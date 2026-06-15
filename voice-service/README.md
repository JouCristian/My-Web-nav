# AI Voice Workshop Service

This FastAPI service wraps the local VoxCPM2 model for the Next.js page at:

`http://localhost:3000/joujou-tools/ai-voice-workshop`

The model runs outside Next.js and Vercel Serverless. The frontend can connect through the local engine mode or a custom API base URL. The environment variable remains available as a fallback:

`NEXT_PUBLIC_VOICE_API_BASE_URL=http://127.0.0.1:8866`

Current local engine API version: `0.3.0`. This version uses fast non-streaming generation by default, supports optional interruptible generation, reference-audio conversion, and canceling jobs without stopping the engine process.

For the productized local engine flow, run `setup-local-engine.bat` once. It creates `.venv`, installs dependencies, and registers the `joujou-voice://` protocol. After that, the web page can call `joujou-voice://start` to launch `start-local-engine.bat`.

## Start Locally

Run these commands from `voice-service/`.

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install CUDA PyTorch manually first. `requirements.txt` intentionally does not include `torch`.

```powershell
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126
```

Install the service dependencies.

```powershell
pip install -r requirements.txt
```

Start the voice service.

```powershell
python -m uvicorn app.main:app --host 127.0.0.1 --port 8866
```

The service should listen on `127.0.0.1`, not `0.0.0.0`.

In another terminal, start Next.js from the project root.

```powershell
$env:NEXT_PUBLIC_VOICE_API_BASE_URL="http://127.0.0.1:8866"
npm run dev
```

Then open:

`http://localhost:3000/joujou-tools/ai-voice-workshop`

## Audio Upload Notes

- WAV is recommended and should work without FFmpeg.
- MP3, M4A, and AAC are accepted by the API, then normalized to 16 kHz mono WAV.
- `imageio-ffmpeg` supplies the local FFmpeg executable, so users do not need to configure a separate system `PATH`.
- The original upload is preserved for browser preview; VoxCPM2 only receives the normalized WAV path.

## API

### `GET /health`

Returns service status, model loaded state, and device.

### `GET /engine/info`

Returns engine metadata, model loaded state, device, GPU name, and local API base URL.

### `GET /voice-presets`

Returns built-in voice preset cards.

### `POST /tts/generate`

Accepts `multipart/form-data`.

Fields:

- `text`: required, max 500 characters.
- `mode`: required, `design` or `clone`.
- `voice_prompt`: optional.
- `preset_id`: optional.
- `reference_audio`: required in `clone` mode.
- `clone_safety_accepted`: required as `true` in `clone` mode.
- `cfg_value`: optional, default `2.0`, range `1.0` to `3.0`.
- `inference_timesteps`: optional, default `6`, range `4` to `30`.
- `interruptible`: optional, default `false`. When `false`, the engine uses the faster `model.generate()` path. When `true`, it uses `model.generate_streaming()` and checks cancel requests between audio chunks.

Returns:

```json
{ "job_id": "...", "status": "queued" }
```

### `GET /tts/jobs/{job_id}`

Returns `queued`, `running`, `canceling`, `canceled`, `succeeded`, or `failed`.

Successful jobs include `audio_url` and `filename`. Failed jobs include `error`.

### `POST /tts/jobs/{job_id}/cancel`

Cancels a queued job immediately. Interruptible running jobs stop at the next VoxCPM2 streaming audio chunk. Fast non-streaming jobs finish the current inference and discard the result. In both cases the service remains available for the next request.

### `GET /tts/audio/{filename}`

Streams the generated WAV file.

## Runtime Behavior

- VoxCPM2 is loaded once during service startup with `VoxCPM.from_pretrained("openbmb/VoxCPM2", load_denoiser=False)`.
- CUDA is used when `torch.cuda.is_available()` is true.
- Generation runs through one background worker, so only one job runs at a time.
- Uploaded reference audio is saved under `storage/inputs/`.
- Generated WAV files are saved under `storage/outputs/`.
- Job state is in memory for local usage. Restarting the service clears queued jobs and history.
- CORS defaults to `http://localhost:3000` and `http://127.0.0.1:3000`. Use `VOICE_ALLOWED_ORIGINS` for an explicit comma-separated allowlist.
