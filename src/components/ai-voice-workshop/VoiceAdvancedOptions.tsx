"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, SlidersHorizontal, X } from "lucide-react"
import {
  voiceFastSpring,
  voicePopoverVariants,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"

interface VoiceAdvancedOptionsProps {
  cfgValue: number
  inferenceTimesteps: number
  onCfgValueChange: (value: number) => void
  onInferenceTimestepsChange: (value: number) => void
}

export function VoiceAdvancedOptions({
  cfgValue,
  inferenceTimesteps,
  onCfgValueChange,
  onInferenceTimestepsChange,
}: VoiceAdvancedOptionsProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={`relative ${open ? "z-40" : "z-10"}`}>
      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 text-left text-xs font-bold text-zinc-300 transition-colors hover:border-cyan-100/30 hover:bg-cyan-100/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-cyan-100" />
          高级选项
          <span className="font-normal text-zinc-500">CFG {cfgValue.toFixed(1)} · Steps {inferenceTimesteps}</span>
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={voiceFastSpring}>
          <ChevronDown className="no-spin-hover h-4 w-4" />
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            variants={voicePopoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={voiceSpring}
            className="voice-scroll absolute bottom-[calc(100%+10px)] right-0 z-50 w-[min(520px,calc(100vw-3rem))] max-h-[min(420px,55vh)] overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[#090c18]/98 p-5 shadow-[0_12px_36px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-6"
            role="dialog"
            aria-label="高级生成选项"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">高级生成选项</div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">默认参数适合大多数内容，调整后立即生效。</p>
              </div>
              <motion.button
                type="button"
                onClick={() => setOpen(false)}
                whileTap={voiceTap}
                transition={voiceFastSpring}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                aria-label="关闭高级选项"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ParameterSlider label="CFG Value" value={cfgValue.toFixed(1)} description="控制模型对音色提示或参考条件的遵循程度。">
                <input type="range" min={1} max={3} step={0.1} value={cfgValue} onChange={(event) => onCfgValueChange(Number(event.target.value))} className="w-full cursor-pointer accent-cyan-300" />
              </ParameterSlider>
              <ParameterSlider label="Steps" value={String(inferenceTimesteps)} description="控制生成打磨步数，越高越慢，细节可能更稳定。">
                <input type="range" min={4} max={30} step={1} value={inferenceTimesteps} onChange={(event) => onInferenceTimestepsChange(Number(event.target.value))} className="w-full cursor-pointer accent-cyan-300" />
              </ParameterSlider>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function ParameterSlider({ label, value, description, children }: { label: string; value: string; description: string; children: ReactNode }) {
  return (
    <label className="block rounded-xl border border-white/[0.08] bg-black/20 p-3">
      <span className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-zinc-200">
        <span>{label}</span>
        <b className="rounded-full bg-cyan-200/[0.09] px-2 py-1 font-mono text-cyan-100">{value}</b>
      </span>
      {children}
      <span className="mt-3 block text-[11px] leading-relaxed text-zinc-400">{description}</span>
    </label>
  )
}
