"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Mic2, X } from "lucide-react"
import { VoicePresetCard } from "@/components/ai-voice-workshop/VoicePresetCard"
import {
  voiceFastSpring,
  voiceHover,
  voicePopoverVariants,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import type { VoicePreset } from "@/lib/ai-voice-workshop/types"

interface VoicePresetSelectorProps {
  presets: VoicePreset[]
  selectedPreset?: VoicePreset
  onSelect: (preset: VoicePreset) => void
}

export function VoicePresetSelector({ presets, selectedPreset, onSelect }: VoicePresetSelectorProps) {
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
        whileHover={voiceHover}
        whileTap={voiceTap}
        transition={voiceFastSpring}
        className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/22 px-4 text-left transition-colors hover:border-cyan-100/35 hover:bg-cyan-100/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-cyan-100/20 bg-cyan-200/[0.08] text-cyan-100">
          <Mic2 className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-white">{selectedPreset?.name || "选择音色"}</span>
          <span className="mt-1 block truncate text-xs text-zinc-400">
            {selectedPreset?.description || "从预设音色中选择"}
          </span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-cyan-100">
          更换音色
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={voiceFastSpring}>
            <ChevronDown className="h-4 w-4" />
          </motion.span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            variants={voicePopoverVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={voiceSpring}
            className="absolute left-0 top-[calc(100%+10px)] z-50 w-[min(640px,calc(100vw-3rem))] max-h-[min(520px,60vh)] overflow-y-auto overscroll-contain rounded-2xl border border-white/12 bg-[#090c18]/98 p-4 shadow-[0_12px_36px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-5"
            role="listbox"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold text-white">选择预设音色</div>
                <p className="mt-1 text-xs leading-relaxed text-zinc-400">选择后自动关闭，切换模式不会丢失当前选择。</p>
              </div>
              <motion.button
                type="button"
                onClick={() => setOpen(false)}
                whileTap={voiceTap}
                transition={voiceFastSpring}
                className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white"
                aria-label="关闭音色选择"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {presets.map((preset) => (
                <VoicePresetCard
                  key={preset.id}
                  preset={preset}
                  selected={selectedPreset?.id === preset.id}
                  onSelect={(nextPreset) => {
                    onSelect(nextPreset)
                    setOpen(false)
                  }}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
