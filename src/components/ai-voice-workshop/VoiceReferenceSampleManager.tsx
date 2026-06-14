"use client"

import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { Check, CircleAlert, FileAudio, ImagePlus, Loader2, Plus, Save, Settings2, Trash2, Volume2, X } from "lucide-react"
import { VoiceAudioPlayer } from "@/components/ai-voice-workshop/VoiceAudioPlayer"
import { voiceFastSpring, voiceHover, voiceLayoutSpring, voiceSpring, voiceTap } from "@/components/ai-voice-workshop/motion"
import {
  cleanupVoiceReferenceSampleUploads,
  createVoiceReferenceSample,
  deleteVoiceReferenceSample,
  getAdminVoiceReferenceSamples,
  uploadVoiceReferenceSampleFiles,
  updateVoiceReferenceSample,
} from "@/lib/ai-voice-workshop/reference-samples-api"
import type { VoiceReferenceSample } from "@/lib/ai-voice-workshop/types"

interface VoiceReferenceSampleManagerProps {
  open: boolean
  onClose: () => void
  onChanged: () => void
}

type EditorState = {
  name: string
  description: string
  tags: string
  sortOrder: string
  isActive: boolean
  avatar: File | null
  audio: File | null
  audioDurationSeconds: number | null
}

const emptyEditor: EditorState = {
  name: "",
  description: "",
  tags: "",
  sortOrder: "0",
  isActive: true,
  avatar: null,
  audio: null,
  audioDurationSeconds: null,
}

export function VoiceReferenceSampleManager({ open, onClose, onChanged }: VoiceReferenceSampleManagerProps) {
  const [samples, setSamples] = useState<VoiceReferenceSample[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editor, setEditor] = useState<EditorState>(emptyEditor)
  const [saving, setSaving] = useState(false)
  const [savingStage, setSavingStage] = useState<"uploading" | "saving" | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<VoiceReferenceSample | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ tone: "success" | "error"; message: string } | null>(null)
  const toastTimer = useRef<number | null>(null)

  const selectedSample = useMemo(() => samples.find((sample) => sample.id === selectedId) ?? null, [samples, selectedId])
  const isCreating = selectedId === null

  const showToast = useCallback((tone: "success" | "error", message: string) => {
    setToast({ tone, message })
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2600)
  }, [])

  const loadSamples = useCallback(async (preferredId?: string | null) => {
    setLoading(true)
    setError(null)
    try {
      const nextSamples = await getAdminVoiceReferenceSamples()
      setSamples(nextSamples)
      const nextId = preferredId === null ? null : preferredId && nextSamples.some((sample) => sample.id === preferredId) ? preferredId : nextSamples[0]?.id ?? null
      setSelectedId(nextId)
      if (nextId) {
        const sample = nextSamples.find((item) => item.id === nextId)!
        setEditor(editorFromSample(sample))
      } else {
        setEditor(emptyEditor)
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "管理列表加载失败")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    const frame = window.requestAnimationFrame(() => void loadSamples())
    return () => window.cancelAnimationFrame(frame)
  }, [loadSamples, open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (deleteTarget) setDeleteTarget(null)
      else onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [deleteTarget, onClose, open])

  useEffect(() => () => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current)
  }, [])

  function selectSample(sample: VoiceReferenceSample) {
    setSelectedId(sample.id)
    setEditor(editorFromSample(sample))
    setError(null)
  }

  function startCreating() {
    setSelectedId(null)
    setEditor(emptyEditor)
    setError(null)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    const validationMessage = validateEditor(editor, isCreating)
    if (validationMessage) {
      setError(validationMessage)
      showToast("error", validationMessage)
      return
    }

    setSaving(true)
    setSavingStage(editor.avatar || editor.audio ? "uploading" : "saving")
    setError(null)
    let pendingUploads: Awaited<ReturnType<typeof uploadVoiceReferenceSampleFiles>> | null = null
    try {
      pendingUploads = await uploadVoiceReferenceSampleFiles(
        { avatar: editor.avatar, audio: editor.audio },
        isCreating ? null : selectedId,
      )
      setSavingStage("saving")
      const payload = editorToPayload(editor, pendingUploads)
      const saved = isCreating
        ? await createVoiceReferenceSample(payload)
        : await updateVoiceReferenceSample(selectedId!, payload)
      pendingUploads = null
      await loadSamples(saved.id)
      onChanged()
      showToast("success", isCreating ? "精选参考音频已新增" : "修改已保存")
    } catch (saveError) {
      if (pendingUploads) {
        const paths = [pendingUploads.avatarUpload?.path, pendingUploads.audioUpload?.path]
          .filter((path): path is string => Boolean(path))
        if (paths.length) {
          await cleanupVoiceReferenceSampleUploads(pendingUploads.sampleId, paths).catch(() => undefined)
        }
      }
      const message = saveError instanceof Error ? saveError.message : "保存失败，请稍后重试"
      setError(message)
      showToast("error", message)
    } finally {
      setSaving(false)
      setSavingStage(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    try {
      const result = await deleteVoiceReferenceSample(deleteTarget.id)
      await loadSamples()
      onChanged()
      setDeleteTarget(null)
      showToast("success", result.storageCleanupWarning ? "记录已删除，部分存储文件需手动清理" : "精选参考音频已删除")
    } catch (deleteError) {
      showToast("error", deleteError instanceof Error ? deleteError.message : "删除失败，请稍后重试")
    } finally {
      setDeleting(false)
    }
  }

  const dialog = (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[130] flex items-end justify-center bg-black/72 p-0 backdrop-blur-sm sm:items-center sm:p-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} onPointerDown={(event) => { if (event.target === event.currentTarget && !saving) onClose() }}>
          <motion.section role="dialog" aria-modal="true" aria-label="管理精选参考音频" initial={{ opacity: 0, y: 30, scale: 0.965 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 18, scale: 0.975 }} transition={voiceSpring} className="relative flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-2xl border border-white/12 bg-[#080c17]/98 shadow-[0_26px_90px_rgba(0,0,0,0.62)] sm:h-[86vh] sm:rounded-2xl">
            <div className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent" />
            <header className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 sm:px-6">
              <div><div className="flex items-center gap-2 text-base font-black text-white"><Settings2 className="h-4 w-4 text-cyan-100" />管理精选参考音频</div><p className="mt-1 text-xs text-zinc-500">上传文件会保存到 Supabase Storage，停用项目不会对普通用户显示。</p></div>
              <motion.button type="button" onClick={onClose} disabled={saving} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40" aria-label="关闭管理弹窗"><X className="h-4 w-4" /></motion.button>
            </header>

            <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_minmax(0,1fr)]">
              <aside className="voice-scroll min-h-0 overflow-y-auto border-b border-white/8 p-4 lg:border-b-0 lg:border-r">
                <motion.button type="button" onClick={startCreating} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className={`mb-3 inline-flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border px-4 text-xs font-black transition-colors ${isCreating ? "border-cyan-200/42 bg-cyan-200/[0.1] text-cyan-50" : "border-white/10 bg-white/[0.04] text-zinc-200 hover:border-cyan-100/25 hover:text-white"}`}><Plus className="h-4 w-4" />新增精选声音</motion.button>
                {loading ? <div className="grid min-h-36 place-items-center"><Loader2 className="h-5 w-5 animate-spin text-cyan-100" /></div> : samples.length ? (
                  <motion.div layout transition={voiceLayoutSpring} className="space-y-2">
                    {samples.map((sample) => (
                      <motion.button key={sample.id} layout type="button" onClick={() => selectSample(sample)} whileTap={voiceTap} transition={voiceLayoutSpring} className={`relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border p-3 text-left transition-colors ${selectedId === sample.id ? "border-cyan-200/38 bg-cyan-200/[0.075]" : "border-transparent bg-black/20 hover:border-white/10 hover:bg-white/[0.04]"}`}>
                        {selectedId === sample.id ? <motion.span layoutId="manager-sample-selection" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-cyan-200" transition={voiceSpring} /> : null}
                        <ManagerAvatar sample={sample} />
                        <span className="min-w-0 flex-1"><span className="flex items-center gap-2"><b className="truncate text-xs text-white">{sample.name}</b><span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${sample.isActive ? "bg-emerald-300/10 text-emerald-100/75" : "bg-zinc-500/10 text-zinc-500"}`}>{sample.isActive ? "启用" : "停用"}</span></span><span className="mt-1 block truncate text-[10px] text-zinc-500">排序 {sample.sortOrder} · {sample.tags.join(" / ") || "暂无标签"}</span></span>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : <div className="rounded-xl border border-dashed border-white/10 bg-black/18 p-4 text-center text-xs text-zinc-500">还没有精选声音，先新增第一条。</div>}
              </aside>

              <main className="voice-scroll min-h-0 overflow-y-auto p-5 sm:p-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.form key={selectedId ?? "new"} onSubmit={handleSave} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-3xl space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-black text-white">{isCreating ? "新增精选声音" : `编辑 · ${selectedSample?.name ?? "精选声音"}`}</h2><p className="mt-1 text-xs text-zinc-500">名称与参考音频为必填项。</p></div>{!isCreating && selectedSample ? <motion.button type="button" onClick={() => setDeleteTarget(selectedSample)} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-rose-200/15 bg-rose-500/[0.05] px-3 text-[11px] font-bold text-rose-100/75 transition-colors hover:border-rose-200/30 hover:bg-rose-500/[0.1] hover:text-rose-50"><Trash2 className="h-3.5 w-3.5" />删除</motion.button> : null}</div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="名称" required><input value={editor.name} onChange={(event) => setEditor((current) => ({ ...current, name: event.target.value }))} maxLength={80} className={inputClass} placeholder="例如：沉稳纪录片男声" /></Field>
                      <Field label="排序"><input type="number" value={editor.sortOrder} onChange={(event) => setEditor((current) => ({ ...current, sortOrder: event.target.value }))} className={inputClass} /></Field>
                    </div>
                    <Field label="描述"><textarea value={editor.description} onChange={(event) => setEditor((current) => ({ ...current, description: event.target.value }))} maxLength={500} rows={3} className={`${inputClass} min-h-24 resize-y py-3`} placeholder="介绍声音气质与适用场景" /></Field>
                    <Field label="标签，用逗号分隔"><input value={editor.tags} onChange={(event) => setEditor((current) => ({ ...current, tags: event.target.value }))} className={inputClass} placeholder="沉稳，男声，纪录片" /></Field>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <UploadField label="头像" hint="PNG / JPG / WEBP，最大 2 MB" icon={<ImagePlus className="h-4 w-4" />} filename={editor.avatar?.name || (!isCreating ? selectedSample?.avatarPath?.split("/").pop() : undefined)} accept="image/png,image/jpeg,image/webp" onChange={(file) => setEditor((current) => ({ ...current, avatar: file }))} />
                      <UploadField label="参考音频" hint="WAV / MP3 / M4A / AAC，最大 4 MB" icon={<FileAudio className="h-4 w-4" />} filename={editor.audio?.name || (!isCreating ? selectedSample?.audioPath.split("/").pop() : undefined)} accept="audio/wav,audio/mpeg,audio/mp4,audio/aac,.wav,.mp3,.m4a,.aac" onChange={(file) => inspectAudio(file, (duration) => setEditor((current) => ({ ...current, audio: file, audioDurationSeconds: duration })))} />
                    </div>

                    {(editor.audio || selectedSample?.audioUrl) ? <div className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="mb-2 flex items-center gap-2 text-[11px] font-bold text-zinc-300"><Volume2 className="h-3.5 w-3.5 text-cyan-100" />试听当前音频</div><ManagerAudioPreview file={editor.audio} fallbackUrl={selectedSample?.audioUrl} id={selectedId ?? "new"} /></div> : null}

                    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.035] p-3 transition-colors hover:border-cyan-100/22"><span><b className="block text-xs text-zinc-100">对普通用户启用</b><span className="mt-1 block text-[10px] text-zinc-500">关闭后仍保留在管理列表，但不会出现在选择器。</span></span><input type="checkbox" checked={editor.isActive} onChange={(event) => setEditor((current) => ({ ...current, isActive: event.target.checked }))} className="h-4 w-4 cursor-pointer accent-cyan-300" /></label>

                    <AnimatePresence>{error ? <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={voiceSpring} className="flex items-start gap-2 rounded-xl border border-rose-200/18 bg-rose-500/[0.07] p-3 text-xs font-bold text-rose-100"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{error}</motion.div> : null}</AnimatePresence>

                    <motion.button type="submit" disabled={saving} whileHover={saving ? undefined : voiceHover} whileTap={saving ? undefined : voiceTap} transition={voiceFastSpring} className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-300 to-violet-400 px-5 text-sm font-black text-[#07101d] transition-[filter,opacity] hover:brightness-110 disabled:cursor-wait disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{savingStage === "uploading" ? "正在上传文件..." : savingStage === "saving" ? "正在保存资料..." : isCreating ? "新增精选声音" : "保存修改"}</motion.button>
                  </motion.form>
                </AnimatePresence>
              </main>
            </div>

            <AnimatePresence>{toast ? <motion.div initial={{ opacity: 0, scale: 0.72, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 8 }} transition={{ type: "spring", stiffness: 520, damping: 25, mass: 0.65 }} className={`pointer-events-none absolute bottom-5 right-5 z-20 flex max-w-sm items-center gap-2 rounded-xl border px-4 py-3 text-xs font-black shadow-[0_12px_32px_rgba(0,0,0,0.38)] ${toast.tone === "success" ? "border-emerald-200/20 bg-[#10201d]/98 text-emerald-50" : "border-rose-200/20 bg-[#251219]/98 text-rose-50"}`}>{toast.tone === "success" ? <Check className="h-4 w-4 text-emerald-200" /> : <CircleAlert className="h-4 w-4 text-rose-200" />}{toast.message}</motion.div> : null}</AnimatePresence>

            <AnimatePresence>{deleteTarget ? <motion.div className="absolute inset-0 z-30 grid place-items-center bg-black/62 p-5 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={(event) => { if (event.target === event.currentTarget && !deleting) setDeleteTarget(null) }}><motion.div initial={{ opacity: 0, scale: 0.88, y: 14 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={voiceSpring} className="w-full max-w-sm rounded-2xl border border-rose-200/18 bg-[#120c14]/98 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"><h3 className="text-sm font-black text-white">删除“{deleteTarget.name}”？</h3><p className="mt-2 text-xs leading-relaxed text-zinc-400">数据库记录、头像和参考音频都会被删除，此操作不可撤销。</p><div className="mt-5 flex justify-end gap-2"><motion.button type="button" onClick={() => setDeleteTarget(null)} disabled={deleting} whileHover={voiceHover} whileTap={voiceTap} transition={voiceFastSpring} className="h-10 cursor-pointer rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-bold text-zinc-200">取消</motion.button><motion.button type="button" onClick={() => void handleDelete()} disabled={deleting} whileHover={deleting ? undefined : voiceHover} whileTap={deleting ? undefined : voiceTap} transition={voiceFastSpring} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-rose-200/22 bg-rose-500/12 px-4 text-xs font-black text-rose-50 disabled:cursor-wait disabled:opacity-60">{deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{deleting ? "删除中..." : "确认删除"}</motion.button></div></motion.div></motion.div> : null}</AnimatePresence>
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return typeof document !== "undefined" ? createPortal(dialog, document.body) : null
}

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3.5 text-sm text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-cyan-100/45 focus:ring-2 focus:ring-cyan-200/10"

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block text-xs font-bold text-zinc-300">{label}{required ? <span className="ml-1 text-cyan-100">*</span> : null}</span>{children}</label>
}

function UploadField({ label, hint, icon, filename, accept, onChange }: { label: string; hint: string; icon: React.ReactNode; filename?: string; accept: string; onChange: (file: File | null) => void }) {
  return <label className="group block cursor-pointer rounded-xl border border-dashed border-white/12 bg-black/20 p-4 transition-colors hover:border-cyan-100/30 hover:bg-cyan-100/[0.035]"><span className="flex items-center gap-2 text-xs font-black text-white">{icon}{label}</span><span className="mt-2 block truncate text-[11px] text-zinc-400">{filename || "点击选择文件"}</span><span className="mt-1 block text-[10px] text-zinc-600">{hint}</span><input type="file" accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /></label>
}

function ManagerAvatar({ sample }: { sample: VoiceReferenceSample }) {
  return <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-cyan-100/[0.06] text-cyan-100">{sample.avatarUrl ? <span className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(sample.avatarUrl).slice(1, -1)})` }} /> : <Volume2 className="h-4 w-4" />}</span>
}

function ManagerAudioPreview({ file, fallbackUrl, id }: { file: File | null; fallbackUrl?: string; id: string }) {
  const [url, setUrl] = useState(fallbackUrl || "")
  useEffect(() => {
    if (!file) {
      const frame = window.requestAnimationFrame(() => setUrl(fallbackUrl || ""))
      return () => window.cancelAnimationFrame(frame)
    }
    const nextUrl = URL.createObjectURL(file)
    const frame = window.requestAnimationFrame(() => setUrl(nextUrl))
    return () => {
      window.cancelAnimationFrame(frame)
      URL.revokeObjectURL(nextUrl)
    }
  }, [fallbackUrl, file])
  return url ? <VoiceAudioPlayer id={`manager-sample-${id}-${file?.lastModified ?? "stored"}`} src={url} compact /> : null
}

function editorFromSample(sample: VoiceReferenceSample): EditorState {
  return { name: sample.name, description: sample.description, tags: sample.tags.join("，"), sortOrder: String(sample.sortOrder), isActive: sample.isActive, avatar: null, audio: null, audioDurationSeconds: sample.audioDurationSeconds ?? null }
}

function validateEditor(editor: EditorState, isCreating: boolean) {
  if (!editor.name.trim()) return "请填写名称"
  if (isCreating && !editor.audio) return "新增精选声音时必须上传参考音频"
  if (editor.avatar && !["image/png", "image/jpeg", "image/webp"].includes(editor.avatar.type)) return "头像仅支持 PNG、JPG 或 WEBP"
  if (editor.avatar && editor.avatar.size > 2 * 1024 * 1024) return "头像不能超过 2 MB"
  if (editor.audio) {
    const extension = editor.audio.name.split(".").pop()?.toLowerCase()
    const validAudioType = ["audio/wav", "audio/x-wav", "audio/wave", "audio/mpeg", "audio/mp4", "audio/x-m4a", "audio/aac"].includes(editor.audio.type)
    if (!validAudioType && !["wav", "mp3", "m4a", "aac"].includes(extension || "")) return "参考音频仅支持 WAV、MP3、M4A 或 AAC"
  }
  if (editor.audio && editor.audio.size > 4 * 1024 * 1024) return "参考音频不能超过 4 MB"
  return null
}

function editorToPayload(
  editor: EditorState,
  uploads: Awaited<ReturnType<typeof uploadVoiceReferenceSampleFiles>>,
) {
  return {
    sampleId: uploads.sampleId,
    name: editor.name.trim(),
    description: editor.description.trim(),
    tags: editor.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean),
    sortOrder: Number.parseInt(editor.sortOrder || "0", 10) || 0,
    isActive: editor.isActive,
    audioDurationSeconds: editor.audioDurationSeconds,
    avatarUpload: uploads.avatarUpload,
    audioUpload: uploads.audioUpload,
  }
}

function inspectAudio(file: File | null, onReady: (duration: number | null) => void) {
  if (!file) {
    onReady(null)
    return
  }
  const url = URL.createObjectURL(file)
  const audio = new Audio(url)
  const finish = (duration: number | null) => {
    URL.revokeObjectURL(url)
    onReady(duration)
  }
  audio.addEventListener("loadedmetadata", () => finish(Number.isFinite(audio.duration) ? audio.duration : null), { once: true })
  audio.addEventListener("error", () => finish(null), { once: true })
  audio.load()
}
