"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// 动态导入 Iridescence 组件
const Iridescence = dynamic(() => import("./Iridescence"), { 
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ backgroundColor: "transparent" }} />
})

// Apple 风格的非线性缓动曲线
const EASING = {
  // 快出慢入 - iOS 风格
  easeOutExpo: "cubic-bezier(0.16, 1, 0.3, 1)",
  // 弹性回弹 - 柔和弹性
  easeOutBack: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  // 平滑过渡 - Apple 标准曲线
  easeInOutQuart: "cubic-bezier(0.76, 0, 0.24, 1)",
  // 超平滑曲线
  easeInOutSine: "cubic-bezier(0.37, 0, 0.63, 1)",
}

// 将 hex 颜色转换为 RGB 数组 (0-1 范围)
function hexToRgbArray(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ]
  }
  return [0.125, 0.145, 0.165] // 默认深灰色
}

// 剧本配置：不同的场景状态
const AURORA_SCRIPTS = [
  {
    name: "静谧深空",
    color: "#1a2634",  // 深蓝灰
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
    color: "#2d1f4e",  // 深紫
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
    color: "#3d1f3d",  // 深品红
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
    color: "#1f2d3d",  // 深青蓝
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
  const [transitionPhase, setTransitionPhase] = useState<"idle" | "accelerate" | "peak" | "decelerate">("idle")
  
  // Iridescence 动态参数
  const [iridescenceParams, setIridescenceParams] = useState({
    color: hexToRgbArray(AURORA_SCRIPTS[0].color),
    speed: AURORA_SCRIPTS[0].speed,
  })
  
  // 背景层引用
  const bgLayerRef = useRef<HTMLDivElement>(null)

// 切换剧本的核心逻辑 - 宏大的“深呼吸”曲线
const switchScript = useCallback(() => {
    if (isTransitioning) return
    
    const nextIndex = (scriptIndex + 1) % AURORA_SCRIPTS.length
    const nextScript = AURORA_SCRIPTS[nextIndex]
    const nextColor = hexToRgbArray(nextScript.color)
    
    setIsTransitioning(true)
    setScriptIndex(nextIndex)
    
    // 阶段 1：起步。缓慢加速与放大 (与底层 CSS 背景的 1.5s 过渡完美对齐)
    setTransitionPhase("peak")
    
    setIridescenceParams({
      color: nextColor,
      // 降低峰值速度：从 2.5 降到 1.2。
      // 配合 Iridescence 里 0.015 的 ease 因子，它不会一下子飙到 1.2，
      // 而是像潮水一样，缓慢地上涌。
      speed: 1.2, 
    })
    
    // 阶段 2：1500ms 后（此时底层背景刚好完全变色，WebGL 也刚好涌到高潮）
    // 我们开始缓慢退潮（减速、缩小）
    setTimeout(() => {
      setTransitionPhase("idle")
      setIridescenceParams({
        color: nextColor,
        speed: nextScript.speed, // 目标归位到 0.3
      })
    }, 1500)

    // 阶段 3：冷却期。设定 3 秒的冷却时间，确保“深呼吸”彻底完成后，才能进行下一次切换
    setTimeout(() => {
      setIsTransitioning(false)
    }, 3000)
    
  }, [scriptIndex, isTransitioning])
  
  // 监听全局 aurora-shift 事件
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

  // 未挂载时返回静态深色占位符
  if (!mounted) {
    return (
      <div 
        className="fixed inset-0 z-[-1]" 
        style={{ backgroundColor: "#020205" }}
        aria-hidden="true"
      />
    )
  }

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
      {/* 切换按钮（仅在非首页显示） */}
      {!isHomePage && createPortal(
        <div className="fixed bottom-8 right-8 z-[100]">
          <button
            onClick={switchScript}
            className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
            style={{
              transition: `all 0.6s ${EASING.easeOutBack}`,
            }}
          >
            {/* 动态指示灯 */}
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

            {/* 第三层：Iridescence 流动效果（全屏覆盖，修复长宽比与跳动） */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            // 弃用改变 height 和 translateY 的做法，改用均匀的 scale 来实现呼吸感
            transform: transitionPhase === "peak" ? "scale(1.05)" : "scale(1)",
            transition: `transform 0.8s ${EASING.easeOutExpo}`,
            transformOrigin: "center center",
            mixBlendMode: "screen", // 关键：确保与底层星空完美融合
            
            // 将底部切断的遮罩改为全屏的径向渐变，让波纹在四周自然消散，而不是被切断
            maskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)",
            WebkitMaskImage: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 40%, rgba(0,0,0,0.1) 100%)",
            opacity: 0.75, // 可以根据需要微调整体亮度
          }}
        >
          <Iridescence
            color={iridescenceParams.color}
            speed={iridescenceParams.speed}
            amplitude={0.05} // 建议：全屏后振幅可稍微调小一点，显得更高级克制
            mouseReact={false}
          />
        </div>

        {/* 第四层：过渡时的光晕扩散 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 150% 120% at 50% 100%, ${currentScript.accentColor}15 0%, transparent 60%),
              radial-gradient(ellipse 100% 80% at 50% 90%, ${currentScript.accentColor}10 0%, transparent 50%)
            `,
            opacity: transitionPhase === "peak" ? 0.8 : 0.3,
            transform: transitionPhase === "peak" ? "scale(1.1)" : "scale(1)",
            transition: `all 0.6s ${EASING.easeOutExpo}`,
          }}
        />

        {/* 第五层：边缘光晕 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `inset 0 -150px 180px -80px ${currentScript.accentColor}10`,
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
