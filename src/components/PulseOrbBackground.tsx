"use client"

import React, { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// 动态导入组件，避免 SSR 报错
const Orb = dynamic(() => import("./Orb"), { ssr: false })
const Galaxy = dynamic(() => import("./Galaxy"), { ssr: false })

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
      {/* 第一层：Galaxy (放在最底层，使用截图参数) */}
      <div className="absolute inset-0 z-0 opacity-80">
        <Galaxy
          mouseInteraction={true}
          mouseRepulsion={true}
          density={2.8}
          glowIntensity={0.2}
          saturation={0}         // 零饱和度，打造高级黑白星空
          hueShift={120}
          twinkleIntensity={0.2}
          rotationSpeed={0.05}   // 缓慢旋转的史诗感
          repulsionStrength={0.5}
          autoCenterRepulsion={0}
          starSpeed={0.2}
          speed={0.5}
          transparent={true}     // 保证底色透传
        />
      </div>

      {/* 第二层：Orb (放在上层)
        加上 pointer-events-none 让鼠标事件穿透到下层的 Galaxy，
        这样你滑动鼠标时，底层星系会被推开，上层能量团也会扭曲，两层联动！
      */}
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