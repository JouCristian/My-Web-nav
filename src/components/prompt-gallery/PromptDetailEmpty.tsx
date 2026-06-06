"use client"

import { motion } from "framer-motion"
import { SearchX } from "lucide-react"

interface PromptDetailEmptyProps {
  panelHeight?: number | null
  onClearFilters: () => void
  hasActiveFilters: boolean
}

const stroke = "rgba(165,243,252,0.95)"
const glow = { filter: "drop-shadow(0 0 6px rgba(34,211,238,0.45))" }

// 循环一笔画：依次描绘画框 → 落日 → 山峦，并往复循环
function drawLoop(delay: number) {
  return {
    initial: { pathLength: 0, opacity: 0.15 },
    animate: { pathLength: [0, 1, 1, 0], opacity: [0.15, 1, 1, 0.15] },
    transition: {
      duration: 2.4,
      ease: [0.65, 0, 0.35, 1] as const,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 0.8,
      delay,
    },
  }
}

export function PromptDetailEmpty({ panelHeight, onClearFilters, hasActiveFilters }: PromptDetailEmptyProps) {
  return (
    <motion.aside
      key="detail-empty"
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.985 }}
      transition={{ type: "spring", stiffness: 230, damping: 25 }}
      style={panelHeight ? { height: panelHeight, maxHeight: panelHeight } : undefined}
      className={panelHeight ? "min-w-0" : "min-w-0 lg:h-[calc(100vh-120px)] lg:max-h-[calc(100vh-120px)] lg:min-h-[70vh]"}
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
        {/* 图片预览区：循环一笔画动画 */}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-cyan-200/[0.06] via-black/20 to-black/40">
          {/* 背景网点 */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(rgba(125,211,252,0.9) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
          <svg
            width={180}
            height={180}
            viewBox="0 0 120 120"
            fill="none"
            aria-hidden="true"
            className="relative overflow-visible"
          >
            {/* 画框 */}
            <motion.rect
              x={18}
              y={26}
              width={84}
              height={68}
              rx={10}
              fill="none"
              stroke={stroke}
              strokeWidth={2.4}
              strokeLinecap="round"
              pathLength={1}
              style={glow}
              {...drawLoop(0)}
            />
            {/* 落日 */}
            <motion.circle
              cx={44}
              cy={50}
              r={9}
              fill="none"
              stroke={stroke}
              strokeWidth={2.4}
              strokeLinecap="round"
              pathLength={1}
              style={glow}
              {...drawLoop(0.5)}
            />
            {/* 山峦 */}
            <motion.path
              d="M22 88L48 60L66 80L82 64L98 88"
              fill="none"
              stroke={stroke}
              strokeWidth={2.4}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              style={glow}
              {...drawLoop(0.9)}
            />
          </svg>
          {/* 角标徽章 */}
          <div className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-cyan-200/20 bg-black/35 px-2.5 py-1 font-mono text-[10px] text-cyan-100/70 backdrop-blur">
            <SearchX className="h-3 w-3" />
            NO MATCH
          </div>
        </div>

        {/* 文案区：无匹配提示词 */}
        <div className="flex flex-1 flex-col items-center justify-center px-2 py-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="text-xl font-black leading-tight text-white sm:text-2xl"
          >
            没有匹配的提示词
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
            className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-500"
          >
            当前筛选条件下没有找到对应的视觉提示词。换一个关键词、减少标签条件，或清除筛选重新浏览灵感库。
          </motion.p>

          {hasActiveFilters ? (
            <motion.button
              type="button"
              onClick={onClearFilters}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.26 }}
              className="mt-6 inline-flex min-h-10 cursor-pointer items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] px-5 text-xs font-black text-cyan-50 transition-colors hover:bg-cyan-200/[0.13] active:scale-[0.98]"
            >
              清除全部筛选
            </motion.button>
          ) : null}
        </div>
      </div>
    </motion.aside>
  )
}
