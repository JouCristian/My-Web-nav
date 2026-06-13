from __future__ import annotations

from pathlib import Path
import subprocess
from uuid import uuid4

from fastapi import UploadFile


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

    try:
        from imageio_ffmpeg import get_ffmpeg_exe
    except ImportError as error:
        if input_path.suffix.lower() == ".wav":
            from pydub import AudioSegment

            audio = AudioSegment.from_wav(input_path)
            audio.set_frame_rate(16000).set_channels(1).export(output_path, format="wav")
            return output_path
        raise RuntimeError("缺少音频转换组件，请重新运行本地引擎安装程序。") from error

    result = subprocess.run(
        [
            get_ffmpeg_exe(),
            "-y",
            "-loglevel",
            "error",
            "-i",
            str(input_path),
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            str(output_path),
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode != 0 or not output_path.exists():
        detail = result.stderr.strip().splitlines()[-1] if result.stderr.strip() else "无法解析该音频文件"
        raise RuntimeError(f"音频转换失败：{detail}")
    return output_path
