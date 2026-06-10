"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { useId } from "react"
import { easeOutExpo, easeStroke } from "@/components/prompt-gallery/motion"

interface PromptFavoriteButtonProps {
  active?: boolean
  busy?: boolean
  disabled?: boolean
  label?: string
  compact?: boolean
  className?: string
  onToggle: () => void
}

const starPath =
  "M12 2.8L14.86 8.6L21.26 9.53L16.63 14.04L17.72 20.42L12 17.41L6.28 20.42L7.37 14.04L2.74 9.53L9.14 8.6L12 2.8Z"

export function PromptFavoriteButton({
  active = false,
  busy = false,
  disabled = false,
  label,
  compact = false,
  className = "",
  onToggle,
}: PromptFavoriteButtonProps) {
  const id = useId().replace(/:/g, "")
  const clipId = `${id}-favorite-star-clip`
  const gradientId = `${id}-favorite-star-fill`
  const interactive = !busy && !disabled

  return (
    <motion.button
      type="button"
      onClick={(event) => {
        event.stopPropagation()
        if (interactive) onToggle()
      }}
      disabled={!interactive}
      aria-pressed={active}
      aria-label={active ? "取消收藏" : "加入收藏"}
      whileHover={interactive ? { y: -1, borderColor: active ? "rgba(253,224,71,0.48)" : "rgba(255,255,255,0.24)" } : undefined}
      whileTap={interactive ? { scale: 0.92 } : undefined}
      transition={{ type: "spring", stiffness: 520, damping: 32, mass: 0.6 }}
      className={`relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/12 bg-black/35 text-white backdrop-blur-xl transition-[background-color,box-shadow] hover:bg-black/50 disabled:cursor-not-allowed disabled:opacity-65 ${
        compact ? "h-10 w-10" : "min-h-11 px-4 text-sm font-black"
      } ${active ? "shadow-[0_0_24px_rgba(250,204,21,0.12)]" : ""} ${className}`}
    >
      <span className="relative grid h-5 w-5 place-items-center">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin text-amber-100" />
        ) : (
          <motion.svg
            width={22}
            height={22}
            viewBox="0 0 24 24"
            fill="none"
            className="overflow-visible"
            animate={active ? { scale: [1, 1.18, 0.96, 1.06, 1] } : { scale: 1 }}
            transition={{ duration: 0.58, ease: easeOutExpo }}
          >
            <defs>
              <clipPath id={clipId}>
                <path d={starPath} />
              </clipPath>
              <radialGradient id={gradientId} cx="50%" cy="52%" r="58%">
                <stop offset="0%" stopColor="#fff7ad" />
                <stop offset="52%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#f59e0b" />
              </radialGradient>
            </defs>
            <motion.circle
              clipPath={`url(#${clipId})`}
              cx={12}
              cy={12}
              r={active ? 16 : 0}
              fill={`url(#${gradientId})`}
              initial={false}
              animate={{ r: active ? 16 : 0, opacity: active ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 22, mass: 0.7 }}
            />
            <motion.path
              d={starPath}
              fill="none"
              stroke={active ? "rgba(254,240,138,0.98)" : "rgba(255,255,255,0.72)"}
              strokeWidth={1.8}
              strokeLinejoin="round"
              pathLength={1}
              initial={false}
              animate={{ pathLength: active ? [0, 1] : 1 }}
              transition={{ duration: 0.46, ease: easeStroke }}
              style={{ filter: active ? "drop-shadow(0 0 7px rgba(250,204,21,0.46))" : undefined }}
            />
            <AnimatePresence>
              {active ? (
                <motion.g
                  key="spark"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.6, 1.1, 1.35] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: easeOutExpo }}
                >
                  <path d="M12 0.8V4" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M21.2 7.2L18.4 8.8" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M2.8 7.2L5.6 8.8" stroke="#fde68a" strokeWidth="1.4" strokeLinecap="round" />
                </motion.g>
              ) : null}
            </AnimatePresence>
          </motion.svg>
        )}
      </span>
      {label && !compact ? <span>{label}</span> : null}
    </motion.button>
  )
}
