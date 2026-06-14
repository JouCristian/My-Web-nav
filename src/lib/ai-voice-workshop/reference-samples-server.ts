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
const audioExtensions = new Set(["wav", "mp3", "m4a", "aac"])
const maxAvatarBytes = 2 * 1024 * 1024
const maxAudioBytes = 4 * 1024 * 1024
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

export type VoiceReferenceUploadKind = "avatar" | "audio"

export type VoiceReferenceUploadRequest = {
  kind: VoiceReferenceUploadKind
  name: string
  mimeType: string
  size: number
}

export type VoiceReferenceUploadedFile = {
  path: string
  mimeType: string
  size: number
}

export type VoiceReferenceSamplePayload = VoiceReferenceSampleInput & {
  sampleId: string
  avatarUpload?: VoiceReferenceUploadedFile | null
  audioUpload?: VoiceReferenceUploadedFile | null
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

export async function createVoiceReferenceUploadIntents(
  requestedSampleId: string | null,
  files: VoiceReferenceUploadRequest[],
) {
  if (!files.length || files.length > 2) {
    throw new VoiceReferenceSampleHttpError(400, "请选择需要上传的头像或参考音频")
  }

  const sampleId = requestedSampleId || randomUUID()
  assertSampleId(sampleId)

  if (requestedSampleId) {
    const { data, error } = await getSupabaseAdminClient()
      .from("voice_reference_samples")
      .select("id")
      .eq("id", sampleId)
      .single()
    if (error || !data) throw new VoiceReferenceSampleHttpError(404, "精选参考音频不存在")
  }

  const seenKinds = new Set<VoiceReferenceUploadKind>()
  const storage = getSupabaseAdminClient().storage.from(voiceReferenceSampleBucket)
  const uploads = []

  for (const file of files) {
    validateUploadRequest(file)
    if (seenKinds.has(file.kind)) throw new VoiceReferenceSampleHttpError(400, "同一类文件只能上传一个")
    seenKinds.add(file.kind)

    const folder = file.kind === "avatar" ? "avatars" : "audios"
    const extension = safeFileExtension(file.name, file.kind === "avatar" ? "webp" : "wav")
    const path = `${folder}/${sampleId}/${file.kind}-${randomUUID()}.${extension}`
    const { data, error } = await storage.createSignedUploadUrl(path)
    if (error || !data) throw new Error(`${file.kind === "avatar" ? "头像" : "音频"}上传地址创建失败：${error?.message ?? "未知错误"}`)
    uploads.push({ kind: file.kind, path: data.path, token: data.token })
  }

  return { sampleId, uploads }
}

export async function cleanupVoiceReferenceUploads(sampleId: string, paths: string[]) {
  assertSampleId(sampleId)
  const scopedPaths = paths.filter((path) => isPathForSample(path, sampleId))
  if (scopedPaths.length !== paths.length) throw new VoiceReferenceSampleHttpError(400, "存在无效的存储路径")
  const error = await removeStoragePaths(scopedPaths)
  if (error) throw new Error(`临时文件清理失败：${error.message}`)
  return { success: true }
}

export async function createVoiceReferenceSample(payload: unknown, adminEmail: string) {
  const input = parseVoiceReferenceSamplePayload(payload)
  const avatarUpload = input.avatarUpload
    ? await verifyUploadedFile(input.sampleId, "avatar", input.avatarUpload)
    : null
  const audioUpload = input.audioUpload
    ? await verifyUploadedFile(input.sampleId, "audio", input.audioUpload)
    : null

  if (!audioUpload) throw new VoiceReferenceSampleHttpError(400, "请上传参考音频")

  try {
    const { data, error } = await getSupabaseAdminClient()
      .from("voice_reference_samples")
      .insert({
        id: input.sampleId,
        name: input.name,
        description: input.description,
        tags: input.tags,
        avatar_path: avatarUpload?.path ?? null,
        avatar_url: avatarUpload?.url ?? null,
        audio_path: audioUpload.path,
        audio_url: audioUpload.url,
        audio_duration_seconds: input.audioDurationSeconds,
        audio_mime_type: audioUpload.mimeType,
        audio_size_bytes: audioUpload.size,
        sort_order: input.sortOrder,
        is_active: input.isActive,
        created_by_email: adminEmail,
      })
      .select("*")
      .single()

    if (error) throw new Error(`保存失败：${error.message}`)
    return mapVoiceReferenceSample(data as VoiceReferenceSampleRow)
  } catch (error) {
    await removeStoragePaths([avatarUpload?.path, audioUpload.path])
    throw error
  }
}

export async function updateVoiceReferenceSample(id: string, payload: unknown) {
  assertSampleId(id)
  const input = parseVoiceReferenceSamplePayload(payload)
  if (input.sampleId !== id) throw new VoiceReferenceSampleHttpError(400, "样例标识不匹配")

  const client = getSupabaseAdminClient()
  const { data: existingData, error: existingError } = await client
    .from("voice_reference_samples")
    .select("*")
    .eq("id", id)
    .single()
  if (existingError || !existingData) throw new VoiceReferenceSampleHttpError(404, "精选参考音频不存在")
  const existing = existingData as VoiceReferenceSampleRow

  const avatarUpload = input.avatarUpload
    ? await verifyUploadedFile(id, "avatar", input.avatarUpload)
    : null
  const audioUpload = input.audioUpload
    ? await verifyUploadedFile(id, "audio", input.audioUpload)
    : null

  try {
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
        audio_duration_seconds: audioUpload ? input.audioDurationSeconds : existing.audio_duration_seconds,
        audio_mime_type: audioUpload ? audioUpload.mimeType : existing.audio_mime_type,
        audio_size_bytes: audioUpload ? audioUpload.size : existing.audio_size_bytes,
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

function parseVoiceReferenceSamplePayload(payload: unknown): VoiceReferenceSamplePayload {
  if (!payload || typeof payload !== "object") throw new VoiceReferenceSampleHttpError(400, "请求内容无效")
  const body = payload as Record<string, unknown>
  const name = String(body.name ?? "").trim()
  if (!name) throw new VoiceReferenceSampleHttpError(400, "名称不能为空")
  if (name.length > 80) throw new VoiceReferenceSampleHttpError(400, "名称不能超过 80 个字符")

  const sampleId = String(body.sampleId ?? "")
  assertSampleId(sampleId)
  const description = String(body.description ?? "").trim().slice(0, 500)
  const tags = Array.isArray(body.tags)
    ? [...new Set(body.tags.map((tag) => String(tag).trim()).filter(Boolean))].slice(0, 12)
    : []
  const sortOrder = Number(body.sortOrder)
  const duration = body.audioDurationSeconds === null || body.audioDurationSeconds === undefined
    ? null
    : Number(body.audioDurationSeconds)

  return {
    sampleId,
    name,
    description,
    tags,
    sortOrder: Number.isInteger(sortOrder) ? sortOrder : 0,
    isActive: body.isActive !== false,
    audioDurationSeconds: duration !== null && Number.isFinite(duration) && duration >= 0 ? duration : null,
    avatarUpload: parseUploadedFile(body.avatarUpload),
    audioUpload: parseUploadedFile(body.audioUpload),
  }
}

function parseUploadedFile(value: unknown): VoiceReferenceUploadedFile | null {
  if (value === null || value === undefined) return null
  if (typeof value !== "object") throw new VoiceReferenceSampleHttpError(400, "上传文件信息无效")
  const file = value as Record<string, unknown>
  const path = String(file.path ?? "")
  const mimeType = String(file.mimeType ?? "")
  const size = Number(file.size)
  if (!path || !Number.isFinite(size) || size <= 0) throw new VoiceReferenceSampleHttpError(400, "上传文件信息不完整")
  return { path, mimeType, size }
}

function validateUploadRequest(file: VoiceReferenceUploadRequest) {
  if (!file || (file.kind !== "avatar" && file.kind !== "audio")) {
    throw new VoiceReferenceSampleHttpError(400, "上传文件类型无效")
  }
  if (!file.name || !Number.isFinite(file.size) || file.size <= 0) {
    throw new VoiceReferenceSampleHttpError(400, "上传文件信息不完整")
  }
  validateFileMetadata(file.kind, file.name, file.mimeType, file.size)
}

function validateFileMetadata(kind: VoiceReferenceUploadKind, name: string, mimeType: string, size: number) {
  if (kind === "avatar") {
    if (!avatarMimeTypes.has(mimeType)) throw new VoiceReferenceSampleHttpError(400, "头像仅支持 PNG、JPG 或 WEBP")
    if (size > maxAvatarBytes) throw new VoiceReferenceSampleHttpError(400, "头像不能超过 2 MB")
    return
  }

  const extension = name.split(".").pop()?.toLowerCase()
  if (!audioMimeTypes.has(mimeType) && !audioExtensions.has(extension ?? "")) {
    throw new VoiceReferenceSampleHttpError(400, "参考音频仅支持 WAV、MP3、M4A 或 AAC")
  }
  if (size > maxAudioBytes) throw new VoiceReferenceSampleHttpError(400, "参考音频不能超过 4 MB")
}

async function verifyUploadedFile(
  sampleId: string,
  kind: VoiceReferenceUploadKind,
  file: VoiceReferenceUploadedFile,
) {
  if (!isPathForSample(file.path, sampleId, kind)) {
    throw new VoiceReferenceSampleHttpError(400, "上传文件路径无效")
  }

  validateFileMetadata(kind, file.path, file.mimeType, file.size)
  const storage = getSupabaseAdminClient().storage.from(voiceReferenceSampleBucket)
  const { data, error } = await storage.info(file.path)
  if (error || !data) throw new VoiceReferenceSampleHttpError(400, "上传文件不存在或尚未完成上传")

  const metadata = (data.metadata ?? {}) as Record<string, unknown>
  const actualSize = Number(metadata.size ?? file.size)
  const actualMimeType = String(metadata.mimetype ?? metadata.contentType ?? file.mimeType)
  validateFileMetadata(kind, file.path, actualMimeType, actualSize)
  if (actualSize !== file.size) throw new VoiceReferenceSampleHttpError(400, "上传文件大小校验失败")

  return {
    path: file.path,
    url: storage.getPublicUrl(file.path).data.publicUrl,
    mimeType: actualMimeType,
    size: actualSize,
  }
}

function safeFileExtension(name: string, fallback: string) {
  const extension = name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "")
  return extension || fallback
}

function assertSampleId(id: string) {
  if (!uuidPattern.test(id)) throw new VoiceReferenceSampleHttpError(400, "样例标识无效")
}

function isPathForSample(path: string, sampleId: string, kind?: VoiceReferenceUploadKind) {
  const prefixes = kind
    ? [kind === "avatar" ? `avatars/${sampleId}/` : `audios/${sampleId}/`]
    : [`avatars/${sampleId}/`, `audios/${sampleId}/`]
  return prefixes.some((prefix) => path.startsWith(prefix)) && !path.includes("..")
}

async function removeStoragePaths(paths: Array<string | null | undefined>) {
  const validPaths = paths.filter((path): path is string => Boolean(path))
  if (!validPaths.length) return null
  const { error } = await getSupabaseAdminClient().storage.from(voiceReferenceSampleBucket).remove(validPaths)
  return error
}

export class VoiceReferenceSampleHttpError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = "VoiceReferenceSampleHttpError"
  }
}
