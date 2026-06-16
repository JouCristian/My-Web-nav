export type VoiceMode = "design" | "clone"
export type VoiceJobStatus = "queued" | "running" | "canceling" | "canceled" | "succeeded" | "failed"
export type VoiceEngineMode = "local" | "custom"
export type VoiceEngineStatus = "idle" | "checking" | "connected" | "disconnected" | "starting" | "failed"
export type ReferenceAudioSource = "upload" | "sample" | null

export interface VoicePreset {
  id: string
  name: string
  prompt: string
  description: string
}

export interface VoiceReferenceSample {
  id: string
  name: string
  description: string
  tags: string[]
  avatarPath?: string | null
  avatarUrl?: string | null
  audioPath: string
  audioUrl: string
  audioDurationSeconds?: number | null
  audioMimeType?: string | null
  audioSizeBytes?: number | null
  sortOrder: number
  isActive: boolean
  createdByEmail?: string | null
  createdAt: string
  updatedAt: string
}

export interface VoiceHealth {
  status: string
  model_loaded: boolean
  device: string
}

export interface VoiceEngineInfo {
  ok: boolean
  engine: string
  engine_version?: string
  capabilities?: string[]
  model_name?: string
  model_loaded: boolean
  device: string
  gpu_name?: string | null
  api_base_url?: string
}

export interface VoiceGeneratePayload {
  text: string
  mode: VoiceMode
  voicePrompt?: string
  presetId?: string
  referenceAudio?: File | null
  cloneSafetyAccepted?: boolean
  cfgValue: number
  inferenceTimesteps: number
  interruptible?: boolean
}

export interface VoiceGenerateResponse {
  job_id: string
  status: VoiceJobStatus
}

export interface VoiceJob {
  job_id: string
  status: VoiceJobStatus
  created_at?: string
  text?: string
  mode?: VoiceMode
  voice_prompt?: string
  preset_id?: string | null
  audio_url?: string | null
  audio_path?: string | null
  filename?: string | null
  duration?: number | null
  error?: string | null
}

export interface VoiceHistoryItem {
  id: string
  title?: string
  text: string
  mode: VoiceMode
  apiBaseUrl?: string
  engineKind?: VoiceEngineMode
  presetId?: string
  presetName?: string
  customVoicePrompt?: string
  /** @deprecated Use customVoicePrompt. Kept for localStorage migration. */
  voicePrompt?: string
  cfgValue?: number
  inferenceTimesteps?: number
  referenceAudioName?: string
  referenceSource?: Exclude<ReferenceAudioSource, null>
  selectedSampleId?: string
  /** @deprecated Use selectedSampleId. Kept for localStorage migration. */
  referenceSampleId?: string
  referenceSampleName?: string
  referenceSampleAvatarUrl?: string | null
  referenceSampleAudioUrl?: string
  interruptible?: boolean
  audioPath: string
  /** @deprecated Runtime-only legacy field. Do not persist blob URLs. */
  audioUrl?: string
  filename: string
  duration?: number | null
  createdAt: string
}
