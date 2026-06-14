"use client"

import { useEffect } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Clock3, Headphones, Library, Loader2, RefreshCw, Settings2, Sparkles, X } from "lucide-react"
import { VoiceAudioPlayer } from "@/components/ai-voice-workshop/VoiceAudioPlayer"
import {
  voiceFastSpring,
  voiceHover,
  voiceLayoutSpring,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import { useExclusiveVoicePopover } from "@/components/ai-voice-workshop/useExclusiveVoicePopover"
import type { VoiceReferenceSample } from "@/lib/ai-voice-workshop/types"

interface VoiceReferenceSampleSelectorProps {
  samples: VoiceReferenceSample[]
  selectedSample: VoiceReferenceSample | null
  loading: boolean
  error: string | null
  isAdmin: boolean
  onSelect: (sample: VoiceReferenceSample) => void
  onRefresh: () => void
  onManage: () => void
  openRequestToken?: number
}

export function VoiceReferenceSampleSelector({
  samples,
  selectedSample,
  loading,
  error,
  isAdmin,
  onSelect,
  onRefresh,
  onManage,
  openRequestToken = 0,
}: VoiceReferenceSampleSelectorProps) {
  const { open, openPopover, closePopover, togglePopover } = useExclusiveVoicePopover("reference-samples")
  useEffect(() => {
    if (openRequestToken <= 0) return
    const frame = window.requestAnimationFrame(openPopover)
    return () => window.cancelAnimationFrame(frame)
  }, [openPopover, openRequestToken])
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopover()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [closePopover, open])

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-black/68 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) closePopover()
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label="精选参考音频"
            initial={{ opacity: 0, y: 28, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.975 }}
            transition={voiceSpring}
            className="voice-scroll relative flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-white/12 bg-[#090d19]/98 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:max-h-[82vh] sm:rounded-2xl"
          >
            <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent" />
            <header className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-base font-black text-white"><Library className="h-4 w-4 text-cyan-100" />精选参考音频</div>
                <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">试听并选择一个预设角色声音，作为本次声音克隆的参考。</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {isAdmin ? (
                  <motion.button
                    type="button"
                    onClick={() => {
                      closePopover()
                      onManage()
                    }}
                    whileHover={voiceHover}
                    whileTap={voiceTap}
                    transition={voiceFastSpring}
                    className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-cyan-100/18 bg-cyan-100/[0.07] px-3 text-[11px] font-bold text-cyan-50 transition-colors hover:border-cyan-100/35 hover:bg-cyan-100/[0.11]"
                  >
                    <Settings2 className="h-3.5 w-3.5" />管理
                  </motion.button>
                ) : null}
                <motion.button type="button" onClick={closePopover} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white" aria-label="关闭精选参考音频">
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </header>

            <div className="voice-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
              {loading ? (
                <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-white/10 bg-black/18 text-center">
                  <div><Loader2 className="mx-auto h-6 w-6 animate-spin text-cyan-100" /><p className="mt-3 text-sm font-bold text-zinc-200">正在载入精选声音</p></div>
                </div>
              ) : error ? (
                <div className="grid min-h-64 place-items-center rounded-xl border border-rose-200/15 bg-rose-500/[0.045] px-5 text-center">
                  <div><p className="text-sm font-bold text-rose-100">精选音频暂时加载失败</p><p className="mt-2 text-xs leading-relaxed text-rose-100/60">{error}</p><motion.button type="button" onClick={onRefresh} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="mt-4 inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-white/12 bg-white/[0.05] px-4 text-xs font-bold text-white"><RefreshCw className="h-3.5 w-3.5" />重新加载</motion.button></div>
                </div>
              ) : samples.length === 0 ? (
                <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-white/10 bg-black/18 px-5 text-center">
                  <div><Sparkles className="mx-auto h-6 w-6 text-cyan-100/70" /><p className="mt-3 text-sm font-bold text-zinc-200">还没有可用的精选声音</p><p className="mt-1.5 text-xs text-zinc-500">管理员添加并启用样例后会显示在这里。</p></div>
                </div>
              ) : (
                <motion.div layout transition={voiceLayoutSpring} className="grid gap-3 md:grid-cols-2">
                  {samples.map((sample) => {
                    const selected = selectedSample?.id === sample.id
                    return (
                      <motion.article key={sample.id} layout transition={voiceLayoutSpring} className={`relative overflow-hidden rounded-xl border p-4 transition-colors ${selected ? "border-cyan-200/45 bg-cyan-200/[0.08]" : "border-white/10 bg-black/20 hover:border-white/18 hover:bg-white/[0.035]"}`}>
                        {selected ? <motion.div layoutId="selected-reference-sample" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-200/[0.06] to-violet-300/[0.04]" transition={voiceSpring} /> : null}
                        <div className="relative flex items-start gap-3">
                          <SampleAvatar sample={sample} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2"><h3 className="truncate text-sm font-black text-white">{sample.name}</h3>{selected ? <Check className="h-4 w-4 shrink-0 text-cyan-100" /> : null}</div>
                            <p className="mt-1 line-clamp-2 min-h-9 text-xs leading-relaxed text-zinc-400">{sample.description || "适合作为声音克隆参考的精选人声。"}</p>
                          </div>
                        </div>
                        <div className="relative mt-3 flex min-h-5 flex-wrap gap-1.5">
                          {sample.tags.map((tag) => <span key={tag} className="rounded-full border border-white/8 bg-white/[0.045] px-2 py-0.5 text-[10px] font-bold text-zinc-400">{tag}</span>)}
                          {sample.audioDurationSeconds ? <span className="inline-flex items-center gap-1 px-1 text-[10px] text-zinc-500"><Clock3 className="h-3 w-3" />{formatDuration(sample.audioDurationSeconds)}</span> : null}
                        </div>
                        <div className="relative mt-3"><VoiceAudioPlayer id={`featured-sample-${sample.id}`} src={sample.audioUrl} compact /></div>
                        <motion.button
                          type="button"
                          onClick={() => {
                            onSelect(sample)
                            closePopover()
                          }}
                          whileHover={voiceHover}
                          whileTap={voiceTap}
                          transition={voiceFastSpring}
                          className="relative mt-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-100/22 bg-cyan-100/[0.08] px-4 text-xs font-black text-cyan-50 transition-colors hover:border-cyan-100/40 hover:bg-cyan-100/[0.13]"
                        >
                          <Headphones className="h-4 w-4" />{selected ? "继续使用此声音" : "使用此声音"}
                        </motion.button>
                      </motion.article>
                    )
                  })}
                </motion.div>
              )}
            </div>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return (
    <>
      <motion.button type="button" onClick={togglePopover} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border border-cyan-100/18 bg-cyan-100/[0.065] px-3.5 text-[11px] font-bold text-cyan-50 transition-colors hover:border-cyan-100/35 hover:bg-cyan-100/[0.11]" aria-expanded={open}>
        <Library className="h-3.5 w-3.5" />精选参考音频
      </motion.button>
      {typeof document !== "undefined" ? createPortal(overlay, document.body) : null}
    </>
  )
}

export function SelectedVoiceReferenceSample({ sample, onChange, onRemove }: { sample: VoiceReferenceSample; onChange: () => void; onRemove: () => void }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.975 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.975 }} transition={voiceSpring} className="relative overflow-hidden rounded-xl border border-cyan-100/22 bg-cyan-100/[0.065] p-4">
      <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/60 to-transparent" />
      <div className="flex items-start gap-3">
        <SampleAvatar sample={sample} />
        <div className="min-w-0 flex-1"><p className="text-[10px] font-black uppercase text-cyan-100/65">已选择精选参考音频</p><h3 className="mt-1 truncate text-sm font-black text-white">{sample.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-400">{sample.description}</p></div>
      </div>
      <div className="mt-3"><VoiceAudioPlayer id={`selected-featured-sample-${sample.id}`} src={sample.audioUrl} compact /></div>
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        <motion.button type="button" onClick={onChange} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.045] px-3 text-[11px] font-bold text-zinc-200 transition-colors hover:border-cyan-100/25 hover:text-white"><RefreshCw className="h-3.5 w-3.5" />更换</motion.button>
        <motion.button type="button" onClick={onRemove} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-rose-200/12 bg-rose-500/[0.045] px-3 text-[11px] font-bold text-rose-100/75 transition-colors hover:border-rose-200/25 hover:bg-rose-500/[0.08] hover:text-rose-50"><X className="h-3.5 w-3.5" />移除</motion.button>
      </div>
    </motion.div>
  )
}

function SampleAvatar({ sample }: { sample: VoiceReferenceSample }) {
  return (
    <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/12 bg-gradient-to-br from-cyan-200/15 to-violet-300/12 text-cyan-100">
      {sample.avatarUrl ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(sample.avatarUrl).slice(1, -1)})` }} aria-label={`${sample.name} 头像`} /> : <Headphones className="h-5 w-5" />}
    </span>
  )
}

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const remainder = Math.round(seconds % 60)
  return `${minutes}:${remainder.toString().padStart(2, "0")}`
}
