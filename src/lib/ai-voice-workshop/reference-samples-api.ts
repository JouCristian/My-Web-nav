import type { VoiceReferenceSample } from "@/lib/ai-voice-workshop/types"

async function readApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as { error?: string } | T | null
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload ? payload.error : undefined
    throw new Error(message || `请求失败（${response.status}）`)
  }
  return payload as T
}

export async function getVoiceReferenceSamples() {
  const response = await fetch("/api/voice-reference-samples", { cache: "no-store" })
  return readApiResponse<VoiceReferenceSample[]>(response)
}

export async function getAdminVoiceReferenceSamples() {
  const response = await fetch("/api/voice-reference-samples?admin=1", { cache: "no-store" })
  return readApiResponse<VoiceReferenceSample[]>(response)
}

export async function createVoiceReferenceSample(formData: FormData) {
  const response = await fetch("/api/voice-reference-samples", { method: "POST", body: formData })
  return readApiResponse<VoiceReferenceSample>(response)
}

export async function updateVoiceReferenceSample(id: string, formData: FormData) {
  const response = await fetch(`/api/voice-reference-samples/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: formData,
  })
  return readApiResponse<VoiceReferenceSample>(response)
}

export async function deleteVoiceReferenceSample(id: string) {
  const response = await fetch(`/api/voice-reference-samples/${encodeURIComponent(id)}`, { method: "DELETE" })
  return readApiResponse<{ storageCleanupWarning?: string | null }>(response)
}

export async function voiceReferenceSampleToFile(sample: VoiceReferenceSample) {
  let response: Response
  try {
    response = await fetch(sample.audioUrl, { cache: "no-store" })
  } catch {
    throw new Error("精选参考音频下载失败，请检查网络后重试。")
  }
  if (!response.ok) {
    if (response.status === 404) throw new Error("该精选参考音频已被删除或暂时不可用，请重新选择。")
    throw new Error(`精选参考音频下载失败（${response.status}），请稍后重试。`)
  }

  const blob = await response.blob()
  if (!blob.size) throw new Error("精选参考音频内容为空，请重新选择。")
  const extension = sample.audioPath.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "wav"
  const filename = `${sample.name.replace(/[\\/:*?"<>|]/g, "-")}.${extension}`
  return new File([blob], filename, { type: blob.type || sample.audioMimeType || "audio/wav" })
}
