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
export function AutoHeight({
  children,
  className,
  clip = false,
}: {
  children: ReactNode
  className?: string
  /**
   * 始终把超出当前高度的内容裁掉（overflow: hidden）。
   * 用于内部没有需要溢出显示的绝对定位弹出层、但外层有滚动容器的场景，
   * 防止内容切换瞬间（height state 滞后于 ResizeObserver 那一帧）撑大父级滚动容器、闪现滚动条。
   * 含绝对定位弹出层（如预设面板）的场景保持默认 false。
   */
  clip?: boolean
}) {
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
      style={
        clip
          ? // 始终裁切：内部无溢出弹出层，杜绝切换瞬间撑大外层滚动容器导致的滚动条闪现
            { overflow: "hidden" }
          : {
              // clip-path 在动画期间裁切超出部分，动画结束后恢复 none，
              // 这样绝对定位的弹出层（预设面板、下拉等）不受影响，
              // 也不会在弹窗的 overflow-y-auto 容器内触发多余的滚动条。
              clipPath: animating ? "inset(0 -100vw -100vh -100vw)" : "none",
              overflow: "visible",
            }
      }
    >
      <div ref={innerRef}>{children}</div>
    </motion.div>
  )
}
