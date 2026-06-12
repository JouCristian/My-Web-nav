from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile
from pydub import AudioSegment


SUPPORTED_AUDIO_EXTENSIONS = {".wav", ".mp3", ".m4a", ".aac"}


async def save_upload_file(file: UploadFile, input_dir: Path) -> Path:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in SUPPORTED_AUDIO_EXTENSIONS:
        raise ValueError("参考音频仅支持 wav、mp3、m4a、aac 格式，推荐上传 wav。")

    input_dir.mkdir(parents=True, exist_ok=True)
    target = input_dir / f"{uuid4().hex}{suffix}"

    with target.open("wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            buffer.write(chunk)

    return target


def normalize_reference_audio(input_path: Path, input_dir: Path) -> Path:
    output_path = input_dir / f"{input_path.stem}_16k_mono.wav"

    if input_path.suffix.lower() == ".wav":
        audio = AudioSegment.from_wav(input_path)
    else:
        audio = AudioSegment.from_file(input_path)

    audio = audio.set_frame_rate(16000).set_channels(1)
    audio.export(output_path, format="wav")
    return output_path
