"use client"

import { useState, type DragEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileAudio, ShieldCheck, UploadCloud, X } from "lucide-react"
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
  onFileChange: (file: File | null) => void
  onConsentChange: (checked: boolean) => void
}

export function ReferenceAudioUploader({
  file,
  consentChecked,
  error,
  safetyError = false,
  onFileChange,
  onConsentChange,
}: ReferenceAudioUploaderProps) {
  const [dragging, setDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setDragging(false)
    const nextFile = event.dataTransfer.files?.[0]
    if (nextFile) onFileChange(nextFile)
  }

  return (
    <div className="space-y-3">
      <label
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
        <span className="mt-1 block text-xs leading-relaxed text-zinc-400">支持 WAV / MP3 / M4A / AAC，推荐纯净人声 5 至 20 秒</span>
        <input
          type="file"
          accept="audio/wav,audio/mpeg,audio/mp4,audio/aac,.wav,.mp3,.m4a,.aac"
          className="sr-only"
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </label>

      <AnimatePresence initial={false} mode="popLayout">
        {file ? (
          <motion.div
            key={file.name}
            layout
            variants={voiceFadeScaleVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={voiceSpring}
            className="flex items-center justify-between gap-3 rounded-xl border border-cyan-100/15 bg-cyan-100/[0.055] px-3 py-2.5"
          >
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
            我确认拥有该参考音频的使用权，不会用于冒充、欺骗或违法用途。
          </span>
        </span>
      </motion.label>

      <AnimatePresence initial={false}>
        {error ? <motion.p key={error} variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} role="alert" className="text-xs font-bold text-rose-200">{error}</motion.p> : null}
      </AnimatePresence>
    </div>
  )
}
