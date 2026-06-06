"use client"

import { useEffect, useRef, useState } from "react"

// 搜索框聚焦流光边框：用 SVG 圆角矩形描边 + dashoffset 沿“周长”匀速移动，
// 彻底解决 conic-gradient 按角度旋转时在矩形长边/角落忽快忽慢的问题。
export function SearchFlowBorder() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => {
      const rect = el.getBoundingClientRect()
      setSize({ w: rect.width, h: rect.height })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const inset = 1
  const radius = 16
  const w = Math.max(size.w - inset * 2, 0)
  const h = Math.max(size.h - inset * 2, 0)
  // 圆角矩形周长，用于把亮弧与间隙换算成等长（保证速度均匀）
  const perimeter = w > 0 && h > 0 ? 2 * (w + h) - 8 * radius + 2 * Math.PI * radius : 0
  // 亮弧占周长的比例，其余为透明间隙
  const dashLength = perimeter * 0.32
  const gapLength = perimeter - dashLength
  const ready = perimeter > 0

  return (
    <div ref={wrapRef} className="pointer-events-none absolute inset-0">
      {ready ? (
        <>
          {/* 底层 360° 静态发散底色：整圈完整描边 + 模糊，填满亮弧扫不到的地方，不让边框显空 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible" style={{ filter: "blur(8px)" }}>
            <rect
              x={inset}
              y={inset}
              width={w}
              height={h}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="rgba(34,211,238,0.4)"
              strokeWidth={2.5}
            />
          </svg>
          {/* 底层 360° 静态描边线：柔和的整圈基底 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <rect
              x={inset}
              y={inset}
              width={w}
              height={h}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="rgba(125,211,252,0.3)"
              strokeWidth={1.5}
            />
          </svg>
          {/* 外发光层：更粗、模糊，营造光晕 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible" style={{ filter: "blur(7px)" }}>
            <rect
              x={inset}
              y={inset}
              width={w}
              height={h}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="rgba(34,211,238,0.85)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${dashLength} ${gapLength}`}
              className="search-flow-dash"
              style={{ ["--flow-perimeter" as string]: `${perimeter}px` }}
            />
          </svg>
          {/* 清晰描边线 */}
          <svg className="absolute inset-0 h-full w-full overflow-visible">
            <rect
              x={inset}
              y={inset}
              width={w}
              height={h}
              rx={radius}
              ry={radius}
              fill="none"
              stroke="rgba(186,250,255,1)"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeDasharray={`${dashLength} ${gapLength}`}
              className="search-flow-dash"
              style={{ ["--flow-perimeter" as string]: `${perimeter}px` }}
            />
          </svg>
        </>
      ) : null}
    </div>
  )
}
