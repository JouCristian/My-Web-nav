"use client"

import { motion } from "framer-motion"
import { Search, SlidersHorizontal, X } from "lucide-react"
import type { ImagePromptCategory } from "@/types/ai-image-prompt"

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
  return (
    <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#05070d]/55 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.2)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/35 to-transparent" />

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cyan-100/55" />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="搜索标题、场景、标签或 prompt 内容"
            className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.045] pl-11 pr-11 text-sm font-medium text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-200/35 focus:bg-white/[0.065]"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="清除搜索"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] px-3 py-2 text-xs font-black text-cyan-50">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {resultCount}/{totalCount} 条
          </div>

          {hasActiveFilters ? (
            <motion.button
              type="button"
              onClick={onClearFilters}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex h-10 items-center gap-2 rounded-2xl border border-rose-200/15 bg-rose-300/[0.08] px-3 text-xs font-black text-rose-100 transition-colors hover:bg-rose-300/[0.13] active:scale-[0.98]"
            >
              <X className="h-3.5 w-3.5" />
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
                  className={`relative min-h-11 shrink-0 rounded-2xl px-4 text-sm font-bold transition-colors duration-300 active:scale-[0.98] ${
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
              className={`inline-flex min-h-9 items-center rounded-xl border px-3 text-xs font-bold transition-all duration-300 active:scale-[0.98] ${
                active
                  ? "border-cyan-200/25 bg-cyan-200/[0.12] text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.08)]"
                  : "border-white/10 bg-white/[0.035] text-zinc-500 hover:border-white/20 hover:bg-white/[0.055] hover:text-zinc-200"
              }`}
            >
              #{tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
