// src/app/loading.tsx
"use client"

import { useEffect, useRef } from "react"

export default function GlobalLoading() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
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

    class Particle {
      angle: number
      radius: number
      size: number
      baseAlpha: number
      layer: number
      vr: number 

      constructor() {
        this.angle = Math.random() * Math.PI * 2
        this.radius = Math.max(w, h) * (0.2 + Math.random() * 1.2)
        this.layer = Math.floor(Math.random() * 3)
        // 缩小基础尺寸，让光线更锐利精细
        this.size = 0.3 + this.layer * 0.5 
        this.baseAlpha = 0.1 + this.layer * 0.2
        this.vr = 0 
      }

      update() {
        const distSq = Math.max(this.radius * this.radius, 10)
        const gravity = 2500 / distSq 
        this.vr += gravity
        this.radius -= this.vr

        const spin = 0.001 + 60 / distSq
        this.angle += spin

        if (this.radius < 2) {
          this.radius = Math.max(w, h) * (1 + Math.random() * 0.5)
          this.angle = Math.random() * Math.PI * 2
          this.vr = 0
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        // 控制最大拉丝长度，避免变成无限长的棍子
        const tailLength = Math.min(this.vr * 8, 180) 
        const prevRadius = this.radius + tailLength
        const prevAngle = this.angle - (0.001 + 60 / Math.max(prevRadius * prevRadius, 10)) * tailLength * 0.05
        
        const xTail = cx + Math.cos(prevAngle) * prevRadius
        const yTail = cy + Math.sin(prevAngle) * prevRadius
        const xHead = cx + Math.cos(this.angle) * this.radius
        const yHead = cy + Math.sin(this.angle) * this.radius

        const intensity = Math.min(this.baseAlpha + this.vr * 0.2, 1)

        // 🚀 核心优化 1：创建方向性渐变，头部亮，尾部完全透明消失
        const grad = ctx.createLinearGradient(xHead, yHead, xTail, yTail)
        grad.addColorStop(0, `rgba(255, 255, 255, ${intensity})`) // 头部最高亮
        grad.addColorStop(0.2, `rgba(255, 255, 255, ${intensity * 0.5})`) // 迅速衰减
        grad.addColorStop(1, `rgba(255, 255, 255, 0)`) // 尾部无形消散

        ctx.beginPath()
        ctx.moveTo(xTail, yTail)
        ctx.lineTo(xHead, yHead)
        ctx.strokeStyle = grad
        // 限制最大粗细，防止变成棍子
        ctx.lineWidth = this.size * (1 + Math.min(this.vr * 0.05, 1.5))
        ctx.lineCap = "round"
        ctx.stroke()

        // 🚀 核心优化 2：对于高速粒子，在头部画一个极小的高光点，增强针尖般的锐利感
        if (this.vr > 5) {
          ctx.beginPath()
          ctx.arc(xHead, yHead, this.size * 0.6, 0, Math.PI * 2)
          ctx.fillStyle = "#FFFFFF"
          ctx.fill()
        }
      }
    }

    const particles = Array.from({ length: 350 }, () => new Particle())

    const render = () => {
      ctx.clearRect(0, 0, w, h)

      // 🚀 核心优化 3：开启 Canvas 的 Screen（滤色）混合模式
      // 重叠的光线会变得更加刺眼明亮，而不会互相遮盖成一团死白
      ctx.globalCompositeOperation = "screen"

      particles.forEach(p => {
        p.update()
        p.draw(ctx)
      })

      const time = Date.now() * 0.0015

      // 能量震荡激波环
      for (let i = 0; i < 3; i++) {
        const t = (time * 0.8 + i * 0.333) % 1
        const easeOut = 1 - Math.pow(1 - t, 3)
        const shockRadius = 10 + easeOut * 350
        const shockAlpha = (1 - t) * 0.15

        ctx.beginPath()
        ctx.arc(cx, cy, shockRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${shockAlpha})`
        ctx.lineWidth = 1 + (1 - t) * 1.5
        ctx.stroke()
      }

      // 恢复正常的混合模式来画中心奇点
      ctx.globalCompositeOperation = "source-over"

      const pulse = Math.sin(time * 2)
      
      // 环境泛光
      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = 100 + pulse * 20
      ctx.shadowColor = "rgba(255, 255, 255, 0.5)"
      ctx.fill()

      // 实态白洞核心
      ctx.beginPath()
      ctx.arc(cx, cy, 3 + pulse * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = 15
      ctx.shadowColor = "#FFFFFF"
      ctx.fill()

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