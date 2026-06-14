import "server-only"

import { randomUUID } from "node:crypto"
import { auth } from "@/auth"
import { getSupabaseAdminClient, getSupabasePublicClient } from "@/lib/supabase/admin"
import type { VoiceReferenceSample } from "@/lib/ai-voice-workshop/types"

export const voiceReferenceSampleAdminEmail = "zoujunyi869@gmail.com"
export const voiceReferenceSampleBucket = "voice-reference-samples"

const avatarMimeTypes = new Set(["image/png", "image/jpeg", "image/webp"])
const audioMimeTypes = new Set([
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
])
const maxAvatarBytes = 2 * 1024 * 1024
const maxAudioBytes = 4 * 1024 * 1024

type VoiceReferenceSampleRow = {
  id: string
  name: string
  description: string
  tags: string[] | null
  avatar_path: string | null
  avatar_url: string | null
  audio_path: string
  audio_url: string
  audio_duration_seconds: number | string | null
  audio_mime_type: string | null
  audio_size_bytes: number | string | null
  sort_order: number
  is_active: boolean
  created_by_email: string | null
  created_at: string
  updated_at: string
}

export type VoiceReferenceSampleInput = {
  name: string
  description: string
  tags: string[]
  sortOrder: number
  isActive: boolean
  audioDurationSeconds: number | null
}

export function mapVoiceReferenceSample(row: VoiceReferenceSampleRow): VoiceReferenceSample {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    tags: row.tags ?? [],
    avatarPath: row.avatar_path,
    avatarUrl: row.avatar_url,
    audioPath: row.audio_path,
    audioUrl: row.audio_url,
    audioDurationSeconds: row.audio_duration_seconds === null ? null : Number(row.audio_duration_seconds),
    audioMimeType: row.audio_mime_type,
    audioSizeBytes: row.audio_size_bytes === null ? null : Number(row.audio_size_bytes),
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdByEmail: row.created_by_email,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function assertVoiceReferenceSampleAdmin() {
  const session = await auth()
  const email = session?.user?.email?.toLowerCase()
  if (email !== voiceReferenceSampleAdminEmail) {
    throw new VoiceReferenceSampleHttpError(403, "无权管理精选参考音频")
  }
  return email
}

export async function listPublicVoiceReferenceSamples() {
  const { data, error } = await getSupabasePublicClient()
    .from("voice_reference_samples")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    if (error.code === "PGRST205" || error.message.includes("schema cache")) {
      throw new Error("精选参考音频尚未完成初始化，请稍后再试。")
    }
    throw new Error("精选参考音频暂时无法加载，请稍后重试。")
  }
  return (data as VoiceReferenceSampleRow[]).map(mapVoiceReferenceSample)
}

export async function listAllVoiceReferenceSamples() {
  const { data, error } = await getSupabaseAdminClient()
    .from("voice_reference_samples")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) {
    if (error.code === "PGRST205" || error.message.includes("schema cache")) {
      throw new Error("精选参考音频数据表尚未初始化，请先执行 Supabase migration。")
    }
    throw new Error(`管理列表加载失败：${error.message}`)
  }
  return (data as VoiceReferenceSampleRow[]).map(mapVoiceReferenceSample)
}

export function parseVoiceReferenceSampleForm(formData: FormData): VoiceReferenceSampleInput {
  const name = String(formData.get("name") ?? "").trim()
  if (!name) throw new VoiceReferenceSampleHttpError(400, "名称不能为空")
  if (name.length > 80) throw new VoiceReferenceSampleHttpError(400, "名称不能超过 80 个字符")

  const description = String(formData.get("description") ?? "").trim()
  const tags = String(formData.get("tags") ?? "")
    .split(/[,，]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 12)
  const parsedSortOrder = Number.parseInt(String(formData.get("sortOrder") ?? "0"), 10)
  const durationValue = Number.parseFloat(String(formData.get("audioDurationSeconds") ?? ""))

  return {
    name,
    description: description.slice(0, 500),
    tags: [...new Set(tags)],
    sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : 0,
    isActive: String(formData.get("isActive") ?? "true") === "true",
    audioDurationSeconds: Number.isFinite(durationValue) && durationValue >= 0 ? durationValue : null,
  }
}

export function readOptionalFile(formData: FormData, key: string) {
  const value = formData.get(key)
  return value instanceof File && value.size > 0 ? value : null
}

export function validateAvatarFile(file: File | null) {
  if (!file) return
  if (!avatarMimeTypes.has(file.type)) throw new VoiceReferenceSampleHttpError(400, "头像仅支持 PNG、JPG 或 WEBP")
  if (file.size > maxAvatarBytes) throw new VoiceReferenceSampleHttpError(400, "头像不能超过 2 MB")
}

export function validateAudioFile(file: File | null, required: boolean) {
  if (!file) {
    if (required) throw new VoiceReferenceSampleHttpError(400, "请上传参考音频")
    return
  }
  const extension = file.name.split(".").pop()?.toLowerCase()
  const allowedExtension = extension && ["wav", "mp3", "m4a", "aac"].includes(extension)
  if (!audioMimeTypes.has(file.type) && !allowedExtension) {
    throw new VoiceReferenceSampleHttpError(400, "参考音频仅支持 WAV、MP3、M4A 或 AAC")
  }
  if (file.size > maxAudioBytes) throw new VoiceReferenceSampleHttpError(400, "参考音频不能超过 4 MB")
}

function fileExtension(file: File, fallback: string) {
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")
  return extension || fallback
}

async function uploadSampleFile(sampleId: string, kind: "avatars" | "audios", file: File) {
  const fallback = kind === "avatars" ? "webp" : "wav"
  const path = `${kind}/${sampleId}/${kind === "avatars" ? "avatar" : "audio"}-${randomUUID()}.${fileExtension(file, fallback)}`
  const client = getSupabaseAdminClient()
  const { error } = await client.storage.from(voiceReferenceSampleBucket).upload(path, file, {
    contentType: file.type || undefined,
    upsert: false,
  })
  if (error) throw new Error(`${kind === "avatars" ? "头像" : "音频"}上传失败：${error.message}`)
  return {
    path,
    url: client.storage.from(voiceReferenceSampleBucket).getPublicUrl(path).data.publicUrl,
  }
}

async function removeStoragePaths(paths: Array<string | null | undefined>) {
  const validPaths = paths.filter((path): path is string => Boolean(path))
  if (!validPaths.length) return null
  const { error } = await getSupabaseAdminClient().storage.from(voiceReferenceSampleBucket).remove(validPaths)
  return error
}

export async function createVoiceReferenceSample(formData: FormData, adminEmail: string) {
  const input = parseVoiceReferenceSampleForm(formData)
  const avatar = readOptionalFile(formData, "avatar")
  const audio = readOptionalFile(formData, "audio")
  validateAvatarFile(avatar)
  validateAudioFile(audio, true)

  const id = randomUUID()
  let avatarUpload: Awaited<ReturnType<typeof uploadSampleFile>> | null = null
  let audioUpload: Awaited<ReturnType<typeof uploadSampleFile>> | null = null

  try {
    if (avatar) avatarUpload = await uploadSampleFile(id, "avatars", avatar)
    audioUpload = await uploadSampleFile(id, "audios", audio!)

    const { data, error } = await getSupabaseAdminClient()
      .from("voice_reference_samples")
      .insert({
        id,
        name: input.name,
        description: input.description,
        tags: input.tags,
        avatar_path: avatarUpload?.path ?? null,
        avatar_url: avatarUpload?.url ?? null,
        audio_path: audioUpload.path,
        audio_url: audioUpload.url,
        audio_duration_seconds: input.audioDurationSeconds,
        audio_mime_type: audio!.type || null,
        audio_size_bytes: audio!.size,
        sort_order: input.sortOrder,
        is_active: input.isActive,
        created_by_email: adminEmail,
      })
      .select("*")
      .single()

    if (error) throw new Error(`保存失败：${error.message}`)
    return mapVoiceReferenceSample(data as VoiceReferenceSampleRow)
  } catch (error) {
    await removeStoragePaths([avatarUpload?.path, audioUpload?.path])
    throw error
  }
}

export async function updateVoiceReferenceSample(id: string, formData: FormData) {
  const input = parseVoiceReferenceSampleForm(formData)
  const avatar = readOptionalFile(formData, "avatar")
  const audio = readOptionalFile(formData, "audio")
  validateAvatarFile(avatar)
  validateAudioFile(audio, false)

  const client = getSupabaseAdminClient()
  const { data: existingData, error: existingError } = await client
    .from("voice_reference_samples")
    .select("*")
    .eq("id", id)
    .single()
  if (existingError || !existingData) throw new VoiceReferenceSampleHttpError(404, "精选参考音频不存在")
  const existing = existingData as VoiceReferenceSampleRow

  let avatarUpload: Awaited<ReturnType<typeof uploadSampleFile>> | null = null
  let audioUpload: Awaited<ReturnType<typeof uploadSampleFile>> | null = null
  try {
    if (avatar) avatarUpload = await uploadSampleFile(id, "avatars", avatar)
    if (audio) audioUpload = await uploadSampleFile(id, "audios", audio)

    const { data, error } = await client
      .from("voice_reference_samples")
      .update({
        name: input.name,
        description: input.description,
        tags: input.tags,
        avatar_path: avatarUpload?.path ?? existing.avatar_path,
        avatar_url: avatarUpload?.url ?? existing.avatar_url,
        audio_path: audioUpload?.path ?? existing.audio_path,
        audio_url: audioUpload?.url ?? existing.audio_url,
        audio_duration_seconds: audio ? input.audioDurationSeconds : existing.audio_duration_seconds,
        audio_mime_type: audio ? audio.type || null : existing.audio_mime_type,
        audio_size_bytes: audio ? audio.size : existing.audio_size_bytes,
        sort_order: input.sortOrder,
        is_active: input.isActive,
      })
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw new Error(`保存失败：${error.message}`)
    await removeStoragePaths([
      avatarUpload ? existing.avatar_path : null,
      audioUpload ? existing.audio_path : null,
    ])
    return mapVoiceReferenceSample(data as VoiceReferenceSampleRow)
  } catch (error) {
    await removeStoragePaths([avatarUpload?.path, audioUpload?.path])
    throw error
  }
}

export async function deleteVoiceReferenceSample(id: string) {
  const client = getSupabaseAdminClient()
  const { data, error: readError } = await client
    .from("voice_reference_samples")
    .select("avatar_path,audio_path")
    .eq("id", id)
    .single()
  if (readError || !data) throw new VoiceReferenceSampleHttpError(404, "精选参考音频不存在")

  const { error: deleteError } = await client.from("voice_reference_samples").delete().eq("id", id)
  if (deleteError) throw new Error(`删除失败：${deleteError.message}`)

  const cleanupError = await removeStoragePaths([data.avatar_path, data.audio_path])
  return { storageCleanupWarning: cleanupError?.message ?? null }
}

export class VoiceReferenceSampleHttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = "VoiceReferenceSampleHttpError"
  }
}
