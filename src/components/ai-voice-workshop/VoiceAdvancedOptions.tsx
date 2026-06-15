"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, CircleStop, Gauge, Gem, SlidersHorizontal, Sparkles, Zap, X } from "lucide-react"
import {
  voiceFastSpring,
  voicePopoverVariants,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import { useExclusiveVoicePopover } from "@/components/ai-voice-workshop/useExclusiveVoicePopover"

interface VoiceAdvancedOptionsProps {
  cfgValue: number
  inferenceTimesteps: number
  interruptible: boolean
  onCfgValueChange: (value: number) => void
  onInferenceTimestepsChange: (value: number) => void
  onInterruptibleChange: (value: boolean) => void
}

const generationPresets = [
  { id: "fast", label: "极速", description: "Steps 4 · CFG 1.7", cfgValue: 1.7, steps: 4, icon: Zap },
  { id: "recommended", label: "推荐", description: "Steps 6 · CFG 2.0", cfgValue: 2.0, steps: 6, icon: Sparkles },
  { id: "quality", label: "高质量", description: "Steps 10 · CFG 2.2", cfgValue: 2.2, steps: 10, icon: Gem },
] as const

export function VoiceAdvancedOptions({
  cfgValue,
  inferenceTimesteps,
  interruptible,
  onCfgValueChange,
  onInferenceTimestepsChange,
  onInterruptibleChange,
}: VoiceAdvancedOptionsProps) {
  const { open, closePopover, togglePopover } = useExclusiveVoicePopover("advanced-options")
  const rootRef = useRef<HTMLDivElement>(null)
  const activePreset = generationPresets.find(
    (preset) => preset.steps === inferenceTimesteps && Math.abs(preset.cfgValue - cfgValue) < 0.001,
  )?.id

  useEffect(() => {
    if (!open) return

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
  }, [closePopover, open])

  return (
    <div ref={rootRef} className={`relative ${open ? "z-40" : "z-10"}`}>
      <motion.button
        type="button"
        onClick={togglePopover}
        className="flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 text-left text-xs font-bold text-zinc-300 transition-colors hover:border-cyan-100/30 hover:bg-cyan-100/[0.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-cyan-100" />
          高级选项
          <span className="font-normal text-zinc-500">CFG {cfgValue.toFixed(1)} · Steps {inferenceTimesteps} · {interruptible ? "可中断" : "快速"}</span>
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
                onClick={closePopover}
                whileTap={voiceTap}
                transition={voiceFastSpring}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                aria-label="关闭高级选项"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="mb-5">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <span className="text-xs font-bold text-zinc-200">生成档位</span>
                <span className="text-[10px] text-zinc-500">选择后仍可手动微调</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {generationPresets.map((preset) => {
                  const Icon = preset.icon
                  const selected = activePreset === preset.id
                  return (
                    <motion.button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        onCfgValueChange(preset.cfgValue)
                        onInferenceTimestepsChange(preset.steps)
                      }}
                      whileTap={voiceTap}
                      transition={voiceFastSpring}
                      className={`relative isolate min-h-[68px] cursor-pointer overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-colors ${selected ? "border-cyan-100/35 text-white" : "border-white/[0.08] bg-black/20 text-zinc-300 hover:border-cyan-100/20 hover:bg-cyan-100/[0.035]"}`}
                      aria-pressed={selected}
                    >
                      {selected ? (
                        <motion.span
                          layoutId="voice-generation-preset"
                          className="absolute inset-0 -z-10 bg-cyan-200/[0.09]"
                          transition={voiceSpring}
                        />
                      ) : null}
                      <span className="flex items-center gap-2 text-xs font-bold">
                        <Icon className={`h-3.5 w-3.5 ${selected ? "text-cyan-100" : "text-zinc-500"}`} />
                        {preset.label}
                      </span>
                      <span className="mt-1.5 block font-mono text-[9px] text-zinc-500">{preset.description}</span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <ParameterSlider label="CFG Value" value={cfgValue.toFixed(1)} description="控制模型对音色提示或参考条件的遵循程度。">
                <input type="range" min={1} max={3} step={0.1} value={cfgValue} onChange={(event) => onCfgValueChange(Number(event.target.value))} className="w-full cursor-pointer accent-cyan-300" />
              </ParameterSlider>
              <ParameterSlider label="Steps" value={String(inferenceTimesteps)} description="控制生成打磨步数，越高越慢，细节可能更稳定。">
                <input type="range" min={4} max={30} step={1} value={inferenceTimesteps} onChange={(event) => onInferenceTimestepsChange(Number(event.target.value))} className="w-full cursor-pointer accent-cyan-300" />
              </ParameterSlider>
            </div>
            <motion.label
              layout
              transition={voiceSpring}
              className="mt-5 flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-white/[0.08] bg-black/20 p-3 transition-colors hover:border-cyan-100/20 hover:bg-cyan-100/[0.035]"
            >
              <span className="flex min-w-0 items-start gap-3">
                <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${interruptible ? "border-violet-200/25 bg-violet-300/[0.1] text-violet-100" : "border-cyan-100/15 bg-cyan-200/[0.06] text-cyan-100"}`}>
                  {interruptible ? <CircleStop className="h-4 w-4" /> : <Gauge className="h-4 w-4" />}
                </span>
                <span>
                  <span className="block text-xs font-bold text-zinc-100">可中断生成</span>
                  <span className="mt-1 block text-[11px] leading-relaxed text-zinc-400">默认关闭并使用快速 GPU 推理。开启后可在生成途中停止，但速度会明显变慢。</span>
                </span>
              </span>
              <span className={`relative mt-1 h-6 w-11 shrink-0 rounded-full border transition-colors ${interruptible ? "border-violet-200/35 bg-violet-400/35" : "border-white/12 bg-white/[0.07]"}`}>
                <motion.span
                  className="absolute left-0.5 top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-sm"
                  animate={{ x: interruptible ? 20 : 0 }}
                  transition={voiceFastSpring}
                />
              </span>
              <input type="checkbox" checked={interruptible} onChange={(event) => onInterruptibleChange(event.target.checked)} className="sr-only" />
            </motion.label>
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
