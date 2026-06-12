from typing import Literal, Optional

from pydantic import BaseModel, Field


JobStatus = Literal["queued", "running", "succeeded", "failed"]
GenerationMode = Literal["design", "clone"]


class VoicePreset(BaseModel):
    id: str
    name: str
    prompt: str
    description: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str


class GenerateResponse(BaseModel):
    job_id: str
    status: JobStatus


class JobRecord(BaseModel):
    job_id: str
    status: JobStatus
    text: str = ""
    mode: GenerationMode = "design"
    voice_prompt: str = ""
    preset_id: Optional[str] = None
    reference_audio_path: Optional[str] = None
    cfg_value: float = Field(default=2.0, ge=1.0, le=3.0)
    inference_timesteps: int = Field(default=10, ge=4, le=30)
    audio_url: Optional[str] = None
    filename: Optional[str] = None
    error: Optional[str] = None
