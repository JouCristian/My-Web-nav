"use client"

import type { ImagePromptCategory, ImagePromptItem } from "@/types/ai-image-prompt"
import { ImagePlus, Plus, Save, Settings2, Tag, Trash2, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useMemo, useState } from "react"

interface PromptManagerModalProps {
  open: boolean
  items: ImagePromptItem[]
  categories: Array<"全部" | ImagePromptCategory>
  onClose: () => void
  onSaveItem: (item: ImagePromptItem) => Promise<void>
  onDeleteItem: (id: string) => Promise<void>
  onCreateCategory: (name: string) => Promise<void>
  onDeleteCategory: (name: ImagePromptCategory) => Promise<void>
  onSelectPrompt: (item: ImagePromptItem) => void
}

type PromptDraft = Omit<ImagePromptItem, "tags"> & {
  tagsText: string
}

function createEmptyPrompt(category: ImagePromptCategory): ImagePromptItem {
  const id = `custom-${Date.now()}`

  return {
    id,
    title: "新的生图提示词",
    description: "写一句清晰的副标题，说明这条提示词适合什么画面。",
    category,
    tags: ["custom", "prompt"],
    modelTarget: "AI 通用",
    previewGradient:
      "radial-gradient(circle at 28% 18%, rgba(190,238,255,0.26), transparent 28%), radial-gradient(circle at 74% 70%, rgba(78,161,255,0.18), transparent 30%), linear-gradient(145deg, #111827 0%, #05070d 50%, #0f172a 100%)",
    promptSummary: "用于快速记录这条提示词的核心视觉方向。",
    prompt: "Describe the image you want with clear subject, material, lighting, composition, mood, and negative constraints.",
    useCase: "适合补充为新的灵感卡片。",
    tips: ["保持主体清晰。", "把文字和 logo 放到后期排版。"],
  }
}

function toDraft(item: ImagePromptItem): PromptDraft {
  return {
    ...item,
    tagsText: item.tags.join(", "),
  }
}

function fromDraft(draft: PromptDraft): ImagePromptItem {
  return {
    ...draft,
    tags: draft.tagsText
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  }
}

function readImageAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const maxSize = 1400
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))

      const context = canvas.getContext("2d")
      if (!context) {
        reject(new Error("图片压缩失败"))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/webp", 0.82))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("图片读取失败"))
    }

    image.src = objectUrl
  })
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

function baseInputClass(multiline = false) {
  return `w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-200/35 focus:bg-black/45 ${
    multiline ? "min-h-28 resize-y" : ""
  }`
}

function CategorySelect({
  value,
  categories,
  onChange,
}: {
  value: ImagePromptCategory
  categories: ImagePromptCategory[]
  onChange: (category: ImagePromptCategory) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        onBlur={(event) => {
          if (!event.currentTarget.parentElement?.contains(event.relatedTarget as Node | null)) {
            setOpen(false)
          }
        }}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left text-sm font-bold text-white outline-none transition-all hover:bg-black/45 focus:border-cyan-200/35"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate">{value}</span>
        <span className={`text-cyan-100 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-full z-50 overflow-hidden rounded-2xl border border-cyan-200/20 bg-[#060912]/95 p-1.5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl"
          >
            <div className="max-h-56 overflow-y-auto pr-1 [scrollbar-color:rgba(125,211,252,0.42)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/40 [&::-webkit-scrollbar-track]:bg-transparent">
              {categories.map((category) => {
                const selected = category === value

                return (
                  <button
                    key={category}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(category)
                      setOpen(false)
                    }}
                    className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold transition-colors ${
                      selected ? "bg-cyan-200/[0.12] text-cyan-50" : "text-zinc-400 hover:bg-white/[0.055] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 truncate">{category}</span>
                    {selected ? <span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100" /> : null}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function PromptManagerEditor({
  item,
  categories,
  onSave,
}: {
  item: ImagePromptItem
  categories: ImagePromptCategory[]
  onSave: (item: ImagePromptItem) => Promise<void>
}) {
  const [draft, setDraft] = useState<PromptDraft>(() => toDraft(item))
  const [saving, setSaving] = useState(false)

  const previewStyle = useMemo(
    () => ({ background: draft.previewImage ? undefined : draft.previewGradient }),
    [draft.previewGradient, draft.previewImage],
  )

  const update = <K extends keyof PromptDraft>(key: K, value: PromptDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const dataUrl = await readImageAsDataUrl(file)
    update("previewImage", dataUrl)
  }

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <div className="min-w-0">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080b12]" style={previewStyle}>
          {draft.previewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={draft.previewImage} alt={draft.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_34%)]" />
          <label className="absolute bottom-4 left-4 right-4 flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-bold text-white backdrop-blur-xl transition-colors hover:bg-black/50">
            <ImagePlus className="h-4 w-4 text-cyan-100" />
            上传展示图片
            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </label>
        </div>
      </div>

      <div className="grid min-w-0 gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="标题">
            <input className={baseInputClass()} value={draft.title} onChange={(event) => update("title", event.target.value)} />
          </Field>
          <Field label="分类">
            <CategorySelect
              value={draft.category}
              categories={categories}
              onChange={(category) => update("category", category)}
            />
          </Field>
        </div>

        <Field label="副标题">
          <input className={baseInputClass()} value={draft.description} onChange={(event) => update("description", event.target.value)} />
        </Field>

        <Field label="标签，用英文逗号分隔">
          <input className={baseInputClass()} value={draft.tagsText} onChange={(event) => update("tagsText", event.target.value)} />
        </Field>

        <Field label="Prompt 摘要">
          <input className={baseInputClass()} value={draft.promptSummary} onChange={(event) => update("promptSummary", event.target.value)} />
        </Field>

        <Field label="完整提示词">
          <textarea className={baseInputClass(true)} value={draft.prompt} onChange={(event) => update("prompt", event.target.value)} />
        </Field>

        <Field label="适用场景">
          <textarea className={baseInputClass(true)} value={draft.useCase} onChange={(event) => update("useCase", event.target.value)} />
        </Field>

        <button
          type="button"
          onClick={async () => {
            setSaving(true)
            try {
              await onSave(fromDraft(draft))
            } finally {
              setSaving(false)
            }
          }}
          disabled={saving}
          className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.10] px-5 text-sm font-black text-cyan-50 transition-all hover:bg-cyan-200/[0.14] active:scale-[0.98]"
        >
          <Save className="h-4 w-4" />
          {saving ? "保存中..." : "保存到数据库"}
        </button>
      </div>
    </div>
  )
}

export function PromptManagerModal({
  open,
  items,
  categories,
  onClose,
  onSaveItem,
  onDeleteItem,
  onCreateCategory,
  onDeleteCategory,
  onSelectPrompt,
}: PromptManagerModalProps) {
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? "")
  const [newCategory, setNewCategory] = useState("")
  const [busy, setBusy] = useState(false)
  const editableCategories = categories.filter((category): category is ImagePromptCategory => category !== "全部")
  const selectedItem = items.find((item) => item.id === selectedId) ?? items[0]

  const runMutation = async (mutation: () => Promise<void>) => {
    setBusy(true)
    try {
      await mutation()
    } finally {
      setBusy(false)
    }
  }

  const handleAdd = () => {
    const next = createEmptyPrompt(editableCategories[0] ?? "产品海报")
    runMutation(async () => {
      await onSaveItem(next)
      setSelectedId(next.id)
      onSelectPrompt(next)
    })
  }

  const handleSave = async (nextItem: ImagePromptItem) => {
    await onSaveItem(nextItem)
    onSelectPrompt(nextItem)
  }

  const handleDeleteCard = (id: string) => {
    if (items.length <= 1) return
    const currentIndex = items.findIndex((item) => item.id === id)
    const nextItems = items.filter((item) => item.id !== id)
    const nextSelected = nextItems[Math.min(currentIndex, nextItems.length - 1)] ?? nextItems[0]
    runMutation(async () => {
      await onDeleteItem(id)
      setSelectedId(nextSelected.id)
      onSelectPrompt(nextSelected)
    })
  }

  const handleAddCategory = () => {
    const nextCategory = newCategory.trim()
    if (!nextCategory || nextCategory === "全部" || categories.includes(nextCategory)) return
    runMutation(async () => {
      await onCreateCategory(nextCategory)
      setNewCategory("")
    })
  }

  const handleDeleteCategory = (category: ImagePromptCategory) => {
    if (editableCategories.length <= 1) return
    runMutation(async () => {
      await onDeleteCategory(category)
    })
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 240, damping: 26 }}
            className="relative flex max-h-[88dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070d]/95 shadow-[0_30px_120px_rgba(0,0,0,0.52)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.08] text-emerald-100">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-white">提示词卡片管理</h2>
                  <p className="mt-1 text-xs text-zinc-500">本地编辑预览，不会写入数据库。</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-300 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col border-b border-white/10 p-4 lg:border-b-0 lg:border-r">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={busy}
                  className="mb-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.08] text-sm font-black text-emerald-50 transition-all hover:bg-emerald-200/[0.12] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" />
                  增加 card
                </button>

                <div className="mb-4 rounded-[1.35rem] border border-white/10 bg-white/[0.025] p-3">
                  <div className="mb-3 flex items-center gap-2 text-xs font-black text-white">
                    <Tag className="h-3.5 w-3.5 text-cyan-100" />
                    分类标签
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={newCategory}
                      onChange={(event) => setNewCategory(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          handleAddCategory()
                        }
                      }}
                      placeholder="新增分类"
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-600 focus:border-cyan-200/35"
                    />
                    <button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={busy}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-50 transition-colors hover:bg-cyan-200/[0.13]"
                      aria-label="新增分类"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1 [scrollbar-color:rgba(125,211,252,0.34)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/35 [&::-webkit-scrollbar-track]:bg-transparent">
                    {editableCategories.map((category) => (
                      <span key={category} className="inline-flex min-w-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300">
                        <span className="max-w-28 truncate">{category}</span>
                        <button
                          type="button"
                        onClick={() => handleDeleteCategory(category)}
                          disabled={busy || editableCategories.length <= 1}
                          className="rounded-full p-0.5 text-zinc-500 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                          aria-label={`删除分类 ${category}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-6 pr-1 [scrollbar-color:rgba(125,211,252,0.42)_rgba(255,255,255,0.06)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/[0.34] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.05]">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`group flex w-full items-start gap-2 rounded-2xl border p-3 text-left transition-colors ${
                        selectedId === item.id
                          ? "border-cyan-200/30 bg-cyan-200/[0.08]"
                          : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
                      }`}
                    >
                      <button type="button" onClick={() => setSelectedId(item.id)} className="min-w-0 flex-1 text-left">
                        <div className="truncate text-sm font-bold text-white">{item.title}</div>
                        <div className="mt-1 truncate text-xs text-zinc-500">{item.category}</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(item.id)}
                        disabled={busy || items.length <= 1}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-500 opacity-0 transition-all hover:border-red-300/25 hover:bg-red-400/10 hover:text-red-100 disabled:cursor-not-allowed disabled:opacity-25 group-hover:opacity-100"
                        aria-label={`删除 card ${item.title}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto p-5 [scrollbar-color:rgba(125,211,252,0.42)_rgba(255,255,255,0.06)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/[0.34] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.05]">
                {selectedItem ? <PromptManagerEditor key={selectedItem.id} item={selectedItem} categories={editableCategories} onSave={handleSave} /> : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
