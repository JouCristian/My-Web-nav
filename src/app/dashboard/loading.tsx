// src/app/loading.tsx
"use client"

import { useEffect, useRef } from "react"

export default function GlobalLoading() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // 触发全局背景的跃迁脉冲效果
    window.dispatchEvent(new CustomEvent("aurora-shift"))

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let w = window.innerWidth
    let h = window.innerHeight
    let cx = w / 2
    let cy = h / 2

    // 适配 Apple Retina 高分屏
    const dpr = window.devicePixelRatio || 1
    const resizeCanvas = () => {
      w = window.innerWidth
      h = window.innerHeight
      cx = w / 2
      cy = h / 2
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // 🚀 黑洞吸积盘：高张力星尘粒子类
    class Particle {
      angle: number
      radius: number
      size: number
      alpha: number
      layer: number
      vr: number // 径向速度（引力向内）

      constructor() {
        this.angle = Math.random() * Math.PI * 2
        this.radius = Math.random() * Math.max(w, h)
        this.layer = Math.floor(Math.random() * 3)
        this.size = 0.5 + this.layer * 0.5
        this.alpha = 0.2 + this.layer * 0.3
        this.vr = Math.random() * 0.5 // 初始微弱的向内速度
      }

      update() {
        // 1. 引力模型：距离越近，向内加速度呈指数级暴增
        const gravity = 150 / Math.max(this.radius * this.radius, 100)
        this.vr += gravity
        this.radius -= this.vr

        // 2. 角动量守恒：距离越近，旋转速度越快（甩尾效应）
        const spin = 0.002 + 20 / Math.max(this.radius * this.radius, 50)
        this.angle += spin

        // 3. 被中心吞噬后，在边缘宇宙重生
        if (this.radius < 3) {
          this.radius = Math.max(w, h) * (1 + Math.random() * 0.2)
          this.angle = Math.random() * Math.PI * 2
          this.vr = Math.random() * 0.5
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const x = cx + Math.cos(this.angle) * this.radius
        const y = cy + Math.sin(this.angle) * this.radius

        // 🚀 视觉张力核心：根据向内的坠落速度，计算出尾迹（拉丝效果）
        const tailLength = this.vr * 2.5
        const prevRadius = this.radius + tailLength
        const prevAngle = this.angle - (0.002 + 20 / Math.max(prevRadius * prevRadius, 50)) * 2
        const prevX = cx + Math.cos(prevAngle) * prevRadius
        const prevY = cy + Math.sin(prevAngle) * prevRadius

        ctx.beginPath()
        ctx.moveTo(prevX, prevY)
        ctx.lineTo(x, y)
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`
        ctx.lineWidth = this.size
        ctx.lineCap = "round"
        ctx.stroke()
      }
    }

    // 初始化高密度粒子群
    const particles = Array.from({ length: 250 }, () => new Particle())

    // 渲染循环
    const render = () => {
      ctx.clearRect(0, 0, w, h)

      // 渲染拉丝星尘流
      particles.forEach(p => {
        p.update()
        p.draw(ctx)
      })

      // ==========================================
      // 渲染中心能量核 (奇点)
      // ==========================================
      const time = Date.now() * 0.002
      
      // 1. 发光白洞核心
      const coreRadius = 3 + Math.sin(time) * 1
      const glowSpread = 20 + Math.sin(time) * 15

      ctx.beginPath()
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = glowSpread
      ctx.shadowColor = "rgba(255, 255, 255, 1)"
      ctx.fill()
      ctx.shadowBlur = 0 // 重置阴影防止污染粒子

      // 2. 吸积环 (Event Horizon Edge)，产生微弱的高科技光晕
      ctx.beginPath()
      ctx.arc(cx, cy, 14 + Math.cos(time * 0.8) * 2, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 + Math.sin(time) * 0.1})`
      ctx.lineWidth = 1
      ctx.stroke()

      animationFrameId = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <main className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center overflow-hidden pointer-events-none">
      
      {/* WebGL/Canvas 核心渲染层 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* 极简跟踪文本 (固定在奇点下方) */}
      <div className="absolute top-[55%] flex items-center gap-4 opacity-80">
        <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/30"></span>
        <span className="text-[9px] font-mono tracking-[0.6em] text-white/70 uppercase">
          Reconstituting
        </span>
        <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white/30"></span>
      </div>
      
    </main>
  )
}