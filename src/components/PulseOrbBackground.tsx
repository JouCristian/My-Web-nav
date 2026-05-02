"use client"

import React, { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// 动态导入 Orb，关闭 SSR 以防 OGL 报错
const Orb = dynamic(() => import("./Orb"), { 
  ssr: false,
  loading: () => <div className="w-full h-full" style={{ backgroundColor: "#2b84a1" }} />
})

export function PulseOrbBackground() {
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  
  // 控制 Orb 形变的状态
  const [isRound, setIsRound] = useState(false)
  
  // 触发跃迁脉冲（变圆再回弹）
  const triggerPulse = useCallback(() => {
    if (isRound) return
    
    setIsRound(true) // 触发：开始向正圆形变
    
    // 维持圆形态 800ms 后释放，底层的 Spring Physics 会自动产生优雅的回弹动画
    setTimeout(() => {
      setIsRound(false) 
    }, 800)
    
  }, [isRound])
  
  // 监听全局事件触发 (适配你之前的逻辑)
  useEffect(() => {
    const handleOrbShift = () => triggerPulse()
    // 兼容原有的 aurora-shift 事件名，或者你可以自己改成 orb-shift
    window.addEventListener("aurora-shift", handleOrbShift) 
    return () => window.removeEventListener("aurora-shift", handleOrbShift)
  }, [triggerPulse])

  useEffect(() => {
    setMounted(true)
    let lastWidth = window.innerWidth

    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
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
    return <div className="fixed inset-0 z-[-1]" style={{ backgroundColor: "#2b84a1" }} aria-hidden="true" />
  }

  return (
    <div
      className="fixed z-[-1] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        width: "100vw",
        height: fixedHeight,
        backgroundColor: "#020205", // 根据你图中的参数设置底色
      }}
    >
      <div className="absolute inset-0">
        <Orb
          hue={102}                 // 你的截图参数: Hue Shift 102
          hoverIntensity={0.5}      // 你的截图参数: Hover Intensity 0.4
          rotateOnHover={true}      // 你的截图参数: Rotate On Hover 开
          forceHoverState={true}   // 你的截图参数: Force Hover State 关
          backgroundColor="#020205" // 你的截图参数: 容器背景色
          isRound={isRound}         // 传入脉冲状态，驱动物理回弹形变
        />
      </div>
    </div>
  )
}