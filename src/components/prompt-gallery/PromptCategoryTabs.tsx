"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import type { ImagePromptCategory } from "@/types/ai-image-prompt"
import { easeOutExpo, easeStroke } from "@/components/prompt-gallery/motion"

interface PromptCategoryTabsProps {
  categories: Array<"全部" | ImagePromptCategory>
  activeCategory: "全部" | ImagePromptCategory
  onCategoryChange: (category: "全部" | ImagePromptCategory) => void
  searchQuery: string
  onSearchChange: (value: string) => void
  tags: string[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  resultCount: number
  totalCount: number
}

// 计数徽章：结果数变化时，沿徽章画一道一笔画高亮弧线作为“刷新”反馈
function CountBadge({ resultCount, totalCount }: { resultCount: number; totalCount: number }) {
  const [strokeKey, setStrokeKey] = useState(0)
  const prevRef = useRef(resultCount)

  useEffect(() => {
    if (prevRef.current !== resultCount) {
      prevRef.current = resultCount
      setStrokeKey((current) => current + 1)
    }
  }, [resultCount])

  return (
    <div className="relative inline-flex items-center gap-2 overflow-hidden rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2 text-xs font-black text-cyan-50">
      <SlidersHorizontal className="h-3.5 w-3.5" />
      <span style={{ fontVariantNumeric: "tabular-nums" }}>
        {resultCount}/{totalCount} 条
      </span>
      <AnimatePresence>
        <motion.svg
          key={strokeKey}
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox="0 0 100 36"
          preserveAspectRatio="none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: easeOutExpo }}
        >
          <motion.rect
            x={1.5}
            y={1.5}
            width={97}
            height={33}
            rx={14}
            ry={14}
            fill="none"
            stroke="rgba(165,243,252,0.95)"
            strokeWidth={1.5}
            strokeLinecap="round"
            pathLength={1}
            style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.45))" }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: easeStroke }}
          />
        </motion.svg>
      </AnimatePresence>
    </div>
  )
}

export function PromptCategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  tags,
  selectedTags,
  onToggleTag,
  onClearFilters,
  hasActiveFilters,
  resultCount,
  totalCount,
}: PromptCategoryTabsProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  // 空闲提示：用户一段时间没操作且搜索框为空时，让搜索框做一次轻微“呼吸”脉冲
  const [idleHint, setIdleHint] = useState(false)
  const idleTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const scheduleIdle = () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
      setIdleHint(false)
      // 搜索框已有内容或正在聚焦时不提示
      if (searchQuery || searchFocused) return
      idleTimerRef.current = window.setTimeout(() => setIdleHint(true), 6000)
    }

    scheduleIdle()
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "pointermove", "scroll"]
    events.forEach((evt) => window.addEventListener(evt, scheduleIdle, { passive: true }))

    return () => {
      if (idleTimerRef.current) window.clearTimeout(idleTimerRef.current)
      events.forEach((evt) => window.removeEventListener(evt, scheduleIdle))
    }
  }, [searchQuery, searchFocused])

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#05070d]/55 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/35 to-transparent" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          {/* 聚焦光晕 / 空闲呼吸脉冲 */}
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            animate={
              searchFocused
                ? { boxShadow: "0 0 0 1px rgba(125,211,252,0.35), 0 0 26px rgba(34,211,238,0.22)" }
                : idleHint
                  ? {
                      boxShadow: [
                        "0 0 0 1px rgba(125,211,252,0)",
                        "0 0 0 1px rgba(125,211,252,0.3), 0 0 22px rgba(34,211,238,0.18)",
                        "0 0 0 1px rgba(125,211,252,0)",
                      ],
                    }
                  : { boxShadow: "0 0 0 1px rgba(125,211,252,0)" }
            }
            transition={
              idleHint && !searchFocused
                ? { duration: 2.2, ease: easeOutExpo, repeat: Number.POSITIVE_INFINITY }
                : { duration: 0.45, ease: easeOutExpo }
            }
          />
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="搜索标题、场景、标签或 prompt 内容"
            className="relative h-12 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-11 pr-11 text-sm font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-200/35 focus:bg-white/[0.065]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="清除搜索"
            >
              <X className="h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110" />
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3">
          <CountBadge resultCount={resultCount} totalCount={totalCount} />

          {hasActiveFilters ? (
            <motion.button
              type="button"
              onClick={onClearFilters}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group/clear inline-flex h-10 cursor-pointer items-center gap-2 rounded-2xl border border-rose-200/15 bg-rose-300/[0.08] px-3 text-xs font-black text-rose-100 transition-colors hover:bg-rose-300/[0.13] active:scale-[0.98]"
            >
              <X className="h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/clear:scale-110" />
              清除筛选
            </motion.button>
          ) : null}
        </div>
      </div>

      <div className="relative mt-3">
        <div className="max-w-full overflow-x-auto pb-2 [scrollbar-color:rgba(125,211,252,0.34)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/35 [&::-webkit-scrollbar-track]:bg-transparent">
          <div className="inline-flex w-max min-w-full gap-2 px-2">
            {categories.map((category) => {
              const active = category === activeCategory

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`relative min-h-11 shrink-0 cursor-pointer rounded-2xl px-4 text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
                    active ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {active ? (
                    <motion.span
                      layoutId="prompt-category-indicator"
                      className="absolute inset-0 rounded-2xl border border-cyan-200/25 bg-cyan-200/[0.11] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_0_28px_rgba(34,211,238,0.08)]"
                      transition={{ type: "spring", stiffness: 340, damping: 30 }}
                    />
                  ) : null}
                  <span className="relative">{category}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-2 flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1 [scrollbar-color:rgba(125,211,252,0.34)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/35 [&::-webkit-scrollbar-track]:bg-transparent">
        {tags.map((tag) => {
          const active = selectedTags.includes(tag)

          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggleTag(tag)}
              className={`group/tag inline-flex min-h-9 cursor-pointer items-center gap-1 rounded-xl border px-3 text-xs font-bold transition-all duration-300 active:scale-[0.98] ${
                active
                  ? "border-cyan-200/25 bg-cyan-200/[0.12] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                  : "border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:bg-white/[0.055] hover:text-zinc-200"
              }`}
            >
              {/* 选中时：一笔画对勾，呼应复制按钮的对勾语言 */}
              <AnimatePresence initial={false}>
                {active ? (
                  <motion.span
                    key="check"
                    className="inline-flex items-center overflow-hidden text-cyan-200"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 14, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: easeOutExpo }}
                  >
                    <motion.svg
                      width={12}
                      height={12}
                      viewBox="0 0 24 24"
                      fill="none"
                      className="overflow-visible"
                    >
                      <motion.path
                        d="M4 12.5L9.5 18L20 6"
                        stroke="currentColor"
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        pathLength={1}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, ease: easeStroke }}
                        style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.5))" }}
                      />
                    </motion.svg>
                  </motion.span>
                ) : null}
              </AnimatePresence>
              #{tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
