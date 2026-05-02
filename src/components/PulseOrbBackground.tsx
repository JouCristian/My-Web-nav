"use client"

import React, { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// 动态导入组件，避免 SSR 报错
const Orb = dynamic(() => import("./Orb"), { ssr: false })
const DotField = dynamic(() => import("./DotField"), { ssr: false })

export function PulseOrbBackground() {
  const [mounted, setMounted] = useState(false)
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
    setMounted(true)
    let lastWidth = window.innerWidth
    const lockHeight = () => setFixedHeight(`${window.innerHeight}px`)
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

  return (
    <div
      className="fixed z-[-1] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        width: "100vw",
        height: fixedHeight,
        backgroundColor: "#020205", // 宇宙黑底色
      }}
    >
      {/* 第一层：DotField (完全按照截图参数配置) */}
      <div className="absolute inset-0 z-0">
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          cursorRadius={500}
          cursorForce={0.1}
          bulgeOnly={true}
          bulgeStrength={67}
          glowRadius={160}
          waveAmplitude={0}
          sparkle={false}
          gradientFrom="#339eb8"
          gradientTo="#b497cf"
          glowColor="#120f17"
        />
      </div>

      {/* 第二层：Orb (放在上层，允许鼠标事件穿透到底层点阵) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <Orb
          hue={102}                 
          hoverIntensity={0.4}      
          rotateOnHover={true}      
          forceHoverState={false}   
          backgroundColor="#020205" // 与容器底色一致
          isRound={isRound}         
        />
      </div>
    </div>
  )
}