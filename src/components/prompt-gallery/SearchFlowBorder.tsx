"use client"

import type { CSSProperties } from "react"

// 流光边框（ReactBits BorderGlow 风格）：
// - 底层：完整 360° 静态发光底色，填满边框不显空
// - 上层：青色锥形亮光绕边框旋转扫动
// radius 可配置以适配不同圆角的容器（搜索框 1rem / 预览图 1.5rem）
export function SearchFlowBorder({ radius = "1rem" }: { radius?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ ["--glow-radius" as keyof CSSProperties]: radius } as CSSProperties}
    >
      <div className="search-glow-ring search-glow-base" />
      <div className="search-glow-sweep" />
    </div>
  )
}
