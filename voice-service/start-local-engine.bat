@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "VENV_ACTIVATE=%SCRIPT_DIR%.venv\Scripts\Activate.ps1"
set "DOWNLOAD_SOURCE_FILE=%SCRIPT_DIR%.download-source.json"

if not exist "%VENV_ACTIVATE%" (
  echo [JouJou Voice Engine] Virtual environment not found.
  echo Please run setup-local-engine.bat first.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "try { $r = Invoke-WebRequest -UseBasicParsing 'http://127.0.0.1:8866/health' -TimeoutSec 2; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { exit 0 } else { exit 1 } } catch { exit 1 }"

if %ERRORLEVEL% EQU 0 (
  echo [JouJou Voice Engine] Service is already running at http://127.0.0.1:8866
  exit /b 0
)

set "HF_ENDPOINT="
if /I "%JOUJOU_DOWNLOAD_SOURCE%"=="official" (
  echo [JouJou Voice Engine] Download source override: official
) else if /I "%JOUJOU_DOWNLOAD_SOURCE%"=="hf-mirror" (
  set "HF_ENDPOINT=https://hf-mirror.com"
  echo [JouJou Voice Engine] Download source override: hf-mirror
) else if exist "%DOWNLOAD_SOURCE_FILE%" (
  for /f "usebackq delims=" %%I in (`powershell -NoProfile -Command "$config = ConvertFrom-Json -InputObject (Get-Content -Raw -LiteralPath '%DOWNLOAD_SOURCE_FILE%'); if ($config.hf_endpoint) { $config.hf_endpoint }"`) do set "HF_ENDPOINT=%%I"
)

if defined HF_ENDPOINT (
  echo [JouJou Voice Engine] Hugging Face endpoint: %HF_ENDPOINT%
) else (
  echo [JouJou Voice Engine] Hugging Face endpoint: official
)

echo [JouJou Voice Engine] Starting local voice service...

start "JouJou Voice Engine" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%SCRIPT_DIR%'; . '.\.venv\Scripts\Activate.ps1'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8866"

endlocal
