"use client"

import { memo, useLayoutEffect } from "react"
import type { ImagePromptItem } from "@/types/ai-image-prompt"
import { Lightbulb, Sparkles, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { PromptCopyButton } from "@/components/prompt-gallery/PromptCopyButton"
import { PromptPreviewVisual } from "@/components/prompt-gallery/PromptPreviewVisual"

interface PromptDetailDialogProps {
  item: ImagePromptItem | null
  open: boolean
  onClose: () => void
  onExitComplete?: () => void
}

function PromptDetailDialogComponent({ item, open, onClose, onExitComplete }: PromptDetailDialogProps) {
  useLayoutEffect(() => {
    if (!open) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [open, onClose])

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {open && item ? (
        <motion.div
          className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 backdrop-blur-md [will-change:opacity] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} 详情`}
        >
          <motion.div
            className="relative flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#05070d]/95 shadow-[0_-20px_80px_rgba(0,0,0,0.5)] [backface-visibility:hidden] [transform:translate3d(0,0,0)] [will-change:transform]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
              <div className="mx-auto absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15" />
              <span className="mt-1 rounded-full border border-cyan-200/20 bg-cyan-200/[0.08] px-3 py-1.5 text-xs font-bold text-cyan-100">
                {item.category}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="关闭详情"
                className="mt-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.09] hover:text-white active:scale-95"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="relative overflow-y-auto overscroll-contain px-4 pb-6 pt-4 [scrollbar-width:thin] [will-change:scroll-position] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/40 [&::-webkit-scrollbar-track]:bg-transparent">
              <PromptPreviewVisual item={item} size="detail" />

              <div className="px-1 pt-6">
                <h2 className="text-2xl font-black leading-tight tracking-tight text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{item.description}</p>

                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs text-zinc-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/30 p-4 [content-visibility:auto] [contain-intrinsic-size:220px]">
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-white">
                  <Sparkles className="h-4 w-4 text-cyan-200" />
                  完整提示词
                </div>
                <p className="max-h-[240px] overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {item.prompt}
                </p>
              </div>

              <div className="mt-4 grid gap-3 [content-visibility:auto] [contain-intrinsic-size:260px]">
                <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
                    <Lightbulb className="h-4 w-4 text-cyan-200" />
                    适用场景
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-400">{item.useCase}</p>
                </div>

                {item.tips?.length ? (
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4">
                    <div className="mb-3 text-sm font-bold text-white">使用建议</div>
                    <div className="grid gap-2">
                      {item.tips.map((tip) => (
                        <p key={tip} className="text-sm leading-relaxed text-zinc-400">
                          {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                ) : null}

                <PromptCopyButton prompt={item.prompt} label="复制提示词" className="w-full" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export const PromptDetailDialog = memo(PromptDetailDialogComponent)
