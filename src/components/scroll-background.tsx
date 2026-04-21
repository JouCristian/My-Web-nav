"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ==========================================
// 🌌 真实感非对称银河系 (性能极致优化版)
// ==========================================
// 🚀 1. 新增这个 Interface，告诉 TypeScript 这些参数都是什么类型
interface MilkyWayProps {
  count?: number;
  scrollProgressRef: React.MutableRefObject<number>;
  isMobile?: boolean;
}

// 🚀 2. 在组件这里应用这个类型
function MilkyWay({ count = 80000, scrollProgressRef, isMobile = false }: MilkyWayProps) {
  const pointsRef = useRef<THREE.Points>(null)

  // 渲染星空贴图保持不变
  const starTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 64; canvas.height = 64
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
      grad.addColorStop(0, 'rgba(255,255,255,1)')
      grad.addColorStop(0.2, 'rgba(255,240,200,0.8)')
      grad.addColorStop(0.5, 'rgba(100,150,255,0.2)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 64, 64)
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const branches = 5 
    const radius = 4000

    for (let i = 0; i < count; i++) {
      const r = (Math.pow(Math.random(), 1.3) * radius) + 80 
      const branchAngle = ((i % branches) / branches) * Math.PI * 2
      
      const randomnessPower = 3
      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (r / 4)
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (r / 8)
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (r / 4)

      pos[i * 3 + 0] = Math.cos(branchAngle + r * 0.0008) * r + randomX
      pos[i * 3 + 1] = randomY
      pos[i * 3 + 2] = Math.sin(branchAngle + r * 0.0008) * r + randomZ

      const color = new THREE.Color()
      const colorProgress = r / radius
      if (colorProgress < 0.15) {
        color.setHSL(0.08, 0.7, 0.5)
      } else if (colorProgress < 0.5) {
        color.setHSL(0.6, 0.3, 0.6)
      } else {
        color.setHSL(0.75, 0.4, 0.3)
      }
      
      col[i * 3 + 0] = color.r
      col[i * 3 + 1] = color.g
      col[i * 3 + 2] = color.b
    }
    return [pos, col]
  }, [count])

  // 🚀 性能大杀器：使用 Lerp 阻尼缓冲，切断与原生滑动的硬绑定
  useFrame((state, delta) => {
    if (pointsRef.current) {
      // 基础自转
      pointsRef.current.rotation.y -= delta * 0.015 
      // 滚动带来的加速转动（加上平滑过渡）
      pointsRef.current.rotation.y -= delta * (scrollProgressRef.current * 0.04)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        // 🚀 救命神技 1：手机端疯狂缩小尺寸（5），电脑端保持 10。大幅削减 Overdraw 重绘率！
        size={isMobile ? 5 : 10} 
        map={starTexture}
        vertexColors
        transparent
        // 🚀 救命神技 2：关闭深度测试，让 GPU 直接把图层糊上去，不测算前后遮挡关系
        depthWrite={false}
        depthTest={false} 
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// ==========================================
// 🎥 镜头导演：丝滑阻尼版
// ==========================================
function CameraController({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree()
  // 记录相机当前真实位置
  const currentZ = useRef(3500)
  const currentY = useRef(2620)
  
  // 🚀 救命神技 3：将所有镜头运动放入 useFrame 内部，脱离 Scroll 事件的顿挫
  useFrame((state, delta) => {
    const progress = scrollProgressRef.current
    const ease = 1 - Math.pow(1 - progress, 2.5) 
    
    // 计算目标位置
    const targetY = 120 + ease * 2500
    const targetZ = 180 + ease * 3500 

    // 使用 MathUtils.lerp 进行平滑阻尼插值 (0.05 是平滑度，数字越小越软)
    currentY.current = THREE.MathUtils.lerp(currentY.current, targetY, 0.08)
    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ, 0.08)

    camera.position.set(0, currentY.current, currentZ.current)
    camera.lookAt(0, 0, 0)
  })

  return null
}

// ==========================================
// 🚀 主画布组件
// ==========================================
export function ScrollBackground() {
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  const [isMobile, setIsMobile] = useState(false)
  
  // 🌟 使用 ref 存储滚动进度，因为 useState 会触发组件重新渲染，在滚动时极耗性能
  const scrollProgressRef = useRef(0)
  // 用于更新 UI 毛玻璃的状态（只做轻量级更新）
  const [uiProgress, setUiProgress] = useState(0)

  useEffect(() => {
    setMounted(true)
    let lastWidth = window.innerWidth

    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
      setIsMobile(window.innerWidth < 768)
    }
    lockHeight()

    const handleResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        setTimeout(lockHeight, 100)
      }
    }

    // 🌟 将滚动监听轻量化：只赋值 ref，不执行复杂的数学运算
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = window.scrollY / (scrollHeight || 1)
      const progress = Math.max(0, Math.min(1, p))
      
      scrollProgressRef.current = progress
      // 节流一下 UI 更新，防止毛玻璃重绘卡顿
      requestAnimationFrame(() => setUiProgress(progress))
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })
    
    // 初始化执行一次
    handleScroll()
    
    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  if (!mounted) return <div className="fixed inset-0 bg-[#020205] z-[-1]" />

  return (
    <div 
      className="fixed z-[-1] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        width: '100vw',
        height: fixedHeight, 
        backgroundColor: '#020205'
      }}
    >
      <div 
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-150 ease-linear"
        style={{
          backdropFilter: `blur(${Math.max(0, 8 * (1 - uiProgress * 4))}px)`,
          background: `radial-gradient(circle at center, 
            rgba(2, 2, 5, ${0.3 * (1 - uiProgress)}) 0%, 
            rgba(2, 2, 5, ${0.7 + uiProgress * 0.3}) 100%)`
        }}
      />
      
      <Canvas
        camera={{ position: [0, 120, 180], fov: 75, near: 1, far: 15000 }}
        // 🚀 救命神技 4：手机端强制 DPR 为 1，电脑端最高 1.5。绝对禁止 3x 高分屏带来的负荷
        dpr={isMobile ? 1 : [1, 1.5]} 
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#010103"]} />
        <fog attach="fog" args={["#010103", 3000, 12000]} />
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#fff4e0" />
          <pointLight intensity={2.5} distance={800} decay={2} color="#ffccaa" />
        </mesh>

        {/* 🚀 救命神技 5：手机端星空数量降至 15000，配合小 size 打造“星沙”质感 */}
        <MilkyWay 
          count={isMobile ? 15000 : 90000} 
          scrollProgressRef={scrollProgressRef} 
          isMobile={isMobile} 
        />
        <CameraController scrollProgressRef={scrollProgressRef} />
      </Canvas>
    </div>
  )
}