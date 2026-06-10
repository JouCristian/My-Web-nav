"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <motion.button
      type="button"
      aria-label="返回上一页"
      onClick={() => router.back()}
      whileHover="hover"
      whileTap="tap"
      initial="idle"
      className={className}
    >
      <motion.span
        className="flex items-center justify-center w-11 h-11 rounded-full border border-white/15 bg-black/40 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.45)] cursor-pointer"
        variants={{
          idle: { scale: 1, backgroundColor: "rgba(0,0,0,0.4)", borderColor: "rgba(255,255,255,0.15)" },
          hover: { scale: 1.08, backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.3)" },
          tap:  { scale: 0.92 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        {/* 左箭头 SVG */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/80"
          variants={{
            idle: { x: 0 },
            hover: { x: -2 },
            tap:  { x: -3 },
          }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
        >
          <path d="M15 18l-6-6 6-6" />
        </motion.svg>
      </motion.span>
    </motion.button>
  )
}
