"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronRight, Clock3, Download, Pause, Play, Trash2, X } from "lucide-react"
import {
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceHover,
  voicePopoverVariants,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import type { VoiceHistoryItem } from "@/lib/ai-voice-workshop/types"

interface VoiceHistoryPanelProps {
  items: VoiceHistoryItem[]
  onClear: () => void
}

function formatDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "--:--"
  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)
  return `${minutes}:${remaining.toString().padStart(2, "0")}`
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "刚刚"
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date)
}

export function VoiceHistoryPanel({ items, onClear }: VoiceHistoryPanelProps) {
  const [allOpen, setAllOpen] = useState(false)
  const rootRef = useRef<HTMLElement>(null)
  const visibleItems = items.slice(0, 3)

  useEffect(() => {
    if (!allOpen) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setAllOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAllOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [allOpen])

  return (
    <section ref={rootRef} className={`relative overflow-visible rounded-2xl border border-white/10 bg-[#090c18]/82 p-5 backdrop-blur-xl sm:p-6 ${allOpen ? "z-40" : "z-10"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Clock3 className="h-4 w-4 text-cyan-100" />最近生成</div>
          <p className="mt-1 text-xs text-zinc-500">最近 {items.length}/8 条，仅保存在当前浏览器</p>
        </div>
        <div className="flex items-center gap-2">
          {items.length > 3 ? (
            <button type="button" onClick={() => setAllOpen((current) => !current)} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-bold text-zinc-300 transition-colors hover:border-cyan-100/25" aria-expanded={allOpen}>
              查看全部<ChevronRight className="h-3.5 w-3.5" />
            </button>
          ) : null}
          {items.length > 0 ? (
            <motion.button type="button" onClick={() => { setAllOpen(false); onClear() }} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-black/20 text-rose-100/65 transition-colors hover:border-rose-200/30 hover:bg-rose-500/10 hover:text-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200/50" aria-label="清空生成历史">
              <Trash2 className="h-4 w-4" />
            </motion.button>
          ) : null}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-black/18 p-5 text-sm leading-relaxed text-zinc-400">生成成功后会自动保留最近记录，方便回听和下载。</div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {visibleItems.map((item) => <HistoryRow key={item.id} item={item} />)}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {allOpen ? (
          <motion.div variants={voicePopoverVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="voice-scroll absolute bottom-[calc(100%+10px)] right-0 z-50 w-[min(540px,calc(100vw-3rem))] max-h-[min(520px,60vh)] overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[#090c18]/98 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-5" role="dialog" aria-label="全部生成历史">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><div className="text-sm font-bold text-white">全部生成记录</div><p className="mt-1 text-xs text-zinc-500">最多保留 8 条本地记录</p></div>
              <motion.button type="button" onClick={() => setAllOpen(false)} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white" aria-label="关闭全部生成历史"><X className="h-4 w-4" /></motion.button>
            </div>
            <div className="space-y-2">{items.map((item) => <HistoryRow key={item.id} item={item} />)}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function HistoryRow({ item }: { item: VoiceHistoryItem }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [duration, setDuration] = useState(0)

  async function togglePlayback() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <motion.article layout variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="group flex items-center gap-3 rounded-xl border border-transparent bg-black/20 p-3 transition-colors hover:border-white/10 hover:bg-white/[0.045]">
      <motion.button type="button" onClick={() => void togglePlayback()} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-cyan-100/20 bg-cyan-100/[0.07] text-cyan-50 transition-colors hover:bg-cyan-100/[0.13] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50" aria-label={playing ? "暂停历史音频" : "播放历史音频"}>
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </motion.button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2"><div className="truncate text-xs font-bold text-zinc-100">{item.title || item.presetName || (item.mode === "clone" ? "声音克隆" : "自定义音色")}</div><span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-400">{item.mode === "clone" ? "克隆" : "设计"}</span></div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500"><span>{formatTime(item.createdAt)}</span><span>·</span><span>{formatDuration(duration)}</span></div>
      </div>
      <motion.a href={item.audioUrl} download={item.filename} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50" aria-label="下载历史音频"><Download className="h-4 w-4" /></motion.a>
      <audio ref={audioRef} src={item.audioUrl} preload="metadata" onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onEnded={() => setPlaying(false)} className="hidden" />
    </motion.article>
  )
}
