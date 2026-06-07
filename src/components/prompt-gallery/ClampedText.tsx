"use client"

import { useLayoutEffect, useRef, useState } from "react"

interface ClampedTextProps {
  text: string
  /** 最多显示的行数 */
  lines?: number
  className?: string
}

/**
 * 基于实测高度的多行文本截断组件。
 *
 * 背景：本项目中 Tailwind 的 `line-clamp-*`（即 -webkit-line-clamp）在多行文本下
 * 截断机制失效——浏览器会把 display 规范成 flow-root 且不裁剪文字，只靠 overflow 硬切，
 * 导致末尾没有省略号、还会露出半行。这里改用测量法：用一个与显示元素同宽同字体的
 * 隐藏探针节点测量文本高度，二分裁剪字符并补「…」，保证省略号一定出现、高度恒定。
 */
export function ClampedText({ text, lines = 2, className }: ClampedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const [display, setDisplay] = useState(text)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const cs = getComputedStyle(el)
    const lineHeight = Number.parseFloat(cs.lineHeight) || 0
    if (!lineHeight) {
      setDisplay(text)
      return
    }
    // 目标最大高度 = 行高 * 行数（+1px 容差，吸收亚像素误差）
    const maxHeight = Math.ceil(lineHeight * lines) + 1

    // 真实可用文字宽度 = 内容盒宽度（clientWidth 已扣除边框，再扣 padding）
    const padLeft = Number.parseFloat(cs.paddingLeft) || 0
    const padRight = Number.parseFloat(cs.paddingRight) || 0
    const contentWidth = el.clientWidth - padLeft - padRight
    if (contentWidth <= 0) {
      setDisplay(text)
      return
    }

    // 创建隐藏探针：content-box，宽度即纯文字宽度，无 padding/border，
    // 这样 scrollHeight 直接等于文字内容高度，测量与真实渲染一致。
    const probe = document.createElement("div")
    probe.style.position = "absolute"
    probe.style.visibility = "hidden"
    probe.style.left = "-99999px"
    probe.style.top = "0"
    probe.style.boxSizing = "content-box"
    probe.style.width = `${contentWidth}px`
    probe.style.padding = "0"
    probe.style.border = "0"
    probe.style.fontFamily = cs.fontFamily
    probe.style.fontSize = cs.fontSize
    probe.style.fontWeight = cs.fontWeight
    probe.style.letterSpacing = cs.letterSpacing
    probe.style.lineHeight = cs.lineHeight
    probe.style.whiteSpace = "normal"
    probe.style.wordBreak = cs.wordBreak
    probe.style.overflowWrap = cs.overflowWrap
    document.body.appendChild(probe)

    const measure = (value: string) => {
      probe.textContent = value
      return probe.scrollHeight
    }

    let result = text
    if (measure(text) > maxHeight) {
      // 二分查找放得下的最大字符数（含末尾省略号）
      let low = 0
      let high = text.length
      let best = 0
      while (low <= high) {
        const mid = (low + high) >> 1
        if (measure(text.slice(0, mid).trimEnd() + "…") <= maxHeight) {
          best = mid
          low = mid + 1
        } else {
          high = mid - 1
        }
      }
      result = text.slice(0, best).trimEnd() + "…"
    }

    document.body.removeChild(probe)
    setDisplay(result)
  }, [text, lines])

  return (
    <p ref={ref} className={className}>
      {display}
    </p>
  )
}
