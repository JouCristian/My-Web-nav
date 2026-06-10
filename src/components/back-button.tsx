"use client"

import { motion } from "framer-motion"
import ShapeBlur from "@/components/ShapeBlur"

export function BackButton({ className }: { className?: string }) {
  return (
    <motion.button
      type="button"
      aria-label="返回上一页"
      onClick={() => window.history.back()}
      whileHover="hover"
      whileTap="tap"
      initial="idle"
      className={`group relative inline-flex h-12 w-12 items-center justify-center ${className ?? ""}`}
    >
      {/* ShapeBlur 圆形边框效果：跟随指针的发光描边 */}
      <span className="pointer-events-none absolute inset-0">
        <ShapeBlur
          variation={2}
          shapeSize={1.0}
          roundness={1.0}
          borderSize={0.04}
          circleSize={0.35}
          circleEdge={0.6}
        />
      </span>

      {/* 静态底座圆环 */}
      <motion.span
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-black/40 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.45)] cursor-pointer"
        variants={{
          idle: { scale: 1, borderColor: "rgba(255,255,255,0.12)" },
          hover: { scale: 1.06, borderColor: "rgba(255,255,255,0.28)" },
          tap: { scale: 0.93 },
        }}
        transition={{ type: "spring", stiffness: 400, damping: 22 }}
      >
        {/* 更完整的箭头 SVG（带横线杆 + 箭头头部），hover 时轻微左移 */}
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white/85"
          variants={{
            idle: { x: 0 },
            hover: { x: -2 },
            tap: { x: -3 },
          }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
        >
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="11 18 5 12 11 6" />
        </motion.svg>
      </motion.span>
    </motion.button>
  )
}
