export type VoiceMode = "design" | "clone"
export type VoiceJobStatus = "queued" | "running" | "canceling" | "canceled" | "succeeded" | "failed"
export type VoiceEngineMode = "local" | "custom"
export type VoiceEngineStatus = "idle" | "checking" | "connected" | "disconnected" | "starting" | "failed"

export interface VoicePreset {
  id: string
  name: string
  prompt: string
  description: string
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
  text?: string
  mode?: VoiceMode
  voice_prompt?: string
  preset_id?: string | null
  audio_url?: string | null
  filename?: string | null
  error?: string | null
}

export interface VoiceHistoryItem {
  id: string
  title?: string
  text: string
  mode: VoiceMode
  presetId?: string
  presetName?: string
  voicePrompt?: string
  cfgValue?: number
  inferenceTimesteps?: number
  referenceAudioName?: string
  referenceAudioStored?: boolean
  interruptible?: boolean
  audioUrl: string
  filename: string
  createdAt: string
}
