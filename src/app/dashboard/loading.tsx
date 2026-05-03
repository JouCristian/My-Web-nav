// src/app/loading.tsx
"use client"

import { useEffect, useRef } from "react"

export default function GlobalLoading() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // 触发底层的背景跃迁事件
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

    // 适配高分屏，确保拉丝射线极其锐利
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

    // ==========================================
    // 🚀 核心视效：相对论级吸积盘粒子
    // ==========================================
    class Particle {
      angle: number
      radius: number
      size: number
      baseAlpha: number
      layer: number
      vr: number // 向内坠落的速度

      constructor() {
        this.angle = Math.random() * Math.PI * 2
        // 初始分布得更广，制造宏大的空间纵深
        this.radius = Math.max(w, h) * (0.2 + Math.random() * 1.2)
        this.layer = Math.floor(Math.random() * 3)
        this.size = 0.5 + this.layer * 0.8
        this.baseAlpha = 0.1 + this.layer * 0.2
        this.vr = 0 // 初始静止
      }

      update() {
        // 1. 真实引力场：距离越近，引力平方反比暴增
        const distSq = Math.max(this.radius * this.radius, 10)
        // 引力常数极高，制造毁灭性的坠落感
        const gravity = 2500 / distSq 
        this.vr += gravity
        this.radius -= this.vr

        // 2. 角动量守恒：靠近奇点时，发生疯狂的死亡甩尾
        const spin = 0.001 + 80 / distSq
        this.angle += spin

        // 3. 跨越事件视界后，从深空边缘重新生成
        if (this.radius < 2) {
          this.radius = Math.max(w, h) * (1 + Math.random() * 0.5)
          this.angle = Math.random() * Math.PI * 2
          this.vr = 0
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // 🚀 视觉张力核心：根据瞬时速度计算尾迹长度（相对论拉丝效应）
        // 速度越快，拉丝越长，最长可达半径的数倍
        const tailLength = Math.min(this.vr * 15, 400) 
        const prevRadius = this.radius + tailLength
        const prevAngle = this.angle - (0.001 + 80 / Math.max(prevRadius * prevRadius, 10)) * tailLength * 0.1
        
        const x1 = cx + Math.cos(prevAngle) * prevRadius
        const y1 = cy + Math.sin(prevAngle) * prevRadius
        const x2 = cx + Math.cos(this.angle) * this.radius
        const y2 = cy + Math.sin(this.angle) * this.radius

        // 速度越快，亮度越高，核心处产生物理过曝
        const intensity = Math.min(this.baseAlpha + this.vr * 0.1, 1)

        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`
        // 靠近核心时，光束因为能量聚集变得更粗
        ctx.lineWidth = this.size * (1 + this.vr * 0.15)
        ctx.lineCap = "round"
        ctx.stroke()
      }
    }

    // 提升粒子密度，让吸积盘极度饱满压迫
    const particles = Array.from({ length: 400 }, () => new Particle())

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      // 渲染所有拉丝星尘
      particles.forEach(p => {
        p.update()
        p.draw(ctx)
      })

      const time = Date.now() * 0.0015

      // ==========================================
      // 🚀 能量震荡激波环 (Shockwaves)
      // ==========================================
      for (let i = 0; i < 3; i++) {
        // 时间取模，制造不断外扩的波纹
        const t = (time * 0.8 + i * 0.333) % 1
        // 采用缓出曲线 (Ease-out)，扩散初期极快，后期减速变大
        const easeOut = 1 - Math.pow(1 - t, 3)
        const shockRadius = 10 + easeOut * 400
        const shockAlpha = (1 - t) * 0.15

        ctx.beginPath()
        ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${shockAlpha})`
        ctx.lineWidth = 1 + (1 - t) * 2
        ctx.stroke()
      }

      // ==========================================
      // 🚀 曝光过载的中心奇点 (Bloom Overload)
      // ==========================================
      const pulse = Math.sin(time * 2)
      
      // 第一层：超大范围微弱环境泛光
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = 120 + pulse * 20
      ctx.shadowColor = "rgba(255, 255, 255, 0.4)"
      ctx.fill()

      // 第二层：刺眼的实态白洞核心
      ctx.beginPath()
      ctx.arc(cx, cy, 3.5 + pulse * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = 20
      ctx.shadowColor = "#FFFFFF"
      ctx.fill()

      // 重置阴影，保证后续粒子的高效渲染
      ctx.shadowBlur = 0 

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
      
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* 极简 Apple 追踪排版：悬浮在过曝奇点正下方，提供冰冷的工业反差 */}
      <div className="absolute top-[58%] flex items-center gap-4 opacity-90 mix-blend-screen">
        <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-white/40"></span>
        <span className="text-[10px] font-mono tracking-[0.8em] text-white uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
          Reconstituting
        </span>
        <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-white/40"></span>
      </div>
      
    </main>
  )
}