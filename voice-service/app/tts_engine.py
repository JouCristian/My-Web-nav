from __future__ import annotations

from pathlib import Path
import threading
from typing import Any
from uuid import uuid4

import numpy as np
import soundfile as sf

from app.schemas import JobRecord, VoicePreset


VOICE_PRESETS = [
    VoicePreset(
        id="tech-male",
        name="科技男声",
        prompt="男声，沉稳，科技感，语速适中",
        description="适合产品介绍、技术演示、工具说明",
    ),
    VoicePreset(
        id="gentle-female",
        name="温柔女声",
        prompt="年轻女性，温柔，清晰，带一点微笑感",
        description="适合教程讲解、陪伴感内容、温暖旁白",
    ),
    VoicePreset(
        id="documentary",
        name="纪录片旁白",
        prompt="纪录片旁白风格，低沉，缓慢，富有故事感",
        description="适合历史、人文、城市、自然类视频",
    ),
    VoicePreset(
        id="short-video",
        name="短视频解说",
        prompt="年轻男声，清晰，有节奏感，表达自然，适合短视频解说",
        description="适合抖音、小红书、B站口播解说",
    ),
    VoicePreset(
        id="news",
        name="新闻播报",
        prompt="标准普通话，新闻播报风格，清晰，正式，语速稳定",
        description="适合通知、公告、正式介绍",
    ),
    VoicePreset(
        id="storyteller",
        name="故事讲述",
        prompt="温和，叙事感，语速偏慢，像在讲一个故事",
        description="适合故事、微电影旁白、睡前内容",
    ),
]


def _preset_prompt(preset_id: str | None) -> str:
    if not preset_id:
        return ""
    preset = next((item for item in VOICE_PRESETS if item.id == preset_id), None)
    return preset.prompt if preset else ""


class TTSEngine:
    def __init__(self, output_dir: Path) -> None:
        self.output_dir = output_dir
        self.device = "cpu"
        self.model: Any = None

    @property
    def model_loaded(self) -> bool:
        return self.model is not None

    def load(self) -> None:
        import torch
        from voxcpm import VoxCPM

        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)

        if hasattr(self.model, "to"):
            self.model = self.model.to(self.device)
        if hasattr(self.model, "eval"):
            self.model.eval()

    def generate(self, job: JobRecord, cancel_event: threading.Event) -> tuple[str, Path]:
        if self.model is None:
            raise RuntimeError("VoxCPM2 模型尚未加载")

        self.output_dir.mkdir(parents=True, exist_ok=True)
        filename = f"{uuid4().hex}.wav"
        output_path = self.output_dir / filename
        voice_prompt = "" if job.mode == "clone" else job.voice_prompt.strip() or _preset_prompt(job.preset_id)

        try:
            wav = self._call_model(job=job, voice_prompt=voice_prompt, cancel_event=cancel_event)
        except GenerationCancelled:
            if self.device == "cuda":
                import torch

                torch.cuda.empty_cache()
            raise
        self._save_wav(wav, output_path)
        return filename, output_path

    def _call_model(self, job: JobRecord, voice_prompt: str, cancel_event: threading.Event) -> Any:
        text = job.text.strip()
        kwargs: dict[str, Any] = {
            "text": text,
            "cfg_value": job.cfg_value,
            "inference_timesteps": job.inference_timesteps,
        }

        if job.mode == "clone":
            if not job.reference_audio_path:
                raise RuntimeError("声音克隆模式缺少参考音频")
            kwargs["reference_wav_path"] = job.reference_audio_path
        else:
            kwargs["text"] = f"({voice_prompt.strip()}){text}" if voice_prompt else text

        if not job.interruptible:
            wav = self.model.generate(**kwargs)
            if cancel_event.is_set():
                raise GenerationCancelled()
            return wav

        chunks: list[np.ndarray] = []
        stream = self.model.generate_streaming(**kwargs)
        try:
            for chunk in stream:
                if cancel_event.is_set():
                    raise GenerationCancelled()
                chunks.append(np.asarray(chunk).reshape(-1))
        finally:
            stream.close()

        if cancel_event.is_set():
            raise GenerationCancelled()
        if not chunks:
            raise RuntimeError("VoxCPM2 未返回音频数据")
        return np.concatenate(chunks)

    def _save_wav(self, wav: Any, output_path: Path) -> None:
        if wav is None:
            raise RuntimeError("VoxCPM2 未返回音频数据")

        if hasattr(wav, "detach"):
            wav = wav.detach().cpu().numpy()

        sample_rate = getattr(getattr(self.model, "tts_model", None), "sample_rate", None)
        if sample_rate is None:
            raise RuntimeError("VoxCPM2 模型缺少 tts_model.sample_rate，无法保存音频")

        sf.write(output_path, wav, int(sample_rate))


class GenerationCancelled(Exception):
    """Raised when the active local generation is canceled by the user."""
