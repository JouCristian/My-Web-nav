@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "VENV_ACTIVATE=%SCRIPT_DIR%.venv\Scripts\Activate.ps1"

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

echo [JouJou Voice Engine] Starting local voice service...

start "JouJou Voice Engine" powershell -NoExit -ExecutionPolicy Bypass -Command "Set-Location -LiteralPath '%SCRIPT_DIR%'; . '.\.venv\Scripts\Activate.ps1'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8866"

endlocal
