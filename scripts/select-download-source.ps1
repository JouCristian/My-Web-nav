param(
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Net.Http

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
  $projectRoot = Split-Path -Parent $PSScriptRoot
  $OutputPath = Join-Path $projectRoot "voice-service\.download-source.json"
}

$officialUrl = "https://huggingface.co"
$mirrorUrl = "https://hf-mirror.com"
$requestedMode = [Environment]::GetEnvironmentVariable("JOUJOU_DOWNLOAD_SOURCE")
if ([string]::IsNullOrWhiteSpace($requestedMode)) {
  $requestedMode = "auto"
}
$requestedMode = $requestedMode.Trim().ToLowerInvariant()

if ($requestedMode -notin @("auto", "official", "hf-mirror")) {
  Write-Warning "Unknown JOUJOU_DOWNLOAD_SOURCE '$requestedMode'; falling back to auto."
  $requestedMode = "auto"
}

function Test-DownloadEndpoint {
  param(
    [Parameter(Mandatory = $true)][string]$Url,
    [int]$TimeoutSeconds = 6
  )

  $handler = [System.Net.Http.HttpClientHandler]::new()
  $handler.AllowAutoRedirect = $true
  $client = [System.Net.Http.HttpClient]::new($handler)
  $client.Timeout = [TimeSpan]::FromSeconds($TimeoutSeconds)
  $request = [System.Net.Http.HttpRequestMessage]::new([System.Net.Http.HttpMethod]::Head, $Url)
  $watch = [System.Diagnostics.Stopwatch]::StartNew()

  try {
    $response = $client.SendAsync($request).GetAwaiter().GetResult()
    $watch.Stop()
    return [ordered]@{
      available = [bool]$response.IsSuccessStatusCode
      response_ms = [int]$watch.ElapsedMilliseconds
      status_code = [int]$response.StatusCode
      error = $null
    }
  }
  catch {
    $watch.Stop()
    return [ordered]@{
      available = $false
      response_ms = $null
      status_code = $null
      error = $_.Exception.Message
    }
  }
  finally {
    $request.Dispose()
    $client.Dispose()
    $handler.Dispose()
  }
}

$officialResult = $null
$mirrorResult = $null

if ($requestedMode -eq "auto") {
  Write-Host "[JouJou Voice Engine] Testing Hugging Face download sources..."
  $officialResult = Test-DownloadEndpoint -Url $officialUrl
  $mirrorResult = Test-DownloadEndpoint -Url $mirrorUrl

  if ($officialResult.available -and (-not $mirrorResult.available -or $officialResult.response_ms -le $mirrorResult.response_ms)) {
    $selectedSource = "official"
  }
  elseif ($mirrorResult.available) {
    $selectedSource = "hf-mirror"
  }
  else {
    # Keep the Hugging Face default when neither probe succeeds. The next run can retry.
    $selectedSource = "official"
  }
}
else {
  $selectedSource = $requestedMode
}

$hfEndpoint = if ($selectedSource -eq "hf-mirror") { $mirrorUrl } else { $null }
$config = [ordered]@{
  mode = $requestedMode
  source = $selectedSource
  hf_endpoint = $hfEndpoint
  selected_at = [DateTimeOffset]::Now.ToString("o")
  probes = [ordered]@{
    official = $officialResult
    hf_mirror = $mirrorResult
  }
}

$outputDirectory = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outputDirectory)) {
  New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
}
$config | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $OutputPath -Encoding UTF8

if ($selectedSource -eq "hf-mirror") {
  Write-Host "[JouJou Voice Engine] Selected hf-mirror: $mirrorUrl"
}
else {
  Write-Host "[JouJou Voice Engine] Selected official Hugging Face source."
}
Write-Host "[JouJou Voice Engine] Download source saved to: $OutputPath"
