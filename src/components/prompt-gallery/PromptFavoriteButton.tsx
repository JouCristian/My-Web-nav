"use client"

import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { easeOutBack } from "@/components/prompt-gallery/motion"

interface PromptFavoriteButtonProps {
  active?: boolean
  busy?: boolean
  disabled?: boolean
  label?: string
  compact?: boolean
  className?: string
  onToggle: () => void
}

// 完整的实心五角星路径（viewBox 0 0 24 24，所有顶点都落在视口内部，避免被裁切）
const starPath =
  "M12 2.4L14.94 8.36L21.52 9.32L16.76 13.96L17.88 20.52L12 17.42L6.12 20.52L7.24 13.96L2.48 9.32L9.06 8.36L12 2.4Z"

export function PromptFavoriteButton({
  active = false,
  busy = false,
  disabled = false,
  label,
  compact = false,
  className = "",
  onToggle,
}: PromptFavoriteButtonProps) {
  const interactive = !busy && !disabled

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        if (interactive) onToggle()
      }}
      disabled={busy}
      aria-pressed={active}
      aria-label={active ? "取消收藏" : "加入收藏"}
      whileHover={interactive ? { y: -1 } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.6 }}
      className={`relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border text-white backdrop-blur-xl transition-[background-color,border-color,box-shadow] disabled:cursor-not-allowed disabled:opacity-65 ${
        compact ? "h-10 w-10" : "min-h-11 px-4 text-sm font-black"
      } ${
        active
          ? "border-amber-300/40 bg-black/55 shadow-[0_0_22px_rgba(250,204,21,0.18)]"
          : "border-white/15 bg-black/55 hover:border-white/25 hover:bg-black/65"
      } ${className}`}
    >
      {/* 黑色磨砂玻璃底座：再叠一层轻微的内发光，保证白色星标在浅色预览图上也清晰可见 */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]" />

      <span className="relative grid h-[22px] w-[22px] place-items-center">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-100" />
        ) : (
          <motion.svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            // 只对 SVG 图标本体施加 Q 弹（轻微摇晃放大回弹），不在图标之外添加动画
            animate={active ? { scale: [1, 1.28, 0.9, 1.12, 1], rotate: [0, -6, 5, -2, 0] } : { scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: easeOutBack }}
            style={{ transformOrigin: "center", transformBox: "fill-box" }}
          >
            <motion.path
              d={starPath}
              strokeLinejoin="round"
              initial={false}
              // 触发点：未收藏时只有白色描边、内部空心；收藏后填充黄色
              animate={{
                fill: active ? "#facc15" : "rgba(255,255,255,0)",
                stroke: active ? "#fde047" : "rgba(255,255,255,0.95)",
              }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              strokeWidth={1.6}
              style={{ filter: active ? "drop-shadow(0 0 6px rgba(250,204,21,0.5))" : undefined }}
            />
          </motion.svg>
        )}
      </span>
      {label && !compact ? <span>{label}</span> : null}
    </motion.button>
  )
}
