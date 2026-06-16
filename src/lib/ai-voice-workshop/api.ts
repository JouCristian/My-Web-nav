import type { VoiceEngineInfo, VoiceGeneratePayload, VoiceGenerateResponse, VoiceHealth, VoiceJob, VoicePreset } from "./types"

export const defaultLocalVoiceApiBaseUrl = "http://127.0.0.1:8866"
export const envVoiceApiBaseUrl = process.env.NEXT_PUBLIC_VOICE_API_BASE_URL || ""
export const voiceApiBaseUrl = normalizeVoiceApiBaseUrl(envVoiceApiBaseUrl || defaultLocalVoiceApiBaseUrl)

export function normalizeVoiceApiBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "")
}

async function readJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `请求失败：${response.status}`
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // Keep the status based message when the response is not JSON.
    }
    throw new Error(message)
  }

  return (await response.json()) as T
}

export async function getVoiceHealth(baseUrl: string, signal?: AbortSignal): Promise<VoiceHealth> {
  const response = await fetch(`${normalizeVoiceApiBaseUrl(baseUrl)}/health`, { cache: "no-store", signal })
  return readJson<VoiceHealth>(response)
}

export async function getVoiceEngineInfo(baseUrl: string, signal?: AbortSignal): Promise<VoiceEngineInfo> {
  const normalizedBaseUrl = normalizeVoiceApiBaseUrl(baseUrl)

  try {
    const response = await fetch(`${normalizedBaseUrl}/engine/info`, { cache: "no-store", signal })
    return readJson<VoiceEngineInfo>(response)
  } catch {
    const health = await getVoiceHealth(normalizedBaseUrl, signal)
    return {
      ok: true,
      engine: "voxcpm2",
      model_name: "openbmb/VoxCPM2",
      model_loaded: health.model_loaded,
      device: health.device,
      gpu_name: null,
      api_base_url: normalizedBaseUrl,
    }
  }
}

export async function getVoicePresets(baseUrl: string, signal?: AbortSignal): Promise<VoicePreset[]> {
  const response = await fetch(`${normalizeVoiceApiBaseUrl(baseUrl)}/voice-presets`, { cache: "no-store", signal })
  return readJson<VoicePreset[]>(response)
}

export async function generateVoice(baseUrl: string, payload: VoiceGeneratePayload): Promise<VoiceGenerateResponse> {
  const body = new FormData()
  body.set("text", payload.text)
  body.set("mode", payload.mode)
  if (payload.mode !== "clone" && payload.voicePrompt) body.set("voice_prompt", payload.voicePrompt)
  if (payload.mode !== "clone" && payload.presetId) body.set("preset_id", payload.presetId)
  if (payload.mode === "clone") {
    body.set("clone_safety_accepted", String(Boolean(payload.cloneSafetyAccepted)))
    if (payload.referenceAudio) body.set("reference_audio", payload.referenceAudio)
  }
  body.set("cfg_value", String(payload.cfgValue ?? 2))
  body.set("inference_timesteps", String(payload.inferenceTimesteps ?? 6))
  body.set("interruptible", String(payload.interruptible === true))

  const response = await fetch(`${normalizeVoiceApiBaseUrl(baseUrl)}/tts/generate`, {
    method: "POST",
    body,
  })

  return readJson<VoiceGenerateResponse>(response)
}

export async function getVoiceJob(baseUrl: string, jobId: string, signal?: AbortSignal): Promise<VoiceJob> {
  const response = await fetch(`${normalizeVoiceApiBaseUrl(baseUrl)}/tts/jobs/${jobId}`, { cache: "no-store", signal })
  return readJson<VoiceJob>(response)
}

export async function cancelVoiceJob(baseUrl: string, jobId: string): Promise<VoiceJob> {
  const response = await fetch(`${normalizeVoiceApiBaseUrl(baseUrl)}/tts/jobs/${jobId}/cancel`, {
    method: "POST",
  })
  if (response.status === 404) {
    throw new Error("本地声音引擎版本过旧，请下载并安装最新版引擎后重试。")
  }
  return readJson<VoiceJob>(response)
}

export function resolveVoiceAudioUrl(baseUrl: string, audioUrl?: string | null, filename?: string | null): string {
  const rawUrl = audioUrl || (filename ? `/tts/audio/${filename}` : "")
  if (!rawUrl) return ""
  if (/^https?:\/\//i.test(rawUrl)) return rawUrl
  const normalizedBaseUrl = normalizeVoiceApiBaseUrl(baseUrl)
  return `${normalizedBaseUrl}${rawUrl.startsWith("/") ? rawUrl : `/${rawUrl}`}`
}

export function resolveVoiceAudioPath(audioPath?: string | null, audioUrl?: string | null, filename?: string | null): string {
  const rawPath = audioPath || audioUrl || (filename ? `/tts/audio/${filename}` : "")
  if (!rawPath || rawPath.startsWith("blob:")) return filename ? `/tts/audio/${filename}` : ""
  if (/^https?:\/\//i.test(rawPath)) {
    try {
      const url = new URL(rawPath)
      return `${url.pathname}${url.search}`
    } catch {
      return filename ? `/tts/audio/${filename}` : ""
    }
  }
  return rawPath.startsWith("/") ? rawPath : `/${rawPath}`
}
