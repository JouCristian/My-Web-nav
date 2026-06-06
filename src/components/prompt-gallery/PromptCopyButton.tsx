"use client"

import { Copy } from "lucide-react"
import { useEffect, useRef, useState, type MouseEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"

interface PromptCopyButtonProps {
  prompt: string
  label?: string
  compact?: boolean
  className?: string
}

// 非线性缓动曲线
const EASE_OUT = [0.22, 1, 0.36, 1] as const
const EASE_DRAW = [0.16, 1, 0.3, 1] as const

async function copyText(value: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  if (typeof document === "undefined") return

  const textarea = document.createElement("textarea")
  textarea.value = value
  textarea.setAttribute("readonly", "true")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  textarea.style.top = "0"
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand("copy")
  textarea.remove()
}

// 一笔画对勾
function StrokeCheck({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        d="M4.5 12.5L9.5 17.5L19.5 6.5"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.42, ease: EASE_DRAW, delay: 0.08 }}
        style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.45))" }}
      />
    </svg>
  )
}

export function PromptCopyButton({
  prompt,
  label = "复制提示词",
  compact = false,
  className = "",
}: PromptCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current)
    }
  }, [])

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    try {
      await copyText(prompt)
    } catch {
      // 即使复制 API 失败，也给出反馈
    }

    setCopied(true)

    if (resetTimer.current) window.clearTimeout(resetTimer.current)
    resetTimer.current = window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group/copy relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.09] text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.10)] transition-colors duration-300 hover:border-cyan-200/[0.35] hover:bg-cyan-200/[0.13] ${compact ? "gap-2 px-3 py-2 text-xs" : "gap-3 px-5 py-3 text-sm"} ${className}`}
      aria-label={copied ? "已复制" : label}
    >
      {/* 复制态：图标 + 文字，点击后向内滑动收缩消失 */}
      <motion.span
        className="inline-flex items-center gap-2"
        initial={false}
        animate={
          copied
            ? { opacity: 0, scale: 0.4, x: 8, filter: "blur(4px)" }
            : { opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }
        }
        transition={{ duration: 0.32, ease: EASE_OUT }}
      >
        <span className="relative inline-flex transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/copy:scale-110">
          <Copy className="h-4 w-4" />
        </span>
        <span className="font-bold">{label}</span>
      </motion.span>

      {/* 已复制态：一笔画对勾 + 文案，从内向外滑入 */}
      <AnimatePresence>
        {copied ? (
          <motion.span
            key="copied"
            className="absolute inset-0 inline-flex items-center justify-center gap-2 font-bold"
            initial={{ opacity: 0, scale: 0.5, x: -8, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.5, x: -8, filter: "blur(4px)" }}
            transition={{ duration: 0.34, ease: EASE_OUT }}
          >
            <StrokeCheck />
            已复制
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  )
}
