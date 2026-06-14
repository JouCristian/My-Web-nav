"use client"

import { useEffect, useMemo, useState, type DragEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CircleAlert, CircleCheck, FileAudio, ShieldCheck, UploadCloud, X } from "lucide-react"
import { VoiceAudioPlayer } from "@/components/ai-voice-workshop/VoiceAudioPlayer"
import {
  voiceErrorTransition,
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceHover,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"

interface ReferenceAudioUploaderProps {
  file: File | null
  consentChecked: boolean
  error?: string
  safetyError?: boolean
  showUpload?: boolean
  consentText?: string
  onFileChange: (file: File | null) => void
  onConsentChange: (checked: boolean) => void
}

export function ReferenceAudioUploader({
  file,
  consentChecked,
  error,
  safetyError = false,
  showUpload = true,
  consentText = "我确认已获得该声音使用授权，且不会用于冒充、诈骗、骚扰或其他违法违规用途。",
  onFileChange,
  onConsentChange,
}: ReferenceAudioUploaderProps) {
  const [dragging, setDragging] = useState(false)
  const [audioUrl, setAudioUrl] = useState("")
  const [duration, setDuration] = useState<number | null>(null)

  useEffect(() => {
    if (!file) {
      const frame = window.requestAnimationFrame(() => {
        setAudioUrl("")
        setDuration(null)
      })
      return () => window.cancelAnimationFrame(frame)
    }

    const nextUrl = URL.createObjectURL(file)
    const probe = new Audio(nextUrl)
    const frame = window.requestAnimationFrame(() => {
      setAudioUrl(nextUrl)
      setDuration(null)
    })
    probe.addEventListener("loadedmetadata", () => setDuration(Number.isFinite(probe.duration) ? probe.duration : null), { once: true })
    probe.load()
    return () => {
      window.cancelAnimationFrame(frame)
      URL.revokeObjectURL(nextUrl)
    }
  }, [file])

  const fileInspection = useMemo(() => {
    if (!file) return null
    const extension = file.name.split(".").pop()?.toUpperCase() || "AUDIO"
    const size = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / 1024 / 1024).toFixed(1)} MB`
    if (!["WAV", "MP3", "M4A", "AAC"].includes(extension)) return { tone: "warning" as const, summary: "该格式可能无法被声音引擎处理", details: `${extension} · ${size}，建议改用 WAV` }
    if (file.size > 50 * 1024 * 1024) return { tone: "warning" as const, summary: "文件较大，上传和转换可能需要更久", details: `${extension} · ${size}` }
    if (duration !== null && (duration < 5 || duration > 20)) return { tone: "warning" as const, summary: "建议使用 5 至 20 秒的参考音频", details: `${extension} · ${size} · ${formatDuration(duration)}` }
    return { tone: "good" as const, summary: duration === null ? "正在读取音频信息" : "音频长度适合声音克隆", details: `${extension} · ${size}${duration === null ? "" : ` · ${formatDuration(duration)}`} · 原格式试听` }
  }, [duration, file])

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const nextFile = event.dataTransfer.files?.[0]
    if (nextFile) onFileChange(nextFile)
  }

  return (
    <div className={showUpload ? "space-y-3" : "mt-3 space-y-3"}>
      {showUpload ? <label
        className={`group block cursor-pointer rounded-xl border border-dashed px-5 py-6 text-center transition-colors focus-within:ring-2 focus-within:ring-cyan-200/50 ${
          dragging
            ? "border-cyan-200/65 bg-cyan-200/[0.09]"
            : "border-white/15 bg-black/20 hover:border-cyan-200/40 hover:bg-cyan-200/[0.045]"
        }`}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-cyan-100/20 bg-cyan-200/[0.08] text-cyan-100 transition-transform group-hover:-translate-y-0.5">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="mt-3 block text-sm font-bold text-white">{file ? "更换参考音频" : dragging ? "松开即可上传" : "拖拽或点击上传音频"}</span>
        <span className="mt-1 block text-xs leading-relaxed text-zinc-400">支持 WAV / MP3 / M4A / AAC，自动转为 WAV；推荐 5 至 20 秒纯净人声</span>
        <input
          type="file"
          accept="audio/wav,audio/mpeg,audio/mp4,audio/aac,.wav,.mp3,.m4a,.aac"
          className="sr-only"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </label> : null}

      <AnimatePresence initial={false} mode="popLayout">
        {showUpload && file ? (
          <motion.div
            key={file.name}
            layout
            variants={voiceFadeScaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={voiceSpring}
            className="space-y-3 rounded-xl border border-cyan-100/15 bg-cyan-100/[0.055] p-3"
          >
            <div className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2">
              <FileAudio className="h-4 w-4 shrink-0 text-cyan-100" />
              <span className="truncate text-xs font-bold text-zinc-200">{file.name}</span>
            </span>
            <motion.button
              type="button"
              onClick={() => onFileChange(null)}
              whileHover={voiceHover}
              whileTap={voiceTap}
              transition={voiceFastSpring}
              className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/25 text-rose-100/75 transition-colors hover:border-rose-200/35 hover:bg-rose-500/10 hover:text-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/50"
              aria-label="移除参考音频"
            >
              <X className="h-4 w-4" />
            </motion.button>
            </div>
            {audioUrl ? <VoiceAudioPlayer id={`reference-${file.name}-${file.lastModified}`} src={audioUrl} compact /> : null}
            {fileInspection ? (
              <div className={`flex items-start gap-2 rounded-lg border px-3 py-2 text-[11px] ${fileInspection.tone === "good" ? "border-emerald-200/15 bg-emerald-300/[0.06] text-emerald-50/80" : "border-amber-200/20 bg-amber-300/[0.07] text-amber-50/80"}`}>
                {fileInspection.tone === "good" ? <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-200" /> : <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />}
                <span><b className="block font-bold text-current">{fileInspection.summary}</b><span className="mt-0.5 block opacity-65">{fileInspection.details}</span></span>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.label
        animate={safetyError ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
        transition={safetyError ? voiceErrorTransition : voiceSpring}
        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
          safetyError
            ? "border-rose-400/75 bg-rose-500/10"
            : "border-white/10 bg-white/[0.035] hover:border-cyan-100/25 hover:bg-white/[0.05]"
        }`}
      >
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(event) => onConsentChange(event.target.checked)}
          className="mt-1 h-4 w-4 cursor-pointer accent-cyan-300"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-2 text-xs font-bold text-zinc-100">
            <ShieldCheck className="h-4 w-4 text-cyan-100" />
            声音使用权确认
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
            {consentText}
          </span>
        </span>
      </motion.label>

      <AnimatePresence initial={false}>
        {error ? <motion.p key={error} variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} role="alert" className="text-xs font-bold text-rose-200">{error}</motion.p> : null}
      </AnimatePresence>
    </div>
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}
