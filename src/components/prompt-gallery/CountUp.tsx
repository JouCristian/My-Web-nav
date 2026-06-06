"use client"

import { useEffect, useRef, useState } from "react"

// 平滑滚动数字：数值变化时用非线性曲线从旧值过渡到新值
export function CountUp({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (from === to) return

    const duration = 420
    const start = performance.now()
    // expo-out 缓动，快进慢停
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const current = Math.round(from + (to - from) * ease(progress))
      setDisplay(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      fromRef.current = to
    }
  }, [value])

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {display}
    </span>
  )
}
