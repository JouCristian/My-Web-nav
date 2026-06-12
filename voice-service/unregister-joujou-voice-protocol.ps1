$ErrorActionPreference = "Stop"

$Protocol = "joujou-voice"
$KeyPath = "HKCU:\Software\Classes\$Protocol"

if (Test-Path $KeyPath) {
    Remove-Item -Path $KeyPath -Recurse -Force
    Write-Host "joujou-voice protocol unregistered successfully."
} else {
    Write-Host "joujou-voice protocol is not registered."
}
