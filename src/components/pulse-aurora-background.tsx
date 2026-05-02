"use client"

import React, { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// 动态导入 Iridescence，关闭 SSR
const Iridescence = dynamic(() => import("./Iridescence"), { 
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ backgroundColor: "transparent" }} />
})

// 统一的噪点纹理
const NOISE_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  filter: "contrast(150%) brightness(100%)",
  transform: "translateZ(0)",
}

export function PulseAuroraBackground() {
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  const [isMobile, setIsMobile] = useState(false)
  
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // 基础流速提升至 0.5
  const [speed, setSpeed] = useState(0.5) 
  
  // 核心跃迁逻辑：仅进行流速突增与回落
  const triggerPulse = useCallback(() => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    
    // 瞬间拉爆目标速度 (3.5)，带来极强的跃迁推背感
    setSpeed(3.5) 
    
    // 100毫秒后松开油门，WebGL 将自动画出极度平滑的减速抛物线
    setTimeout(() => {
      setSpeed(0.5) 
    }, 100)

    // 冷却时间
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500)
    
  }, [isTransitioning])
  
  // 监听全局事件触发速度跃迁（依然保留，以便你在其他地方调用）
  useEffect(() => {
    const handleAuroraShift = () => triggerPulse()
    window.addEventListener("aurora-shift", handleAuroraShift)
    return () => window.removeEventListener("aurora-shift", handleAuroraShift)
  }, [triggerPulse])

  useEffect(() => {
    setMounted(true)
    let lastWidth = window.innerWidth

    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
      const isSmallScreen = window.innerWidth <= 1366
      const isTouchDevice = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || "ontouchstart" in window
      const isMacPad = /Macintosh/i.test(navigator.userAgent) && isTouchDevice
      setIsMobile((isSmallScreen && isTouchDevice) || isMacPad)
    }
    lockHeight()

    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        setTimeout(lockHeight, 100)
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  if (!mounted) {
    return <div className="fixed inset-0 z-[-1]" style={{ backgroundColor: "#020205" }} aria-hidden="true" />
  }

  // 移动端降级方案：取消光影计算，纯粹暗色质感
  if (isMobile) {
    return (
      <div
        className="fixed z-[-1] overflow-hidden"
        style={{ top: 0, left: 0, width: "100vw", height: fixedHeight, backgroundColor: "#020205" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay" style={NOISE_STYLE} />
      </div>
    )
  }

  return (
    <div
      className="fixed z-[-1] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        width: "100vw",
        height: fixedHeight,
        backgroundColor: "#020205", // 纯粹暗夜黑
      }}
    >
      {/* 第一层：深空渐变底部高光 */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 100%, #0d0d12 0%, #020205 70%)` }}
      />

      {/* 第二层：白色的深空星点 */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.7) 50%, transparent 100%),
            radial-gradient(1px 1px at 73% 28%, rgba(255,255,255,0.6) 50%, transparent 100%),
            radial-gradient(1.2px 1.2px at 38% 52%, rgba(255,255,255,0.6) 50%, transparent 100%),
            radial-gradient(1px 1px at 88% 62%, rgba(255,255,255,0.5) 50%, transparent 100%),
            radial-gradient(1px 1px at 25% 75%, rgba(255,255,255,0.5) 50%, transparent 100%)
          `,
        }}
      />

      {/* 第三层：纯白色的 WebGL 能量流动 */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          mixBlendMode: "screen", 
          maskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.05) 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.05) 100%)",
          opacity: 0.65, // 控制整体亮度，保持冷峻感
        }}
      >
        <Iridescence
          color={[1.0, 1.0, 1.0]} // 强制注入纯白
          speed={speed}           // 传入动态速度
          amplitude={0.035}       // 振幅调低，让白光网格更显锐利紧致
          mouseReact={false}
        />
      </div>

      {/* 第四层：噪点纹理，提升电影胶片质感 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={NOISE_STYLE}
      />
    </div>
  )
}