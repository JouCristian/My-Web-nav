"use client"

import { useEffect, useState } from "react"

/**
 * 检测当前设备是否为"低性能/移动端"设备。
 * 用于在移动端跳过 WebGL / Canvas 重特效，改用纯 CSS 兜底。
 *
 * 判定条件（任一满足即视为移动端）：
 *  1. 视口宽度 <= 1024
 *  2. 触摸设备
 *  3. UA 命中常见移动端关键字
 *  4. 用户系统设置了"减少动态效果"
 *
 * SSR 安全：首屏 return false，挂载后再判定，避免水合不匹配。
 */
export function useIsMobile(breakpoint = 1024): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const detect = () => {
      const isSmall = window.innerWidth <= breakpoint
      const isTouch =
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        "ontouchstart" in window
      const ua = navigator.userAgent || ""
      const isMobileUA =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
      const reducedMotion =
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches

      setIsMobile(Boolean((isSmall && isTouch) || isMobileUA || reducedMotion))
    }

    detect()

    let timer: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (timer) clearTimeout(timer)
      timer = setTimeout(detect, 150)
    }

    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      if (timer) clearTimeout(timer)
    }
  }, [breakpoint])

  return isMobile
}
