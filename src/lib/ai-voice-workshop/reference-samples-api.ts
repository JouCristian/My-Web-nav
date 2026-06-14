import { supabase } from "@/lib/supabase"
import type { VoiceReferenceSample } from "@/lib/ai-voice-workshop/types"

const voiceReferenceSampleBucket = "voice-reference-samples"

export type VoiceReferenceSampleSavePayload = {
  sampleId: string
  name: string
  description: string
  tags: string[]
  sortOrder: number
  isActive: boolean
  audioDurationSeconds: number | null
  avatarUpload?: VoiceReferenceUploadedFile | null
  audioUpload?: VoiceReferenceUploadedFile | null
}

type VoiceReferenceUploadKind = "avatar" | "audio"

type VoiceReferenceUploadedFile = {
  path: string
  mimeType: string
  size: number
}

type UploadIntent = {
  kind: VoiceReferenceUploadKind
  path: string
  token: string
}

type UploadIntentResponse = {
  sampleId: string
  uploads: UploadIntent[]
}

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

export async function uploadVoiceReferenceSampleFiles(
  files: { avatar?: File | null; audio?: File | null },
  existingSampleId?: string | null,
) {
  const requestedFiles = [
    files.avatar ? { kind: "avatar" as const, file: files.avatar } : null,
    files.audio ? { kind: "audio" as const, file: files.audio } : null,
  ].filter((item): item is { kind: VoiceReferenceUploadKind; file: File } => Boolean(item))

  if (!requestedFiles.length) {
    if (!existingSampleId) throw new Error("新增精选声音时必须上传参考音频")
    return { sampleId: existingSampleId, avatarUpload: null, audioUpload: null }
  }

  const response = await fetch("/api/voice-reference-samples/upload-intents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sampleId: existingSampleId ?? null,
      files: requestedFiles.map(({ kind, file }) => ({
        kind,
        name: file.name,
        mimeType: file.type,
        size: file.size,
      })),
    }),
  })
  const intent = await readApiResponse<UploadIntentResponse>(response)
  const completedPaths: string[] = []

  try {
    const uploaded: Partial<Record<VoiceReferenceUploadKind, VoiceReferenceUploadedFile>> = {}
    for (const requested of requestedFiles) {
      const uploadIntent = intent.uploads.find((item) => item.kind === requested.kind)
      if (!uploadIntent) throw new Error("上传任务信息不完整，请重新尝试")

      const { error } = await supabase.storage
        .from(voiceReferenceSampleBucket)
        .uploadToSignedUrl(uploadIntent.path, uploadIntent.token, requested.file, {
          contentType: requested.file.type || undefined,
          upsert: false,
        })
      if (error) throw new Error(`${requested.kind === "avatar" ? "头像" : "参考音频"}上传失败：${error.message}`)

      completedPaths.push(uploadIntent.path)
      uploaded[requested.kind] = {
        path: uploadIntent.path,
        mimeType: requested.file.type,
        size: requested.file.size,
      }
    }

    return {
      sampleId: intent.sampleId,
      avatarUpload: uploaded.avatar ?? null,
      audioUpload: uploaded.audio ?? null,
    }
  } catch (error) {
    if (completedPaths.length) {
      await cleanupVoiceReferenceSampleUploads(intent.sampleId, completedPaths).catch(() => undefined)
    }
    throw error
  }
}

export async function cleanupVoiceReferenceSampleUploads(sampleId: string, paths: string[]) {
  const response = await fetch("/api/voice-reference-samples/upload-intents", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sampleId, paths }),
  })
  return readApiResponse<{ success: boolean }>(response)
}

export async function createVoiceReferenceSample(payload: VoiceReferenceSampleSavePayload) {
  const response = await fetch("/api/voice-reference-samples", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return readApiResponse<VoiceReferenceSample>(response)
}

export async function updateVoiceReferenceSample(id: string, payload: VoiceReferenceSampleSavePayload) {
  const response = await fetch(`/api/voice-reference-samples/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
