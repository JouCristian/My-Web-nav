"use client"

import { Copy } from "lucide-react"
import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react"
import { createPortal } from "react-dom"
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

interface ToastAnchor {
  left: number
  top: number
  placement: "below" | "above"
}

const TOAST_WIDTH = 300
const TOAST_HEIGHT = 78

// Q弹云朵 toast —— 焊在页面文档坐标上，随页面一起滚动
function CloudToast({ message, anchor }: { message: string; anchor: ToastAnchor }) {
  // 进入方向：在下方时从按钮往下弹出，在上方时从按钮往上弹出
  const fromY = anchor.placement === "below" ? -16 : 16

  return (
    <motion.div
      className="pointer-events-none absolute z-[120] h-[78px]"
      style={{ left: anchor.left, top: anchor.top, width: TOAST_WIDTH }}
      initial={{ opacity: 0, y: fromY, scale: 0.6, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: fromY * 0.7, scale: 0.78, filter: "blur(8px)" }}
      transition={{
        opacity: { type: "spring", stiffness: 420, damping: 22, mass: 0.6 },
        y: { type: "spring", stiffness: 360, damping: 14, mass: 0.7 },
        scale: { type: "spring", stiffness: 380, damping: 12, mass: 0.7 },
        filter: { type: "spring", stiffness: 380, damping: 24, mass: 0.6 },
      }}
    >
      <div className="absolute inset-x-10 bottom-1 h-8 rounded-full bg-black/45 blur-2xl" />
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 360 72"
        fill="none"
        aria-hidden="true"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="prompt-cloud-glass" x1="52" y1="8" x2="309" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(42,62,64,0.86)" />
            <stop offset="0.42" stopColor="rgba(18,31,34,0.92)" />
            <stop offset="1" stopColor="rgba(7,13,16,0.96)" />
          </linearGradient>
          <linearGradient id="prompt-cloud-edge" x1="54" y1="7" x2="315" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(165,243,252,0.55)" />
            <stop offset="0.4" stopColor="rgba(125,211,252,0.18)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.22)" />
          </linearGradient>
          <radialGradient
            id="prompt-cloud-glow"
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(151 17) rotate(32) scale(156 64)"
          >
            <stop stopColor="rgba(165,243,252,0.16)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          fill="url(#prompt-cloud-glass)"
        />
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          stroke="url(#prompt-cloud-edge)"
          strokeWidth="1.15"
          opacity="0.95"
        />
        <path
          d="M45 22.8C82.5 11.2 101.8 22.5 123 18.4C149.5 13.2 166 15.1 184 25.3"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          fill="url(#prompt-cloud-glow)"
          opacity="0.8"
        />
      </svg>
      <div className="relative flex h-full items-center justify-center gap-2 px-8 text-center text-[12px] font-bold tracking-wide text-zinc-100/95 drop-shadow-[0_1px_8px_rgba(255,255,255,0.05)]">
        <span className="text-cyan-200">
          <StrokeCheck size={15} />
        </span>
        {message}
      </div>
    </motion.div>
  )
}

export function PromptCopyButton({
  prompt,
  label = "复制提示词",
  compact = false,
  className = "",
}: PromptCopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const resetTimer = useRef<number | null>(null)
  const toastTimer = useRef<number | null>(null)
  const [anchor, setAnchor] = useState<ToastAnchor | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current)
      if (toastTimer.current) window.clearTimeout(toastTimer.current)
    }
  }, [])

  const [showToast, setShowToast] = useState(false)
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null)

  // 找到承载按钮的实际滚动容器（没有则返回 null，代表用 body）
  const getScrollParent = (el: HTMLElement | null): HTMLElement | null => {
    let node = el?.parentElement ?? null
    while (node && node !== document.body) {
      const cs = window.getComputedStyle(node)
      if (/(auto|scroll|overlay)/.test(cs.overflowY) && node.scrollHeight > node.clientHeight) {
        return node
      }
      node = node.parentElement
    }
    return null
  }

  const computeAnchor = useCallback((): { anchor: ToastAnchor; target: HTMLElement | null } => {
    const gap = 12
    const margin = 12
    const fallback = {
      anchor: {
        left: typeof window !== "undefined" ? window.innerWidth / 2 - TOAST_WIDTH / 2 : 0,
        top: 24,
        placement: "below" as const,
      },
      target: null,
    }
    const el = buttonRef.current
    if (!el || typeof window === "undefined") return fallback

    const rect = el.getBoundingClientRect()
    const container = getScrollParent(el)

    // 判断放上方还是下方：相对滚动容器（无容器则相对视口）的可用空间
    const containerRect = container?.getBoundingClientRect()
    const bottomEdge = containerRect ? containerRect.bottom : window.innerHeight
    const spaceBelow = bottomEdge - rect.bottom
    const placement: ToastAnchor["placement"] =
      spaceBelow >= TOAST_HEIGHT + gap + margin ? "below" : "above"

    if (container) {
      // 坐标相对滚动容器内容（含 scrollTop），toast 作为容器子节点，随内容一起滚动并焊在原处
      const cRect = container.getBoundingClientRect()
      const top =
        (placement === "below" ? rect.bottom : rect.top - gap - TOAST_HEIGHT) -
        cRect.top +
        container.scrollTop +
        (placement === "below" ? gap : 0)
      let left = rect.left - cRect.left + container.scrollLeft + rect.width / 2 - TOAST_WIDTH / 2
      const maxLeft = container.scrollWidth - TOAST_WIDTH - margin
      left = Math.max(margin, Math.min(left, Math.max(margin, maxLeft)))
      return { anchor: { left, top, placement }, target: container }
    }

    // 没有滚动容器：portal 到 body，使用文档坐标（含 window 滚动）
    const scrollX = window.scrollX
    const scrollY = window.scrollY
    const top =
      (placement === "below" ? rect.bottom + gap : rect.top - gap - TOAST_HEIGHT) + scrollY
    let left = rect.left + rect.width / 2 - TOAST_WIDTH / 2
    left = Math.max(margin, Math.min(left, window.innerWidth - TOAST_WIDTH - margin)) + scrollX
    return { anchor: { left, top, placement }, target: null }
  }, [])

  const handleCopy = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()

    try {
      await copyText(prompt)
    } catch {
      // 即使复制 API 失败，也给出反馈
    }

    const { anchor: nextAnchor, target } = computeAnchor()
    // 确保容器是定位上下文，absolute 才能相对它定位
    if (target && window.getComputedStyle(target).position === "static") {
      target.style.position = "relative"
    }
    setPortalTarget(target)
    setAnchor(nextAnchor)
    setCopied(true)
    setShowToast(true)

    if (resetTimer.current) window.clearTimeout(resetTimer.current)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)

    resetTimer.current = window.setTimeout(() => setCopied(false), 1800)
    toastTimer.current = window.setTimeout(() => setShowToast(false), 2200)
  }

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
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

      {mounted
        ? createPortal(
            <AnimatePresence>
              {showToast && anchor ? (
                <CloudToast message="已复制到剪贴板" anchor={anchor} />
              ) : null}
            </AnimatePresence>,
            portalTarget ?? document.body,
          )
        : null}
    </>
  )
}
