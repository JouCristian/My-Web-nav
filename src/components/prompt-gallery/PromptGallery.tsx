"use client"

import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import {
  createPromptCategory,
  deletePromptCard,
  deletePromptCategory,
  savePromptCard,
  togglePromptFavorite,
  type PromptWorkshopData,
} from "@/app/joujou-tools/ai-image-prompt-workshop/actions"
import {
  imagePromptGenerationModes,
  type ImagePromptCategory,
  type ImagePromptGenerationMode,
  type ImagePromptItem,
} from "@/types/ai-image-prompt"
import { PromptCard } from "@/components/prompt-gallery/PromptCard"
import { PromptCategoryTabs } from "@/components/prompt-gallery/PromptCategoryTabs"
import { PromptDetailPanel } from "@/components/prompt-gallery/PromptDetailPanel"
import { PromptDetailEmpty } from "@/components/prompt-gallery/PromptDetailEmpty"
import { PromptDetailDialog } from "@/components/prompt-gallery/PromptDetailDialog"
import { gridContainerVariants, gridItemVariants } from "@/components/prompt-gallery/motion"
import { CountUp } from "@/components/prompt-gallery/CountUp"
import { LoginRequiredDialog } from "@/components/prompt-gallery/LoginRequiredDialog"
import { Settings2 } from "lucide-react"

const FAVORITE_CATEGORY = "我的收藏" as const

type ActiveCategory = "全部" | typeof FAVORITE_CATEGORY | ImagePromptCategory
type ActiveGenerationMode = "全部" | ImagePromptGenerationMode

function promptMatchesSearch(item: ImagePromptItem, query: string) {
  if (!query) return true

  const searchSource = [
    item.title,
    item.description,
    item.category,
    item.promptSummary,
    item.prompt,
    item.useCase,
    item.generationMode,
    item.modelTarget,
    item.tags.join(" "),
  ]
    .join(" ")
    .toLowerCase()

  return searchSource.includes(query)
}

function promptMatchesTags(item: ImagePromptItem, tags: string[]) {
  return tags.length === 0 || tags.every((tag) => item.tags.includes(tag))
}

function sameStringList(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index])
}

function getTagCounts(items: ImagePromptItem[]) {
  const counts = new Map<string, number>()

  items.forEach((item) => {
    item.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1))
  })

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
}

function withFavoriteCategory(categories: Array<"全部" | ImagePromptCategory>) {
  const rest = categories.filter((category) => category !== "全部" && category !== FAVORITE_CATEGORY)
  return ["全部", FAVORITE_CATEGORY, ...rest] as Array<"全部" | ImagePromptCategory>
}

const PromptManagerModal = dynamic(
  () => import("@/components/prompt-gallery/PromptManagerModal").then((mod) => mod.PromptManagerModal),
  {
    ssr: false,
    loading: () => null,
  },
)

// 空状态：循环播放的一笔画放大镜
function EmptyStateGlyph() {
  const drawTransition = {
    duration: 1.6,
    ease: [0.65, 0, 0.35, 1] as const,
    repeat: Number.POSITIVE_INFINITY,
    repeatDelay: 0.7,
  }

  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-200/15 bg-cyan-200/[0.05] text-cyan-100 shadow-[0_0_34px_rgba(34,211,238,0.1)]">
      <svg width={40} height={40} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="overflow-visible">
        <motion.path
          d="M33 20A13 13 0 1 1 7 20A13 13 0 1 1 33 20A13 13 0 0 1 31.5 26"
          fill="none"
          stroke="rgba(165,243,252,0.95)"
          strokeWidth={2.4}
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0.2, 1, 1, 0.2] }}
          transition={drawTransition}
          style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.4))" }}
        />
        <motion.path
          d="M30 30L41 41"
          fill="none"
          stroke="rgba(165,243,252,0.95)"
          strokeWidth={2.4}
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0.2, 1, 1, 0.2] }}
          transition={{ ...drawTransition, delay: 0.45 }}
          style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.4))" }}
        />
      </svg>
    </div>
  )
}

function FavoriteEmptyGlyph() {
  const drawTransition = {
    duration: 1.8,
    ease: [0.65, 0, 0.35, 1] as const,
    repeat: Number.POSITIVE_INFINITY,
    repeatDelay: 0.8,
  }

  return (
    <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-200/15 bg-amber-300/[0.055] text-amber-100 shadow-[0_0_34px_rgba(250,204,21,0.1)]">
      <svg width={42} height={42} viewBox="0 0 48 48" fill="none" aria-hidden="true" className="overflow-visible">
        <motion.path
          d="M24 5L29.4 16L41.5 17.8L32.8 26.3L34.8 38.3L24 32.6L13.2 38.3L15.2 26.3L6.5 17.8L18.6 16L24 5Z"
          fill="none"
          stroke="rgba(254,240,138,0.95)"
          strokeWidth={2.35}
          strokeLinejoin="round"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0.2, 1, 1, 0.2] }}
          transition={drawTransition}
          style={{ filter: "drop-shadow(0 0 6px rgba(250,204,21,0.36))" }}
        />
        <motion.path
          d="M24 16V25L30 28"
          fill="none"
          stroke="rgba(254,240,138,0.86)"
          strokeWidth={2.1}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          initial={{ pathLength: 0, opacity: 0.15 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0.15, 0.95, 0.95, 0.15] }}
          transition={{ ...drawTransition, delay: 0.45 }}
        />
      </svg>
    </div>
  )
}

const minTwoRowHeight = 760

export function PromptGallery({
  canManage = false,
  initialItems,
  initialCategories,
  isAuthenticated = false,
}: {
  canManage?: boolean
  initialItems: ImagePromptItem[]
  initialCategories: Array<"全部" | ImagePromptCategory>
  isAuthenticated?: boolean
}) {
  const [items, setItems] = useState<ImagePromptItem[]>(initialItems)
  const [categories, setCategories] = useState<Array<"全部" | ImagePromptCategory>>(() => withFavoriteCategory(initialCategories))
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("全部")
  const [activeGenerationMode, setActiveGenerationMode] = useState<ActiveGenerationMode>("全部")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [favoriteError, setFavoriteError] = useState("")
  const [favoriteBusyIds, setFavoriteBusyIds] = useState<string[]>([])
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [selectedPromptId, setSelectedPromptId] = useState(items[0]?.id ?? "")
  const [selectionVersion, setSelectionVersion] = useState(0)
  const [managerOpen, setManagerOpen] = useState(false)
  const [managerMounted, setManagerMounted] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [dialogPrompt, setDialogPrompt] = useState<ImagePromptItem | null>(null)
  const [twoRowHeight, setTwoRowHeight] = useState<number | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const cardGridRef = useRef<HTMLDivElement>(null)

  const prepareManager = () => {
    if (canManage && !managerMounted) {
      setManagerMounted(true)
    }
  }

  const searchFilteredPrompts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return items.filter((item) => promptMatchesSearch(item, query))
  }, [items, searchQuery])

  const categoryScopedPrompts = useMemo(
    () =>
      searchFilteredPrompts.filter((item) => {
        if (activeCategory === "全部") return true
        if (activeCategory === FAVORITE_CATEGORY) return Boolean(item.isFavorited)
        return item.category === activeCategory
      }),
    [activeCategory, searchFilteredPrompts],
  )

  const modeScopedPrompts = useMemo(
    () =>
      categoryScopedPrompts.filter(
        (item) => activeGenerationMode === "全部" || item.generationMode === activeGenerationMode,
      ),
    [activeGenerationMode, categoryScopedPrompts],
  )

  const filteredPrompts = useMemo(
    () => modeScopedPrompts.filter((item) => promptMatchesTags(item, selectedTags)),
    [modeScopedPrompts, selectedTags],
  )

  const tagEntries = useMemo(() => getTagCounts(modeScopedPrompts), [modeScopedPrompts])
  const suggestedTags = useMemo(() => getTagCounts(items).slice(0, 6).map(([tag]) => tag), [items])
  const tagOptions = useMemo(
    () =>
      tagEntries.map(([tag]) => {
        const active = selectedTags.includes(tag)
        const nextTags = active ? selectedTags.filter((item) => item !== tag) : [...selectedTags, tag]

        return {
          tag,
          disabled: !active && !modeScopedPrompts.some((item) => promptMatchesTags(item, nextTags)),
        }
      }),
    [modeScopedPrompts, selectedTags, tagEntries],
  )

  const availableCategorySet = useMemo(() => {
    const candidates = searchFilteredPrompts
      .filter((item) => activeGenerationMode === "全部" || item.generationMode === activeGenerationMode)
      .filter((item) => promptMatchesTags(item, selectedTags))

    return new Set(candidates.map((item) => item.category))
  }, [activeGenerationMode, searchFilteredPrompts, selectedTags])

  const availableGenerationModeSet = useMemo(() => {
    const candidates = searchFilteredPrompts
      .filter((item) => {
        if (activeCategory === "全部") return true
        if (activeCategory === FAVORITE_CATEGORY) return Boolean(item.isFavorited)
        return item.category === activeCategory
      })
      .filter((item) => promptMatchesTags(item, selectedTags))

    return new Set(candidates.map((item) => item.generationMode))
  }, [activeCategory, searchFilteredPrompts, selectedTags])

  const availableCategorySignature = Array.from(availableCategorySet).sort().join("|")
  const availableGenerationModeSignature = Array.from(availableGenerationModeSet).sort().join("|")
  const tagSignature = tagEntries.map(([tag]) => tag).join("|")

  const selectedPrompt = filteredPrompts.find((item) => item.id === selectedPromptId) ?? filteredPrompts[0] ?? null
  const detailDialogItem = dialogPrompt ? items.find((item) => item.id === dialogPrompt.id) ?? dialogPrompt : selectedPrompt
  const hasActiveFilters =
    activeCategory !== "全部" ||
    activeGenerationMode !== "全部" ||
    selectedTags.length > 0 ||
    Boolean(searchQuery.trim())
  const filteredPromptSignature = filteredPrompts.map((item) => item.id).join("|")
  const panelHeight = twoRowHeight ? Math.max(twoRowHeight, minTwoRowHeight) : null
  const showSearchEmptyState = Boolean(searchQuery.trim()) && filteredPrompts.length === 0
  const showFavoriteEmptyState =
    activeCategory === FAVORITE_CATEGORY && !searchQuery.trim() && filteredPrompts.length === 0

  const handleCategoryChange = (category: ActiveCategory) => {
    if (category !== "全部" && category !== FAVORITE_CATEGORY && !availableCategorySet.has(category)) return

    setActiveCategory(category)
    const nextPrompts = searchFilteredPrompts
      .filter((item) => {
        if (category === "全部") return true
        if (category === FAVORITE_CATEGORY) return Boolean(item.isFavorited)
        return item.category === category
      })
      .filter((item) => activeGenerationMode === "全部" || item.generationMode === activeGenerationMode)
      .filter((item) => promptMatchesTags(item, selectedTags))
    setSelectedPromptId((nextPrompts[0] ?? items[0])?.id ?? "")
    setSelectionVersion((current) => current + 1)
  }

  const handleGenerationModeChange = (mode: ActiveGenerationMode) => {
    if (mode !== "全部" && !availableGenerationModeSet.has(mode)) return

    setActiveGenerationMode(mode)
    const nextPrompts = searchFilteredPrompts
      .filter((item) => activeCategory === "全部" || item.category === activeCategory)
      .filter((item) => mode === "全部" || item.generationMode === mode)
      .filter((item) => promptMatchesTags(item, selectedTags))
    setSelectedPromptId((nextPrompts[0] ?? items[0])?.id ?? "")
    setSelectionVersion((current) => current + 1)
  }

  const handleToggleTag = (tag: string) => {
    const option = tagOptions.find((item) => item.tag === tag)
    if (option?.disabled) return

    setSelectedTags((current) => (current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]))
  }

  const handleClearFilters = () => {
    setActiveCategory("全部")
    setActiveGenerationMode("全部")
    setSearchQuery("")
    setSelectedTags([])
    setSelectedPromptId(items[0]?.id ?? "")
    setSelectionVersion((current) => current + 1)
  }

  const handleSelect = (item: ImagePromptItem) => {
    const isMobileDetail = typeof window !== "undefined" && window.innerWidth < 1024

    if (isMobileDetail) {
      setDialogPrompt(item)
      setDetailDialogOpen(true)

      window.requestAnimationFrame(() => {
        startTransition(() => {
          setSelectedPromptId(item.id)
          setSelectionVersion((current) => current + 1)
        })
      })
      return
    }

    setSelectedPromptId(item.id)
    setSelectionVersion((current) => current + 1)
  }

  const handleTrySuggestedTag = (tag: string) => {
    setActiveCategory("全部")
    setActiveGenerationMode("全部")
    setSearchQuery("")
    setSelectedTags([tag])
    const nextPrompt = items.find((item) => item.tags.includes(tag)) ?? items[0]
    setSelectedPromptId(nextPrompt?.id ?? "")
    setSelectionVersion((current) => current + 1)
  }

  const applyWorkshopData = (data: PromptWorkshopData) => {
    setItems(data.items)
    setCategories(withFavoriteCategory(data.categories))

    if (activeCategory !== FAVORITE_CATEGORY && !data.categories.includes(activeCategory)) {
      setActiveCategory("全部")
    }

    if (activeGenerationMode !== "全部" && !data.items.some((item) => item.generationMode === activeGenerationMode)) {
      setActiveGenerationMode("全部")
    }

    if (!data.items.some((item) => item.id === selectedPromptId)) {
      setSelectedPromptId(data.items[0]?.id ?? "")
      setSelectionVersion((current) => current + 1)
    }
  }

  const handleSaveItem = async (item: ImagePromptItem) => {
    const data = await savePromptCard(item)
    applyWorkshopData(data)
    setSelectedPromptId(item.id)
  }

  const handleDeleteItem = async (id: string) => {
    const data = await deletePromptCard(id)
    applyWorkshopData(data)
  }

  const handleCreateCategory = async (name: string) => {
    const data = await createPromptCategory(name)
    applyWorkshopData(data)
  }

  const handleDeleteCategory = async (name: ImagePromptCategory) => {
    const data = await deletePromptCategory(name)
    applyWorkshopData(data)
  }

  const handleToggleFavorite = async (item: ImagePromptItem) => {
    if (!isAuthenticated) {
      setLoginDialogOpen(true)
      return
    }

    if (favoriteBusyIds.includes(item.id)) return

    setFavoriteError("")
    setFavoriteBusyIds((current) => [...current, item.id])
    const nextFavorite = !item.isFavorited
    setItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, isFavorited: nextFavorite } : currentItem,
      ),
    )

    try {
      const result = await togglePromptFavorite(item.id)
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === result.cardId ? { ...currentItem, isFavorited: result.isFavorited } : currentItem,
        ),
      )
    } catch (error) {
      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, isFavorited: Boolean(item.isFavorited) } : currentItem,
        ),
      )
      setFavoriteError(error instanceof Error ? error.message : "收藏失败，请稍后重试")
    } finally {
      setFavoriteBusyIds((current) => current.filter((id) => id !== item.id))
    }
  }

  useEffect(() => {
    if (!searchFilteredPrompts.length) return

    if (activeCategory !== "全部" && activeCategory !== FAVORITE_CATEGORY && !availableCategorySet.has(activeCategory)) {
      setActiveCategory("全部")
      setSelectionVersion((current) => current + 1)
    }
  }, [activeCategory, availableCategorySet, availableCategorySignature, searchFilteredPrompts.length])

  useEffect(() => {
    if (!searchFilteredPrompts.length) return

    if (activeGenerationMode !== "全部" && !availableGenerationModeSet.has(activeGenerationMode)) {
      setActiveGenerationMode("全部")
      setSelectionVersion((current) => current + 1)
    }
  }, [
    activeGenerationMode,
    availableGenerationModeSet,
    availableGenerationModeSignature,
    searchFilteredPrompts.length,
  ])

  useEffect(() => {
    if (!searchFilteredPrompts.length) return

    setSelectedTags((current) => {
      const next: string[] = []

      current.forEach((tag) => {
        const nextTags = [...next, tag]
        if (tagEntries.some(([item]) => item === tag) && modeScopedPrompts.some((item) => promptMatchesTags(item, nextTags))) {
          next.push(tag)
        }
      })

      return sameStringList(current, next) ? current : next
    })
  }, [modeScopedPrompts, searchFilteredPrompts.length, tagEntries, tagSignature])

  useEffect(() => {
    if (!canManage || managerMounted) return

    const timer = window.setTimeout(() => {
      setManagerMounted(true)
    }, 900)

    return () => {
      window.clearTimeout(timer)
    }
  }, [canManage, managerMounted])

  useEffect(() => {
    const grid = cardGridRef.current
    if (!grid) return

    const syncTwoRowHeight = () => {
      if (window.innerWidth < 1024) {
        setTwoRowHeight(null)
        return
      }

      const firstCard = grid.querySelector("article")
      if (!firstCard) return

      const rowGap = Number.parseFloat(window.getComputedStyle(grid).rowGap || "0")
      const cardHeight = firstCard.getBoundingClientRect().height
      const measuredHeight = Math.round(cardHeight * 2 + rowGap + 24)

      setTwoRowHeight((currentHeight) => {
        if (!Number.isFinite(measuredHeight) || measuredHeight < minTwoRowHeight) {
          return currentHeight ?? minTwoRowHeight
        }

        return measuredHeight
      })
    }

    syncTwoRowHeight()

    const observer = new ResizeObserver(syncTwoRowHeight)
    observer.observe(grid)
    const firstCard = grid.querySelector("article")
    if (firstCard) observer.observe(firstCard)
    window.addEventListener("resize", syncTwoRowHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener("resize", syncTwoRowHeight)
    }
  }, [filteredPromptSignature])

  useLayoutEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [filteredPromptSignature])

  return (
    <section className="grid gap-6">
      <div className="min-w-0">
        <PromptCategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
          generationModes={imagePromptGenerationModes}
          activeGenerationMode={activeGenerationMode}
          onGenerationModeChange={handleGenerationModeChange}
          availableCategories={Array.from(availableCategorySet)}
          availableGenerationModes={Array.from(availableGenerationModeSet)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          tagOptions={tagOptions}
          selectedTags={selectedTags}
          onToggleTag={handleToggleTag}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={filteredPrompts.length}
          totalCount={items.length}
        />

        <AnimatePresence>
          {favoriteError ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="mt-3 rounded-2xl border border-amber-200/15 bg-amber-300/[0.08] px-4 py-2 text-xs font-bold text-amber-100"
            >
              {favoriteError}
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="mt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-white">
              <CountUp value={filteredPrompts.length} className="text-cyan-100" /> 条精选提示词
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {hasActiveFilters ? "正在按搜索词、分类、生成方式和标签筛选结果。" : "搜索或选择标签，点击卡片查看完整 prompt 和使用建议。"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {canManage ? (
              <button
                type="button"
                onPointerEnter={prepareManager}
                onFocus={prepareManager}
                onTouchStart={prepareManager}
                onClick={() => {
                  prepareManager()
                  setManagerOpen(true)
                }}
                className="group/manage inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.07] px-3 text-xs font-black text-emerald-50 transition-all hover:bg-emerald-200/[0.11] active:scale-[0.98]"
              >
                <Settings2 className="h-3.5 w-3.5 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/manage:scale-110" />
                管理 card
              </button>
            ) : null}
            {selectedPrompt ? (
              <div className="hidden rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 font-mono text-[10px] text-zinc-500 sm:block">
                {selectedPrompt.title}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(380px,520px)] lg:items-start">
        <div
          ref={scrollAreaRef}
          id="prompt-card-scroll-area"
          className="min-w-0 lg:overflow-y-auto lg:rounded-[2rem] lg:border lg:border-white/10 lg:bg-black/[0.12] lg:p-3 lg:pr-1 lg:shadow-[0_24px_80px_rgba(0,0,0,0.2)] lg:backdrop-blur-xl lg:[scrollbar-color:rgba(125,211,252,0.42)_transparent] lg:[scrollbar-gutter:stable] lg:[scrollbar-width:thin] lg:[&::-webkit-scrollbar]:w-2 lg:[&::-webkit-scrollbar-thumb]:rounded-full lg:[&::-webkit-scrollbar-thumb]:bg-cyan-200/40 lg:[&::-webkit-scrollbar-track]:bg-transparent"
          style={panelHeight ? { height: panelHeight } : undefined}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={filteredPromptSignature || "empty-prompts"}
              ref={cardGridRef}
              className="grid min-w-0 content-start items-start gap-5 md:grid-cols-2 lg:pr-2 2xl:grid-cols-3"
              variants={gridContainerVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              style={{ transformOrigin: "top center" }}
            >
              {filteredPrompts.map((item) => (
              <motion.div key={item.id} variants={gridItemVariants} className="min-w-0">
                <PromptCard
                  item={item}
                  active={selectedPrompt?.id === item.id}
                  selectionVersion={selectionVersion}
                  favoriteBusy={favoriteBusyIds.includes(item.id)}
                  onSelect={handleSelect}
                  onToggleFavorite={handleToggleFavorite}
                />
              </motion.div>
              ))}
              {showSearchEmptyState ? (
              <div className="col-span-full flex min-h-[360px] flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-black/25 p-8 text-center">
                <EmptyStateGlyph />
                <h3 className="mt-5 text-lg font-black text-white">没有匹配的提示词</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">换一个关键词，或试试这些常用标签。</p>
                {suggestedTags.length ? (
                  <div className="mt-4 flex max-w-lg flex-wrap justify-center gap-2">
                    {suggestedTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTrySuggestedTag(tag)}
                        className="min-h-9 cursor-pointer rounded-xl border border-cyan-200/15 bg-cyan-200/[0.07] px-3 text-xs font-black text-cyan-50 transition-colors hover:bg-cyan-200/[0.12] active:scale-[0.98]"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 inline-flex min-h-10 cursor-pointer items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] px-4 text-xs font-black text-cyan-50 transition-colors hover:bg-cyan-200/[0.13] active:scale-[0.98]"
                >
                  清空搜索
                </button>
              </div>
              ) : null}
              {showFavoriteEmptyState ? (
              <div className="col-span-full flex min-h-[360px] flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-black/25 p-8 text-center">
                <FavoriteEmptyGlyph />
                <h3 className="mt-5 text-lg font-black text-white">{isAuthenticated ? "还没有收藏提示词" : "登录后使用收藏栏"}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">
                  {isAuthenticated ? "试试收藏一些精美提示词？点击卡片图片右上角的星标，就能把它们收进这里。" : "登录 GitHub 或 Gitee 后，每个账号都可以拥有自己的收藏栏。"}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveCategory("全部")}
                  className="mt-5 inline-flex min-h-10 cursor-pointer items-center rounded-2xl border border-amber-200/20 bg-amber-300/[0.08] px-4 text-xs font-black text-amber-50 transition-colors hover:bg-amber-300/[0.13] active:scale-[0.98]"
                >
                  先浏览全部提示词
                </button>
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => setLoginDialogOpen(true)}
                    className="mt-3 inline-flex min-h-10 cursor-pointer items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] px-4 text-xs font-black text-cyan-50 transition-colors hover:bg-cyan-200/[0.13] active:scale-[0.98]"
                  >
                    前往登录
                  </button>
                ) : null}
              </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden min-w-0 lg:block lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {selectedPrompt ? (
              <PromptDetailPanel
                key={selectedPrompt.id}
                item={selectedPrompt}
                panelHeight={panelHeight}
                favoriteBusy={favoriteBusyIds.includes(selectedPrompt.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <PromptDetailEmpty
                key="detail-empty"
                panelHeight={panelHeight}
                onClearFilters={handleClearFilters}
                hasActiveFilters={hasActiveFilters}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <PromptDetailDialog
        item={detailDialogItem}
        open={detailDialogOpen}
        favoriteBusy={Boolean(detailDialogItem?.id && favoriteBusyIds.includes(detailDialogItem.id))}
        onToggleFavorite={handleToggleFavorite}
        onClose={() => setDetailDialogOpen(false)}
        onExitComplete={() => setDialogPrompt(null)}
      />

      {canManage && managerMounted ? (
        <PromptManagerModal
          open={managerOpen}
          items={items}
          categories={categories.filter((category) => category !== FAVORITE_CATEGORY)}
          onClose={() => setManagerOpen(false)}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onSelectPrompt={handleSelect}
        />
      ) : null}

      <LoginRequiredDialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} />
    </section>
  )
}
