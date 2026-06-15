"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, ChevronRight, Clock3, Download, Loader2, RotateCcw, SlidersHorizontal, Trash2, X } from "lucide-react"
import { VoiceAudioPlayer } from "@/components/ai-voice-workshop/VoiceAudioPlayer"
import {
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceHover,
  voiceLayoutSpring,
  voicePopoverVariants,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import { useExclusiveVoicePopover } from "@/components/ai-voice-workshop/useExclusiveVoicePopover"
import type { VoiceHistoryItem } from "@/lib/ai-voice-workshop/types"

interface VoiceHistoryPanelProps {
  items: VoiceHistoryItem[]
  onDelete: (id: string) => void
  onReuse: (item: VoiceHistoryItem) => Promise<string>
}

function formatTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "刚刚"
  return new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(date)
}

export function VoiceHistoryPanel({ items, onDelete, onReuse }: VoiceHistoryPanelProps) {
  const { open: allOpen, closePopover, togglePopover } = useExclusiveVoicePopover("history")
  const [deletingIds, setDeletingIds] = useState<string[]>([])
  const deleteTimers = useRef<number[]>([])
  const rootRef = useRef<HTMLElement>(null)
  const visibleItems = items.slice(0, 3)

  useEffect(() => () => deleteTimers.current.forEach((timer) => window.clearTimeout(timer)), [])

  useEffect(() => {
    if (!allOpen) return
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) closePopover()
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closePopover()
    }
    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [allOpen, closePopover])

  function deleteWithAnimation(id: string) {
    if (deletingIds.includes(id)) return
    setDeletingIds((current) => [...current, id])
    const timer = window.setTimeout(() => {
      onDelete(id)
      setDeletingIds((current) => current.filter((itemId) => itemId !== id))
    }, 180)
    deleteTimers.current.push(timer)
  }

  return (
    <section ref={rootRef} className={`relative flex min-h-0 flex-1 flex-col overflow-visible rounded-2xl border border-white/10 bg-[#090c18]/82 p-5 backdrop-blur-xl sm:p-6 ${allOpen ? "z-40" : "z-10"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Clock3 className="h-4 w-4 text-cyan-100" />最近生成</div>
          <p className="mt-1 text-xs text-zinc-500">最近 {items.length}/8 条，仅保存在当前浏览器</p>
        </div>
        {items.length > 3 ? (
          <motion.button type="button" onClick={togglePopover} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[11px] font-bold text-zinc-300 transition-colors hover:border-cyan-100/25 hover:text-white" aria-expanded={allOpen}>
            查看全部<ChevronRight className="h-3.5 w-3.5" />
          </motion.button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-black/18 p-5 text-sm leading-relaxed text-zinc-400">生成成功后会自动保留最近记录，方便回听、复用和下载。</div>
      ) : (
        <motion.div layout transition={voiceLayoutSpring} className="voice-scroll max-h-[440px] min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1">
          <AnimatePresence initial={false} mode="sync">
            {visibleItems.map((item) => <HistoryRow key={item.id} scope="recent" item={item} deleting={deletingIds.includes(item.id)} onDelete={() => deleteWithAnimation(item.id)} onReuse={() => onReuse(item)} />)}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {allOpen ? (
          <motion.div variants={voicePopoverVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="voice-scroll absolute bottom-[calc(100%+10px)] right-0 z-50 w-[min(560px,calc(100vw-3rem))] max-h-[min(560px,65vh)] overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[#090c18]/98 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-5" role="dialog" aria-label="全部生成历史">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div><div className="text-sm font-bold text-white">全部生成记录</div><p className="mt-1 text-xs text-zinc-500">最多保留 8 条本地记录</p></div>
              <motion.button type="button" onClick={closePopover} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white" aria-label="关闭全部生成历史"><X className="h-4 w-4" /></motion.button>
            </div>
            <motion.div layout transition={voiceLayoutSpring} className="space-y-2">
              <AnimatePresence initial={false} mode="sync">
                {items.map((item) => <HistoryRow key={item.id} scope="all" item={item} deleting={deletingIds.includes(item.id)} onDelete={() => deleteWithAnimation(item.id)} onReuse={() => onReuse(item)} />)}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  )
}

function HistoryRow({ item, scope, deleting, onDelete, onReuse }: { item: VoiceHistoryItem; scope: string; deleting: boolean; onDelete: () => void; onReuse: () => Promise<string> }) {
  const [reuseToast, setReuseToast] = useState(false)
  const [reuseMessage, setReuseMessage] = useState("")
  const [reusePending, setReusePending] = useState(false)
  const reuseTimer = useRef<number | null>(null)

  useEffect(() => () => {
    if (reuseTimer.current !== null) window.clearTimeout(reuseTimer.current)
  }, [])

  async function handleReuse() {
    if (reusePending) return
    setReusePending(true)
    try {
      const message = await onReuse()
      setReuseMessage(message)
      setReuseToast(true)
      if (reuseTimer.current !== null) window.clearTimeout(reuseTimer.current)
      reuseTimer.current = window.setTimeout(() => setReuseToast(false), 2200)
    } finally {
      setReusePending(false)
    }
  }

  return (
    <motion.article
      layout
      variants={voiceFadeScaleVariants}
      initial="hidden"
      animate={deleting ? { opacity: 0, scale: 0.965, filter: "blur(3px)" } : "visible"}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={deleting ? { duration: 0.18, ease: [0.4, 0, 1, 1] } : voiceLayoutSpring}
      className="group rounded-xl border border-transparent bg-black/20 p-3 transition-colors hover:border-white/10 hover:bg-white/[0.045]"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {item.referenceSource === "sample" && item.referenceSampleAvatarUrl ? <span className="h-5 w-5 shrink-0 rounded-md border border-white/10 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(item.referenceSampleAvatarUrl).slice(1, -1)})` }} /> : null}
            <div className="truncate text-xs font-bold text-zinc-100">{item.title || item.presetName || (item.mode === "clone" ? "声音克隆" : "自定义音色")}</div><span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold text-zinc-400">{item.mode === "clone" ? "克隆" : "设计"}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-zinc-500"><span>{formatTime(item.createdAt)}</span><span>·</span><span>CFG {item.cfgValue?.toFixed(1) ?? "2.0"}</span><span>·</span><span>{item.inferenceTimesteps ?? 6} Steps</span></div>
        </div>
        <div className="relative flex shrink-0 items-center gap-1">
          <HistoryAction label="使用此配置" onClick={() => void handleReuse()} disabled={reusePending}>{reusePending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}</HistoryAction>
          <HistoryAction label="删除此记录" danger onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></HistoryAction>
          <AnimatePresence>
            {reuseToast ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.72, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -2 }}
                transition={{ type: "spring", stiffness: 560, damping: 24, mass: 0.62 }}
                className="pointer-events-none absolute right-0 top-[calc(100%+6px)] z-20 flex w-max max-w-56 items-center gap-1.5 rounded-lg border border-cyan-100/20 bg-[#101827]/98 px-2.5 py-2 text-[10px] font-bold text-cyan-50 shadow-[0_6px_14px_rgba(0,0,0,0.3)]"
                role="status"
              >
                <Check className="h-3.5 w-3.5 text-cyan-200" />
                {reuseMessage}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="mt-3"><VoiceAudioPlayer id={`history-${scope}-${item.id}`} src={item.audioUrl} compact /></div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="inline-flex min-w-0 items-center gap-1.5 truncate text-[10px] text-zinc-500"><SlidersHorizontal className="h-3 w-3 shrink-0" />{item.mode === "clone" ? item.referenceSource === "sample" ? `精选 · ${item.referenceSampleName || "参考音频"}` : `${item.referenceAudioName || "参考音频"} · 复用时需重新上传` : item.voicePrompt || item.presetName || "预设音色"}</span>
        <motion.a href={item.audioUrl} download={item.filename} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-bold text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-cyan-50" aria-label="下载历史音频"><Download className="h-3.5 w-3.5" />下载</motion.a>
      </div>
    </motion.article>
  )
}

function HistoryAction({ label, danger = false, disabled = false, onClick, children }: { label: string; danger?: boolean; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return <motion.button type="button" onClick={onClick} disabled={disabled} whileTap={disabled ? undefined : voiceTap} transition={voiceFastSpring} className={`grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-wait disabled:opacity-60 ${danger ? "text-rose-100/60 hover:border-rose-200/20 hover:bg-rose-500/10 hover:text-rose-50 focus-visible:ring-rose-200/40" : "text-zinc-400 hover:border-cyan-100/15 hover:bg-cyan-100/[0.07] hover:text-cyan-50 focus-visible:ring-cyan-200/40"}`} aria-label={label} title={label}>{children}</motion.button>
}
