"use client"

import { AnimatePresence, MotionConfig, motion } from "framer-motion"
import {
  AudioLines,
  AudioWaveform,
  Cpu,
  Headphones,
  Loader2,
  Mic2,
  Sparkles,
  Wand2,
} from "lucide-react"
import { type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AudioResultCard } from "@/components/ai-voice-workshop/AudioResultCard"
import { BackButton } from "@/components/back-button"
import { ReferenceAudioUploader } from "@/components/ai-voice-workshop/ReferenceAudioUploader"
import { VoiceReferenceSampleManager } from "@/components/ai-voice-workshop/VoiceReferenceSampleManager"
import {
  SelectedVoiceReferenceSample,
  VoiceReferenceSampleSelector,
} from "@/components/ai-voice-workshop/VoiceReferenceSampleSelector"
import { VoiceAdvancedOptions } from "@/components/ai-voice-workshop/VoiceAdvancedOptions"
import { VoiceEngineSettings } from "@/components/ai-voice-workshop/VoiceEngineSettings"
import { VoiceHistoryPanel } from "@/components/ai-voice-workshop/VoiceHistoryPanel"
import { VoiceWorkshopPresentationCard } from "@/components/ai-voice-workshop/VoiceWorkshopPresentationCard"
import { VoicePresetSelector } from "@/components/ai-voice-workshop/VoicePresetSelector"
import { VoiceTipsCard } from "@/components/ai-voice-workshop/VoiceTipsCard"
import {
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceSpring,
  voiceTap,
  voicePageContainer,
  voicePageItem,
} from "@/components/ai-voice-workshop/motion"
import { AutoHeight } from "@/components/ai-voice-workshop/AutoHeight"
import {
  defaultLocalVoiceApiBaseUrl,
  cancelVoiceJob,
  generateVoice,
  getVoiceEngineInfo,
  getVoiceJob,
  getVoicePresets,
  normalizeVoiceApiBaseUrl,
  resolveVoiceAudioPath,
  resolveVoiceAudioUrl,
  voiceApiBaseUrl,
} from "@/lib/ai-voice-workshop/api"
import { defaultVoicePresets } from "@/lib/ai-voice-workshop/presets"
import {
  getVoiceReferenceSamples,
  voiceReferenceSampleToFile,
} from "@/lib/ai-voice-workshop/reference-samples-api"
import type {
  ReferenceAudioSource,
  VoiceEngineInfo,
  VoiceEngineMode,
  VoiceEngineStatus,
  VoiceHealth,
  VoiceHistoryItem,
  VoiceJobStatus,
  VoiceMode,
  VoicePreset,
  VoiceReferenceSample,
} from "@/lib/ai-voice-workshop/types"

const historyStorageKey = "ai-voice-workshop-history-v1"
const maxHistoryItems = 8
const VOICE_ENGINE_MODE_KEY = "joujou_voice_engine_mode"
const VOICE_CUSTOM_API_URL_KEY = "joujou_voice_custom_api_url"
const VOICE_LOCAL_API_URL_KEY = "joujou_voice_local_api_url"

type VoiceHistoryConfig = Pick<VoiceHistoryItem, "presetId" | "presetName" | "customVoicePrompt" | "cfgValue" | "inferenceTimesteps" | "referenceAudioName" | "referenceSource" | "selectedSampleId" | "referenceSampleName" | "referenceSampleAvatarUrl" | "interruptible">

function isValidHttpUrl(url: string) {
  return /^https?:\/\/.+/i.test(url.trim())
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function normalizeHistoryItem(rawItem: unknown): VoiceHistoryItem | null {
  if (!rawItem || typeof rawItem !== "object") return null
  const item = rawItem as Partial<VoiceHistoryItem>
  if (!item.id || !item.text || !item.filename) return null
  if (item.mode !== "design" && item.mode !== "clone") return null

  const audioPath = resolveVoiceAudioPath(item.audioPath, item.audioUrl, item.filename)
  if (!audioPath) return null

  return {
    id: String(item.id),
    title: item.title,
    text: String(item.text),
    mode: item.mode,
    apiBaseUrl: item.apiBaseUrl,
    engineKind: item.engineKind,
    presetId: item.presetId,
    presetName: item.presetName,
    customVoicePrompt: item.customVoicePrompt || item.voicePrompt,
    cfgValue: item.cfgValue,
    inferenceTimesteps: item.inferenceTimesteps,
    referenceAudioName: item.referenceAudioName,
    referenceSource: item.referenceSource ?? undefined,
    selectedSampleId: item.selectedSampleId || item.referenceSampleId,
    referenceSampleName: item.referenceSampleName,
    referenceSampleAvatarUrl: item.referenceSampleAvatarUrl,
    interruptible: item.interruptible,
    audioPath,
    filename: String(item.filename),
    duration: item.duration,
    createdAt: item.createdAt || new Date().toISOString(),
  }
}

function serializeHistoryItems(items: VoiceHistoryItem[]) {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    text: item.text,
    mode: item.mode,
    apiBaseUrl: item.apiBaseUrl,
    engineKind: item.engineKind,
    presetId: item.presetId,
    presetName: item.presetName,
    customVoicePrompt: item.customVoicePrompt,
    cfgValue: item.cfgValue,
    inferenceTimesteps: item.inferenceTimesteps,
    referenceAudioName: item.referenceAudioName,
    referenceSource: item.referenceSource,
    selectedSampleId: item.selectedSampleId,
    referenceSampleName: item.referenceSampleName,
    referenceSampleAvatarUrl: item.referenceSampleAvatarUrl,
    interruptible: item.interruptible,
    audioPath: item.audioPath,
    filename: item.filename,
    duration: item.duration,
    createdAt: item.createdAt,
  }))
}

export function VoiceWorkshopClient({ isReferenceSampleAdmin = false }: { isReferenceSampleAdmin?: boolean }) {
  const [mode, setMode] = useState<VoiceMode>("design")
  const [text, setText] = useState("")
  const [voicePrompt, setVoicePrompt] = useState("")
  const [selectedPresetId, setSelectedPresetId] = useState(defaultVoicePresets[0]?.id ?? "")
  const [referenceAudio, setReferenceAudio] = useState<File | null>(null)
  const [referenceAudioSource, setReferenceAudioSource] = useState<ReferenceAudioSource>(null)
  const [selectedReferenceSample, setSelectedReferenceSample] = useState<VoiceReferenceSample | null>(null)
  const [referenceSamples, setReferenceSamples] = useState<VoiceReferenceSample[]>([])
  const [referenceSamplesLoading, setReferenceSamplesLoading] = useState(true)
  const [referenceSamplesError, setReferenceSamplesError] = useState<string | null>(null)
  const [referenceSampleManagerOpen, setReferenceSampleManagerOpen] = useState(false)
  const [referenceSelectorOpenRequest, setReferenceSelectorOpenRequest] = useState(0)
  const [cloneConsent, setCloneConsent] = useState(false)
  const [showCloneSafetyError, setShowCloneSafetyError] = useState(false)
  const [cfgValue, setCfgValue] = useState(2)
  const [inferenceTimesteps, setInferenceTimesteps] = useState(6)
  const [interruptible, setInterruptible] = useState(false)

  const [engineMode, setEngineMode] = useState<VoiceEngineMode>("local")
  const [engineStatus, setEngineStatus] = useState<VoiceEngineStatus>("idle")
  const [engineInfo, setEngineInfo] = useState<VoiceEngineInfo | null>(null)
  const [engineError, setEngineError] = useState<string | null>(null)
  const [localApiUrl, setLocalApiUrl] = useState(defaultLocalVoiceApiBaseUrl)
  const [customApiUrl, setCustomApiUrl] = useState("")
  const [customDraftApiUrl, setCustomDraftApiUrl] = useState("")
  const [engineGuideOpen, setEngineGuideOpen] = useState(false)

  const [health, setHealth] = useState<VoiceHealth | null>(null)
  const [presets, setPresets] = useState<VoicePreset[]>(defaultVoicePresets)

  const [resultStatus, setResultStatus] = useState<VoiceJobStatus | "idle">("idle")
  const [resultError, setResultError] = useState<string | null>(null)
  const [resultAudioUrl, setResultAudioUrl] = useState("")
  const [resultFilename, setResultFilename] = useState("")
  const [resultTitle, setResultTitle] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [history, setHistory] = useState<VoiceHistoryItem[]>([])
  const [historyHydrated, setHistoryHydrated] = useState(false)
  const [resultMode, setResultMode] = useState<VoiceMode>("design")
  const [resultInterruptible, setResultInterruptible] = useState(false)
  const [generationStartedAt, setGenerationStartedAt] = useState<number | null>(null)
  const [formContentVersion, setFormContentVersion] = useState(0)

  const pollTimerRef = useRef<number | null>(null)
  const activeJobIdRef = useRef<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const selectedReferenceSampleRef = useRef<VoiceReferenceSample | null>(null)

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [presets, selectedPresetId],
  )

  const refreshReferenceSamples = useCallback(async () => {
    setReferenceSamplesLoading(true)
    setReferenceSamplesError(null)
    try {
      const nextSamples = await getVoiceReferenceSamples()
      setReferenceSamples(nextSamples)
      const currentSample = selectedReferenceSampleRef.current
      if (currentSample) {
        const refreshed = nextSamples.find((sample) => sample.id === currentSample.id)
        if (refreshed) {
          selectedReferenceSampleRef.current = refreshed
          setSelectedReferenceSample(refreshed)
        } else {
          selectedReferenceSampleRef.current = null
          setSelectedReferenceSample(null)
          setReferenceAudioSource(null)
          setCloneConsent(false)
          setValidationError("当前精选参考音频已被删除或停用，请重新选择。")
        }
      }
    } catch (error) {
      setReferenceSamplesError(error instanceof Error ? error.message : "精选参考音频加载失败")
    } finally {
      setReferenceSamplesLoading(false)
    }
  }, [])

  const activeApiBaseUrl = useMemo(() => {
    if (engineMode === "custom" && customApiUrl.trim()) return normalizeVoiceApiBaseUrl(customApiUrl)
    return normalizeVoiceApiBaseUrl(localApiUrl || voiceApiBaseUrl)
  }, [customApiUrl, engineMode, localApiUrl])

  const connected = engineStatus === "connected" && Boolean(health?.model_loaded)
  const localEngineNeedsUpdate = engineMode === "local" && connected && !engineInfo?.capabilities?.includes("interruptible_generation")
  const isGenerating = resultStatus === "queued" || resultStatus === "running" || resultStatus === "canceling"
  const trimmedText = text.trim()
  const isCloneMode = mode === "clone"
  const voicePromptForGeneration = isCloneMode ? "" : voicePrompt.trim() || selectedPreset?.prompt || ""
  const displayTitle = isCloneMode
    ? selectedReferenceSample?.name
      ? `声音克隆 · ${selectedReferenceSample.name}`
      : referenceAudio?.name
      ? `声音克隆 · ${referenceAudio.name}`
      : "声音克隆"
    : selectedPreset?.name || "自定义音色"
  const cloneValidationError =
    mode === "clone" && validationError && (validationError.includes("参考音频") || validationError.includes("使用权"))
      ? validationError
      : undefined
  const generationBlockReason = isGenerating
    ? resultStatus === "canceling" ? "正在停止本次生成，请稍候。" : "当前任务正在生成，可在结果区停止本次任务。"
    : !connected
      ? "请先连接并加载声音引擎。"
      : localEngineNeedsUpdate
        ? "本地声音引擎版本过旧，请安装 0.3.0 或更高版本后重新启动。"
      : !trimmedText
        ? "请输入要合成的文字。"
        : trimmedText.length > 500
          ? "文字超过 500 字，请先精简文案。"
          : isCloneMode && !referenceAudio && !selectedReferenceSample
            ? "请上传参考音频，或从精选参考音频中选择一个声音。"
            : isCloneMode && !cloneConsent
              ? selectedReferenceSample
                ? "请确认精选参考音频仅用于本工具允许的创作用途。"
                : "请确认已获得参考音频的声音使用授权。"
              : null
  const canGenerate = generationBlockReason === null

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current !== null) {
      window.clearInterval(pollTimerRef.current)
      pollTimerRef.current = null
    }
  }, [])

  const refreshService = useCallback(async (targetApiBaseUrl: string, status: VoiceEngineStatus = "checking") => {
    const normalizedBaseUrl = normalizeVoiceApiBaseUrl(targetApiBaseUrl)
    setEngineStatus(status)
    setEngineError(null)

    try {
      const [nextInfo, nextPresets] = await Promise.all([
        getVoiceEngineInfo(normalizedBaseUrl),
        getVoicePresets(normalizedBaseUrl).catch(() => defaultVoicePresets),
      ])
      setEngineInfo(nextInfo)
      setHealth({
        status: nextInfo.model_loaded ? "ok" : "loading",
        model_loaded: nextInfo.model_loaded,
        device: nextInfo.device,
      })
      setPresets(nextPresets.length > 0 ? nextPresets : defaultVoicePresets)
      setSelectedPresetId((current) => {
        const available = nextPresets.length > 0 ? nextPresets : defaultVoicePresets
        return available.some((preset) => preset.id === current) ? current : available[0]?.id ?? ""
      })
      setEngineStatus(nextInfo.model_loaded ? "connected" : "disconnected")
      if (!nextInfo.model_loaded) setEngineError("引擎已响应，但模型尚未加载完成。")
      return nextInfo.model_loaded
    } catch (error) {
      setHealth(null)
      setEngineInfo(null)
      setPresets(defaultVoicePresets)
      setEngineStatus(status === "starting" ? "failed" : "disconnected")
      setEngineError(error instanceof Error ? error.message : "无法连接声音引擎")
      return false
    }
  }, [])

  useEffect(() => {
    const storedMode = window.localStorage.getItem(VOICE_ENGINE_MODE_KEY)
    const storedLocalUrl = window.localStorage.getItem(VOICE_LOCAL_API_URL_KEY)
    const storedCustomUrl = window.localStorage.getItem(VOICE_CUSTOM_API_URL_KEY)
    const nextMode: VoiceEngineMode = storedMode === "custom" ? "custom" : "local"
    const nextLocalUrl = normalizeVoiceApiBaseUrl(storedLocalUrl || defaultLocalVoiceApiBaseUrl)
    const nextCustomUrl = storedCustomUrl ? normalizeVoiceApiBaseUrl(storedCustomUrl) : ""
    const initialApiBaseUrl = nextMode === "custom" && nextCustomUrl ? nextCustomUrl : nextLocalUrl

    const frame = window.requestAnimationFrame(() => {
      setEngineMode(nextMode)
      setLocalApiUrl(nextLocalUrl)
      setCustomApiUrl(nextCustomUrl)
      setCustomDraftApiUrl(nextCustomUrl || defaultLocalVoiceApiBaseUrl)
      void refreshService(initialApiBaseUrl)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [refreshService])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const raw = window.localStorage.getItem(historyStorageKey)
        if (raw) {
          const parsed = JSON.parse(raw) as unknown
          const nextHistory = Array.isArray(parsed)
            ? parsed.map(normalizeHistoryItem).filter((item): item is VoiceHistoryItem => Boolean(item)).slice(0, maxHistoryItems)
            : []
          setHistory(nextHistory)
        }
      } catch {
        setHistory([])
      } finally {
        setHistoryHydrated(true)
      }
    })
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => void refreshReferenceSamples())
    return () => window.cancelAnimationFrame(frame)
  }, [refreshReferenceSamples])

  useEffect(() => {
    if (!historyHydrated) return
    try {
      window.localStorage.setItem(historyStorageKey, JSON.stringify(serializeHistoryItems(history)))
    } catch {
      // Local history is a convenience feature, so storage failures should not block generation.
    }
  }, [history, historyHydrated])

  useEffect(() => () => {
    stopPolling()
  }, [stopPolling])

  useEffect(() => {
    function handleKeyboardShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const interactive = Boolean(target?.closest("input, textarea, select, button, a, [contenteditable='true']"))
      const commandKey = event.ctrlKey || event.metaKey

      if (commandKey && event.key === "Enter") {
        event.preventDefault()
        formRef.current?.requestSubmit()
        return
      }

      if (commandKey && event.shiftKey && event.key.toLowerCase() === "d" && resultStatus === "succeeded" && resultAudioUrl) {
        event.preventDefault()
        const link = document.createElement("a")
        link.href = resultAudioUrl
        link.download = resultFilename || "voice-output.wav"
        link.click()
        return
      }

      if (!interactive && event.code === "Space" && resultStatus === "succeeded" && resultAudioUrl) {
        event.preventDefault()
        window.dispatchEvent(new Event("joujou-voice-toggle-primary-player"))
      }
    }

    window.addEventListener("keydown", handleKeyboardShortcut)
    return () => window.removeEventListener("keydown", handleKeyboardShortcut)
  }, [resultAudioUrl, resultFilename, resultStatus])

  function handleEngineModeChange(nextMode: VoiceEngineMode) {
    setEngineMode(nextMode)
    window.localStorage.setItem(VOICE_ENGINE_MODE_KEY, nextMode)

    if (nextMode === "local") {
      void refreshService(localApiUrl)
      return
    }

    if (customApiUrl) {
      void refreshService(customApiUrl)
    } else {
      setEngineStatus("idle")
      setEngineError(null)
      setEngineInfo(null)
      setHealth(null)
    }
  }

  async function handleCheckEngine() {
    await refreshService(activeApiBaseUrl)
  }

  async function handleStartLocalEngine() {
    setEngineMode("local")
    window.localStorage.setItem(VOICE_ENGINE_MODE_KEY, "local")
    window.location.href = "joujou-voice://start"

    setEngineStatus("starting")
    setEngineError(null)
    for (let attempt = 0; attempt < 30; attempt += 1) {
      await sleep(2000)
      const ok = await refreshService(localApiUrl, "starting")
      if (ok) return
      setEngineStatus("starting")
    }

    setEngineStatus("failed")
    setEngineError("启动失败，请确认本地引擎已初始化。")
  }

  async function handleSaveCustomApiUrl() {
    const normalizedUrl = normalizeVoiceApiBaseUrl(customDraftApiUrl)
    if (!isValidHttpUrl(normalizedUrl)) {
      setEngineStatus("failed")
      setEngineError("API Base URL 必须以 http:// 或 https:// 开头。")
      return
    }

    const ok = await refreshService(normalizedUrl)
    if (!ok) {
      setEngineError("自定义 API 检测失败，当前可用配置不会被覆盖。")
      return
    }

    setCustomApiUrl(normalizedUrl)
    setCustomDraftApiUrl(normalizedUrl)
    setEngineMode("custom")
    window.localStorage.setItem(VOICE_ENGINE_MODE_KEY, "custom")
    window.localStorage.setItem(VOICE_CUSTOM_API_URL_KEY, normalizedUrl)
  }

  function handleResetCustomApiUrl() {
    setCustomApiUrl("")
    setCustomDraftApiUrl(defaultLocalVoiceApiBaseUrl)
    setLocalApiUrl(defaultLocalVoiceApiBaseUrl)
    setEngineMode("local")
    window.localStorage.setItem(VOICE_ENGINE_MODE_KEY, "local")
    window.localStorage.setItem(VOICE_LOCAL_API_URL_KEY, defaultLocalVoiceApiBaseUrl)
    window.localStorage.removeItem(VOICE_CUSTOM_API_URL_KEY)
    void refreshService(defaultLocalVoiceApiBaseUrl)
  }

  function handleReferenceAudioChange(file: File | null) {
    setReferenceAudio(file)
    selectedReferenceSampleRef.current = null
    setSelectedReferenceSample(null)
    setReferenceAudioSource(file ? "upload" : null)
    setCloneConsent(false)
    if (file) setValidationError((current) => current?.includes("参考音频") ? null : current)
  }

  function handleCloneConsentChange(checked: boolean) {
    setCloneConsent(checked)
    if (checked) {
      setShowCloneSafetyError(false)
      setValidationError((current) => (current?.includes("使用权") ? null : current))
    }
  }

  function validateForm() {
    if (!connected) return "请先连接声音引擎，并等待模型加载完成。"
    if (!trimmedText) return "请输入要合成的文字。"
    if (trimmedText.length > 500) return "文字最多 500 字，请先精简文案。"
    if (isCloneMode && !referenceAudio && !selectedReferenceSample) return "声音克隆模式需要上传参考音频，或选择精选参考音频。"
    if (isCloneMode && !cloneConsent) {
      return selectedReferenceSample
        ? "请确认仅将精选参考音频用于本工具允许的创作用途，不用于冒充、欺骗或违法用途。"
        : "请确认已获得该声音使用授权，且不会用于冒充、诈骗、骚扰或其他违法违规用途。"
    }
    return null
  }

  async function pollJob(jobId: string, requestTitle: string, requestText: string, requestMode: VoiceMode, requestApiBaseUrl: string, requestEngineKind: VoiceEngineMode, requestConfig: VoiceHistoryConfig) {
    try {
      const job = await getVoiceJob(requestApiBaseUrl, jobId)
      if (activeJobIdRef.current !== jobId) return
      setResultStatus(job.status)

      if (job.status === "succeeded") {
        stopPolling()
        const filename = job.filename || "voice-output.wav"
        const audioPath = resolveVoiceAudioPath(job.audio_path, job.audio_url, filename)
        const audioUrl = resolveVoiceAudioUrl(requestApiBaseUrl, audioPath, filename)
        setResultAudioUrl(audioUrl)
        setResultFilename(filename)
        setResultTitle(requestTitle)
        setResultError(null)
        activeJobIdRef.current = null
        setHistory((current) => {
          const nextHistory = [{
            id: job.job_id,
            title: requestTitle,
            text: requestText,
            mode: requestMode,
            apiBaseUrl: requestApiBaseUrl,
            engineKind: requestEngineKind,
            ...requestConfig,
            audioPath,
            filename,
            duration: job.duration,
            createdAt: job.created_at || new Date().toISOString(),
          }, ...current.filter((item) => item.id !== job.job_id)]
          return nextHistory.slice(0, maxHistoryItems)
        })
      }

      if (job.status === "failed") {
        stopPolling()
        activeJobIdRef.current = null
        setResultError(job.error || "生成失败，请检查本地声音引擎后重试。")
      }

      if (job.status === "canceled") {
        stopPolling()
        activeJobIdRef.current = null
        setResultError(null)
      }
    } catch (error) {
      if (activeJobIdRef.current !== jobId) return
      stopPolling()
      activeJobIdRef.current = null
      setResultStatus("failed")
      setResultError(error instanceof Error ? error.message : "获取生成任务状态失败，请检查引擎连接。")
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formError = validateForm()
    const cloneSafetyError = isCloneMode && !cloneConsent
    setShowCloneSafetyError(cloneSafetyError)
    setValidationError(formError)
    if (formError || isGenerating || !canGenerate) return

    stopPolling()
    setResultStatus("queued")
    setResultError(null)
    setResultAudioUrl("")
    setResultFilename("")
    setResultTitle(displayTitle)
    setGenerationStartedAt(Date.now())

    try {
      const requestTitle = displayTitle
      const requestText = trimmedText
      const requestMode = mode
      const requestApiBaseUrl = activeApiBaseUrl
      const requestEngineKind = engineMode
      const requestSelectedSample = requestMode === "clone" ? selectedReferenceSample : null
      const requestReferenceAudio = requestMode === "clone"
        ? requestSelectedSample
          ? await voiceReferenceSampleToFile(requestSelectedSample)
          : referenceAudio
        : null
      const requestConfig: VoiceHistoryConfig = {
        presetId: requestMode === "design" ? selectedPreset?.id : undefined,
        presetName: requestMode === "design" ? selectedPreset?.name : undefined,
        customVoicePrompt: requestMode === "design" ? voicePrompt.trim() : undefined,
        cfgValue,
        inferenceTimesteps,
        interruptible,
        referenceAudioName: requestMode === "clone" ? requestReferenceAudio?.name : undefined,
        referenceSource: requestMode === "clone" ? (requestSelectedSample ? "sample" : referenceAudioSource ?? "upload") : undefined,
        selectedSampleId: requestSelectedSample?.id,
        referenceSampleName: requestSelectedSample?.name,
        referenceSampleAvatarUrl: requestSelectedSample?.avatarUrl,
      }
      setResultMode(requestMode)
      setResultInterruptible(interruptible)
      const response = await generateVoice(requestApiBaseUrl, {
        text: requestText,
        mode: requestMode,
        voicePrompt: voicePromptForGeneration,
        presetId: isCloneMode ? undefined : selectedPreset?.id,
        referenceAudio: requestReferenceAudio,
        cloneSafetyAccepted: isCloneMode ? cloneConsent : undefined,
        cfgValue,
        inferenceTimesteps,
        interruptible,
      })
      activeJobIdRef.current = response.job_id
      setResultStatus(response.status)
      await pollJob(response.job_id, requestTitle, requestText, requestMode, requestApiBaseUrl, requestEngineKind, requestConfig)
      if (activeJobIdRef.current === response.job_id) {
        pollTimerRef.current = window.setInterval(() => {
          void pollJob(response.job_id, requestTitle, requestText, requestMode, requestApiBaseUrl, requestEngineKind, requestConfig)
        }, 1000)
      }
    } catch (error) {
      activeJobIdRef.current = null
      setResultStatus("failed")
      setResultError(error instanceof Error ? error.message : "提交生成任务失败")
    }
  }

  function resetResult() {
    if (isGenerating) return
    stopPolling()
    setResultStatus("idle")
    setResultError(null)
    setResultAudioUrl("")
    setResultFilename("")
    setResultTitle("")
    setGenerationStartedAt(null)
  }

  async function handleCancelGeneration() {
    const jobId = activeJobIdRef.current
    if (!jobId || !isGenerating || resultStatus === "canceling") return

    if (!engineInfo?.capabilities?.includes("job_cancel")) {
      setResultError("当前本地声音引擎版本过旧，不支持网页停止任务。请下载并安装最新版引擎，然后重新启动。")
      return
    }

    const previousStatus = resultStatus
    setResultStatus("canceling")
    setResultError(null)
    try {
      const job = await cancelVoiceJob(activeApiBaseUrl, jobId)
      if (activeJobIdRef.current !== jobId) return
      setResultStatus(job.status)
      if (job.status === "canceled") {
        stopPolling()
        activeJobIdRef.current = null
      }
    } catch (error) {
      setResultStatus(previousStatus === "queued" ? "queued" : "running")
      setResultError(error instanceof Error ? `停止失败：${error.message}` : "停止失败，请稍后重试。")
    }
  }

  function handleDeleteHistory(id: string) {
    setHistory((current) => current.filter((item) => item.id !== id))
  }

  async function handleReuseHistory(item: VoiceHistoryItem) {
    setMode(item.mode)
    setText(item.text)
    setCfgValue(item.cfgValue ?? 2)
    setInferenceTimesteps(item.inferenceTimesteps ?? 6)
    setInterruptible(item.interruptible ?? false)
    if (item.mode === "design") {
      setReferenceAudio(null)
      setReferenceAudioSource(null)
      selectedReferenceSampleRef.current = null
      setSelectedReferenceSample(null)
      setCloneConsent(false)
      setShowCloneSafetyError(false)
      const restoredPreset = presets.find((preset) => preset.id === item.presetId) || presets.find((preset) => preset.name === item.presetName)
      if (restoredPreset) setSelectedPresetId(restoredPreset.id)
      setVoicePrompt(item.customVoicePrompt || item.voicePrompt || "")
      setValidationError(null)
    } else {
      const selectedSampleId = item.selectedSampleId || item.referenceSampleId
      const restoredSample = item.referenceSource === "sample" && selectedSampleId
        ? referenceSamples.find((sample) => sample.id === selectedSampleId) ?? null
        : null
      setReferenceAudio(null)
      setSelectedReferenceSample(restoredSample)
      selectedReferenceSampleRef.current = restoredSample
      setReferenceAudioSource(restoredSample ? "sample" : item.referenceSource === "upload" ? "upload" : null)
      setCloneConsent(false)
      setValidationError(
        item.referenceSource === "sample" && !restoredSample
          ? "这条记录使用的精选参考音频已被删除或停用，请重新选择。"
          : restoredSample
            ? null
            : "请重新上传这条记录使用的参考音频后再生成。",
      )
    }
    setFormContentVersion((current) => current + 1)
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    if (item.mode === "clone") {
      if (item.referenceSource === "sample") {
        const selectedSampleId = item.selectedSampleId || item.referenceSampleId
        return referenceSamples.some((sample) => sample.id === selectedSampleId)
          ? "文案、参数和精选参考音频已恢复，请重新确认用途"
          : "文案和参数已恢复，原精选参考音频已不可用"
      }
      return "文案和参数已恢复，参考音频需要重新上传"
    }
    return item.customVoicePrompt || item.voicePrompt ? "文案、自定义音色和参数已恢复" : "文案、预设音色和参数已恢复"
  }

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        className="voice-workshop space-y-6"
        variants={voicePageContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.header variants={voicePageItem} className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_270px_320px] xl:items-end">
          <div className="min-w-0 xl:min-h-[286px]">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton />
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-200/[0.07] px-3 py-1.5 font-mono text-[10px] text-cyan-100/85">
                <Sparkles className="h-3.5 w-3.5" />AI Voice Workshop
              </span>
            </div>
            <div className="mt-6 flex items-start gap-5">
              <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-xl border border-cyan-100/20 bg-cyan-200/[0.08] text-cyan-100 sm:grid">
                <AudioWaveform className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                <h1 className="text-balance text-5xl font-black leading-[1.02] tracking-[-0.035em] text-white sm:text-6xl xl:text-[64px]">AI 声音创作工坊</h1>
                <p className="mt-4 max-w-3xl text-pretty text-base leading-7 text-zinc-200 sm:text-lg sm:leading-8">
                  输入文本，选择音色或上传参考音频，让本地 VoxCPM2 生成可播放、可下载的 WAV 语音。
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2.5">
              {[
                { icon: Mic2, label: "VoxCPM2 TTS" },
                { icon: Headphones, label: "声音克隆" },
                { icon: AudioLines, label: "WAV 输出" },
                { icon: Cpu, label: "本地 GPU 引擎" },
              ].map((item) => {
                const Icon = item.icon
                return <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm font-bold text-zinc-200"><Icon className="h-4 w-4 text-cyan-100" />{item.label}</span>
              })}
            </div>
          </div>

          <VoiceWorkshopPresentationCard />

          <VoiceEngineSettings
            engineMode={engineMode}
            engineStatus={engineStatus}
            engineInfo={engineInfo}
            engineError={engineError}
            localApiUrl={localApiUrl}
            customDraftApiUrl={customDraftApiUrl}
            activeApiBaseUrl={activeApiBaseUrl}
            guideOpen={engineGuideOpen}
            onModeChange={handleEngineModeChange}
            onCheckEngine={() => void handleCheckEngine()}
            onStartLocalEngine={() => void handleStartLocalEngine()}
            onCustomDraftChange={setCustomDraftApiUrl}
            onSaveCustomApiUrl={() => void handleSaveCustomApiUrl()}
            onResetCustomApiUrl={handleResetCustomApiUrl}
            onToggleGuide={() => setEngineGuideOpen((open) => !open)}
          />
        </motion.header>

        <div className="grid items-stretch gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
          <motion.div variants={voicePageItem}>
          <form ref={formRef} onSubmit={handleSubmit} className="min-w-0">
            <section className="relative overflow-visible rounded-2xl border border-white/10 bg-[#090c18]/88 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-white"><Wand2 className="h-4 w-4 text-cyan-100" />创作流程</div>
              <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={formContentVersion}
                initial={{ opacity: 0, filter: "blur(3px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(3px)" }}
                transition={{ opacity: { duration: 0.15 }, filter: { duration: 0.15 } }}
                className="relative space-y-5"
              >
                <div className="absolute bottom-5 left-[15px] top-4 hidden border-l border-dashed border-cyan-200/20 sm:block" aria-hidden="true" />

                <FlowStep number="1" title="选择模式" description="选择音色设计，或使用参考音频克隆声音。">
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {[
                      { value: "design" as const, icon: Sparkles, label: "音色设计", description: "使用预设或自定义描述" },
                      { value: "clone" as const, icon: Headphones, label: "声音克隆", description: "上传参考音频贴近原声" },
                    ].map((item) => {
                      const Icon = item.icon
                      const selected = mode === item.value
                      return (
                        <motion.button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setMode(item.value)
                            setValidationError(null)
                            if (item.value !== "clone") {
                              setCloneConsent(false)
                              setShowCloneSafetyError(false)
                            }
                          }}
                          whileTap={voiceTap}
                          transition={voiceFastSpring}
                          className={`relative isolate flex min-h-[76px] cursor-pointer items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50 ${selected ? "border-cyan-200/45 bg-cyan-200/[0.08]" : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/[0.045]"}`}
                          aria-pressed={selected}
                        >
                          {selected ? <motion.span layoutId="voice-mode-selection" className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-300/[0.09] to-violet-400/[0.08]" transition={voiceSpring} /> : null}
                          <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors ${selected ? "border-cyan-100/30 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/25 text-zinc-400"}`}><Icon className="h-4 w-4" /></span>
                          <span className="min-w-0"><span className="block text-sm font-bold text-white">{item.label}</span><span className="mt-1 block text-xs text-zinc-400">{item.description}</span></span>
                        </motion.button>
                      )
                    })}
                  </div>
                </FlowStep>

                <section className="relative grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-4">
                  <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-200 to-violet-300 text-[11px] font-black text-[#07101d]">2</span>
                  <AutoHeight className="relative min-w-0">
                    <motion.div
                      key={isCloneMode ? "clone-settings" : "design-settings"}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={voiceSpring}
                    >
                      {!isCloneMode ? (
                        <>
                          <div className="mb-3"><h2 className="text-sm font-bold text-white">音色设置</h2><p className="mt-1 text-xs leading-relaxed text-zinc-400">选择预设，也可以补充自定义音色描述。</p></div>
                          <VoicePresetSelector presets={presets} selectedPreset={selectedPreset} onSelect={(preset) => setSelectedPresetId(preset.id)} />
                          <label className="mt-3 block">
                            <span className="mb-2 block text-xs font-bold text-zinc-300">自定义音色描述</span>
                            <input value={voicePrompt} onChange={(event) => setVoicePrompt(event.target.value)} placeholder="例如：年轻女性，清晰自然，语速偏慢" className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-100/45 focus:ring-2 focus:ring-cyan-200/10" />
                            <span className="mt-1.5 block text-[11px] leading-relaxed text-zinc-500">填写后优先使用自定义描述，留空则使用已选预设。</span>
                          </label>
                        </>
                      ) : (
                        <>
                          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                            <div><h2 className="text-sm font-bold text-white">参考音频</h2><p className="mt-1 text-xs leading-relaxed text-zinc-400">上传自己的音频，或从精选声音中选择；建议 5 至 20 秒纯净人声。</p></div>
                            <VoiceReferenceSampleSelector
                              samples={referenceSamples}
                              selectedSample={selectedReferenceSample}
                              loading={referenceSamplesLoading}
                              error={referenceSamplesError}
                              isAdmin={isReferenceSampleAdmin}
                              openRequestToken={referenceSelectorOpenRequest}
                              onSelect={(sample) => {
                                selectedReferenceSampleRef.current = sample
                                setSelectedReferenceSample(sample)
                                setReferenceAudio(null)
                                setReferenceAudioSource("sample")
                                setCloneConsent(false)
                                setShowCloneSafetyError(false)
                                setValidationError(null)
                              }}
                              onRefresh={() => void refreshReferenceSamples()}
                              onManage={() => setReferenceSampleManagerOpen(true)}
                            />
                          </div>
                          <AnimatePresence initial={false} mode="wait">
                            {selectedReferenceSample ? (
                              <motion.div
                                key={`selected-reference-${selectedReferenceSample.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <SelectedVoiceReferenceSample
                                  sample={selectedReferenceSample}
                                  onChange={() => setReferenceSelectorOpenRequest((current) => current + 1)}
                                  onRemove={() => {
                                    selectedReferenceSampleRef.current = null
                                    setSelectedReferenceSample(null)
                                    setReferenceAudioSource(null)
                                    setCloneConsent(false)
                                    setValidationError("请选择或上传参考音频。")
                                  }}
                                />
                                <ReferenceAudioUploader
                                  file={referenceAudio}
                                  consentChecked={cloneConsent}
                                  error={cloneValidationError}
                                  safetyError={showCloneSafetyError}
                                  showUpload={false}
                                  consentText="我确认仅将精选参考音频用于本工具允许的创作用途，不用于冒充、欺骗或违法用途。"
                                  onFileChange={handleReferenceAudioChange}
                                  onConsentChange={handleCloneConsentChange}
                                />
                              </motion.div>
                            ) : (
                              <motion.div
                                key="uploaded-reference"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <ReferenceAudioUploader
                                  file={referenceAudio}
                                  consentChecked={cloneConsent}
                                  error={cloneValidationError}
                                  safetyError={showCloneSafetyError}
                                  showUpload
                                  consentText="我确认已获得该声音使用授权，且不会用于冒充、诈骗、骚扰或其他违法违规用途。"
                                  onFileChange={handleReferenceAudioChange}
                                  onConsentChange={handleCloneConsentChange}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}
                    </motion.div>
                  </AutoHeight>
                </section>

                <FlowStep number="3" title="合成文本" description="输入要朗读的内容，一次最多 500 字。">
                  <label className="block">
                    <span className="sr-only">合成文本</span>
                    <textarea value={text} onChange={(event) => { setText(event.target.value); setValidationError((current) => current?.includes("文字") ? null : current) }} rows={5} placeholder="请输入要生成语音的文字，建议一段话控制在 500 字内。" className={`voice-scroll min-h-[132px] max-h-[280px] w-full resize-y rounded-xl border bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:ring-2 ${trimmedText.length > 500 ? "border-rose-300/55 focus:border-rose-300 focus:ring-rose-300/10" : "border-white/10 focus:border-cyan-100/45 focus:ring-cyan-200/10"}`} />
                    <span className={`mt-1.5 block text-right font-mono text-[11px] ${trimmedText.length > 500 ? "text-rose-200" : "text-zinc-500"}`}>{trimmedText.length}/500</span>
                  </label>
                </FlowStep>

                <FlowStep number="4" title="生成语音" description="确认设置后提交生成任务。">
                  <VoiceAdvancedOptions cfgValue={cfgValue} inferenceTimesteps={inferenceTimesteps} interruptible={interruptible} onCfgValueChange={setCfgValue} onInferenceTimestepsChange={setInferenceTimesteps} onInterruptibleChange={setInterruptible} />

                  <AnimatePresence mode="wait" initial={false}>
                    {validationError && !cloneValidationError ? <motion.p key={validationError} variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} role="alert" className="mt-3 rounded-xl border border-rose-200/20 bg-rose-500/[0.08] p-3 text-xs font-bold text-rose-100">{validationError}</motion.p> : null}
                  </AnimatePresence>

                  <div className="mt-3" onPointerDownCapture={() => {
                    if (!canGenerate && !isGenerating) {
                      const issue = validateForm()
                      setValidationError(issue)
                      if (isCloneMode && (referenceAudio || selectedReferenceSample) && !cloneConsent) setShowCloneSafetyError(true)
                    }
                  }}>
                    <button type="submit" disabled={!canGenerate} className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400 px-6 py-3.5 text-sm font-black text-[#07101d] transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-50" aria-keyshortcuts="Control+Enter Meta+Enter">
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AudioLines className="h-4 w-4" />}
                      {isGenerating ? "生成中..." : "开始生成 WAV"}
                    </button>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.p key={generationBlockReason || "ready"} variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className={`mt-1.5 text-center text-[11px] ${generationBlockReason ? "text-amber-100/70" : "text-emerald-100/65"}`}>
                        {generationBlockReason || "已准备好，可以开始生成。"}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </FlowStep>
              </motion.div>
              </AnimatePresence>
            </section>
          </form>
          </motion.div>

          <motion.aside variants={voicePageItem} className="flex min-w-0 flex-col gap-4 xl:max-h-full">
            <AudioResultCard status={resultStatus} mode={resultMode} interruptible={resultInterruptible} audioUrl={resultAudioUrl} filename={resultFilename} title={resultTitle} error={resultError || undefined} startedAt={generationStartedAt} onCancel={isGenerating && resultInterruptible ? () => void handleCancelGeneration() : undefined} onReset={resultStatus === "idle" || isGenerating ? undefined : resetResult} onRetry={resultStatus === "failed" || resultStatus === "canceled" ? () => formRef.current?.requestSubmit() : undefined} />
            <VoiceTipsCard />
            <VoiceHistoryPanel items={history} apiBaseUrl={activeApiBaseUrl} engineConnected={connected} onDelete={handleDeleteHistory} onReuse={handleReuseHistory} />
          </motion.aside>
        </div>
        <VoiceReferenceSampleManager
          open={referenceSampleManagerOpen}
          onClose={() => setReferenceSampleManagerOpen(false)}
          onChanged={() => void refreshReferenceSamples()}
        />
      </motion.div>
    </MotionConfig>
  )
}

function FlowStep({ number, title, description, children }: { number: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="relative grid gap-3 sm:grid-cols-[2rem_minmax(0,1fr)] sm:gap-4">
      <span className="relative z-10 grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-200 to-violet-300 text-[11px] font-black text-[#07101d]">{number}</span>
      <div className="min-w-0">
        <div className="mb-3"><h2 className="text-sm font-bold text-white">{title}</h2><p className="mt-1 text-xs leading-relaxed text-zinc-400">{description}</p></div>
        {children}
      </div>
    </section>
  )
}
