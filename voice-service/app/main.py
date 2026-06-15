from __future__ import annotations

import logging
import os
import re
import threading
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response

from app.audio_utils import normalize_reference_audio, save_upload_file
from app.job_store import job_store
from app.schemas import GenerateResponse, HealthResponse, JobRecord
from app.tts_engine import GenerationCancelled, TTSEngine, VOICE_PRESETS

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice-service")

BASE_DIR = Path(__file__).resolve().parents[1]
STORAGE_DIR = BASE_DIR / "storage"
INPUT_DIR = STORAGE_DIR / "inputs"
OUTPUT_DIR = STORAGE_DIR / "outputs"

INPUT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

engine = TTSEngine(output_dir=OUTPUT_DIR)
worker_started = False

app = FastAPI(title="AI Voice Workshop Service", version="0.3.0")

# Default web origins allowed to reach the local voice engine.
# Browser CORS uses the Origin (scheme + host + port) only, not the full page path.
# For https://www.zoujunyispace.cn/joujou-tools/ai-voice-workshop the origin is
# https://www.zoujunyispace.cn
DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://www.zoujunyispace.cn",
]

_env_origins = os.getenv("VOICE_ALLOWED_ORIGINS", "")
_extra_origins = [item.strip() for item in _env_origins.split(",") if item.strip()]

# Merge defaults with env-provided origins while preserving order and removing duplicates.
allowed_origins = list(dict.fromkeys(DEFAULT_ALLOWED_ORIGINS + _extra_origins))

# Optional regex for advanced setups. Disabled (empty) by default so that arbitrary
# public sites can NOT reach the user's local engine.
allowed_origin_regex = os.getenv("VOICE_ALLOWED_ORIGIN_REGEX", "").strip()


def is_allowed_origin(origin: str | None) -> bool:
    if not origin:
        return False

    if origin in allowed_origins:
        return True

    if allowed_origin_regex:
        try:
            return re.match(allowed_origin_regex, origin) is not None
        except re.error:
            return False

    return False


app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex or None,
    # Credentials are not used; keeping this False lets the engine echo the exact Origin
    # without the wildcard restrictions and avoids leaking cookies cross-site.
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_private_network_access_headers(request: Request, call_next):
    """Add Chrome Private Network Access headers so an HTTPS page can reach
    the local (private network) engine. CORSMiddleware does not emit
    Access-Control-Allow-Private-Network on its own."""
    origin = request.headers.get("origin")

    # Handle the PNA preflight explicitly so the required header is always present.
    if request.method == "OPTIONS" and is_allowed_origin(origin):
        response = Response(status_code=204)
        response.headers["Access-Control-Allow-Origin"] = origin  # type: ignore[arg-type]
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,PATCH,DELETE,OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = request.headers.get(
            "access-control-request-headers", "*"
        )
        response.headers["Access-Control-Allow-Private-Network"] = "true"
        return response

    response = await call_next(request)

    if is_allowed_origin(origin):
        response.headers["Access-Control-Allow-Origin"] = origin  # type: ignore[arg-type]
        response.headers["Vary"] = "Origin"
        response.headers["Access-Control-Allow-Private-Network"] = "true"

    return response


def _worker_loop() -> None:
    while True:
        job = job_store.pop_next()
        if not job:
            time.sleep(0.2)
            continue

        cancel_event = job_store.cancel_event(job.job_id)
        if cancel_event.is_set():
            job_store.update(job.job_id, status="canceled", error=None)
            continue

        job_store.update(job.job_id, status="running", error=None)
        try:
            try:
                import torch

                torch_version = torch.__version__
                cuda_available = torch.cuda.is_available()
                gpu_name = torch.cuda.get_device_name(0) if cuda_available else "none"
            except Exception:  # noqa: BLE001 - diagnostics must not block generation.
                torch_version = "unavailable"
                cuda_available = False
                gpu_name = "unavailable"

            generation_backend = "generate_streaming" if job.interruptible else "generate"
            logger.info(
                "TTS generation start job_id=%s mode=%s text_length=%s reference_audio_duration=%s "
                "cfg=%s steps=%s interruptible=%s generation_backend=%s device=%s "
                "torch_version=%s cuda_available=%s gpu_name=%s",
                job.job_id,
                job.mode,
                len(job.text),
                f"{job.reference_audio_duration:.2f}s" if job.reference_audio_duration is not None else "none",
                job.cfg_value,
                job.inference_timesteps,
                job.interruptible,
                generation_backend,
                engine.device,
                torch_version,
                cuda_available,
                gpu_name,
            )
            filename, _ = engine.generate(job, cancel_event)
            if cancel_event.is_set():
                (OUTPUT_DIR / filename).unlink(missing_ok=True)
                job_store.update(job.job_id, status="canceled", error=None)
                continue
            job_store.update(
                job.job_id,
                status="succeeded",
                filename=filename,
                audio_url=f"/tts/audio/{filename}",
            )
        except GenerationCancelled:
            logger.info("TTS job canceled: %s", job.job_id)
            job_store.update(job.job_id, status="canceled", error=None)
        except Exception as error:  # noqa: BLE001 - API should return model errors as job failures.
            if cancel_event.is_set():
                logger.info("TTS job canceled after inference ended with an error: %s", job.job_id)
                job_store.update(job.job_id, status="canceled", error=None)
                continue
            logger.exception("TTS job failed: %s", job.job_id)
            job_store.update(job.job_id, status="failed", error=str(error))


@app.on_event("startup")
def on_startup() -> None:
    global worker_started

    engine.load()
    if not worker_started:
        thread = threading.Thread(target=_worker_loop, name="voice-generation-worker", daemon=True)
        thread.start()
        worker_started = True


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok" if engine.model_loaded else "loading",
        model_loaded=engine.model_loaded,
        device=engine.device,
    )


@app.get("/engine/info")
def engine_info() -> dict[str, object]:
    try:
        import torch

        cuda_available = torch.cuda.is_available()
        gpu_name = torch.cuda.get_device_name(0) if cuda_available else None
        device = "cuda" if cuda_available else "cpu"
    except Exception:  # noqa: BLE001 - health endpoint should stay available even if torch metadata fails.
        gpu_name = None
        device = engine.device

    return {
        "ok": True,
        "engine": "voxcpm2",
        "engine_version": "0.3.0",
        "capabilities": ["job_cancel", "audio_format_conversion", "interruptible_generation"],
        "model_name": "openbmb/VoxCPM2",
        "model_loaded": engine.model_loaded,
        "device": device,
        "gpu_name": gpu_name,
        "api_base_url": "http://127.0.0.1:8866",
    }


@app.get("/voice-presets")
def voice_presets() -> list[dict[str, str]]:
    return [preset.model_dump() for preset in VOICE_PRESETS]


@app.post("/tts/generate", response_model=GenerateResponse)
async def generate_tts(
    text: str = Form(...),
    mode: str = Form(...),
    voice_prompt: str = Form(""),
    preset_id: str | None = Form(None),
    reference_audio: UploadFile | None = File(None),
    clone_safety_accepted: bool = Form(False),
    cfg_value: float = Form(2.0),
    inference_timesteps: int = Form(6),
    interruptible: bool = Form(False),
) -> GenerateResponse:
    normalized_text = text.strip()
    if not normalized_text:
        raise HTTPException(status_code=400, detail="text 不能为空")
    if len(normalized_text) > 500:
        raise HTTPException(status_code=400, detail="text 最多 500 字")
    if mode not in {"design", "clone"}:
        raise HTTPException(status_code=400, detail="mode 必须是 design 或 clone")
    if cfg_value < 1.0 or cfg_value > 3.0:
        raise HTTPException(status_code=400, detail="cfg_value 必须在 1.0 到 3.0 之间")
    if inference_timesteps < 4 or inference_timesteps > 30:
        raise HTTPException(status_code=400, detail="inference_timesteps 必须在 4 到 30 之间")

    reference_audio_path: str | None = None
    reference_audio_duration: float | None = None
    if mode == "clone":
        if not clone_safety_accepted:
            raise HTTPException(status_code=400, detail="声音克隆前必须确认拥有参考音频使用权。")
        if reference_audio is None:
            raise HTTPException(status_code=400, detail="clone 模式必须上传参考音频")

        try:
            uploaded_path = await save_upload_file(reference_audio, INPUT_DIR)
            reference_audio_path = str(normalize_reference_audio(uploaded_path, INPUT_DIR))
            import soundfile as sf

            reference_audio_duration = float(sf.info(reference_audio_path).duration)
        except ValueError as error:
            raise HTTPException(status_code=400, detail=str(error)) from error
        except Exception as error:  # noqa: BLE001
            raise HTTPException(status_code=400, detail=f"参考音频处理失败：{error}") from error

    job_id = job_store.create_id()
    job = JobRecord(
        job_id=job_id,
        status="queued",
        text=normalized_text,
        mode=mode,  # type: ignore[arg-type]
        voice_prompt="" if mode == "clone" else voice_prompt.strip(),
        preset_id=None if mode == "clone" else preset_id,
        reference_audio_path=reference_audio_path,
        cfg_value=cfg_value,
        inference_timesteps=inference_timesteps,
        interruptible=interruptible,
        reference_audio_duration=reference_audio_duration,
    )
    job_store.create(job)

    return GenerateResponse(job_id=job_id, status="queued")


@app.get("/tts/jobs/{job_id}")
def get_job(job_id: str) -> dict[str, object]:
    job = job_store.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    return job.model_dump()


@app.post("/tts/jobs/{job_id}/cancel")
def cancel_job(job_id: str) -> dict[str, object]:
    job = job_store.cancel(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="任务不存在")
    return job.model_dump()


@app.get("/tts/audio/{filename}")
def get_audio(filename: str) -> FileResponse:
    if "/" in filename or "\\" in filename:
        raise HTTPException(status_code=400, detail="文件名无效")

    audio_path = OUTPUT_DIR / filename
    if not audio_path.exists() or audio_path.suffix.lower() != ".wav":
        raise HTTPException(status_code=404, detail="音频文件不存在")

    return FileResponse(audio_path, media_type="audio/wav", filename=filename)
