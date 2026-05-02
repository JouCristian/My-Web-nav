"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// 动态导入 Aurora 组件
const Aurora = dynamic(() => import("./Aurora"), { ssr: false })

// Apple 风格的非线性缓动曲线
const EASING = {
  // 快出慢入（主要用于爆发效果）- iOS 风格
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  // 弹性回弹（用于恢复效果）- 柔和弹性
  easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // 平滑过渡 - Apple 标准曲线
  easeInOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
  // 柔和启动快速结束 - 用于蓄力阶段
  easeInQuad: "cubic-bezier(0.55, 0.085, 0.68, 0.53)",
  // 超平滑曲线 - 用于颜色过渡
  easeInOutSine: "cubic-bezier(0.37, 0, 0.63, 1)",
}

// 剧本配置：不同的极光状态 - 更柔和、更缓慢的光扩散效果
const AURORA_SCRIPTS = [
  {
    name: "静谧深空",
    amplitude: 0.35,  // 降低振幅，更柔和
    blend: 0.85,      // 提高混合值，过渡更平滑
    speed: 0.3,       // 大幅降低速度，光线缓慢流动
    colorStops: ["#1e3a5f", "#0ea5e9", "#1e3a5f"],
    bgGradient: `
      radial-gradient(ellipse 150% 100% at 50% 100%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 100% 80% at 20% 95%, rgba(99, 102, 241, 0.08) 0%, transparent 55%),
      radial-gradient(ellipse 100% 80% at 80% 100%, rgba(6, 182, 212, 0.06) 0%, transparent 55%),
      linear-gradient(to top, #030712 0%, #020205 50%, #020205 100%)
    `,
  },
  {
    name: "极光风暴",
    amplitude: 1.2,   // 降低振幅
    blend: 0.6,       // 提高混合值
    speed: 0.8,       // 降低速度
    colorStops: ["#7c3aed", "#22d3ee", "#10b981"],
    bgGradient: `
      radial-gradient(ellipse 180% 120% at 50% 100%, rgba(124, 58, 237, 0.18) 0%, transparent 65%),
      radial-gradient(ellipse 120% 90% at 30% 90%, rgba(34, 211, 238, 0.12) 0%, transparent 60%),
      radial-gradient(ellipse 120% 90% at 70% 95%, rgba(16, 185, 129, 0.08) 0%, transparent 60%),
      linear-gradient(to top, #0f0a1a 0%, #020205 45%, #020205 100%)
    `,
  },
  {
    name: "星云漫游",
    amplitude: 0.6,   // 降低振幅
    blend: 0.75,      // 提高混合值
    speed: 0.45,      // 降低速度
    colorStops: ["#6366f1", "#a855f7", "#ec4899"],
    bgGradient: `
      radial-gradient(ellipse 160% 110% at 50% 100%, rgba(168, 85, 247, 0.14) 0%, transparent 62%),
      radial-gradient(ellipse 110% 85% at 25% 92%, rgba(99, 102, 241, 0.09) 0%, transparent 58%),
      radial-gradient(ellipse 110% 85% at 75% 98%, rgba(236, 72, 153, 0.07) 0%, transparent 58%),
      linear-gradient(to top, #0a0512 0%, #020205 48%, #020205 100%)
    `,
  },
  {
    name: "深渊脉动",
    amplitude: 0.8,   // 降低振幅
    blend: 0.7,       // 提高混合值
    speed: 0.55,      // 降低速度
    colorStops: ["#0891b2", "#3b82f6", "#8b5cf6"],
    bgGradient: `
      radial-gradient(ellipse 170% 115% at 50% 100%, rgba(59, 130, 246, 0.16) 0%, transparent 63%),
      radial-gradient(ellipse 115% 88% at 15% 95%, rgba(8, 145, 178, 0.1) 0%, transparent 56%),
      radial-gradient(ellipse 115% 88% at 85% 92%, rgba(139, 92, 246, 0.08) 0%, transparent 56%),
      linear-gradient(to top, #030a12 0%, #020205 46%, #020205 100%)
    `,
  },
]

const SCRIPT_NAMES = AURORA_SCRIPTS.map((s) => s.name)

// 噪点纹理样式
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
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "charge" | "burst" | "settle">("idle")
  
  // Aurora 动态参数
  const [auroraParams, setAuroraParams] = useState(AURORA_SCRIPTS[0])
  
  // 背景层引用（用于 CSS 过渡）
  const bgLayerRef = useRef<HTMLDivElement>(null)
  const auroraContainerRef = useRef<HTMLDivElement>(null)

  // 切换剧本的核心逻辑 - 柔和丝滑的非线性动效
  // 缓慢过渡：轻柔蓄力 → 舒缓扩散 → 平滑着陆
  const switchScript = useCallback(() => {
    if (isTransitioning) return // 防止重复触发
    
    const nextIndex = (scriptIndex + 1) % AURORA_SCRIPTS.length
    const nextScript = AURORA_SCRIPTS[nextIndex]
    const currentAmplitude = auroraParams.amplitude
    
    setIsTransitioning(true)
    setTransitionPhase("charge")
    setScriptIndex(nextIndex)
    
    // 阶段1: 轻柔蓄力 (0-400ms) - 缓慢收缩，呼吸感
    setAuroraParams((prev) => ({
      ...prev,
      amplitude: currentAmplitude * 0.7,
      speed: prev.speed * 0.6,
      blend: Math.min(prev.blend * 1.15, 0.95),
    }))
    
    // 阶段2: 舒缓扩散 (400-1200ms) - 柔和展开，颜色渐变
    setTimeout(() => {
      setTransitionPhase("burst")
      setAuroraParams((prev) => ({
        ...prev,
        amplitude: Math.max(nextScript.amplitude * 1.8, 1.5), // 柔和扩散
        speed: Math.max(nextScript.speed * 1.5, 0.8),
        blend: 0.55,
        colorStops: nextScript.colorStops, // 开始颜色切换
      }))
    }, 400)
    
    // 阶段3: 回落过渡 (1200-2000ms) - 光线逐渐收敛
    setTimeout(() => {
      setTransitionPhase("settle")
      setAuroraParams({
        ...nextScript,
        amplitude: nextScript.amplitude * 1.35,
        speed: nextScript.speed * 1.2,
        blend: nextScript.blend * 0.95,
      })
    }, 1200)
    
    // 阶段4: 柔和着陆 (2000-2800ms) - 平滑过渡到目标状态
    setTimeout(() => {
      setAuroraParams({
        ...nextScript,
        amplitude: nextScript.amplitude * 1.1,
        speed: nextScript.speed * 1.05,
      })
    }, 2000)
    
    // 阶段5: 完全恢复 (2800ms+)
    setTimeout(() => {
      setAuroraParams(nextScript)
      setIsTransitioning(false)
      setTransitionPhase("idle")
    }, 2800)
  }, [scriptIndex, isTransitioning, auroraParams.amplitude])
  
  // 监听全局 aurora-shift 事件（loading 触发用）
  useEffect(() => {
    const handleAuroraShift = () => {
      switchScript()
    }
    
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

  if (!mounted) return <div className="fixed inset-0 bg-[#020205] z-[-1]" />

  // 移动端：纯 CSS 渐变��景
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
      {/* 时空切换按钮（仅在非首页显示） */}
      {!isHomePage && createPortal(
        <div className="fixed bottom-8 right-8 z-[100]">
          <button
            onClick={switchScript}
            className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
            style={{
              transition: `all 0.6s ${EASING.easeOutBack}`,
            }}
          >
            {/* 动态指示灯 */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-white/10 transition-colors">
              <div
                className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]"
                style={{
                  backgroundColor: currentScript.colorStops[1],
                  boxShadow: `0 0 12px ${currentScript.colorStops[1]}`,
                  transition: `all 0.6s ${EASING.easeOutExpo}`,
                }}
              />
              <div
                className="absolute inset-0 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"
                style={{
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: `${currentScript.colorStops[1]}50`,
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

      {/* 背景容器 */}
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
            opacity: transitionPhase === "burst" ? 0.92 : 1,
            transition: `background 2s ${EASING.easeInOutSine}, opacity 1.5s ${EASING.easeInOutSine}`,
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

        {/* 第三层：Aurora WebGL 极光效果（底部 70%，向上渐隐，更柔和的过渡） */}
        <div
          ref={auroraContainerRef}
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{
            height: transitionPhase === "charge" ? "68%" 
                  : transitionPhase === "burst" ? "78%" 
                  : transitionPhase === "settle" ? "74%" 
                  : "70%",
            transform: transitionPhase === "charge" 
              ? "scaleY(0.96) scaleX(0.99) translateY(1%)" 
              : transitionPhase === "burst"
              ? "scaleY(1.12) scaleX(1.02) translateY(-2%)" 
              : transitionPhase === "settle"
              ? "scaleY(1.05) scaleX(1.01) translateY(-0.5%)"
              : "scaleY(1) scaleX(1) translateY(0)",
            opacity: transitionPhase === "burst" ? 1 : 0.92,
            transition: transitionPhase === "charge"
              ? `all 0.5s ${EASING.easeInOutSine}`
              : transitionPhase === "burst"
              ? `all 0.9s ${EASING.easeOutExpo}`
              : transitionPhase === "settle"
              ? `all 1s ${EASING.easeOutBack}`
              : `all 1.2s ${EASING.easeInOutSine}`,
            transformOrigin: "bottom center",
            maskImage: transitionPhase === "burst" 
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: transitionPhase === "burst" 
              ? "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.5) 65%, rgba(0,0,0,0.15) 85%, rgba(0,0,0,0) 100%)"
              : "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.15) 75%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Aurora
            colorStops={auroraParams.colorStops}
            amplitude={auroraParams.amplitude}
            blend={auroraParams.blend}
            speed={auroraParams.speed}
          />
        </div>

        {/* 第四层：过渡时的柔和光晕扩散 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 150% 120% at 50% 100%, ${currentScript.colorStops[1]}20 0%, transparent 60%),
              radial-gradient(ellipse 100% 80% at 50% 90%, ${currentScript.colorStops[0]}15 0%, transparent 50%)
            `,
            opacity: transitionPhase === "charge" ? 0.25 
                   : transitionPhase === "burst" ? 0.7 
                   : transitionPhase === "settle" ? 0.4 
                   : 0.15,
            transform: transitionPhase === "charge" ? "scale(0.95)" 
                     : transitionPhase === "burst" ? "scale(1.08)" 
                     : transitionPhase === "settle" ? "scale(1.03)"
                     : "scale(1)",
            transition: transitionPhase === "burst" 
              ? `all 1s ${EASING.easeOutExpo}`
              : `all 1.5s ${EASING.easeInOutSine}`,
          }}
        />

        {/* 第五层：持续的边缘光晕（更柔和的常态效果） */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: transitionPhase === "burst" 
              ? `inset 0 -220px 250px -100px ${currentScript.colorStops[1]}18`
              : transitionPhase === "settle"
              ? `inset 0 -180px 200px -90px ${currentScript.colorStops[1]}12`
              : `inset 0 -150px 180px -80px ${currentScript.colorStops[1]}08`,
            transition: `box-shadow 1.5s ${EASING.easeInOutSine}`,
          }}
        />

        {/* 第六层：噪点纹理 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay"
          style={NOISE_STYLE}
        />
      </div>
    </>
  )
}
