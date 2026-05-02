"use client"

import React, { useEffect, useState, useCallback } from "react"

// 【关键修复】直接引入，取消内部的 dynamic 套娃！
// 因为外层的 background-wrapper 已经关闭了 SSR，这里完全可以安全地静态导入
import Orb from "./Orb"
import Galaxy from "./Galaxy"

export function PulseOrbBackground() {
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
  }, [])

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