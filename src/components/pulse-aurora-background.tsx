"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

const Iridescence = dynamic(() => import("./Iridescence"), { 
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ backgroundColor: "transparent" }} />
})

const EASING = {
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  easeInOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
  easeInOutSine: "cubic-bezier(0.37, 0, 0.63, 1)",
}

function hexToRgbArray(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ]
  }
  return [0.125, 0.145, 0.165] 
}

const AURORA_SCRIPTS = [
  {
    name: "静谧深空",
    color: "#1a2634",
    speed: 0.3,
    bgGradient: `
      radial-gradient(ellipse 120% 80% at 50% 100%, rgba(14, 165, 233, 0.12) 0%, transparent 55%),
      radial-gradient(ellipse 80% 60% at 30% 90%, rgba(56, 189, 248, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse 80% 60% at 70% 95%, rgba(14, 165, 233, 0.05) 0%, transparent 50%),
      linear-gradient(to top, #030712 0%, #020205 50%, #020205 100%)
    `,
    accentColor: "#0ea5e9",
  },
  {
    name: "极光风暴",
    color: "#2d1f4e",
    speed: 0.3,
    bgGradient: `
      radial-gradient(ellipse 140% 100% at 50% 100%, rgba(124, 58, 237, 0.15) 0%, transparent 60%),
      radial-gradient(ellipse 100% 70% at 25% 85%, rgba(34, 211, 238, 0.08) 0%, transparent 55%),
      radial-gradient(ellipse 100% 70% at 75% 90%, rgba(16, 185, 129, 0.06) 0%, transparent 55%),
      linear-gradient(to top, #0f0a1a 0%, #020205 45%, #020205 100%)
    `,
    accentColor: "#7c3aed",
  },
  {
    name: "星云漫游",
    color: "#3d1f3d",
    speed: 0.3,
    bgGradient: `
      radial-gradient(ellipse 130% 90% at 50% 100%, rgba(168, 85, 247, 0.14) 0%, transparent 58%),
      radial-gradient(ellipse 90% 65% at 20% 88%, rgba(236, 72, 153, 0.08) 0%, transparent 52%),
      radial-gradient(ellipse 90% 65% at 80% 92%, rgba(99, 102, 241, 0.06) 0%, transparent 52%),
      linear-gradient(to top, #0a0512 0%, #020205 48%, #020205 100%)
    `,
    accentColor: "#a855f7",
  },
  {
    name: "深渊脉动",
    color: "#1f2d3d",
    speed: 0.3,
    bgGradient: `
      radial-gradient(ellipse 135% 95% at 50% 100%, rgba(59, 130, 246, 0.14) 0%, transparent 58%),
      radial-gradient(ellipse 95% 68% at 15% 90%, rgba(139, 92, 246, 0.08) 0%, transparent 52%),
      radial-gradient(ellipse 95% 68% at 85% 88%, rgba(8, 145, 178, 0.06) 0%, transparent 52%),
      linear-gradient(to top, #030a12 0%, #020205 46%, #020205 100%)
    `,
    accentColor: "#3b82f6",
  },
]

const SCRIPT_NAMES = AURORA_SCRIPTS.map((s) => s.name)

const NOISE_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  filter: "contrast(150%) brightness(100%)",
  transform: "translateZ(0)",
}

export function PulseAuroraBackground() {
  const pathname = usePathname()
  const isHomePage = pathname === "/"
  
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  const [isMobile, setIsMobile] = useState(false)
  const [scriptIndex, setScriptIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const [iridescenceParams, setIridescenceParams] = useState({
    color: hexToRgbArray(AURORA_SCRIPTS[0].color),
    speed: AURORA_SCRIPTS[0].speed,
  })
  
  const bgLayerRef = useRef<HTMLDivElement>(null)

  // 重构：极简且完美的单次脉冲机制
  const switchScript = useCallback(() => {
    if (isTransitioning) return
    
    setIsTransitioning(true)
    const nextIndex = (scriptIndex + 1) % AURORA_SCRIPTS.length
    const nextScript = AURORA_SCRIPTS[nextIndex]
    const nextColor = hexToRgbArray(nextScript.color)
    
    setScriptIndex(nextIndex)
    
    // 瞬间拉高速度制造跃迁的初始动能
    setIridescenceParams({
      color: nextColor,
      speed: 2.5, 
    })
    
    // 仅仅 100 毫秒后松开油门，WebGL 底层的 Lerp 会负责画出完美的抛物线缓冲
    setTimeout(() => {
      setIridescenceParams({
        color: nextColor,
        speed: nextScript.speed,
      })
    }, 100)

    // 锁定状态 1.5 秒确保完整波纹扩散完毕
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500)
    
  }, [scriptIndex, isTransitioning])
  
  useEffect(() => {
    const handleAuroraShift = () => switchScript()
    window.addEventListener("aurora-shift", handleAuroraShift)
    return () => window.removeEventListener("aurora-shift", handleAuroraShift)
  }, [switchScript])

  useEffect(() => {
    setMounted(true)
    let lastWidth = window.innerWidth

    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
      const isSmallScreen = window.innerWidth <= 1366
      const isTouchDevice =
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        "ontouchstart" in window
      const isMacPad =
        /Macintosh/i.test(navigator.userAgent) && isTouchDevice
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
    return (
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{ backgroundColor: "#020205" }}
        aria-hidden="true"
      />
    )
  }

  if (isMobile) {
    return (
      <div
        className="fixed z-[-1] overflow-hidden"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: fixedHeight,
          backgroundColor: "#020205",
        }}
        aria-hidden="true"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 90% 60% at 50% 100%, rgba(59, 130, 246, 0.18) 0%, transparent 55%),
              radial-gradient(ellipse 60% 50% at 15% 85%, rgba(168, 85, 247, 0.14) 0%, transparent 60%),
              radial-gradient(ellipse 70% 55% at 85% 90%, rgba(34, 211, 238, 0.1) 0%, transparent 60%),
              #020205
            `,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
          style={NOISE_STYLE}
        />
      </div>
    )
  }

  const currentScript = AURORA_SCRIPTS[scriptIndex]

  return (
    <>
      {!isHomePage && createPortal(
        <div className="fixed bottom-8 right-8 z-[100]">
          <button
            onClick={switchScript}
            className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
            style={{
              transition: `all 0.6s ${EASING.easeOutBack}`,
            }}
          >
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-white/10 transition-colors">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{
                  backgroundColor: currentScript.accentColor,
                  boxShadow: `0 0 12px ${currentScript.accentColor}`,
                  transition: `all 0.6s ${EASING.easeOutExpo}`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${currentScript.accentColor}50`,
                }}
              />
            </div>

            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-zinc-400 transition-colors">
                Aurora Shift
              </span>
              <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
                {SCRIPT_NAMES[scriptIndex]}
              </span>
            </div>
          </button>
        </div>,
        document.body
      )}

      <div
        className="fixed z-[-1] overflow-hidden"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: fixedHeight,
          backgroundColor: "#020205",
        }}
      >
        {/* 第一层：CSS 渐变深空背景 */}
        <div
          ref={bgLayerRef}
          className="absolute inset-0"
          style={{
            background: currentScript.bgGradient,
            transition: `background 1.5s ${EASING.easeInOutSine}`,
          }}
        />

        {/* 第二层：微妙的星点 */}
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(1px 1px at 12% 18%, rgba(255,255,255,0.6) 50%, transparent 100%),
              radial-gradient(1px 1px at 73% 28%, rgba(200,220,255,0.5) 50%, transparent 100%),
              radial-gradient(1.2px 1.2px at 38% 52%, rgba(255,240,200,0.55) 50%, transparent 100%),
              radial-gradient(1px 1px at 88% 62%, rgba(255,255,255,0.4) 50%, transparent 100%),
              radial-gradient(1px 1px at 25% 75%, rgba(180,200,255,0.45) 50%, transparent 100%),
              radial-gradient(1px 1px at 60% 15%, rgba(255,255,255,0.5) 50%, transparent 100%),
              radial-gradient(1px 1px at 5% 40%, rgba(255,255,255,0.35) 50%, transparent 100%),
              radial-gradient(1.1px 1.1px at 95% 45%, rgba(220,230,255,0.45) 50%, transparent 100%),
              radial-gradient(0.8px 0.8px at 45% 8%, rgba(255,255,255,0.4) 50%, transparent 100%),
              radial-gradient(0.9px 0.9px at 82% 85%, rgba(200,210,255,0.35) 50%, transparent 100%)
            `,
          }}
        />

        {/* 第三层：Iridescence 流动效果（去除了所有破坏美感的跳动动画，完美融合背景） */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            mixBlendMode: "screen", 
            maskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)",
            opacity: 0.85, 
          }}
        >
          <Iridescence
            color={iridescenceParams.color}
            speed={iridescenceParams.speed}
            amplitude={0.05} // 调低了振幅，全屏波纹更加克制、高级
            mouseReact={false}
          />
        </div>

        {/* 第四层：边缘光晕 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 -150px 180px -80px ${currentScript.accentColor}10`,
            transition: `box-shadow 1.5s ${EASING.easeInOutSine}`,
          }}
        />

        {/* 第五层：噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
          style={NOISE_STYLE}
        />
      </div>
    </>
  )
}