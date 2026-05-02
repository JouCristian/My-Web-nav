"use client"

import dynamic from "next/dynamic"

// 静态深空背景占位符（防止加载时闪白）
function BackgroundPlaceholder() {
  return (
    <div 
      className="fixed inset-0 z-[-1]"
      style={{ backgroundColor: "#020205" }}
    />
  )
}

// 动态导入脉冲极光背景（禁用 SSR，避免 WebGL 在服务端报错）
const PulseAuroraBackground = dynamic(
  () => import("./pulse-aurora-background").then(mod => mod.PulseAuroraBackground),
  { 
    ssr: false,
    loading: () => <BackgroundPlaceholder />
  }
)

export function BackgroundWrapper() {
  return <PulseAuroraBackground />
}
