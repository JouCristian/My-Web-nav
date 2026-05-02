// src/app/loading.tsx
"use client"

import { useEffect, useRef } from "react"

export default function GlobalLoading() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // 触发全局背景的跃迁脉冲效果，让背景与 Loading 完美联动
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

    // 适配 Apple Retina 高分屏，解决 Canvas 模糊问题
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

    // 星尘粒子类
    class Particle {
      angle: number
      radius: number
      speed: number
      size: number
      alpha: number
      layer: number

      constructor() {
        this.angle = Math.random() * Math.PI * 2
        // 初始位置分布在屏幕外部到中心之间
        this.radius = Math.random() * Math.max(w, h)
        // 划分为 3 个深度层：0(底层/暗/慢), 1(中层), 2(顶层/亮/快)
        this.layer = Math.floor(Math.random() * 3)
        // 非线性基础速度
        this.speed = 0.015 + this.layer * 0.01
        // 尺寸与透明度随图层变化，增强空间深度
        this.size = 0.4 + this.layer * 0.6
        this.alpha = 0.15 + this.layer * 0.25
      }

      update() {
        // 核心非线性缓动：距离中心越近，速度相对变慢，形成优雅的阻尼感
        this.radius -= this.radius * this.speed
        // 伴随极其轻微的螺旋旋转
        this.angle += 0.002 + this.layer * 0.001

        // 当粒子被吸入核心后，在边缘重生，形成无尽的星尘流
        if (this.radius < 5) {
          this.radius = Math.max(w, h) * (1 + Math.random() * 0.2)
          this.angle = Math.random() * Math.PI * 2
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        const x = cx + Math.cos(this.angle) * this.radius
        const y = cy + Math.sin(this.angle) * this.radius
        ctx.beginPath()
        ctx.arc(x, y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`
        ctx.fill()
      }
    }

    // 初始化粒子群
    const particles = Array.from({ length: 200 }, () => new Particle())

    // 渲染循环
    const render = () => {
      // 极其干净的清屏，保持背景绝对透明
      ctx.clearRect(0, 0, w, h)

      // 渲染星尘流
      particles.forEach(p => {
        p.update()
        p.draw(ctx)
      })

      // 渲染中心能量核心（带有正弦波呼吸律动）
      const time = Date.now() * 0.002
      const coreRadius = 6 + Math.sin(time) * 1.5
      const glowSpread = 15 + Math.sin(time) * 10

      ctx.beginPath()
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = "#FFFFFF"
      ctx.shadowBlur = glowSpread
      ctx.shadowColor = "rgba(255, 255, 255, 0.8)"
      ctx.fill()
      // 重置阴影，防止污染粒子
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
    // 极其通透的全屏容器，允许底层的 Galaxy 和 Orb 背景完全透视出来
    <main className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center overflow-hidden pointer-events-none">
      
      {/* WebGL/Canvas 星尘重塑动画层 */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none"
      />

      {/* 视觉中心：Apple 风格毛玻璃光学透镜 */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 透镜容器：居中笼罩在 Canvas 渲染的能量核心上方，产生折射模糊 */}
        <div className="w-16 h-16 rounded-full backdrop-blur-xl bg-white/[0.02] border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden relative">
           {/* 高光反射面，增加玻璃的立体质感 */}
           <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.05] to-white/[0.15] rounded-full" />
        </div>
        
        {/* 极简的跟踪文本 */}
        <div className="mt-8 flex items-center gap-4 opacity-80">
          <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-white/30"></span>
          <span className="text-[9px] font-mono tracking-[0.6em] text-white/70 uppercase">
            Reconstituting
          </span>
          <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-white/30"></span>
        </div>
      </div>
      
    </main>
  )
}