"use client"

import { motion, useReducedMotion } from "framer-motion"
import { ExternalLink, Play, Presentation, Sparkles } from "lucide-react"
import { voiceFastSpring, voiceSpring, voiceTap } from "@/components/ai-voice-workshop/motion"

const previewBars = [34, 58, 44, 76, 52, 88, 64, 72, 46, 82, 56, 68]

export function VoiceWorkshopPresentationCard() {
  const reduceMotion = useReducedMotion()

  return (
    <motion.a
      href="/presentations/voice-workshop-presentation.html"
      target="_blank"
      rel="noreferrer"
      aria-label="预览 JouJou 工具库 VoxCPM2 项目演示"
      whileHover={reduceMotion ? undefined : { y: -3, scale: 1.012 }}
      whileTap={voiceTap}
      transition={voiceSpring}
      className="group relative isolate flex min-h-[188px] w-full min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-cyan-100/16 bg-[#090c18]/88 p-4 text-left shadow-[0_8px_24px_rgba(0,0,0,0.24)] outline-none backdrop-blur-xl transition-colors hover:border-cyan-100/36 focus-visible:ring-2 focus-visible:ring-cyan-200/55 xl:h-[224px]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-35 transition-opacity duration-300 group-hover:opacity-55"
        style={{ backgroundImage: "radial-gradient(circle, rgba(103,232,249,.38) 1px, transparent 1.2px)", backgroundSize: "18px 18px" }}
      />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/55 to-transparent" />
      {!reduceMotion ? (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-cyan-100/[0.08] to-transparent"
          animate={{ x: ["-140%", "420%"] }}
          transition={{ duration: 4.8, repeat: Infinity, repeatDelay: 1.4, ease: [0.16, 1, 0.3, 1] }}
        />
      ) : null}

      <div className="relative z-10 flex w-full min-w-0 flex-col justify-between gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-cyan-100/70">
              <Presentation className="h-3.5 w-3.5" /> 项目可视化演示
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-400">点击打开 20 页交互式网页 PPT</p>
          </div>
          <motion.span
            animate={reduceMotion ? undefined : { x: [0, 2, 0], y: [0, -2, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/12 bg-white/[0.05] text-zinc-300 transition-colors group-hover:border-cyan-100/35 group-hover:text-cyan-100"
          >
            <ExternalLink className="h-4 w-4" />
          </motion.span>
        </div>

        <div>
          <div className="flex items-end gap-1.5" aria-hidden="true">
            {previewBars.map((height, index) => (
              <motion.span
                key={`${height}-${index}`}
                className="w-1 origin-bottom bg-cyan-200/75"
                style={{ height: `${Math.round(height * 0.45)}px` }}
                animate={reduceMotion ? undefined : { scaleY: [0.45, 1, 0.62] }}
                transition={{ duration: 1.4 + (index % 3) * 0.18, repeat: Infinity, repeatType: "mirror", delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
          </div>
          <div className="mt-3 flex min-w-0 items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Sparkles className="h-4 w-4 text-cyan-100" /> JouJou × VoxCPM2
              </div>
              <p className="mt-1 text-xs leading-5 text-zinc-400">可视化开源语音创作项目</p>
            </div>
            <motion.span
              whileHover={reduceMotion ? undefined : { scale: 1.06 }}
              transition={voiceFastSpring}
              className="hidden shrink-0 items-center gap-1.5 rounded-full bg-cyan-200 px-3 py-1.5 text-[11px] font-black text-[#07101d] sm:inline-flex"
            >
              <Play className="h-3 w-3 fill-current" /> 预览
            </motion.span>
          </div>
        </div>
      </div>
    </motion.a>
  )
}
