"use client"

import { motion } from "framer-motion"
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { voiceLayoutSpring } from "@/components/ai-voice-workshop/motion"

/**
 * 用真实 height 做弹性高度过渡的容器。
 * 通过 ResizeObserver 跟踪内容自然高度，再用统一的非线性曲线（voiceLayoutSpring）
 * 动画到目标高度。因为动画的是真实流式高度，所以下方的兄弟元素会顺势滑动，
 * 依赖 grid/flex 拉伸的相邻卡片也会逐帧跟随，不会闪切。
 */
export function AutoHeight({ children, className }: { children: ReactNode; className?: string }) {
  const innerRef = useRef<HTMLDivElement>(null)
  const hasMeasured = useRef(false)
  const [height, setHeight] = useState<number | "auto">("auto")
  const [animating, setAnimating] = useState(false)

  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    const update = () => {
      const next = el.offsetHeight
      setHeight((prev) => {
        // 首次测量同步定位，不触发弹簧动画；只有挂载后内容真正变化才动画。
        if (hasMeasured.current && prev !== next) setAnimating(true)
        return next
      })
      hasMeasured.current = true
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <motion.div
      animate={{ height }}
      transition={animating ? voiceLayoutSpring : { duration: 0 }}
      onAnimationComplete={() => setAnimating(false)}
      className={className}
      style={{
        // clip-path 在动画期间裁切超出部分，动画结束后恢复 none，
        // 这样绝对定位的弹出层（预设面板、下拉等）不受影响，
        // 也不会在弹窗的 overflow-y-auto 容器内触发多余的滚动条。
        clipPath: animating ? "inset(0 -100vw -100vh -100vw)" : "none",
        overflow: "visible",
      }}
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  )
}
