@echo off
setlocal

set "SCRIPT_DIR=%~dp0"
set "PACKAGE_SCRIPTS_DIR=%SCRIPT_DIR%..\scripts"
set "DOWNLOAD_SOURCE_FILE=%SCRIPT_DIR%.download-source.json"
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

echo [JouJou Voice Engine] Upgrading pip with Tsinghua PyPI mirror...
python -m pip install --upgrade pip --index-url https://pypi.tuna.tsinghua.edu.cn/simple --retries 5 --timeout 60
if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Tsinghua PyPI mirror failed. Retrying official PyPI...
  python -m pip install --upgrade pip --index-url https://pypi.org/simple --retries 5 --timeout 60
)

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Failed to upgrade pip.
  pause
  exit /b 1
)

echo [JouJou Voice Engine] Installing CUDA PyTorch...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu126 --retries 20 --timeout 300

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Failed to install CUDA PyTorch.
  pause
  exit /b 1
)

echo [JouJou Voice Engine] Installing voice-service requirements with Tsinghua PyPI mirror...
pip install -r requirements.txt --index-url https://pypi.tuna.tsinghua.edu.cn/simple --retries 10 --timeout 120

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Tsinghua PyPI mirror failed. Retrying official PyPI...
  pip install -r requirements.txt --index-url https://pypi.org/simple --retries 10 --timeout 120
)

if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Failed to install requirements.
  pause
  exit /b 1
)

if exist "%PACKAGE_SCRIPTS_DIR%\preload-voxcpm-model.py" (
  echo [JouJou Voice Engine] Preloading VoxCPM2 model files...
  python "%PACKAGE_SCRIPTS_DIR%\preload-voxcpm-model.py"
  if errorlevel 1 (
    echo [JouJou Voice Engine] Model preload did not finish. START.bat will retry when the engine starts.
  )
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
