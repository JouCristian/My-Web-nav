"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { CheckCircle2, Download, Loader2, Radio, RotateCcw, Sparkles, TriangleAlert, Wand2 } from "lucide-react"
import {
  voiceErrorTransition,
  voiceFadeScaleVariants,
  voiceFastSpring,
  voiceHover,
  voiceSpring,
  voiceTap,
} from "@/components/ai-voice-workshop/motion"
import type { VoiceJobStatus, VoiceMode } from "@/lib/ai-voice-workshop/types"

interface AudioResultCardProps {
  status: VoiceJobStatus | "idle"
  mode?: VoiceMode
  audioUrl?: string
  filename?: string
  title?: string
  error?: string
  onReset?: () => void
  onRetry?: () => void
}

const statusText: Record<AudioResultCardProps["status"], string> = {
  idle: "等待生成",
  queued: "任务排队中",
  running: "正在生成",
  succeeded: "生成完成",
  failed: "生成失败",
}

const waveform = [32, 54, 42, 72, 48, 84, 58, 38, 66, 46, 78, 52, 34, 62, 44, 70, 40, 56]

export function AudioResultCard({ status, mode, audioUrl, filename, title, error, onReset, onRetry }: AudioResultCardProps) {
  const reducedMotion = useReducedMotion()
  const isLoading = status === "queued" || status === "running"

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#090c18]/88 p-5 shadow-[0_8px_24px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-6">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/55 to-transparent" />
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white"><Radio className="h-4 w-4 text-cyan-100" />生成结果</div>
          <p className="mt-1 text-xs text-zinc-400">{statusText[status]}</p>
        </div>
        {onReset ? (
          <motion.button
            type="button"
            onClick={onReset}
            whileHover={voiceHover}
            whileTap={voiceTap}
            transition={voiceFastSpring}
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition-colors hover:border-cyan-100/30 hover:bg-cyan-100/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200/50"
            aria-label="重置生成结果"
          >
            <RotateCcw className="h-4 w-4" />
          </motion.button>
        ) : null}
      </div>

      <div className="grid min-h-[250px] pt-5">
      <AnimatePresence mode="wait" initial={false}>
        {status === "idle" ? (
          <motion.div key="idle" variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="col-start-1 row-start-1">
            <div className="relative flex min-h-[250px] flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/12 bg-black/20 px-5 text-center">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),transparent_60%)]" />
              <div className="relative flex h-20 items-center gap-1" aria-hidden="true">
                {waveform.map((height, index) => (
                  <span key={`${height}-${index}`} className="w-1 rounded-full bg-gradient-to-t from-violet-400/45 to-cyan-200/80" style={{ height: `${height}%` }} />
                ))}
              </div>
              <div className="relative mt-4 flex items-center gap-2 text-sm font-bold text-white"><Sparkles className="h-4 w-4 text-cyan-100" />生成的 WAV 将出现在这里</div>
              <p className="relative mt-2 max-w-sm text-xs leading-relaxed text-zinc-400">完成左侧创作流程后，可在这里播放、下载并管理生成结果。</p>
            </div>
          </motion.div>
        ) : null}

        {isLoading ? (
          <motion.div key="loading" variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="col-start-1 row-start-1 flex min-h-[250px] flex-col justify-center overflow-hidden rounded-xl border border-cyan-100/15 bg-cyan-100/[0.05] p-5">
            <div className="flex items-center gap-3 text-sm font-bold text-cyan-50"><Loader2 className="h-4 w-4 animate-spin" />{status === "queued" ? "任务已进入队列" : "VoxCPM2 正在合成音频"}</div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">本地任务按顺序执行，模型加载或前序任务生成时请稍候。</p>
            <div className="mt-5 flex h-16 items-center justify-center gap-1 overflow-hidden" aria-hidden="true">
              {waveform.slice(0, 14).map((height, index) => (
                <motion.span
                  key={`${height}-${index}`}
                  className="w-1.5 rounded-full bg-gradient-to-t from-violet-400/55 to-cyan-200"
                  style={{ height: `${Math.max(22, height - 12)}%` }}
                  animate={reducedMotion ? undefined : { scaleY: [0.45, 1, 0.55] }}
                  transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.045, ease: "easeInOut" }}
                />
              ))}
            </div>
            <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/35">
              <motion.div className="h-full w-2/5 rounded-full bg-gradient-to-r from-cyan-200 to-violet-300" animate={reducedMotion ? undefined : { x: ["-110%", "280%"] }} transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }} />
            </div>
          </motion.div>
        ) : null}

        {status === "failed" ? (
          <motion.div key="failed" initial={{ opacity: 0, scale: 0.985, y: 5, x: 0 }} animate={{ opacity: 1, scale: 1, y: 0, x: reducedMotion ? 0 : [0, -3, 3, -2, 0] }} exit="exit" variants={voiceFadeScaleVariants} transition={reducedMotion ? voiceSpring : voiceErrorTransition} className="col-start-1 row-start-1 flex min-h-[250px] flex-col justify-center rounded-xl border border-rose-200/20 bg-rose-500/[0.08] p-5 text-sm leading-relaxed text-rose-100">
            <div className="mb-2 flex items-center gap-2 font-bold"><TriangleAlert className="h-4 w-4" />生成失败</div>
            <p className="text-xs text-rose-100/80">{error || "请检查本地引擎状态后重试。"}</p>
            {onRetry ? <button type="button" onClick={onRetry} className="mt-4 inline-flex min-h-10 w-fit cursor-pointer items-center gap-2 rounded-full border border-rose-100/25 bg-rose-100/[0.08] px-4 text-xs font-bold text-rose-50 transition-colors hover:bg-rose-100/[0.13]"><Wand2 className="h-4 w-4" />重新生成</button> : null}
          </motion.div>
        ) : null}

        {status === "succeeded" && audioUrl ? (
          <motion.div key={audioUrl} variants={voiceFadeScaleVariants} initial="hidden" animate="visible" exit="exit" transition={voiceSpring} className="col-start-1 row-start-1 flex min-h-[250px] flex-col justify-center space-y-4">
            <div className="rounded-xl border border-emerald-200/20 bg-emerald-300/[0.065] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-50"><CheckCircle2 className="h-4 w-4" />{title || "WAV 已生成"}</div>
                  <span className="mt-2 inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] font-bold text-zinc-300">{mode === "clone" ? "声音克隆" : "音色设计"}</span>
                </div>
                <span className="text-[11px] text-emerald-50/60">刚刚生成</span>
              </div>
              <audio controls src={audioUrl} className="mt-4 w-full" />
            </div>
            <a href={audioUrl} download={filename || "voice-output.wav"} className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-300 to-violet-400 px-5 text-sm font-black text-[#07101d] transition-[filter] hover:brightness-110">
              <Download className="h-4 w-4" />下载 WAV
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
      </div>
    </section>
  )
}
