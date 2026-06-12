from __future__ import annotations

import logging
import os
import threading
import time
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.audio_utils import normalize_reference_audio, save_upload_file
from app.job_store import job_store
from app.schemas import GenerateResponse, HealthResponse, JobRecord
from app.tts_engine import TTSEngine, VOICE_PRESETS

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

app = FastAPI(title="AI Voice Workshop Service", version="0.1.0")

allowed_origins = [
    origin.strip()
    for origin in os.getenv("VOICE_ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _worker_loop() -> None:
    while True:
        job = job_store.pop_next()
        if not job:
            time.sleep(0.2)
            continue

        job_store.update(job.job_id, status="running", error=None)
        try:
            filename, _ = engine.generate(job)
            job_store.update(
                job.job_id,
                status="succeeded",
                filename=filename,
                audio_url=f"/tts/audio/{filename}",
            )
        except Exception as error:  # noqa: BLE001 - API should return model errors as job failures.
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
        "engine_version": "0.1.0",
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
    inference_timesteps: int = Form(10),
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
    if mode == "clone":
        if not clone_safety_accepted:
            raise HTTPException(status_code=400, detail="声音克隆前必须确认拥有参考音频使用权。")
        if reference_audio is None:
            raise HTTPException(status_code=400, detail="clone 模式必须上传参考音频")

        try:
            uploaded_path = await save_upload_file(reference_audio, INPUT_DIR)
            reference_audio_path = str(normalize_reference_audio(uploaded_path, INPUT_DIR))
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
    )
    job_store.create(job)

    return GenerateResponse(job_id=job_id, status="queued")


@app.get("/tts/jobs/{job_id}")
def get_job(job_id: str) -> dict[str, object]:
    job = job_store.get(job_id)
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
