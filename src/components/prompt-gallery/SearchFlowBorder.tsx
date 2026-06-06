"use client"

import type { CSSProperties } from "react"

// 流光边框（ReactBits BorderGlow 风格）：
// - 底层：完整 360° 静态发光底色，填满边框不显空
// - 上层：锥形亮光绕边框旋转扫动（纯 CSS 圆角描边，永远贴合容器轮廓）
// 可配置：
// - radius   圆角，适配不同容器（搜索框 1rem / 预览图 1.5rem / 步骤卡 1.35rem）
// - hue      色相（度），用于多色主题（青 190 / 紫 265 / 翠 155）
// - duration 旋转周期
// - delay    动画延迟，用于错开多卡相位
export function SearchFlowBorder({
  radius = "1rem",
  hue,
  duration,
  delay,
}: {
  radius?: string
  hue?: number
  duration?: string
  delay?: string
}) {
  const style = {
    ["--glow-radius" as string]: radius,
    ...(hue !== undefined ? { ["--glow-hue" as string]: `${hue}deg` } : {}),
    ...(duration ? { ["--glow-duration" as string]: duration } : {}),
    ...(delay ? { ["--glow-delay" as string]: delay } : {}),
  } as CSSProperties

  return (
    <div className="pointer-events-none absolute inset-0" style={style}>
      <div className="search-glow-ring search-glow-base" />
      <div className="search-glow-sweep" />
    </div>
  )
}
