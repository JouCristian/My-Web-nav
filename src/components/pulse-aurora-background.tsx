"use client"

import React, { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// 动态导入 Iridescence，关闭 SSR
const Iridescence = dynamic(() => import("./Iridescence"), { 
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ backgroundColor: "transparent" }} />
})

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
  
  // 基础流速
  const [speed, setSpeed] = useState(0.5) 
  
  // 极简单次脉冲跃迁逻辑
  const triggerPulse = useCallback(() => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    setSpeed(3.5) // 瞬间拉爆速度，创造跃迁感
    
    // 100毫秒后松开油门，WebGL 底层 Lerp 自动接管平滑减速
    setTimeout(() => {
      setSpeed(0.5) 
    }, 100)

    // 冷却时间，防止频繁抽搐
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500)
    
  }, [isTransitioning])
  
  // 监听全局事件
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

  // 移动端降级方案
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
        backgroundColor: "#020205", // 极客深渊黑底色
      }}
    >
      {/* 第一层：深空渐变底色，增加空间深度 */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse at 50% 100%, #0a0a14 0%, #020205 70%)` }}
      />

      {/* 第二层：背景微弱星点 */}
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

      {/* 第三层：纯白光晕 WebGL（核心层） */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          // 关键：滤色模式！自动让 WebGL 里的黑色变透明，只留下纯粹的白光线条
          mixBlendMode: "screen", 
          // 径向遮罩，让边缘自然过渡消失
          maskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.05) 100%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.05) 100%)",
          // 提高透明度，让白光更加耀眼清晰
          opacity: 0.95, 
        }}
      >
        <Iridescence
          color={[1.0, 1.0, 1.0]} 
          speed={speed}           
          amplitude={0.035}       
          mouseReact={false}
        />
      </div>

      {/* 第四层：胶片噪点纹理，提升高级感 */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={NOISE_STYLE}
      />
    </div>
  )
}