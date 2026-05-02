"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useIsMobile } from "@/hooks/use-is-mobile"

// 【关键修复】直接引入，取消内部的 dynamic 套娃！
// 因为外层的 background-wrapper 已经关闭了 SSR，这里完全可以安全地静态导入
import Orb from "./Orb"
import Galaxy from "./Galaxy"

export function PulseOrbBackground() {
  const isMobile = useIsMobile()
  // 移除了 mounted 状态，组件直接秒级挂载
  const [fixedHeight, setFixedHeight] = useState("100vh")
  const [isRound, setIsRound] = useState(false)
  
  const triggerPulse = useCallback(() => {
    if (isRound) return
    setIsRound(true) 
    setTimeout(() => {
      setIsRound(false) 
    }, 800)
  }, [isRound])
  
  useEffect(() => {
    const handleOrbShift = () => triggerPulse()
    window.addEventListener("aurora-shift", handleOrbShift) 
    return () => window.removeEventListener("aurora-shift", handleOrbShift)
  }, [triggerPulse])

  useEffect(() => {
    // 移动端跳过高度锁定逻辑，减少计算
    if (isMobile) return
    
    let lastWidth = window.innerWidth
    const lockHeight = () => setFixedHeight(`${window.innerHeight}px`)
    lockHeight() // 初始锁定高度
    
    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        setTimeout(lockHeight, 100)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobile])

  // 移动端：纯 CSS 降级背景，完全禁用 WebGL
  if (isMobile) {
    return (
      <div
        className="fixed z-[-1] overflow-hidden pointer-events-none"
        aria-hidden="true"
        style={{
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#020205",
        }}
      >
        {/* 模拟 Galaxy 星空的多层径向渐变 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 60% 50% at 50% 50%, rgba(130, 255, 180, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 80% 60% at 30% 40%, rgba(100, 200, 150, 0.05) 0%, transparent 55%),
              radial-gradient(ellipse 70% 50% at 70% 60%, rgba(80, 180, 130, 0.04) 0%, transparent 50%),
              #020205
            `,
          }}
        />
        {/* 模拟 Orb 能量核心的中心光晕 - 使用 CSS 动画模拟呼吸效果 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="mobile-orb-glow"
            style={{
              width: "min(70vw, 70vh)",
              height: "min(70vw, 70vh)",
              borderRadius: "50%",
              background: `
                radial-gradient(circle, rgba(130, 255, 180, 0.15) 0%, rgba(100, 200, 150, 0.08) 40%, transparent 70%)
              `,
            }}
          />
        </div>
        {/* 轻量星点 */}
        <div className="absolute inset-0 mobile-dashboard-stars opacity-50" />
        <style jsx>{`
          .mobile-orb-glow {
            animation: orb-breathe 4s ease-in-out infinite;
          }
          @keyframes orb-breathe {
            0%, 100% { 
              transform: scale(1); 
              opacity: 0.8;
            }
            50% { 
              transform: scale(1.08); 
              opacity: 1;
            }
          }
          .mobile-dashboard-stars {
            background-image:
              radial-gradient(1px 1px at 15% 25%, rgba(255, 255, 255, 0.6) 50%, transparent 100%),
              radial-gradient(1px 1px at 85% 15%, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
              radial-gradient(1px 1px at 45% 75%, rgba(200, 255, 220, 0.5) 50%, transparent 100%),
              radial-gradient(1.5px 1.5px at 75% 55%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
              radial-gradient(1px 1px at 25% 85%, rgba(180, 255, 200, 0.4) 50%, transparent 100%),
              radial-gradient(1px 1px at 55% 35%, rgba(255, 255, 255, 0.3) 50%, transparent 100%),
              radial-gradient(1px 1px at 95% 75%, rgba(200, 255, 220, 0.4) 50%, transparent 100%);
            background-size: 100% 100%;
          }
          @media (prefers-reduced-motion: reduce) {
            .mobile-orb-glow {
              animation: none;
            }
          }
        `}</style>
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
        backgroundColor: "#020205", // 宇宙黑底色，确保没有白底漏出
      }}
    >
      {/* 第一层：Galaxy 星空 */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Galaxy
          mouseInteraction={true}
          mouseRepulsion={true}
          density={2.8}
          glowIntensity={0.2}
          saturation={0}         
          hueShift={120}
          twinkleIntensity={0.2}
          rotationSpeed={0.05}   
          repulsionStrength={0.5}
          autoCenterRepulsion={0}
          starSpeed={0.2}
          speed={0.5}
          transparent={true}     
        />
      </div>

      {/* 第二层：Orb 能量核心 */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Orb
          hue={102}                 
          hoverIntensity={0.4}      
          rotateOnHover={true}      
          forceHoverState={true}   
          backgroundColor="#020205" 
          isRound={isRound}         
        />
      </div>
    </div>
  )
}
