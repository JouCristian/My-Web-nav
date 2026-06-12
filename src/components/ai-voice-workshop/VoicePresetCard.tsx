"use client"

import { motion } from "framer-motion"
import { Check, Mic2 } from "lucide-react"
import { voiceFastSpring, voiceSpring, voiceTap } from "@/components/ai-voice-workshop/motion"
import type { VoicePreset } from "@/lib/ai-voice-workshop/types"

interface VoicePresetCardProps {
  preset: VoicePreset
  selected: boolean
  onSelect: (preset: VoicePreset) => void
}

export function VoicePresetCard({ preset, selected, onSelect }: VoicePresetCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(preset)}
      whileTap={voiceTap}
      transition={voiceFastSpring}
      className={`group relative min-h-[116px] cursor-pointer overflow-hidden rounded-xl border p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/60 ${
        selected
          ? "border-cyan-200/50 bg-cyan-200/[0.1]"
          : "border-white/10 bg-[#0b0e1a]/72 hover:border-violet-200/25 hover:bg-white/[0.055]"
      }`}
      role="option"
      aria-selected={selected}
    >
      {selected ? <motion.span layoutId="voice-preset-highlight" className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-violet-300 to-transparent" transition={voiceSpring} /> : null}
      <span className="relative flex items-start gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors ${
            selected ? "border-cyan-100/30 bg-cyan-200/15 text-cyan-100" : "border-white/10 bg-black/25 text-zinc-400"
          }`}
        >
          <Mic2 className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold text-white">{preset.name}</span>
            <motion.span
              initial={false}
              animate={selected ? { scale: 1, opacity: 1 } : { scale: 0.75, opacity: 0 }}
              transition={voiceFastSpring}
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-200 text-cyan-950"
            >
              <Check className="h-3 w-3" />
            </motion.span>
          </span>
          <span className="mt-1 block text-xs leading-relaxed text-zinc-400">{preset.description}</span>
        </span>
      </span>
      <span className="relative mt-3 block line-clamp-2 text-[11px] leading-relaxed text-cyan-50/60">{preset.prompt}</span>
    </motion.button>
  )
}
