"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Archive,
  Check,
  CheckCircle2,
  ChevronDown,
  Clipboard,
  Cpu,
  Download,
  Gauge,
  Loader2,
  PlugZap,
  RefreshCcw,
  RotateCcw,
  Settings2,
  TriangleAlert,
  Wrench,
  X,
} from "lucide-react"
import {
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceLayoutSpring,
  voicePopoverVariants,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import { AutoHeight } from "@/components/ai-voice-workshop/AutoHeight"
import { useExclusiveVoicePopover } from "@/components/ai-voice-workshop/useExclusiveVoicePopover"
import type { VoiceEngineInfo, VoiceEngineMode, VoiceEngineStatus } from "@/lib/ai-voice-workshop/types"

interface VoiceEngineSettingsProps {
  engineMode: VoiceEngineMode
  engineStatus: VoiceEngineStatus
  engineInfo: VoiceEngineInfo | null
  engineError: string | null
  localApiUrl: string
  customDraftApiUrl: string
  activeApiBaseUrl: string
  guideOpen: boolean
  onModeChange: (mode: VoiceEngineMode) => void
  onCheckEngine: () => void
  onStartLocalEngine: () => void
  onCustomDraftChange: (url: string) => void
  onSaveCustomApiUrl: () => void
  onResetCustomApiUrl: () => void
  onToggleGuide: () => void
}

const statusCopy: Record<VoiceEngineStatus, string> = {
  idle: "尚未检测",
  checking: "正在检测",
  connected: "引擎已连接",
  disconnected: "引擎未连接",
  starting: "正在启动",
  failed: "连接失败",
}

const secondaryButton =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.045] px-4 text-xs font-bold text-zinc-200 transition-colors hover:border-cyan-100/35 hover:bg-cyan-100/[0.07] disabled:cursor-not-allowed disabled:opacity-50"

function statusTone(status: VoiceEngineStatus) {
  if (status === "connected") return "border-emerald-200/25 bg-emerald-300/[0.08] text-emerald-100"
  if (status === "checking" || status === "starting") return "border-cyan-200/25 bg-cyan-300/[0.08] text-cyan-100"
  if (status === "failed") return "border-rose-200/25 bg-rose-500/[0.08] text-rose-100"
  return "border-amber-200/25 bg-amber-300/[0.08] text-amber-100"
}

export function VoiceEngineSettings({
  engineMode,
  engineStatus,
  engineInfo,
  engineError,
  localApiUrl,
  customDraftApiUrl,
  activeApiBaseUrl,
  guideOpen,
  onModeChange,
  onCheckEngine,
  onStartLocalEngine,
  onCustomDraftChange,
  onSaveCustomApiUrl,
  onResetCustomApiUrl,
  onToggleGuide,
}: VoiceEngineSettingsProps) {
  const { open: settingsOpen, closePopover: closeSettings, togglePopover: toggleSettings } = useExclusiveVoicePopover("engine-settings")
  const [developerOpen, setDeveloperOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const copyTimerRef = useRef<number | null>(null)
  const busy = engineStatus === "checking" || engineStatus === "starting"

  useEffect(() => {
    if (!settingsOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closeSettings()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSettings()
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [closeSettings, settingsOpen])

  useEffect(() => () => {
    if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
  }, [])

  async function copyApiUrl() {
    try {
      await navigator.clipboard.writeText(activeApiBaseUrl)
      setCopied(true)
      if (copyTimerRef.current !== null) window.clearTimeout(copyTimerRef.current)
      copyTimerRef.current = window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      ref={rootRef}
      className={`relative overflow-visible rounded-2xl border border-white/10 bg-[#090c18]/88 shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl ${settingsOpen ? "z-50" : "z-20"}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/55 to-transparent" />
      <div className="flex flex-col items-stretch gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span
              className={`relative h-2.5 w-2.5 shrink-0 rounded-full ${
                engineStatus === "connected" ? "bg-emerald-300" : busy ? "bg-cyan-300" : "bg-amber-300"
              }`}
            >
              {engineStatus === "connected" ? <span className="absolute inset-0 animate-ping rounded-full bg-emerald-300/45" /> : null}
            </span>
            <h2 className="text-sm font-bold text-white">{statusCopy[engineStatus]}</h2>
          </div>
          <p className="mt-2 truncate font-mono text-[11px] text-zinc-400">API: {activeApiBaseUrl}</p>
          {engineStatus === "connected" && engineInfo ? (
            <p className="mt-1 truncate text-xs text-emerald-100/70">
              {engineInfo.gpu_name || engineInfo.device} · {engineInfo.model_name || "VoxCPM2"}
            </p>
          ) : (
            <p className="mt-1 text-xs text-zinc-500">本地 GPU 推理，参考音频留在你的电脑中。</p>
          )}
        </div>

        <motion.button
          type="button"
          onClick={toggleSettings}
          className="inline-flex min-h-10 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border border-cyan-100/20 bg-cyan-100/[0.07] px-4 text-xs font-bold text-cyan-50 transition-colors hover:border-cyan-100/40 hover:bg-cyan-100/[0.11] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50 sm:w-auto"
          aria-expanded={settingsOpen}
          aria-haspopup="dialog"
        >
          <Settings2 className="h-4 w-4" />
          引擎设置
          <motion.span animate={{ rotate: settingsOpen ? 180 : 0 }} transition={voiceFastSpring}>
            <ChevronDown className="no-spin-hover h-3.5 w-3.5" />
          </motion.span>
        </motion.button>
      </div>

      <AnimatePresence>
        {settingsOpen ? (
          <motion.div
            variants={voicePopoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={voiceSpring}
            className="voice-scroll absolute right-0 top-[calc(100%+12px)] z-50 w-[min(520px,calc(100vw-2rem))] max-h-[min(760px,82vh)] overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[#090c18]/98 p-5 shadow-[0_16px_44px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-6"
            role="dialog"
            aria-label="声音引擎设置"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Settings2 className="h-4 w-4 text-cyan-100" />引擎设置
                </div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">管理本地引擎或连接开发者 API。</p>
              </div>
              <motion.button
                type="button"
                onClick={closeSettings}
                whileTap={voiceTap}
                transition={voiceFastSpring}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                aria-label="关闭引擎设置"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>

            <div className="relative grid grid-cols-2 rounded-xl border border-white/10 bg-black/25 p-1">
              <EngineModeButton active={engineMode === "local"} icon={<Cpu className="h-4 w-4" />} label="本地 GPU 引擎" onClick={() => onModeChange("local")} />
              <EngineModeButton active={engineMode === "custom"} icon={<PlugZap className="h-4 w-4" />} label="自定义 API" onClick={() => onModeChange("custom")} />
            </div>

            <AutoHeight className="mt-5" clip>
              <motion.div key={engineMode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={voiceSpring}>
                {engineMode === "local" ? (
                  <>
                  <div className="space-y-4">
                    <SetupRow number="1" title="下载 Windows 本地引擎包">
                      <a href="/downloads/joujou-voice-engine-windows.zip" download className="mt-2 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 px-4 text-xs font-black text-[#07101d] transition-[filter] hover:brightness-110">
                        <Download className="h-4 w-4" />下载本地引擎包
                      </a>
                    </SetupRow>
                    <SetupRow number="2" title="解压并双击 INSTALL.bat">
                      <p className="mt-1 text-xs leading-relaxed text-zinc-400">首次安装会下载运行环境和模型，请等待窗口显示完成。</p>
                    </SetupRow>
                    <SetupRow number="3" title="回到网页启动引擎">
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button type="button" onClick={onStartLocalEngine} disabled={busy} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-emerald-200/30 bg-emerald-300/[0.09] px-4 text-xs font-bold text-emerald-50 transition-colors hover:bg-emerald-300/[0.14] disabled:cursor-not-allowed disabled:opacity-50">
                          {engineStatus === "starting" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gauge className="h-4 w-4" />}启动本地引擎
                        </button>
                        <button type="button" onClick={onCheckEngine} disabled={busy} className={secondaryButton}>
                          {engineStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}检测连接
                        </button>
                      </div>
                    </SetupRow>
                  </div>

                  <EngineFeedback status={engineStatus} info={engineInfo} error={engineError} local />

                  <div className="mt-5 border-t border-white/10 pt-4">
                    <button type="button" onClick={() => setDeveloperOpen((open) => !open)} className="flex w-full cursor-pointer items-center justify-between text-left text-xs font-bold text-zinc-400" aria-expanded={developerOpen}>
                      <span className="inline-flex items-center gap-2"><Wrench className="h-4 w-4" />开发者选项</span>
                      <motion.span animate={{ rotate: developerOpen ? 180 : 0 }} transition={voiceFastSpring}><ChevronDown className="no-spin-hover h-4 w-4" /></motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {developerOpen ? (
                        <motion.div
                          key="developer-content"
                          initial={{ gridTemplateRows: "0fr", opacity: 0 }}
                          animate={{ gridTemplateRows: "1fr", opacity: 1 }}
                          exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                          transition={voiceLayoutSpring}
                          className="grid"
                        >
                          <div className="min-h-0 overflow-hidden">
                          <div className="pt-4">
                            <div className="space-y-1 break-all font-mono text-[11px] text-zinc-500">
                              <p>当前 API: {activeApiBaseUrl}</p>
                              <p>本地 API: {localApiUrl}</p>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button type="button" onClick={() => void copyApiUrl()} className={secondaryButton}>
                                {copied ? <Check className="h-4 w-4 text-emerald-200" /> : <Clipboard className="h-4 w-4" />}{copied ? "已复制" : "复制当前 API"}
                              </button>
                              <button type="button" onClick={onToggleGuide} className={secondaryButton}><Archive className="h-4 w-4" />{guideOpen ? "收起安装说明" : "查看安装说明"}</button>
                            </div>
                            <AnimatePresence initial={false}>
                              {guideOpen ? (
                                <motion.div
                                  key="guide-content"
                                  initial={{ gridTemplateRows: "0fr", opacity: 0 }}
                                  animate={{ gridTemplateRows: "1fr", opacity: 1 }}
                                  exit={{ gridTemplateRows: "0fr", opacity: 0 }}
                                  transition={voiceLayoutSpring}
                                  className="grid"
                                >
                                  <div className="min-h-0 overflow-hidden">
                                  <div className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.035] p-3 text-xs leading-relaxed text-zinc-400">首次使用请下载并解压引擎包，双击 INSTALL.bat。以后可从网页启动，也可以双击包内 START.bat。</div>
                                  </div>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </div>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                  </>
                ) : (
                  <>
                  <div className="rounded-xl border border-violet-200/15 bg-violet-300/[0.05] p-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-white"><Wrench className="h-4 w-4 text-violet-200" />开发者模式</div>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-400">连接兼容 AI 声音创作工坊接口协议的 VoxCPM 或 FastAPI 服务。</p>
                  </div>
                  <label className="mt-4 block">
                    <span className="mb-2 block text-xs font-bold text-zinc-300">API Base URL</span>
                    <input value={customDraftApiUrl} onChange={(event) => onCustomDraftChange(event.target.value)} placeholder="http://127.0.0.1:8866" className="h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 font-mono text-xs text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-100/45 focus:ring-2 focus:ring-cyan-200/10" />
                  </label>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={onSaveCustomApiUrl} disabled={busy} className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-cyan-100/25 bg-cyan-100/[0.09] px-4 text-xs font-bold text-cyan-50 transition-colors hover:bg-cyan-100/[0.14] disabled:cursor-not-allowed disabled:opacity-50">
                      {engineStatus === "checking" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}保存并检测
                    </button>
                    <button type="button" onClick={onResetCustomApiUrl} className={secondaryButton}><RotateCcw className="h-4 w-4" />恢复默认地址</button>
                    <button type="button" onClick={() => void copyApiUrl()} className={secondaryButton}>{copied ? <Check className="h-4 w-4 text-emerald-200" /> : <Clipboard className="h-4 w-4" />}{copied ? "已复制" : "复制当前 API"}</button>
                  </div>
                  <EngineFeedback status={engineStatus} info={engineInfo} error={engineError} />
                  </>
                )}
              </motion.div>
            </AutoHeight>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function EngineModeButton({ active, icon, label, onClick }: { active: boolean; icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={onClick} whileTap={voiceTap} transition={voiceFastSpring} className={`relative isolate flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition-colors ${active ? "text-cyan-50" : "text-zinc-400"}`}>
      {active ? <motion.span layoutId="voice-engine-tab" className="absolute inset-0 -z-10 rounded-lg border border-cyan-200/35 bg-cyan-200/[0.09]" transition={voiceSpring} /> : null}
      <span className={active ? "text-cyan-100" : "text-zinc-500"}>{icon}</span>{label}
    </motion.button>
  )
}

function SetupRow({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-cyan-200 to-violet-300 text-[11px] font-black text-[#08101d]">{number}</span>
      <div className="min-w-0 pt-1"><h3 className="text-xs font-bold text-zinc-100">{title}</h3>{children}</div>
    </div>
  )
}

function EngineFeedback({ status, info, error, local = false }: { status: VoiceEngineStatus; info: VoiceEngineInfo | null; error: string | null; local?: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {status === "connected" && info ? (
        <motion.div key="connected" variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="mt-4 rounded-xl border border-emerald-200/20 bg-emerald-300/[0.07] p-3 text-xs text-emerald-50">
          <div className="flex items-center gap-2 font-bold"><CheckCircle2 className="h-4 w-4" />{local ? "本地引擎已连接" : "自定义引擎已连接"}</div>
          <div className="mt-2 grid gap-1 text-emerald-50/75 sm:grid-cols-2"><span>模型：{info.model_name || "openbmb/VoxCPM2"}</span><span>设备：{info.device}</span><span className="sm:col-span-2">GPU：{info.gpu_name || "未检测到 GPU"}</span></div>
        </motion.div>
      ) : status === "failed" || status === "disconnected" ? (
        <motion.div key="error" variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className={`mt-4 rounded-xl border p-3 text-xs leading-relaxed ${statusTone(status)}`}>
          <div className="mb-1 flex items-center gap-2 font-bold"><TriangleAlert className="h-4 w-4" />{local ? "尚未检测到本地引擎" : "自定义 API 连接失败"}</div>
          {error || (local ? "首次使用请先完成下载与安装。" : "请检查 API 地址和服务状态。")}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
