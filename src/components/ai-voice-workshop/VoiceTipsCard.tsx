"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Lightbulb } from "lucide-react"
import {
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceHover,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"

export function VoiceTipsCard() {
  const [open, setOpen] = useState(false)

  return (
    <motion.section layout transition={voiceSpring} className="overflow-hidden rounded-2xl border border-amber-200/15 bg-amber-300/[0.045] backdrop-blur-xl">
      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileHover={voiceHover}
        whileTap={voiceTap}
        transition={voiceFastSpring}
        className="flex min-h-[52px] w-full cursor-pointer items-center justify-between gap-3 px-5 text-left text-sm font-bold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-200/40"
        aria-expanded={open}
      >
        <span className="inline-flex items-center gap-2"><Lightbulb className="h-4 w-4 text-amber-200" />使用提示</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={voiceFastSpring}><ChevronDown className="h-4 w-4 text-zinc-500" /></motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring}>
            <ul className="space-y-2 border-t border-white/[0.07] px-5 py-4 text-xs leading-relaxed text-zinc-400">
              <li>音色设计适合创造新声音，声音克隆用于贴近参考音色。</li>
              <li>参考音频建议纯净、无背景噪声，时长 5 至 20 秒。</li>
              <li>生成任务单线程执行，模型加载或排队时请稍候。</li>
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  )
}
