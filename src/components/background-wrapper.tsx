"use client"

import dynamic from "next/dynamic"

// 静态背景占位符（防止加载时闪烁，颜色已与你的 Orb 背景色对齐）
function BackgroundPlaceholder() {
  return (
    <div 
      className="fixed inset-0 z-[-1]"
      style={{ backgroundColor: "#2b84a1" }}
    />
  )
}

// 动态导入脉冲核心背景（禁用 SSR，避免 WebGL 在服务端报错）
const PulseOrbBackground = dynamic(
  () => import("./PulseOrbBackground").then(mod => mod.PulseOrbBackground),
  { 
    ssr: false,
    loading: () => <BackgroundPlaceholder />
  }
)

export function BackgroundWrapper() {
  return <PulseOrbBackground />
}