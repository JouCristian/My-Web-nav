@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo [JouJou Voice Engine] Setup started.
echo [JouJou Voice Engine] Working directory: %SCRIPT_DIR%

where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Python was not found.
  echo Please install Python 3.11 first, then run this script again.
  pause
  exit /b 1
)

if not exist ".venv\Scripts\activate.bat" (
  echo [JouJou Voice Engine] Creating virtual environment...
  python -m venv .venv
  if %ERRORLEVEL% NEQ 0 (
    echo [JouJou Voice Engine] Failed to create virtual environment.
    pause
    exit /b 1
  )
) else (
  echo [JouJou Voice Engine] Virtual environment already exists.
)

call ".venv\Scripts\activate.bat"

echo [JouJou Voice Engine] Upgrading pip...
python -m pip install --upgrade pip

echo [JouJou Voice Engine] Installing CUDA PyTorch...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126 --retries 20 --timeout 300

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Failed to install CUDA PyTorch.
  pause
  exit /b 1
)

echo [JouJou Voice Engine] Installing voice-service requirements...
pip install -r requirements.txt --retries 20 --timeout 300

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Failed to install requirements.
  pause
  exit /b 1
)

echo [JouJou Voice Engine] Registering joujou-voice protocol...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%register-joujou-voice-protocol.ps1"

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Failed to register protocol.
  pause
  exit /b 1
)

echo.
echo [JouJou Voice Engine] Setup completed.
echo [JouJou Voice Engine] You can now click Start Local Engine in the web page.
echo.

pause
endlocal
