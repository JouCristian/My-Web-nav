"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import type { ImagePromptCategory, ImagePromptGenerationMode } from "@/types/ai-image-prompt"
import { easeOutExpo, easeStroke } from "@/components/prompt-gallery/motion"
import { SearchFlowBorder } from "@/components/prompt-gallery/SearchFlowBorder"

type GenerationModeOption = {
  value: ImagePromptGenerationMode
  label: string
  description: string
}

type TagOption = { tag: string; disabled: boolean }

interface PromptCategoryTabsProps {
  categories: Array<"全部" | ImagePromptCategory>
  activeCategory: "全部" | ImagePromptCategory
  onCategoryChange: (category: "全部" | ImagePromptCategory) => void
  generationModes: readonly GenerationModeOption[]
  activeGenerationMode: "全部" | ImagePromptGenerationMode
  onGenerationModeChange: (mode: "全部" | ImagePromptGenerationMode) => void
  availableCategories: string[]
  availableGenerationModes: ImagePromptGenerationMode[]
  searchQuery: string
  onSearchChange: (value: string) => void
  tagOptions: TagOption[]
  selectedTags: string[]
  onToggleTag: (tag: string) => void
  onClearFilters: () => void
  hasActiveFilters: boolean
  resultCount: number
  totalCount: number
}

const tagAreaSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 34,
  mass: 0.72,
}

const tagAreaMobileSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 40,
  mass: 0.58,
}

const tagFadeMs = 170
const tagRevealDelayMs = 260
const tagRevealDelayMobileMs = 210
const tagMaxHeight = 96

function toRenderedTags(options: TagOption[]): TagOption[] {
  return options.map((option) => ({ ...option }))
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
    <div className="relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] px-3 text-xs font-black text-cyan-50">
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
          <motion.path
            d="M60 1.5H84.5A14 14 0 0 1 98.5 15.5V20.5A14 14 0 0 1 84.5 34.5H15.5A14 14 0 0 1 1.5 20.5V15.5A14 14 0 0 1 15.5 1.5H72"
            fill="none"
            stroke="rgba(165,243,252,0.95)"
            strokeWidth={1.5}
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
  generationModes,
  activeGenerationMode,
  onGenerationModeChange,
  availableCategories,
  availableGenerationModes,
  searchQuery,
  onSearchChange,
  tagOptions,
  selectedTags,
  onToggleTag,
  onClearFilters,
  hasActiveFilters,
  resultCount,
  totalCount,
}: PromptCategoryTabsProps) {
  const [searchFocused, setSearchFocused] = useState(false)
  const [renderedTags, setRenderedTags] = useState<TagOption[]>(() => toRenderedTags(tagOptions))
  const [tagsVisible, setTagsVisible] = useState(true)
  const [tagViewportHeight, setTagViewportHeight] = useState<number | null>(null)
  const [compactMotion, setCompactMotion] = useState(false)
  const [isMobileLayout, setIsMobileLayout] = useState(false)
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const [portalReady, setPortalReady] = useState(false)
  const tagContentRef = useRef<HTMLDivElement>(null)
  const renderedTagsRef = useRef(renderedTags)
  const animationIdRef = useRef(0)
  const timersRef = useRef<number[]>([])
  const shouldReduceMotion = useReducedMotion()
  const availableCategorySet = new Set(availableCategories)
  const availableGenerationModeSet = new Set(availableGenerationModes)
  const tagOptionsSignature = tagOptions.map((option) => `${option.tag}:${option.disabled ? 1 : 0}`).join("|")
  const currentTagSet = useMemo(() => new Set(tagOptions.map((option) => option.tag)), [tagOptions])
  const tagItemTransition = shouldReduceMotion ? { duration: 0.01 } : { duration: 0.24, ease: easeOutExpo }
  const tagHeightTransition = shouldReduceMotion ? { duration: 0.01 } : compactMotion ? tagAreaMobileSpring : tagAreaSpring
  const tagRevealDelay = shouldReduceMotion ? 0 : compactMotion ? tagRevealDelayMobileMs : tagRevealDelayMs

  // 移动端进阶筛选（生成方式 + 标签）激活计数，用于“筛选”按钮上的徽章
  const advancedFilterCount = (activeGenerationMode !== "全部" ? 1 : 0) + selectedTags.length

  // 仅客户端挂载后才允许 Portal 渲染（避免 SSR 调用 createPortal）
  useEffect(() => {
    setPortalReady(true)
  }, [])

  const updateTagViewportHeight = () => {
    const content = tagContentRef.current
    if (!content) return

    setTagViewportHeight(Math.min(content.scrollHeight, tagMaxHeight))
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)")
    const syncCompactMotion = () => setCompactMotion(mediaQuery.matches)

    syncCompactMotion()
    mediaQuery.addEventListener("change", syncCompactMotion)

    return () => mediaQuery.removeEventListener("change", syncCompactMotion)
  }, [])

  // lg 断点以下视为移动布局：生成方式 + 标签收进底部抽屉
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)")
    const syncMobileLayout = () => setIsMobileLayout(mediaQuery.matches)

    syncMobileLayout()
    mediaQuery.addEventListener("change", syncMobileLayout)

    return () => mediaQuery.removeEventListener("change", syncMobileLayout)
  }, [])

  // 切回桌面布局时关闭抽屉
  useEffect(() => {
    if (!isMobileLayout) setFilterSheetOpen(false)
  }, [isMobileLayout])

  // 抽屉打开时锁定背景滚动并支持 Esc 关闭
  useEffect(() => {
    if (!filterSheetOpen) return

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFilterSheetOpen(false)
    }

    document.addEventListener("keydown", onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [filterSheetOpen])

  useLayoutEffect(() => {
    updateTagViewportHeight()
  }, [renderedTags, tagOptionsSignature])

  useEffect(() => {
    const content = tagContentRef.current
    if (!content) return

    const observer = new ResizeObserver(updateTagViewportHeight)
    observer.observe(content)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    renderedTagsRef.current = renderedTags
  }, [renderedTags])

  useEffect(() => {
    const nextOptions = tagOptions
    const nextOptionByTag = new Map(nextOptions.map((option) => [option.tag, option]))
    const currentOptions = renderedTagsRef.current
    const currentTags = currentOptions.map((option) => option.tag)
    const nextTags = nextOptions.map((option) => option.tag)
    const removedTags = currentTags.filter((tag) => !nextOptionByTag.has(tag))
    const currentTagSetForDiff = new Set(currentTags)
    const addedTags = nextTags.filter((tag) => !currentTagSetForDiff.has(tag))
    const hasStructuralChange = removedTags.length > 0 || addedTags.length > 0

    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current = []
    animationIdRef.current += 1
    const animationId = animationIdRef.current

    if (!hasStructuralChange || shouldReduceMotion) {
      setRenderedTags(toRenderedTags(nextOptions))
      setTagsVisible(true)
      window.requestAnimationFrame(updateTagViewportHeight)
      return
    }

    setTagsVisible(false)

    const swapTimer = window.setTimeout(() => {
      if (animationIdRef.current !== animationId) return
      setRenderedTags(toRenderedTags(nextOptions))

      const timer = window.setTimeout(() => {
        if (animationIdRef.current !== animationId) return
        setTagsVisible(true)
      }, tagRevealDelay)
      timersRef.current.push(timer)
    }, tagFadeMs)

    timersRef.current.push(swapTimer)
  }, [shouldReduceMotion, tagOptions, tagOptionsSignature, tagRevealDelay])

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  // 生成方式选择区（桌面内联 / 移动抽屉内共用）
  const generationModesBlock = (
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-color:rgba(125,211,252,0.34)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/35 [&::-webkit-scrollbar-track]:bg-transparent">
      <button
        type="button"
        onClick={() => onGenerationModeChange("全部")}
        aria-pressed={activeGenerationMode === "全部"}
        className={`relative min-h-12 shrink-0 rounded-2xl border px-4 text-left transition-colors duration-300 active:scale-[0.98] ${
          activeGenerationMode === "全部"
            ? "border-cyan-200/25 bg-cyan-200/[0.11] text-white"
            : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
        }`}
      >
        <span className="block text-xs font-black">全部生成方式</span>
        <span className="mt-0.5 block text-[10px] font-medium text-current opacity-60">不限制参考图或纯文字生成</span>
      </button>

      {generationModes.map((mode) => {
        const active = activeGenerationMode === mode.value
        const available = availableGenerationModeSet.has(mode.value)

        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onGenerationModeChange(mode.value)}
            disabled={!available}
            aria-pressed={active}
            title={mode.description}
            className={`relative min-h-12 shrink-0 rounded-2xl border px-4 text-left transition-colors duration-300 active:scale-[0.98] ${
              active
                ? "border-cyan-200/25 bg-cyan-200/[0.11] text-white"
                : available
                  ? "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
                  : "cursor-not-allowed border-white/5 bg-white/[0.015] text-zinc-700 opacity-45"
            }`}
          >
            <span className="block text-xs font-black">{mode.label}</span>
            <span className="mt-0.5 block max-w-[13rem] truncate text-[10px] font-medium text-current opacity-60">
              {mode.description}
            </span>
          </button>
        )
      })}
    </div>
  )

  // 标签选择区（桌面内联 / 移动抽屉内共用）
  const tagsBlock = (
    <motion.div
      initial={false}
      animate={tagViewportHeight === null ? undefined : { height: tagViewportHeight }}
      style={{ height: tagViewportHeight === null ? "auto" : tagViewportHeight }}
      transition={tagHeightTransition}
      className="overflow-hidden"
    >
      <div className="max-h-24 overflow-y-auto pr-1 [scrollbar-color:rgba(125,211,252,0.34)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/35 [&::-webkit-scrollbar-track]:bg-transparent">
        <motion.div
          ref={tagContentRef}
          animate={{ opacity: tagsVisible ? 1 : 0 }}
          transition={tagItemTransition}
          className="flex flex-wrap gap-2"
        >
          {renderedTags.map(({ tag, disabled }) => {
            const active = selectedTags.includes(tag)
            const clickable = !disabled && tagsVisible && currentTagSet.has(tag)

            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                disabled={!clickable}
                aria-pressed={active}
                className={`group/tag inline-flex min-h-9 cursor-pointer items-center rounded-xl border px-3 text-xs font-bold transition-colors duration-300 active:scale-[0.98] ${
                  active
                    ? "border-cyan-200/25 bg-cyan-200/[0.12] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                    : !clickable
                      ? "cursor-not-allowed border-white/5 bg-white/[0.015] text-zinc-700 opacity-45"
                      : "border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:bg-white/[0.055] hover:text-zinc-200"
                }`}
              >
                {/* 选中时：一笔画对勾，呼应复制按钮的对勾语言 */}
                <AnimatePresence initial={false}>
                  {active ? (
                    <motion.span
                      key="check"
                      className="inline-flex items-center overflow-hidden text-cyan-200"
                      initial={{ width: 0, marginRight: 0, opacity: 0 }}
                      animate={{ width: 14, marginRight: 4, opacity: 1 }}
                      exit={{ width: 0, marginRight: 0, opacity: 0 }}
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
        </motion.div>
      </div>
    </motion.div>
  )

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#05070d]/55 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/35 to-transparent" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          {/* 聚焦：青色亮弧沿边框匀速流动 + 外发光 */}
          <AnimatePresence>
            {searchFocused ? (
              <motion.div
                key="search-flow"
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: easeOutExpo }}
              >
                <SearchFlowBorder />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            placeholder="搜索标题、场景、标签或 prompt 内容"
            className="relative z-[1] h-12 w-full rounded-2xl border border-white/10 bg-[#070a12] pl-11 pr-11 text-sm font-medium text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-transparent"
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

          {/* 移动端：进阶筛选触发按钮（生成方式 + 标签收进底部抽屉） */}
          <button
            type="button"
            onClick={() => setFilterSheetOpen(true)}
            className="relative inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-3 text-xs font-black text-zinc-200 transition-colors hover:border-white/20 hover:text-white active:scale-[0.98] lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            筛选
            {advancedFilterCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-200/[0.14] px-1 text-[10px] font-black text-cyan-50">
                {advancedFilterCount}
              </span>
            ) : null}
          </button>

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
              const available = category === "全部" || category === "我的收藏" || availableCategorySet.has(category)

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  disabled={!available}
                  aria-pressed={active}
                  className={`relative min-h-11 shrink-0 cursor-pointer rounded-2xl px-4 text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
                    active
                      ? "text-white"
                      : available
                        ? "text-zinc-500 hover:text-zinc-200"
                        : "cursor-not-allowed text-zinc-700 opacity-45"
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

      {/* 桌面端：生成方式 + 标签内联展示 */}
      {!isMobileLayout ? (
        <div className="mt-2 flex flex-col gap-2">
          {generationModesBlock}
          {tagsBlock}
        </div>
      ) : null}

      {/* 移动端：生成方式 + 标签收进底部抽屉（Portal 挂到 body，避开父级 backdrop-blur 包含块裁剪） */}
      {isMobileLayout && portalReady
        ? createPortal(
            <AnimatePresence>
              {filterSheetOpen ? (
            <motion.div
              className="fixed inset-0 z-[130] flex items-end justify-center bg-black/60 backdrop-blur-md [will-change:opacity] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setFilterSheetOpen(false)}
              role="dialog"
              aria-modal="true"
              aria-label="筛选选项"
            >
              <motion.div
                className="relative flex max-h-[85dvh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-white/10 bg-[#05070d]/95 shadow-[0_-20px_80px_rgba(0,0,0,0.5)] [backface-visibility:hidden] [transform:translate3d(0,0,0)] [will-change:transform]"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 34 }}
                onClick={(event) => event.stopPropagation()}
              >
                <div className="relative flex shrink-0 items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
                  <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/15" />
                  <span className="mt-1 text-sm font-black text-white">筛选选项</span>
                  <button
                    type="button"
                    onClick={() => setFilterSheetOpen(false)}
                    aria-label="关闭筛选"
                    className="mt-1 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:bg-white/[0.09] hover:text-white active:scale-95"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="overflow-y-auto overscroll-contain px-4 pb-5 pt-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/40 [&::-webkit-scrollbar-track]:bg-transparent">
                  <div className="mb-2 text-xs font-black text-zinc-400">生成方式</div>
                  {generationModesBlock}

                  <div className="mb-2 mt-5 text-xs font-black text-zinc-400">标签</div>
                  {tagsBlock}
                </div>

                <div className="flex shrink-0 items-center gap-3 border-t border-white/[0.06] px-4 py-3">
                  {hasActiveFilters ? (
                    <button
                      type="button"
                      onClick={() => {
                        onClearFilters()
                        setFilterSheetOpen(false)
                      }}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-rose-200/15 bg-rose-300/[0.08] text-sm font-black text-rose-100 transition-colors hover:bg-rose-300/[0.13] active:scale-[0.98]"
                    >
                      <X className="h-4 w-4" />
                      清除筛选
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setFilterSheetOpen(false)}
                    className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl border border-cyan-200/25 bg-cyan-200/[0.12] text-sm font-black text-cyan-50 transition-colors hover:bg-cyan-200/[0.18] active:scale-[0.98]"
                  >
                    查看 {resultCount} 条结果
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  )
}
