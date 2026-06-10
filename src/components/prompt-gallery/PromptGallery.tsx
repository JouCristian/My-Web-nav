"use client"

import { startTransition, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import {
  createPromptCategory,
  deletePromptCard,
  deletePromptCategory,
  savePromptCard,
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
import { Settings2 } from "lucide-react"

type ActiveCategory = "全部" | ImagePromptCategory
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

const minTwoRowHeight = 760

export function PromptGallery({
  canManage = false,
  initialItems,
  initialCategories,
}: {
  canManage?: boolean
  initialItems: ImagePromptItem[]
  initialCategories: Array<"全部" | ImagePromptCategory>
}) {
  const [items, setItems] = useState<ImagePromptItem[]>(initialItems)
  const [categories, setCategories] = useState<Array<"全部" | ImagePromptCategory>>(initialCategories)
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>("全部")
  const [activeGenerationMode, setActiveGenerationMode] = useState<ActiveGenerationMode>("全部")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
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
    () => searchFilteredPrompts.filter((item) => activeCategory === "全部" || item.category === activeCategory),
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
      .filter((item) => activeCategory === "全部" || item.category === activeCategory)
      .filter((item) => promptMatchesTags(item, selectedTags))

    return new Set(candidates.map((item) => item.generationMode))
  }, [activeCategory, searchFilteredPrompts, selectedTags])

  const availableCategorySignature = Array.from(availableCategorySet).sort().join("|")
  const availableGenerationModeSignature = Array.from(availableGenerationModeSet).sort().join("|")
  const tagSignature = tagEntries.map(([tag]) => tag).join("|")

  const selectedPrompt = filteredPrompts.find((item) => item.id === selectedPromptId) ?? filteredPrompts[0] ?? null
  const hasActiveFilters =
    activeCategory !== "全部" ||
    activeGenerationMode !== "全部" ||
    selectedTags.length > 0 ||
    Boolean(searchQuery.trim())
  const filteredPromptSignature = filteredPrompts.map((item) => item.id).join("|")
  const panelHeight = twoRowHeight ? Math.max(twoRowHeight, minTwoRowHeight) : null
  const showSearchEmptyState = Boolean(searchQuery.trim()) && filteredPrompts.length === 0

  const handleCategoryChange = (category: ActiveCategory) => {
    if (category !== "全部" && !availableCategorySet.has(category)) return

    setActiveCategory(category)
    const nextPrompts = searchFilteredPrompts
      .filter((item) => category === "全部" || item.category === category)
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

  const applyWorkshopData = (data: PromptWorkshopData) => {
    setItems(data.items)
    setCategories(data.categories)

    if (!data.categories.includes(activeCategory)) {
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

  useEffect(() => {
    if (!searchFilteredPrompts.length) return

    if (activeCategory !== "全部" && !availableCategorySet.has(activeCategory)) {
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
                  onSelect={handleSelect}
                />
              </motion.div>
              ))}
              {showSearchEmptyState ? (
              <div className="col-span-full flex min-h-[360px] flex-col items-center justify-center rounded-[1.75rem] border border-white/10 bg-black/25 p-8 text-center">
                <EmptyStateGlyph />
                <h3 className="mt-5 text-lg font-black text-white">没有匹配的提示词</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-zinc-500">换一个关键词，或清空搜索重新浏览当前可用提示词。</p>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="mt-5 inline-flex min-h-10 cursor-pointer items-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] px-4 text-xs font-black text-cyan-50 transition-colors hover:bg-cyan-200/[0.13] active:scale-[0.98]"
                >
                  清空搜索
                </button>
              </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="hidden min-w-0 lg:block lg:sticky lg:top-24 lg:self-start">
          <AnimatePresence mode="wait">
            {selectedPrompt ? (
              <PromptDetailPanel key={selectedPrompt.id} item={selectedPrompt} panelHeight={panelHeight} />
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
        item={dialogPrompt ?? selectedPrompt}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        onExitComplete={() => setDialogPrompt(null)}
      />

      {canManage && managerMounted ? (
        <PromptManagerModal
          open={managerOpen}
          items={items}
          categories={categories}
          onClose={() => setManagerOpen(false)}
          onSaveItem={handleSaveItem}
          onDeleteItem={handleDeleteItem}
          onCreateCategory={handleCreateCategory}
          onDeleteCategory={handleDeleteCategory}
          onSelectPrompt={handleSelect}
        />
      ) : null}
    </section>
  )
}
