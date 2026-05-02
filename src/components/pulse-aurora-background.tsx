"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import dynamic from "next/dynamic"

// 动态导入 Aurora 组件
const Aurora = dynamic(() => import("./Aurora"), { ssr: false })

// Apple 风格的非线性缓动曲线
const EASING = {
  // 快出慢入（主要用于爆发效果）
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  // 弹性回弹（用于恢复效果）
  easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // 平滑过渡
  easeInOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
}

// 剧本配置：不同的极光状态
const AURORA_SCRIPTS = [
  {
    name: "静谧深空",
    amplitude: 0.6,
    blend: 0.7,
    speed: 0.8,
    colorStops: ["#1e3a5f", "#0ea5e9", "#1e3a5f"],
    bgGradient: `
      radial-gradient(ellipse 120% 80% at 50% 100%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse 80% 60% at 20% 90%, rgba(99, 102, 241, 0.1) 0%, transparent 45%),
      radial-gradient(ellipse 80% 60% at 80% 95%, rgba(6, 182, 212, 0.08) 0%, transparent 45%),
      linear-gradient(to top, #030712 0%, #020205 40%, #020205 100%)
    `,
  },
  {
    name: "极光风暴",
    amplitude: 2.8,
    blend: 0.4,
    speed: 2.5,
    colorStops: ["#7c3aed", "#22d3ee", "#10b981"],
    bgGradient: `
      radial-gradient(ellipse 150% 100% at 50% 100%, rgba(124, 58, 237, 0.25) 0%, transparent 55%),
      radial-gradient(ellipse 100% 70% at 30% 85%, rgba(34, 211, 238, 0.18) 0%, transparent 50%),
      radial-gradient(ellipse 100% 70% at 70% 90%, rgba(16, 185, 129, 0.12) 0%, transparent 50%),
      linear-gradient(to top, #0f0a1a 0%, #020205 35%, #020205 100%)
    `,
  },
  {
    name: "星云漫游",
    amplitude: 1.2,
    blend: 0.55,
    speed: 1.2,
    colorStops: ["#6366f1", "#a855f7", "#ec4899"],
    bgGradient: `
      radial-gradient(ellipse 130% 90% at 50% 100%, rgba(168, 85, 247, 0.18) 0%, transparent 52%),
      radial-gradient(ellipse 90% 65% at 25% 88%, rgba(99, 102, 241, 0.12) 0%, transparent 48%),
      radial-gradient(ellipse 90% 65% at 75% 92%, rgba(236, 72, 153, 0.1) 0%, transparent 48%),
      linear-gradient(to top, #0a0512 0%, #020205 38%, #020205 100%)
    `,
  },
  {
    name: "深渊脉动",
    amplitude: 1.8,
    blend: 0.5,
    speed: 1.8,
    colorStops: ["#0891b2", "#3b82f6", "#8b5cf6"],
    bgGradient: `
      radial-gradient(ellipse 140% 95% at 50% 100%, rgba(59, 130, 246, 0.22) 0%, transparent 53%),
      radial-gradient(ellipse 95% 68% at 15% 92%, rgba(8, 145, 178, 0.15) 0%, transparent 46%),
      radial-gradient(ellipse 95% 68% at 85% 88%, rgba(139, 92, 246, 0.12) 0%, transparent 46%),
      linear-gradient(to top, #030a12 0%, #020205 36%, #020205 100%)
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
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  const [isMobile, setIsMobile] = useState(false)
  const [scriptIndex, setScriptIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Aurora 动态参数
  const [auroraParams, setAuroraParams] = useState(AURORA_SCRIPTS[0])
  
  // 背景层引用（用于 CSS 过渡）
  const bgLayerRef = useRef<HTMLDivElement>(null)
  const auroraContainerRef = useRef<HTMLDivElement>(null)

  // 切换剧本的核心逻辑
  const switchScript = useCallback(() => {
    const nextIndex = (scriptIndex + 1) % AURORA_SCRIPTS.length
    const nextScript = AURORA_SCRIPTS[nextIndex]
    
    setIsTransitioning(true)
    setScriptIndex(nextIndex)
    
    // 立即触发爆发效果：振幅瞬间拉满
    setAuroraParams((prev) => ({
      ...prev,
      amplitude: 4.0, // 爆发峰值
      speed: 4.0,
    }))
    
    // 300ms 后开始过渡到目标状态
    setTimeout(() => {
      setAuroraParams(nextScript)
    }, 300)
    
    // 800ms 后结束过渡状态
    setTimeout(() => {
      setIsTransitioning(false)
    }, 800)
  }, [scriptIndex])

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

  // 移动端：纯 CSS 渐变背景
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
      {/* 时空切换按钮 */}
      {createPortal(
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
            transition: `background 1.2s ${EASING.easeInOutQuart}`,
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

        {/* 第三层：Aurora WebGL 极光效果（底部 30%） */}
        <div
          ref={auroraContainerRef}
          className="absolute bottom-0 left-0 right-0 overflow-hidden"
          style={{
            height: "35%",
            opacity: isTransitioning ? 1 : 0.9,
            transform: isTransitioning ? "scaleY(1.3) translateY(-5%)" : "scaleY(1) translateY(0)",
            transition: `transform 0.8s ${EASING.easeOutExpo}, opacity 0.4s ease`,
            transformOrigin: "bottom center",
          }}
        >
          <Aurora
            colorStops={auroraParams.colorStops}
            amplitude={auroraParams.amplitude}
            blend={auroraParams.blend}
            speed={auroraParams.speed}
          />
        </div>

        {/* 第四层：Aurora 上方的柔和渐隐遮罩 */}
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none"
          style={{
            height: "40%",
            background:
              "linear-gradient(to bottom, #020205 0%, transparent 30%, transparent 100%)",
          }}
        />

        {/* 第五层：过渡时的光爆效果 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 100% 80% at 50% 100%, ${currentScript.colorStops[1]}20 0%, transparent 60%)`,
            opacity: isTransitioning ? 0.8 : 0,
            transition: `opacity 0.3s ${EASING.easeOutExpo}`,
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
