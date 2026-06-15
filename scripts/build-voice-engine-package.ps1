$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$sourceRoot = Join-Path $projectRoot "voice-service"
$readmeTemplate = Join-Path $PSScriptRoot "voice-engine-package-README_zh.md"
$downloadsRoot = Join-Path $projectRoot "public\downloads"
$zipPath = Join-Path $downloadsRoot "joujou-voice-engine-windows.zip"
$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("joujou-voice-engine-" + [guid]::NewGuid().ToString("N"))
$packageRoot = Join-Path $tempRoot "JouJou-Voice-Engine-Windows"
$serviceTarget = Join-Path $packageRoot "voice-service"
$packageScriptsTarget = Join-Path $packageRoot "scripts"
$downloadSourceScript = Join-Path $PSScriptRoot "select-download-source.ps1"
$preloadModelScript = Join-Path $PSScriptRoot "preload-voxcpm-model.py"

if (-not (Test-Path -LiteralPath $sourceRoot)) {
  throw "voice-service was not found at: $sourceRoot"
}

if (-not (Test-Path -LiteralPath $readmeTemplate)) {
  throw "Package README template was not found at: $readmeTemplate"
}

if (-not (Test-Path -LiteralPath $downloadSourceScript)) {
  throw "Download source selector was not found at: $downloadSourceScript"
}

if (-not (Test-Path -LiteralPath $preloadModelScript)) {
  throw "VoxCPM2 preload script was not found at: $preloadModelScript"
}

$excludedDirectories = @(
  ".venv",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache",
  "node_modules",
  "storage",
  "huggingface",
  "hub",
  "models"
)
$excludedFileNames = @(".env")
$excludedExtensions = @(".pyc", ".pyo", ".wav", ".mp3", ".m4a", ".aac", ".whl", ".bin", ".safetensors", ".ckpt", ".pt", ".pth")

try {
  New-Item -ItemType Directory -Path $serviceTarget -Force | Out-Null
  New-Item -ItemType Directory -Path $packageScriptsTarget -Force | Out-Null
  New-Item -ItemType Directory -Path $downloadsRoot -Force | Out-Null

  Get-ChildItem -LiteralPath $sourceRoot -Recurse -Force -File | ForEach-Object {
    $relativePath = $_.FullName.Substring($sourceRoot.Length).TrimStart([char[]]"\/")
    $segments = $relativePath -split "[\\/]"
    $hasExcludedDirectory = $false

    foreach ($segment in $segments) {
      if ($excludedDirectories -contains $segment) {
        $hasExcludedDirectory = $true
        break
      }
    }

    if ($hasExcludedDirectory) { return }
    if ($excludedFileNames -contains $_.Name) { return }
    if ($excludedExtensions -contains $_.Extension.ToLowerInvariant()) { return }

    $destination = Join-Path $serviceTarget $relativePath
    $destinationDirectory = Split-Path -Parent $destination
    New-Item -ItemType Directory -Path $destinationDirectory -Force | Out-Null
    Copy-Item -LiteralPath $_.FullName -Destination $destination -Force
  }

  $installBat = @'
@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "SERVICE_DIR=%ROOT_DIR%voice-service"
set "SOURCE_SELECTOR=%ROOT_DIR%scripts\select-download-source.ps1"
set "SOURCE_CONFIG=%SERVICE_DIR%\.download-source.json"

if not exist "%SERVICE_DIR%\setup-local-engine.bat" (
  echo [JouJou Voice Engine] setup-local-engine.bat was not found.
  echo Please make sure the package was extracted correctly.
  pause
  exit /b 1
)

if not exist "%SOURCE_SELECTOR%" (
  echo [JouJou Voice Engine] select-download-source.ps1 was not found.
  echo Please make sure the package was extracted correctly.
  pause
  exit /b 1
)

powershell -NoProfile -ExecutionPolicy Bypass -File "%SOURCE_SELECTOR%" -OutputPath "%SOURCE_CONFIG%"
if %ERRORLEVEL% NEQ 0 (
  echo [JouJou Voice Engine] Download source detection failed. Continuing with the official source.
)

call "%SERVICE_DIR%\setup-local-engine.bat"

endlocal
pause
'@

  $startBat = @'
@echo off
setlocal

set "ROOT_DIR=%~dp0"
set "SERVICE_DIR=%ROOT_DIR%voice-service"

if not exist "%SERVICE_DIR%\start-local-engine.bat" (
  echo [JouJou Voice Engine] start-local-engine.bat was not found.
  echo Please make sure the package was extracted correctly.
  pause
  exit /b 1
)

call "%SERVICE_DIR%\start-local-engine.bat"

endlocal
'@

  Set-Content -LiteralPath (Join-Path $packageRoot "INSTALL.bat") -Value $installBat -Encoding Ascii
  Set-Content -LiteralPath (Join-Path $packageRoot "START.bat") -Value $startBat -Encoding Ascii
  Copy-Item -LiteralPath $downloadSourceScript -Destination (Join-Path $packageScriptsTarget "select-download-source.ps1") -Force
  Copy-Item -LiteralPath $preloadModelScript -Destination (Join-Path $packageScriptsTarget "preload-voxcpm-model.py") -Force
  Copy-Item -LiteralPath $readmeTemplate -Destination (Join-Path $packageRoot "README_zh.md") -Force

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }

  Compress-Archive -LiteralPath $packageRoot -DestinationPath $zipPath -CompressionLevel Optimal
  Write-Host "Created: $zipPath"
}
finally {
  $resolvedTempBase = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
  $resolvedTempRoot = [System.IO.Path]::GetFullPath($tempRoot)
  if ((Test-Path -LiteralPath $tempRoot) -and $resolvedTempRoot.StartsWith($resolvedTempBase, [System.StringComparison]::OrdinalIgnoreCase)) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
