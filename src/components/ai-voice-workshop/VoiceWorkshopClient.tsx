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
import { VoiceAdvancedOptions } from "@/components/ai-voice-workshop/VoiceAdvancedOptions"
import { VoiceEngineSettings } from "@/components/ai-voice-workshop/VoiceEngineSettings"
import { VoiceHistoryPanel } from "@/components/ai-voice-workshop/VoiceHistoryPanel"
import { VoicePresetSelector } from "@/components/ai-voice-workshop/VoicePresetSelector"
import { VoiceTipsCard } from "@/components/ai-voice-workshop/VoiceTipsCard"
import {
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceLayoutSpring,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import {
  defaultLocalVoiceApiBaseUrl,
  generateVoice,
  getVoiceEngineInfo,
  getVoiceJob,
  getVoicePresets,
  normalizeVoiceApiBaseUrl,
  resolveVoiceAudioUrl,
  voiceApiBaseUrl,
} from "@/lib/ai-voice-workshop/api"
import { defaultVoicePresets } from "@/lib/ai-voice-workshop/presets"
import type {
  VoiceEngineInfo,
  VoiceEngineMode,
  VoiceEngineStatus,
  VoiceHealth,
  VoiceHistoryItem,
  VoiceJobStatus,
  VoiceMode,
  VoicePreset,
} from "@/lib/ai-voice-workshop/types"

const historyStorageKey = "ai-voice-workshop-history-v1"
const maxHistoryItems = 8
const VOICE_ENGINE_MODE_KEY = "joujou_voice_engine_mode"
const VOICE_CUSTOM_API_URL_KEY = "joujou_voice_custom_api_url"
const VOICE_LOCAL_API_URL_KEY = "joujou_voice_local_api_url"

function isValidHttpUrl(url: string) {
  return /^https?:\/\/.+/i.test(url.trim())
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function VoiceWorkshopClient() {
  const [mode, setMode] = useState<VoiceMode>("design")
  const [text, setText] = useState("")
  const [voicePrompt, setVoicePrompt] = useState("")
  const [selectedPresetId, setSelectedPresetId] = useState(defaultVoicePresets[0]?.id ?? "")
  const [referenceAudio, setReferenceAudio] = useState<File | null>(null)
  const [cloneConsent, setCloneConsent] = useState(false)
  const [showCloneSafetyError, setShowCloneSafetyError] = useState(false)
  const [cfgValue, setCfgValue] = useState(2)
  const [inferenceTimesteps, setInferenceTimesteps] = useState(10)

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
  const [resultMode, setResultMode] = useState<VoiceMode>("design")

  const pollTimerRef = useRef<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [presets, selectedPresetId],
  )

  const activeApiBaseUrl = useMemo(() => {
    if (engineMode === "custom" && customApiUrl.trim()) return normalizeVoiceApiBaseUrl(customApiUrl)
    return normalizeVoiceApiBaseUrl(localApiUrl || voiceApiBaseUrl)
  }, [customApiUrl, engineMode, localApiUrl])

  const connected = engineStatus === "connected" && Boolean(health?.model_loaded)
  const isGenerating = resultStatus === "queued" || resultStatus === "running"
  const trimmedText = text.trim()
  const isCloneMode = mode === "clone"
  const voicePromptForGeneration = isCloneMode ? "" : voicePrompt.trim() || selectedPreset?.prompt || ""
  const displayTitle = isCloneMode
    ? referenceAudio?.name
      ? `声音克隆 · ${referenceAudio.name}`
      : "声音克隆"
    : selectedPreset?.name || "自定义音色"
  const cloneValidationError =
    mode === "clone" && validationError && (validationError.includes("参考音频") || validationError.includes("使用权"))
      ? validationError
      : undefined
  const canGenerate =
    connected &&
    !isGenerating &&
    trimmedText.length > 0 &&
    trimmedText.length <= 500 &&
    (!isCloneMode || (Boolean(referenceAudio) && cloneConsent))

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
      setEngineError(error instanceof Error ? error.message : "无法连接 voice-service")
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

    setEngineMode(nextMode)
    setLocalApiUrl(nextLocalUrl)
    setCustomApiUrl(nextCustomUrl)
    setCustomDraftApiUrl(nextCustomUrl || defaultLocalVoiceApiBaseUrl)
    void refreshService(initialApiBaseUrl)
  }, [refreshService])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(historyStorageKey)
      if (raw) setHistory(JSON.parse(raw) as VoiceHistoryItem[])
    } catch {
      setHistory([])
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(historyStorageKey, JSON.stringify(history))
    } catch {
      // Local history is a convenience feature, so storage failures should not block generation.
    }
  }, [history])

  useEffect(() => stopPolling, [stopPolling])

  useEffect(() => {
    if (!isCloneMode) {
      setCloneConsent(false)
      setShowCloneSafetyError(false)
    }
  }, [isCloneMode])

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

  function validateForm() {
    if (!connected) return "请先启动 voice-service，并等待 VoxCPM2 模型加载完成。"
    if (!trimmedText) return "请输入要合成的文字。"
    if (trimmedText.length > 500) return "文字最多 500 字，请先精简文案。"
    if (isCloneMode && !referenceAudio) return "声音克隆模式需要上传参考音频。"
    if (isCloneMode && !cloneConsent) return "请先确认拥有参考音频使用权，并承诺不会用于冒充、欺骗或违法用途。"
    return null
  }

  async function pollJob(jobId: string, requestTitle: string, requestText: string, requestMode: VoiceMode, requestApiBaseUrl: string) {
    try {
      const job = await getVoiceJob(requestApiBaseUrl, jobId)
      setResultStatus(job.status)

      if (job.status === "succeeded") {
        stopPolling()
        const audioUrl = resolveVoiceAudioUrl(requestApiBaseUrl, job.audio_url, job.filename)
        const filename = job.filename || "voice-output.wav"
        setResultAudioUrl(audioUrl)
        setResultFilename(filename)
        setResultTitle(requestTitle)
        setResultError(null)
        setHistory((current) => [
          {
            id: job.job_id,
            title: requestTitle,
            text: requestText,
            mode: requestMode,
            presetName: requestMode === "clone" ? undefined : requestTitle,
            audioUrl,
            filename,
            createdAt: new Date().toISOString(),
          },
          ...current.filter((item) => item.id !== job.job_id),
        ].slice(0, maxHistoryItems))
      }

      if (job.status === "failed") {
        stopPolling()
        setResultError(job.error || "生成失败，请查看 voice-service 终端日志。")
      }
    } catch (error) {
      stopPolling()
      setResultStatus("failed")
      setResultError(error instanceof Error ? error.message : "轮询���务状态失败")
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

    try {
      const requestTitle = displayTitle
      const requestText = trimmedText
      const requestMode = mode
      const requestApiBaseUrl = activeApiBaseUrl
      setResultMode(requestMode)
      const response = await generateVoice(requestApiBaseUrl, {
        text: requestText,
        mode: requestMode,
        voicePrompt: voicePromptForGeneration,
        presetId: isCloneMode ? undefined : selectedPreset?.id,
        referenceAudio,
        cloneSafetyAccepted: isCloneMode ? cloneConsent : undefined,
        cfgValue,
        inferenceTimesteps,
      })
      setResultStatus(response.status)
      await pollJob(response.job_id, requestTitle, requestText, requestMode, requestApiBaseUrl)
      pollTimerRef.current = window.setInterval(() => {
        void pollJob(response.job_id, requestTitle, requestText, requestMode, requestApiBaseUrl)
      }, 1000)
    } catch (error) {
      setResultStatus("failed")
      setResultError(error instanceof Error ? error.message : "提交生成任务失败")
    }
  }

  function resetResult() {
    stopPolling()
    setResultStatus("idle")
    setResultError(null)
    setResultAudioUrl("")
    setResultFilename("")
    setResultTitle("")
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="space-y-6">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.46fr)] lg:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <BackButton />
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/18 bg-cyan-200/[0.07] px-3 py-1.5 font-mono text-[10px] text-cyan-100/85">
                <Sparkles className="h-3.5 w-3.5" />AI Voice Workshop
              </span>
            </div>
            <div className="mt-5 flex items-start gap-4">
              <span className="hidden h-12 w-12 shrink-0 place-items-center rounded-xl border border-cyan-100/20 bg-cyan-200/[0.08] text-cyan-100 sm:grid">
                <AudioWaveform className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <h1 className="text-balance text-4xl font-black leading-tight tracking-[-0.03em] text-white sm:text-5xl">AI 声音创作工坊</h1>
                <p className="mt-3 max-w-3xl text-pretty text-sm leading-6 text-zinc-300 sm:text-base">
                  输入文本，选择音色或上传参考音频，让本地 VoxCPM2 生成可播放、可下载的 WAV 语音。
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { icon: Mic2, label: "VoxCPM2 TTS" },
                { icon: Headphones, label: "声音克隆" },
                { icon: AudioLines, label: "WAV 输出" },
                { icon: Cpu, label: "本地 GPU 引擎" },
              ].map((item) => {
                const Icon = item.icon
                return <span key={item.label} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-zinc-300"><Icon className="h-3.5 w-3.5 text-cyan-100" />{item.label}</span>
              })}
            </div>
          </div>

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
        </header>

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(390px,0.92fr)]">
          <form ref={formRef} onSubmit={handleSubmit} className="min-w-0">
            <motion.section layout transition={voiceLayoutSpring} className="relative overflow-visible rounded-2xl border border-white/10 bg-[#090c18]/88 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/60 to-transparent" />
              <div className="mb-5 flex items-center gap-2 text-sm font-bold text-white"><Wand2 className="h-4 w-4 text-cyan-100" />创作流程</div>

              <motion.div layout transition={voiceLayoutSpring} className="relative space-y-5">
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

                <motion.div layout transition={voiceLayoutSpring} className="relative">
                  <AnimatePresence mode="popLayout" initial={false}>
                    {!isCloneMode ? (
                      <motion.div key="design-settings" layout variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring}>
                        <FlowStep number="2" title="音色设置" description="选择预设，也可以补充自定义音色描述。">
                          <VoicePresetSelector presets={presets} selectedPreset={selectedPreset} onSelect={(preset) => setSelectedPresetId(preset.id)} />
                          <label className="mt-3 block">
                            <span className="mb-2 block text-xs font-bold text-zinc-300">自定义音色描述</span>
                            <input value={voicePrompt} onChange={(event) => setVoicePrompt(event.target.value)} placeholder="例如：年轻女性，清晰自然，语速偏慢" className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-100/45 focus:ring-2 focus:ring-cyan-200/10" />
                            <span className="mt-1.5 block text-[11px] leading-relaxed text-zinc-500">填写后优先使用自定义描述，留空则使用已选预设。</span>
                          </label>
                        </FlowStep>
                      </motion.div>
                    ) : (
                      <motion.div key="clone-settings" layout variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring}>
                        <FlowStep number="2" title="参考音频" description="建议使用纯净、无背景噪声的 5 至 20 秒人声。">
                          <ReferenceAudioUploader
                            file={referenceAudio}
                            consentChecked={cloneConsent}
                            error={cloneValidationError}
                            safetyError={showCloneSafetyError}
                            onFileChange={setReferenceAudio}
                            onConsentChange={(checked) => {
                              setCloneConsent(checked)
                              if (checked) {
                                setShowCloneSafetyError(false)
                                setValidationError((current) => (current?.includes("使用权") ? null : current))
                              }
                            }}
                          />
                        </FlowStep>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <FlowStep number="3" title="合成文本" description="输入要朗读的内容，一次最多 500 字。">
                  <label className="block">
                    <span className="sr-only">合成文本</span>
                    <textarea value={text} onChange={(event) => setText(event.target.value)} rows={5} placeholder="请输入要生成语音的文字，建议一段话控制在 500 字内。" className={`min-h-[132px] w-full resize-y rounded-xl border bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:ring-2 ${trimmedText.length > 500 ? "border-rose-300/55 focus:border-rose-300 focus:ring-rose-300/10" : "border-white/10 focus:border-cyan-100/45 focus:ring-cyan-200/10"}`} />
                    <span className={`mt-1.5 block text-right font-mono text-[11px] ${trimmedText.length > 500 ? "text-rose-200" : "text-zinc-500"}`}>{trimmedText.length}/500</span>
                  </label>
                </FlowStep>

                <FlowStep number="4" title="生成语音" description="确认设置后提交生成任务。">
                  <VoiceAdvancedOptions cfgValue={cfgValue} inferenceTimesteps={inferenceTimesteps} onCfgValueChange={setCfgValue} onInferenceTimestepsChange={setInferenceTimesteps} />

                  <AnimatePresence mode="wait" initial={false}>
                    {validationError && !cloneValidationError ? <motion.p key={validationError} variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} role="alert" className="mt-3 rounded-xl border border-rose-200/20 bg-rose-500/[0.08] p-3 text-xs font-bold text-rose-100">{validationError}</motion.p> : null}
                  </AnimatePresence>

                  <div className="mt-3" onPointerDownCapture={() => {
                    if (isCloneMode && referenceAudio && !cloneConsent) {
                      setShowCloneSafetyError(true)
                      setValidationError("请先确认拥有参考音频使用权，并承诺不会用于冒充、欺骗或违法用途。")
                    }
                  }}>
                    <button type="submit" disabled={!canGenerate} className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400 px-6 py-3.5 text-sm font-black text-[#07101d] transition-[filter,opacity] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-35 disabled:saturate-50">
                      {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <AudioLines className="h-4 w-4" />}
                      {isGenerating ? "生成中..." : "开始生成 WAV"}
                    </button>
                    {!connected ? <p className="mt-1.5 text-center text-[11px] text-amber-100/70">连接并加载声音引擎后即可生成。</p> : null}
                  </div>
                </FlowStep>
              </motion.div>
            </motion.section>
          </form>

          <aside className="min-w-0 space-y-4 xl:sticky xl:top-24 xl:self-start">
            <AudioResultCard status={resultStatus} mode={resultMode} audioUrl={resultAudioUrl} filename={resultFilename} title={resultTitle} error={resultError || undefined} onReset={resultStatus === "idle" ? undefined : resetResult} onRetry={resultStatus === "failed" ? () => formRef.current?.requestSubmit() : undefined} />
            <VoiceTipsCard />
            <VoiceHistoryPanel items={history} onClear={() => setHistory([])} />
          </aside>
        </div>
      </div>
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
