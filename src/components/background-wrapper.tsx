"use client"

import dynamic from "next/dynamic"

// 动态导入脉冲极光背景（禁用 SSR，避免 WebGL 在服务端报错）
const PulseAuroraBackground = dynamic(
  () => import("./pulse-aurora-background").then(mod => mod.PulseAuroraBackground),
  { ssr: false }
)

export function BackgroundWrapper() {
  return <PulseAuroraBackground />
}
