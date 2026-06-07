"use client"

import type { ImagePromptItem } from "@/types/ai-image-prompt"
import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { PromptCopyButton } from "@/components/prompt-gallery/PromptCopyButton"
import { PromptPreviewVisual } from "@/components/prompt-gallery/PromptPreviewVisual"
import { ClampedText } from "@/components/prompt-gallery/ClampedText"

interface PromptCardProps {
  item: ImagePromptItem
  active: boolean
  selectionVersion: number
  onSelect: (item: ImagePromptItem) => void
}

// 生成带 overshoot 的圆角矩形描边路径：从顶边中点起顺时针绘制一圈，
// 终点沿顶边越过起点 overlap 长度，闭环重叠以消除起点/终点对接的小缺口
function roundedRectPath(x: number, y: number, w: number, h: number, r: number, overlap = 14) {
  const radius = Math.min(r, w / 2, h / 2)
  const right = x + w
  const bottom = y + h
  const midX = x + w / 2
  return [
    `M${midX} ${y}`,
    `H${right - radius}`,
    `A${radius} ${radius} 0 0 1 ${right} ${y + radius}`,
    `V${bottom - radius}`,
    `A${radius} ${radius} 0 0 1 ${right - radius} ${bottom}`,
    `H${x + radius}`,
    `A${radius} ${radius} 0 0 1 ${x} ${bottom - radius}`,
    `V${y + radius}`,
    `A${radius} ${radius} 0 0 1 ${x + radius} ${y}`,
    `H${Math.min(midX + overlap, right - radius)}`,
  ].join(" ")
}

export function PromptCard({ item, active, selectionVersion, onSelect }: PromptCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const [cardSize, setCardSize] = useState({ width: 0, height: 0 })
  const [hovered, setHovered] = useState(false)
  const activeFrameInset = 2
  const activeFrameRadius = 26
  const hasCardSize = cardSize.width > 0 && cardSize.height > 0

  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const syncCardSize = () => {
      const rect = card.getBoundingClientRect()
      setCardSize({ width: Math.round(rect.width), height: Math.round(rect.height) })
    }

    syncCardSize()

    const observer = new ResizeObserver(syncCardSize)
    observer.observe(card)

    return () => observer.disconnect()
  }, [])

  return (
    <article
      ref={cardRef}
      onClick={() => onSelect(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative min-w-0 cursor-pointer overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#05070d]/82 p-3.5 shadow-[0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur-2xl"
    >
      {/* hover 一笔画描边：未选中时也给“被触碰”的反馈，比选中态更细更暗 */}
      {hasCardSize && !active ? (
        <svg
          className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
          viewBox={`0 0 ${cardSize.width} ${cardSize.height}`}
        >
          <motion.path
            d={roundedRectPath(
              activeFrameInset,
              activeFrameInset,
              cardSize.width - activeFrameInset * 2,
              cardSize.height - activeFrameInset * 2,
              activeFrameRadius,
            )}
            fill="none"
            stroke="rgba(125, 211, 252, 0.4)"
            strokeWidth="1"
            strokeLinejoin="round"
            pathLength={1}
            initial={false}
            animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
            transition={{
              pathLength: { duration: hovered ? 0.55 : 0.35, ease: hovered ? [0.16, 1, 0.3, 1] : [0.64, 0, 0.78, 0] },
              opacity: { duration: 0.3 },
            }}
            style={{ filter: "drop-shadow(0 0 5px rgba(34,211,238,0.18))" }}
          />
        </svg>
      ) : null}

      <AnimatePresence>
        {active ? (
          <motion.div
            key={`${item.id}-active-frame-base`}
            className="pointer-events-none absolute inset-[2px] z-20 rounded-[1.62rem] border border-cyan-100/45 shadow-[0_0_18px_rgba(34,211,238,0.2),inset_0_0_18px_rgba(125,211,252,0.08)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active && hasCardSize ? (
          <motion.svg
            key={`${item.id}-${selectionVersion}-active-frame`}
            className="pointer-events-none absolute inset-0 z-30 h-full w-full overflow-visible"
            viewBox={`0 0 ${cardSize.width} ${cardSize.height}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.path
              d={roundedRectPath(
                activeFrameInset,
                activeFrameInset,
                cardSize.width - activeFrameInset * 2,
                cardSize.height - activeFrameInset * 2,
                activeFrameRadius,
              )}
              fill="none"
              stroke="rgba(165, 243, 252, 0.98)"
              strokeWidth="2"
              strokeLinejoin="round"
              pathLength={1}
              style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.36))" }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.svg>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {active ? (
          <motion.div
            key={`${item.id}-active-glow`}
            className="pointer-events-none absolute inset-0 z-10 rounded-[1.75rem] bg-[radial-gradient(circle_at_24%_0%,rgba(125,211,252,0.18),transparent_36%)] shadow-[inset_0_0_0_1px_rgba(165,243,252,0.18),0_0_34px_rgba(34,211,238,0.12)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative overflow-hidden rounded-[1.45rem]">
        <PromptPreviewVisual item={item} active={active} sweepKey={selectionVersion} />
      </div>

      <div className="relative z-10 p-2 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300">
            {item.category}
          </span>
          <span className="font-mono text-[10px] text-cyan-100/70">Prompt</span>
        </div>

        <h2 className="line-clamp-1 text-xl font-black leading-tight tracking-tight text-white">{item.title}</h2>
        <ClampedText
          text={item.description}
          lines={2}
          className="mt-2 h-10 overflow-hidden text-sm leading-relaxed text-zinc-400"
        />

        <ClampedText
          text={item.promptSummary}
          lines={2}
          className="mt-4 h-[3.9375rem] overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] px-4 py-3 text-xs leading-relaxed text-zinc-300"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-[11px] text-zinc-500">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-5">
          <PromptCopyButton prompt={item.prompt} compact className="w-full" />
        </div>
      </div>
    </article>
  )
}
