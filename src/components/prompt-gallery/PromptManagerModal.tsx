"use client"

import {
  imagePromptGenerationModes,
  type ImagePromptCategory,
  type ImagePromptGenerationMode,
  type ImagePromptItem,
} from "@/types/ai-image-prompt"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Database, ImagePlus, Layers3, Loader2, Plus, Save, Settings2, Tag, Trash2, X } from "lucide-react"
import { memo, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import { easeOutExpo, easeStroke } from "@/components/prompt-gallery/motion"

const PROMPT_PREVIEW_MAX_SIZE = 800
const PROMPT_PREVIEW_MAX_BYTES = 8 * 1024 * 1024
const softSpring = { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.72 }
const quickFade = { duration: 0.22, ease: easeOutExpo }

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

type SaveState = "idle" | "saving" | "success" | "error"
type UploadState = "idle" | "processing" | "success" | "error"

function createEmptyPrompt(category: ImagePromptCategory): ImagePromptItem {
  const id = `custom-${Date.now()}`

  return {
    id,
    title: "新的生图提示词",
    description: "写一句清晰的副标题，说明这条提示词适合什么画面。",
    category,
    tags: ["custom", "prompt"],
    generationMode: "text-to-image",
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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

// 将图片压缩为 webp 格式的 dataURL，直接随表单存入数据库（previewImage 字段），
// 不依赖任何对象存储桶，避免 "Bucket not found" 问题
function compressImageToWebpDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()
    const objectUrl = URL.createObjectURL(file)

    image.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const scale = Math.min(1, PROMPT_PREVIEW_MAX_SIZE / Math.max(image.width, image.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))

      const context = canvas.getContext("2d")
      if (!context) {
        reject(new Error("图片压缩失败"))
        return
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL("image/webp", 0.8))
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error("图片读取失败"))
    }

    image.src = objectUrl
  })
}

async function uploadPromptPreviewImage(file: File) {
  return compressImageToWebpDataUrl(file)
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={`grid gap-2 ${className}`}>
      <span className="text-xs font-bold text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

function baseInputClass(multiline = false) {
  return `w-full rounded-[1.1rem] border border-white/10 bg-black/30 px-4 py-3 text-sm leading-relaxed text-white outline-none transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-zinc-600 focus:border-cyan-200/40 focus:bg-black/45 focus:shadow-[0_0_0_3px_rgba(125,211,252,0.08)] ${
    multiline ? "min-h-28 resize-y" : ""
  }`
}

function SweepHighlight({
  tone = "cyan",
  rounded = "rounded-[inherit]",
}: {
  tone?: "cyan" | "emerald" | "rose"
  rounded?: string
}) {
  const colorClass =
    tone === "emerald"
      ? "from-transparent via-emerald-100/80 to-transparent"
      : tone === "rose"
        ? "from-transparent via-rose-100/75 to-transparent"
        : "from-transparent via-cyan-100/80 to-transparent"

  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${rounded}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 0.92, ease: easeStroke }}
    >
      <motion.span
        className={`absolute left-0 top-0 h-px w-2/3 bg-gradient-to-r ${colorClass}`}
        initial={{ x: "-115%" }}
        animate={{ x: "175%" }}
        transition={{ duration: 0.82, ease: easeStroke }}
      />
      <motion.span
        className={`absolute bottom-0 right-0 h-px w-2/3 bg-gradient-to-r ${colorClass}`}
        initial={{ x: "115%" }}
        animate={{ x: "-175%" }}
        transition={{ duration: 0.82, ease: easeStroke }}
      />
    </motion.span>
  )
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
    <div
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false)
        }
      }}
    >
      <motion.button
        type="button"
        onClick={() => setOpen((current) => !current)}
        whileHover={{ y: -1, borderColor: "rgba(165,243,252,0.28)" }}
        whileTap={{ scale: 0.985 }}
        transition={softSpring}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-[1.1rem] border border-white/10 bg-black/30 px-4 py-3 text-left text-sm font-bold text-white outline-none transition-[background-color,box-shadow] hover:bg-black/45 hover:shadow-[0_0_24px_rgba(34,211,238,0.08)] focus:border-cyan-200/35 focus:shadow-[0_0_0_3px_rgba(125,211,252,0.08)]"
        aria-expanded={open}
      >
        <span className="min-w-0 truncate">{value}</span>
        <span className={`text-cyan-100 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>⌄</span>
      </motion.button>

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
                  <motion.button
                    key={category}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      onChange(category)
                      setOpen(false)
                    }}
                    whileHover={{ x: selected ? 0 : 2 }}
                    whileTap={{ scale: 0.985 }}
                    transition={softSpring}
                    className={`flex min-h-10 w-full items-center justify-between rounded-xl px-3 text-left text-sm font-bold transition-colors ${
                      selected ? "bg-cyan-200/[0.12] text-cyan-50" : "text-white/60 hover:bg-white/[0.055] hover:text-white"
                    }`}
                  >
                    <span className="min-w-0 truncate">{category}</span>
                    {selected ? <span className="ml-3 h-1.5 w-1.5 rounded-full bg-cyan-100" /> : null}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function GenerationModePicker({
  value,
  onChange,
}: {
  value: ImagePromptGenerationMode
  onChange: (mode: ImagePromptGenerationMode) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {imagePromptGenerationModes.map((mode) => {
        const selected = mode.value === value

        return (
          <motion.button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            aria-pressed={selected}
            whileHover={{ y: -2, borderColor: selected ? "rgba(165,243,252,0.48)" : "rgba(255,255,255,0.18)" }}
            whileTap={{ scale: 0.985 }}
            transition={softSpring}
            className={`relative min-h-20 overflow-hidden rounded-[1.1rem] border px-4 py-3 text-left transition-[background-color,box-shadow] ${
              selected
                ? "border-cyan-200/35 bg-cyan-200/[0.1] text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.08)]"
                : "border-white/10 bg-black/30 text-zinc-400 hover:bg-black/45 hover:text-white"
            }`}
          >
            {selected ? (
              <motion.span
                layoutId="manager-generation-mode-active"
                className="absolute inset-0 rounded-[inherit] border border-cyan-100/10"
                transition={softSpring}
              />
            ) : null}
            <span className="block text-sm font-black">{mode.label}</span>
            <span className="mt-1 block text-xs leading-relaxed text-current opacity-65">{mode.description}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

const PromptManagerEditor = memo(function PromptManagerEditor({
  item,
  categories,
  onSave,
}: {
  item: ImagePromptItem
  categories: ImagePromptCategory[]
  onSave: (item: ImagePromptItem) => Promise<void>
}) {
  const [draft, setDraft] = useState<PromptDraft>(() => toDraft(item))
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [uploadState, setUploadState] = useState<UploadState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [statusMessage, setStatusMessage] = useState("")
  const saving = saveState === "saving"
  const uploadingImage = uploadState === "processing"

  const previewStyle = useMemo(
    () => ({ background: draft.previewImage ? undefined : draft.previewGradient }),
    [draft.previewGradient, draft.previewImage],
  )
  const previewTags = useMemo(
    () =>
      draft.tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 4),
    [draft.tagsText],
  )

  const update = <K extends keyof PromptDraft>(key: K, value: PromptDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  useEffect(() => {
    if (saveState !== "success") return

    const timer = window.setTimeout(() => {
      setSaveState("idle")
      setStatusMessage("")
    }, 1700)

    return () => window.clearTimeout(timer)
  }, [saveState])

  useEffect(() => {
    if (uploadState !== "success") return

    const timer = window.setTimeout(() => {
      setUploadState("idle")
      setStatusMessage("")
    }, 1600)

    return () => window.clearTimeout(timer)
  }, [uploadState])

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > PROMPT_PREVIEW_MAX_BYTES) {
      setUploadState("error")
      setErrorMessage("图片过大，请选择 8MB 以内的图片。")
      event.target.value = ""
      return
    }

    setUploadState("processing")
    setErrorMessage("")
    setStatusMessage("图片处理中...")
    try {
      const publicUrl = await uploadPromptPreviewImage(file)
      update("previewImage", publicUrl)
      setUploadState("success")
      setStatusMessage("图片已更新")
    } catch (error) {
      setUploadState("error")
      setStatusMessage("")
      setErrorMessage(getErrorMessage(error, "图片上传失败"))
    } finally {
      event.target.value = ""
    }
  }

  const handleSave = async () => {
    setSaveState("saving")
    setErrorMessage("")
    setStatusMessage("正在保存...")
    try {
      await onSave(fromDraft(draft))
      setSaveState("success")
      setStatusMessage("已保存")
    } catch (error) {
      setSaveState("error")
      setStatusMessage("")
      setErrorMessage(getErrorMessage(error, "保存失败，请稍后重试"))
    }
  }

  return (
    <motion.div
      className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={quickFade}
    >
      <motion.div
        className="relative min-w-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-4 md:p-5"
        initial={false}
        animate={{
          borderColor: saveState === "success" ? "rgba(167,243,208,0.28)" : "rgba(255,255,255,0.1)",
          boxShadow: saveState === "success" ? "0 0 34px rgba(16,185,129,0.08)" : "0 0 0 rgba(0,0,0,0)",
        }}
        transition={quickFade}
      >
        <AnimatePresence>{saveState === "success" ? <SweepHighlight key="save-sweep" tone="emerald" /> : null}</AnimatePresence>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.07] text-cyan-100">
            <Database className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-white">内容编辑</h3>
            <p className="mt-0.5 text-xs text-zinc-500">编辑卡片信息、提示词正文和使用场景</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
          <Field label="标题">
            <input className={baseInputClass()} value={draft.title} onChange={(event) => update("title", event.target.value)} />
          </Field>
          <Field label="分类">
            <CategorySelect value={draft.category} categories={categories} onChange={(category) => update("category", category)} />
          </Field>
        </div>

        <div className="mt-4 grid gap-4">
          <Field label="副标题">
            <input className={baseInputClass()} value={draft.description} onChange={(event) => update("description", event.target.value)} />
          </Field>

          <Field label="生成方式">
            <GenerationModePicker value={draft.generationMode} onChange={(mode) => update("generationMode", mode)} />
          </Field>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.72fr)]">
            <Field label="标签，用英文逗号分隔">
              <input className={baseInputClass()} value={draft.tagsText} onChange={(event) => update("tagsText", event.target.value)} />
            </Field>
            <Field label="模型适配">
              <input className={baseInputClass()} value={draft.modelTarget} onChange={(event) => update("modelTarget", event.target.value)} />
            </Field>
          </div>

          <Field label="Prompt 摘要">
            <input className={baseInputClass()} value={draft.promptSummary} onChange={(event) => update("promptSummary", event.target.value)} />
          </Field>

          <Field label="完整提示词">
            <textarea className={baseInputClass(true)} value={draft.prompt} onChange={(event) => update("prompt", event.target.value)} />
          </Field>

          <Field label="适用场景">
            <textarea className={baseInputClass(true)} value={draft.useCase} onChange={(event) => update("useCase", event.target.value)} />
          </Field>
        </div>
      </motion.div>

      <aside className="min-w-0">
        <motion.div
          className="relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080b12] shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
          initial={false}
          animate={{
            borderColor: uploadState === "success" ? "rgba(165,243,252,0.24)" : "rgba(255,255,255,0.1)",
            boxShadow: uploadState === "success" ? "0 18px 64px rgba(34,211,238,0.1)" : "0 18px 60px rgba(0,0,0,0.28)",
          }}
          transition={quickFade}
        >
          <AnimatePresence>{uploadState === "success" ? <SweepHighlight key="upload-sweep" /> : null}</AnimatePresence>
          <div className="relative h-56 shrink-0 overflow-hidden" style={previewStyle}>
            <AnimatePresence mode="wait">
              {draft.previewImage ? (
                <motion.img
                  key={draft.previewImage}
                  src={draft.previewImage}
                  alt={draft.title}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={quickFade}
                />
              ) : (
                <motion.div
                  key={draft.previewGradient}
                  className="absolute inset-0"
                  style={{ background: draft.previewGradient }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={quickFade}
                />
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.18),transparent_34%)]" />
            <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-300 backdrop-blur-md">
              实时预览
            </span>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-4">
              <motion.label
                whileHover={uploadingImage ? undefined : { y: -2, borderColor: "rgba(165,243,252,0.26)" }}
                whileTap={uploadingImage ? undefined : { scale: 0.985 }}
                transition={softSpring}
                className="flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/35 px-4 text-sm font-bold text-white backdrop-blur-xl transition-[background-color,box-shadow] hover:bg-black/50 hover:shadow-[0_0_26px_rgba(34,211,238,0.1)] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70"
              >
                {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin text-cyan-100" /> : uploadState === "success" ? <Check className="h-4 w-4 text-emerald-100" /> : <ImagePlus className="h-4 w-4 text-cyan-100" />}
                {uploadingImage ? "图片处理中..." : uploadState === "success" ? "图片已更新" : "上传展示图片"}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} disabled={uploadingImage} />
              </motion.label>
            </div>
          </div>

          <motion.div
            key={item.id}
            className="flex min-h-0 flex-1 flex-col gap-4 p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={quickFade}
          >
            <div>
              <div className="truncate text-base font-black text-white">{draft.title || "未命名卡片"}</div>
              <div className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{draft.description || "暂无副标题"}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-200/15 bg-cyan-200/[0.07] px-2.5 py-1 text-[11px] font-bold text-cyan-50">
                {draft.category}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-bold text-zinc-300">
                {draft.modelTarget || "AI 通用"}
              </span>
              <span className="rounded-full border border-violet-200/15 bg-violet-300/[0.07] px-2.5 py-1 text-[11px] font-bold text-violet-50">
                {imagePromptGenerationModes.find((mode) => mode.value === draft.generationMode)?.label ?? "直接生成创意图片"}
              </span>
            </div>

            {previewTags.length ? (
              <div className="flex flex-wrap gap-1.5">
                {previewTags.map((tag) => (
                  <span key={tag} className="rounded-full bg-white/[0.055] px-2 py-1 text-[10px] font-bold text-zinc-400">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-black/25 p-3">
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600">Prompt 摘要</div>
              <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
                {draft.promptSummary || "暂无摘要"}
              </p>
              {draft.tips?.length ? (
                <p className="mt-3 border-t border-white/[0.06] pt-3 text-xs leading-relaxed text-zinc-500">
                  <span className="font-bold text-zinc-400">小贴士 · </span>
                  {draft.tips[0]}
                </p>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              {errorMessage ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={quickFade}
                  className="rounded-2xl border border-red-300/15 bg-red-400/10 px-3 py-2 text-xs leading-relaxed text-red-100"
                >
                  {errorMessage}
                </motion.div>
              ) : statusMessage ? (
                <motion.div
                  key="status"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={quickFade}
                  className={`rounded-2xl border px-3 py-2 text-xs font-bold ${
                    saveState === "success" || uploadState === "success"
                      ? "border-emerald-200/15 bg-emerald-300/[0.08] text-emerald-100"
                      : "border-cyan-200/15 bg-cyan-300/[0.08] text-cyan-100"
                  }`}
                >
                  {statusMessage}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <motion.button
              type="button"
              onClick={handleSave}
              disabled={saving || uploadingImage}
              whileHover={saving || uploadingImage ? undefined : { y: -2, borderColor: "rgba(165,243,252,0.34)" }}
              whileTap={saving || uploadingImage ? undefined : { scale: 0.985 }}
              transition={softSpring}
              className={`mt-auto inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border px-5 text-sm font-black transition-[background-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-60 ${
                saveState === "success"
                  ? "border-emerald-200/25 bg-emerald-300/[0.12] text-emerald-50 shadow-[0_0_28px_rgba(16,185,129,0.1)]"
                  : "border-cyan-200/20 bg-cyan-200/[0.10] text-cyan-50 hover:bg-cyan-200/[0.14] hover:shadow-[0_0_28px_rgba(34,211,238,0.1)]"
              }`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saveState === "success" ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {saving ? "保存中..." : saveState === "success" ? "已保存" : "保存到数据库"}
            </motion.button>
          </motion.div>
        </motion.div>
      </aside>
    </motion.div>
  )
})

function PromptManagerModalComponent({
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
  const [mutationError, setMutationError] = useState("")

  const editableCategories = useMemo(
    () => categories.filter((category): category is ImagePromptCategory => category !== "全部"),
    [categories],
  )
  const selectedItem = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0], [items, selectedId])

  const runMutation = async (mutation: () => Promise<void>) => {
    setBusy(true)
    setMutationError("")
    try {
      await mutation()
    } catch (error) {
      setMutationError(getErrorMessage(error, "操作失败，请稍后重试"))
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
          className="fixed inset-0 z-[140] flex items-center justify-center bg-black/55 p-4 backdrop-blur-xl [will-change:opacity]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="relative flex max-h-[88dvh] w-full max-w-[1180px] transform-gpu flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070d]/95 shadow-[0_30px_120px_rgba(0,0,0,0.52)] [backface-visibility:hidden] [will-change:transform,opacity]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.08] text-emerald-100 shadow-[0_0_34px_rgba(16,185,129,0.08)]">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-white">提示词卡片管理</h2>
                  <p className="mt-1 text-xs text-zinc-500">编辑后点击保存写入数据库。</p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-bold text-zinc-400 sm:flex">
                  <Layers3 className="h-3.5 w-3.5 text-cyan-100" />
                  {items.length} cards
                </div>
                <div className="hidden rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[11px] font-bold text-zinc-400 sm:block">
                  {editableCategories.length} 分类
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ y: -1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.065)" }}
                  whileTap={{ scale: 0.94 }}
                  transition={softSpring}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-zinc-300 transition-colors hover:text-white"
                  aria-label="关闭管理弹窗"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[310px_minmax(0,1fr)]">
              <div className="flex min-h-0 flex-col border-b border-white/10 bg-black/[0.12] p-4 lg:border-b-0 lg:border-r lg:border-white/10">
                <motion.button
                  type="button"
                  onClick={handleAdd}
                  disabled={busy}
                  whileHover={busy ? undefined : { y: -2, borderColor: "rgba(167,243,208,0.34)" }}
                  whileTap={busy ? undefined : { scale: 0.985 }}
                  transition={softSpring}
                  className="mb-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200/20 bg-emerald-200/[0.08] text-sm font-black text-emerald-50 transition-[background-color,box-shadow] hover:bg-emerald-200/[0.12] hover:shadow-[0_0_28px_rgba(16,185,129,0.1)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  增加 card
                </motion.button>

                <div className="mb-4 rounded-[1.35rem] border border-white/10 bg-white/[0.025] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2 text-xs font-black text-white">
                      <Tag className="h-3.5 w-3.5 shrink-0 text-cyan-100" />
                      <span className="truncate">分类标签</span>
                    </div>
                    <span className="shrink-0 rounded-full bg-white/[0.045] px-2 py-1 text-[10px] font-bold text-zinc-500">
                      {editableCategories.length}
                    </span>
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
                      className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white outline-none transition-[border-color,background-color,box-shadow] placeholder:text-zinc-600 focus:border-cyan-200/35 focus:bg-black/45 focus:shadow-[0_0_0_3px_rgba(125,211,252,0.08)]"
                    />
                    <motion.button
                      type="button"
                      onClick={handleAddCategory}
                      disabled={busy}
                      whileHover={busy ? undefined : { y: -1, borderColor: "rgba(165,243,252,0.34)" }}
                      whileTap={busy ? undefined : { scale: 0.94 }}
                      transition={softSpring}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-cyan-200/20 bg-cyan-200/[0.08] text-cyan-50 transition-[background-color,box-shadow] hover:bg-cyan-200/[0.13] hover:shadow-[0_0_20px_rgba(34,211,238,0.1)] disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="新增分类"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </motion.button>
                  </div>
                  <div className="mt-3 flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1 [scrollbar-color:rgba(125,211,252,0.34)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/35 [&::-webkit-scrollbar-track]:bg-transparent">
                    <AnimatePresence initial={false}>
                      {editableCategories.map((category) => (
                        <motion.span
                          key={category}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94 }}
                          transition={quickFade}
                          className="inline-flex min-w-0 items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-zinc-300"
                        >
                          <span className="max-w-28 truncate">{category}</span>
                          <motion.button
                            type="button"
                            onClick={() => handleDeleteCategory(category)}
                            disabled={busy || editableCategories.length <= 1}
                            whileHover={busy || editableCategories.length <= 1 ? undefined : { backgroundColor: "rgba(248,113,113,0.12)", color: "rgb(254,202,202)" }}
                            whileTap={busy || editableCategories.length <= 1 ? undefined : { scale: 0.9 }}
                            transition={softSpring}
                            className="rounded-full p-0.5 text-zinc-500 transition-colors disabled:cursor-not-allowed disabled:opacity-35"
                            aria-label={`删除分类 ${category}`}
                          >
                            <X className="h-3 w-3" />
                          </motion.button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <AnimatePresence>
                  {mutationError ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={quickFade}
                      className="mb-3 rounded-2xl border border-red-300/15 bg-red-400/10 px-3 py-2 text-xs leading-relaxed text-red-100"
                    >
                      {mutationError}
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-6 pr-1 [content-visibility:auto] [contain-intrinsic-size:320px_760px] [scrollbar-color:rgba(125,211,252,0.42)_rgba(255,255,255,0.06)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/[0.34] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.05]">
                  <AnimatePresence initial={false}>
                    {items.map((item, index) => {
                      const selected = selectedId === item.id

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                          transition={quickFade}
                          whileHover={selected ? undefined : { x: 2 }}
                          className={`group relative flex w-full items-start gap-2 overflow-hidden rounded-2xl border p-3 text-left transition-colors ${
                            selected ? "border-cyan-200/30 bg-cyan-200/[0.08]" : "border-white/10 bg-white/[0.025] hover:bg-white/[0.045]"
                          }`}
                        >
                          {selected ? (
                            <>
                              <motion.span
                                layoutId="manager-card-active-bg"
                                className="absolute inset-0 rounded-2xl bg-cyan-200/[0.045]"
                                transition={softSpring}
                              />
                              <motion.span
                                layoutId="manager-card-active-line"
                                className="absolute bottom-3 left-0 top-3 w-0.5 rounded-r-full bg-cyan-100"
                                transition={softSpring}
                              />
                              <SweepHighlight rounded="rounded-2xl" />
                            </>
                          ) : null}
                          <button type="button" onClick={() => setSelectedId(item.id)} className="relative min-w-0 flex-1 text-left">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="font-mono text-[10px] font-bold text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
                              <span className="truncate text-sm font-bold text-white">{item.title}</span>
                            </div>
                            <div className="mt-1 flex min-w-0 items-center gap-2">
                              <span className="truncate rounded-full bg-white/[0.045] px-2 py-0.5 text-[10px] font-bold text-zinc-500">{item.category}</span>
                              <span className="truncate text-[10px] text-zinc-600">{item.tags.slice(0, 2).join(" / ")}</span>
                            </div>
                          </button>
                          <motion.button
                            type="button"
                            onClick={() => handleDeleteCard(item.id)}
                            disabled={busy || items.length <= 1}
                            whileHover={busy || items.length <= 1 ? undefined : { y: -1, borderColor: "rgba(252,165,165,0.28)", backgroundColor: "rgba(248,113,113,0.1)", color: "rgb(254,202,202)" }}
                            whileTap={busy || items.length <= 1 ? undefined : { scale: 0.92 }}
                            transition={softSpring}
                            className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-zinc-500 opacity-100 transition-opacity disabled:cursor-not-allowed disabled:opacity-25 sm:opacity-0 sm:group-hover:opacity-100"
                            aria-label={`删除 card ${item.title}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>

              <div className="min-h-0 overflow-y-auto overscroll-contain p-5 [content-visibility:auto] [contain-intrinsic-size:820px_780px] [scrollbar-color:rgba(125,211,252,0.42)_rgba(255,255,255,0.06)] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-cyan-200/[0.34] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-white/[0.05]">
                <AnimatePresence mode="wait">
                  {selectedItem ? (
                    <PromptManagerEditor
                      key={selectedItem.id}
                      item={selectedItem}
                      categories={editableCategories}
                      onSave={handleSave}
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

export const PromptManagerModal = memo(PromptManagerModalComponent)
