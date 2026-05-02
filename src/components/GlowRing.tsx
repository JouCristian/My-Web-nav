"use client"

import React, { useEffect, useState, useRef } from "react"

// Apple 风格的非线性缓动曲线
const EASING = {
  // iOS 标准曲线
  spring: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  // 快出慢入
  easeOut: "cubic-bezier(0.16, 1, 0.3, 1)",
  // 弹性回弹
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
}

interface GlowRingProps {
  colors: string[]
  scale?: number
  intensity?: number
  speed?: number
}

export default function GlowRing({ 
  colors, 
  scale = 1, 
  intensity = 1,
  speed = 1 
}: GlowRingProps) {
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-full h-full" style={{ backgroundColor: "transparent" }} />
  }

  // 从 colors 数组生成渐变
  const primaryColor = colors[0] || "#0ea5e9"
  const secondaryColor = colors[1] || "#38bdf8"
  const tertiaryColor = colors[2] || "#0ea5e9"

  // 动画持续时间（基于 speed）
  const rotationDuration = 20 / speed
  const pulseDuration = 4 / speed

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 flex items-end justify-center overflow-hidden pointer-events-none"
      style={{ paddingBottom: "5vh" }}
    >
      {/* 主容器 - 处理缩放动画 */}
      <div
        className="relative"
        style={{
          width: "min(70vw, 600px)",
          height: "min(35vw, 300px)",
          transform: `scale(${scale})`,
          transition: `transform 0.8s ${EASING.bounce}`,
          transformOrigin: "center bottom",
        }}
      >
        {/* 最外层光晕 - 大范围柔和扩散 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 100% 100% at 50% 100%, 
                ${primaryColor}15 0%, 
                ${secondaryColor}08 40%, 
                transparent 70%)
            `,
            filter: "blur(40px)",
            opacity: intensity * 0.6,
            transition: `opacity 1s ${EASING.spring}, background 1.2s ${EASING.spring}`,
          }}
        />

        {/* 中层光晕 - 增强亮度 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 90% at 50% 100%, 
                ${primaryColor}25 0%, 
                ${secondaryColor}15 30%, 
                transparent 60%)
            `,
            filter: "blur(25px)",
            opacity: intensity * 0.8,
            transition: `opacity 1s ${EASING.spring}, background 1.2s ${EASING.spring}`,
          }}
        />

        {/* 核心光环 - 椭圆形发光环 */}
        <div
          className="absolute"
          style={{
            left: "10%",
            right: "10%",
            bottom: "0",
            height: "60%",
            borderRadius: "50% 50% 50% 50% / 100% 100% 0% 0%",
            background: `
              linear-gradient(180deg, 
                ${primaryColor}00 0%,
                ${primaryColor}40 30%,
                ${secondaryColor}60 50%,
                ${tertiaryColor}40 70%,
                ${primaryColor}00 100%)
            `,
            filter: "blur(8px)",
            opacity: intensity,
            transition: `opacity 0.8s ${EASING.spring}, background 1.2s ${EASING.spring}`,
            animation: `glowPulse ${pulseDuration}s ${EASING.spring} infinite`,
          }}
        />

        {/* 流动光带层1 - 顺时针旋转 */}
        <div
          className="absolute"
          style={{
            left: "5%",
            right: "5%",
            bottom: "-5%",
            height: "70%",
            borderRadius: "50% 50% 50% 50% / 100% 100% 0% 0%",
            background: `
              conic-gradient(from 180deg at 50% 100%,
                transparent 0deg,
                ${primaryColor}30 60deg,
                ${secondaryColor}50 120deg,
                ${tertiaryColor}30 180deg,
                transparent 240deg,
                ${primaryColor}20 300deg,
                transparent 360deg)
            `,
            filter: "blur(15px)",
            opacity: intensity * 0.7,
            transition: `opacity 0.8s ${EASING.spring}, background 1.2s ${EASING.spring}`,
            animation: `flowRotate ${rotationDuration}s linear infinite`,
            transformOrigin: "50% 100%",
          }}
        />

        {/* 流动光带层2 - 逆时针旋转（更快） */}
        <div
          className="absolute"
          style={{
            left: "15%",
            right: "15%",
            bottom: "5%",
            height: "50%",
            borderRadius: "50% 50% 50% 50% / 100% 100% 0% 0%",
            background: `
              conic-gradient(from 0deg at 50% 100%,
                transparent 0deg,
                ${secondaryColor}25 90deg,
                ${tertiaryColor}40 180deg,
                ${primaryColor}25 270deg,
                transparent 360deg)
            `,
            filter: "blur(12px)",
            opacity: intensity * 0.6,
            transition: `opacity 0.8s ${EASING.spring}, background 1.2s ${EASING.spring}`,
            animation: `flowRotateReverse ${rotationDuration * 0.7}s linear infinite`,
            transformOrigin: "50% 100%",
          }}
        />

        {/* 内层高亮边缘 - 锐利的光环边缘 */}
        <div
          className="absolute"
          style={{
            left: "20%",
            right: "20%",
            bottom: "10%",
            height: "40%",
            borderRadius: "50% 50% 50% 50% / 100% 100% 0% 0%",
            background: "transparent",
            boxShadow: `
              inset 0 -2px 20px ${primaryColor}50,
              inset 0 -4px 40px ${secondaryColor}30,
              0 0 30px ${primaryColor}20
            `,
            opacity: intensity * 0.9,
            transition: `opacity 0.8s ${EASING.spring}, box-shadow 1.2s ${EASING.spring}`,
            animation: `edgePulse ${pulseDuration * 1.3}s ${EASING.spring} infinite`,
          }}
        />

        {/* 顶部高光点 - 增加层次感 */}
        <div
          className="absolute"
          style={{
            left: "35%",
            right: "35%",
            bottom: "35%",
            height: "15%",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at center, ${secondaryColor}60 0%, transparent 70%)`,
            filter: "blur(10px)",
            opacity: intensity * 0.5,
            transition: `opacity 0.8s ${EASING.spring}, background 1.2s ${EASING.spring}`,
            animation: `highlightFloat ${pulseDuration * 2}s ${EASING.spring} infinite`,
          }}
        />
      </div>

      {/* CSS 动画定义 */}
      <style jsx>{`
        @keyframes glowPulse {
          0%, 100% {
            opacity: ${intensity};
            transform: scaleX(1);
          }
          50% {
            opacity: ${intensity * 0.85};
            transform: scaleX(1.02);
          }
        }

        @keyframes flowRotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes flowRotateReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes edgePulse {
          0%, 100% {
            opacity: ${intensity * 0.9};
            transform: scaleX(1) scaleY(1);
          }
          50% {
            opacity: ${intensity * 0.7};
            transform: scaleX(1.03) scaleY(1.05);
          }
        }

        @keyframes highlightFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: ${intensity * 0.5};
          }
          50% {
            transform: translateY(-5px) scale(1.1);
            opacity: ${intensity * 0.7};
          }
        }
      `}</style>
    </div>
  )
}
