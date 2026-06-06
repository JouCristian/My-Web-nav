"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useState, type MouseEvent } from "react"

interface PromptCopyButtonProps {
  prompt: string
  label?: string
  compact?: boolean
  className?: string
}

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

export function PromptCopyButton({
  prompt,
  label = "复制提示词",
  compact = false,
  className = "",
}: PromptCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [copied])

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    try {
      await copyText(prompt)
      setCopied(true)
    } catch {
      setCopied(true)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`group/copy relative inline-flex items-center justify-center overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.09] text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.10)] transition-colors duration-300 hover:border-cyan-200/[0.35] hover:bg-cyan-200/[0.13] ${compact ? "gap-2 px-3 py-2 text-xs" : "gap-3 px-5 py-3 text-sm"} ${className}`}
      aria-label={copied ? "已复制" : label}
    >
      <span className="relative transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/copy:scale-110">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </span>
      <span className="relative font-bold">
        {copied ? "已复制" : label}
      </span>
    </button>
  )
}
