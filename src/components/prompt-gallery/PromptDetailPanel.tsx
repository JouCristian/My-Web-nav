"use client"

import { useEffect, useRef } from "react"
import type { ImagePromptItem } from "@/types/ai-image-prompt"
import { imagePromptGenerationModes } from "@/types/ai-image-prompt"
import { Lightbulb, Sparkles } from "lucide-react"
import { motion } from "framer-motion"
import { PromptCopyButton } from "@/components/prompt-gallery/PromptCopyButton"
import { PromptPreviewVisual } from "@/components/prompt-gallery/PromptPreviewVisual"
import { PromptFavoriteButton } from "@/components/prompt-gallery/PromptFavoriteButton"

interface PromptDetailPanelProps {
  item: ImagePromptItem
  panelHeight?: number | null
  favoriteBusy?: boolean
  onToggleFavorite: (item: ImagePromptItem) => void
}

const panelTransition = {
  type: "spring" as const,
  stiffness: 230,
  damping: 25,
}

export function PromptDetailPanel({ item, panelHeight, favoriteBusy = false, onToggleFavorite }: PromptDetailPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const generationModeLabel =
    imagePromptGenerationModes.find((mode) => mode.value === item.generationMode)?.label ?? "直接生成创意图片"

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [item.id])

  return (
    <motion.aside
      key={item.id}
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.985 }}
      transition={panelTransition}
      style={panelHeight ? { height: panelHeight, maxHeight: panelHeight } : undefined}
      className={panelHeight ? "min-w-0" : "min-w-0 lg:h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)] lg:min-h-[70vh]"}
    >
        <div className="relative overflow-visible rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl lg:h-full">
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-[2rem]"
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="absolute inset-0 rounded-[2rem] border border-cyan-200/20" />
            <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent" />
          </motion.div>
          <div
            ref={scrollRef}
            className="relative z-10 overflow-y-auto [scrollbar-color:rgba(125,211,252,0.48)_transparent] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-cyan-100/15 [&::-webkit-scrollbar-thumb]:bg-cyan-200/45 [&::-webkit-scrollbar-track]:bg-transparent lg:h-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.06 }}
            >
              <PromptPreviewVisual item={item} size="detail" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...panelTransition, delay: 0.14 }}
              className="relative z-10 px-1 pt-6"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1.5 text-xs font-bold text-cyan-100">
                  {item.category}
                </span>
                <span className="rounded-full border border-violet-200/15 bg-violet-300/[0.07] px-3 py-1.5 text-xs font-bold text-violet-50">
                  {generationModeLabel}
                </span>
              </div>

              <h2 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">{item.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>

              <div className="mt-4">
                <PromptFavoriteButton
                  active={Boolean(item.isFavorited)}
                  busy={favoriteBusy}
                  label={item.isFavorited ? "已加入收藏" : "加入收藏"}
                  onToggle={() => onToggleFavorite(item)}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span key={tag} className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs text-zinc-500">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...panelTransition, delay: 0.22 }}
              className="relative z-10 mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                <Sparkles className="h-4 w-4 text-cyan-200" />
                完整提示词
              </div>
              <p className="max-h-[260px] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {item.prompt}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...panelTransition, delay: 0.3 }}
              className="relative z-10 mt-4 grid gap-3"
            >
              <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                  <Lightbulb className="h-4 w-4 text-cyan-200" />
                  适用场景
                </div>
                <p className="text-sm leading-relaxed text-zinc-400">{item.useCase}</p>
              </div>

              <PromptCopyButton prompt={item.prompt} label="复制提示词" className="w-full" />
            </motion.div>
              </div>
        </div>
      </motion.aside>
  )
}
