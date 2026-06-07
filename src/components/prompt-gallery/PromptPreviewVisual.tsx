"use client"

import type { ImagePromptItem } from "@/types/ai-image-prompt"
import { motion } from "framer-motion"
import { SearchFlowBorder } from "@/components/prompt-gallery/SearchFlowBorder"

interface PromptPreviewVisualProps {
  item: ImagePromptItem
  size?: "card" | "detail"
  active?: boolean
  sweepKey?: number
}

export function PromptPreviewVisual({ item, size = "card", active = false, sweepKey = 0 }: PromptPreviewVisualProps) {
  const isDetail = size === "detail"
  const showSweep = active || isDetail

  return (
    <div
      className={`relative isolate overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080b12] ${isDetail ? "min-h-[360px] [transform:translate3d(0,0,0)] [will-change:transform]" : "h-52"}`}
      style={{ background: item.previewGradient }}
    >
      {item.previewImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.previewImage}
          alt={item.title}
          loading={isDetail ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isDetail ? "high" : "auto"}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : null}
      {item.previewImage ? <div className="absolute inset-0 bg-black/20" /> : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_35%)]" />
      <div className="absolute inset-[1px] rounded-[1.45rem] border border-white/[0.08]" />
      <div className="absolute left-[18%] top-[22%] h-24 w-24 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-[12%] right-[14%] h-32 w-32 rounded-full bg-cyan-300/10 blur-3xl" />
      {showSweep ? (
        <motion.div
          key={`${item.id}-${sweepKey}-sweep`}
          className="absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/12 to-transparent"
          initial={{ x: "0%" }}
          animate={{ x: "260%" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : null}
      {isDetail ? <SearchFlowBorder radius="1.5rem" /> : null}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-xs font-medium text-white/75 backdrop-blur-xl">
          {item.category}
        </span>
      </div>
    </div>
  )
}
