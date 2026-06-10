"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import ShapeBlur from "@/components/ShapeBlur"

export function BackButton({ className, fallbackHref = "/" }: { className?: string; fallbackHref?: string }) {
  const router = useRouter()

  const handleBack = () => {
    // 有可回退的历史就回上一页；没有（如 v0 预览 iframe、直接打开的新标签）则回到兜底页面
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push(fallbackHref)
    }
  }

  return (
    <motion.button
      type="button"
      aria-label="返回上一页"
      onClick={handleBack}
      whileHover="hover"
      whileTap="tap"
      initial="idle"
      className={`group relative inline-flex h-12 w-12 items-center justify-center ${className ?? ""}`}
    >
      {/* ShapeBlur 圆形边框效果：跟随指针的发光描边，常驻渲染、实时跟随鼠标。
          白边问题已在 ShapeBlur 内部将鼠标初始位置移出容器解决 */}
      <span className="pointer-events-none absolute -inset-2">
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
