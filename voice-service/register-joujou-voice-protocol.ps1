$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Launcher = Join-Path $ScriptDir "start-local-engine.bat"

if (-not (Test-Path $Launcher)) {
    Write-Error "Launcher not found: $Launcher"
    exit 1
}

$Protocol = "joujou-voice"
$RegPath = "Software\Classes\$Protocol"

$RootKey = [Microsoft.Win32.Registry]::CurrentUser.CreateSubKey($RegPath)
$RootKey.SetValue("", "URL:JouJou Voice Engine Protocol")
$RootKey.SetValue("URL Protocol", "")

$CommandKey = $RootKey.CreateSubKey("shell\open\command")
$CommandKey.SetValue("", "`"$Launcher`" `"%1`"")

$CommandKey.Close()
$RootKey.Close()

Write-Host "joujou-voice protocol registered successfully."
Write-Host "Launcher: $Launcher"
