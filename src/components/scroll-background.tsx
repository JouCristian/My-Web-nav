"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ==========================================
// 🌌 真实感非对称银河系
// ==========================================
function MilkyWay({ count = 80000, scrollProgress = 0, isMobile = false }) {
  const pointsRef = useRef<THREE.Points>(null)

  // 生成星星的高清圆形贴图
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
      // 🚀 保持中心空隙
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

  // 缓慢的基础旋转
  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * (0.015 + scrollProgress * 0.04)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        // 🚀 性能优化：手机端粒子数量少了，稍微放大一点点体积填补空隙
        size={isMobile ? 14 : 10} 
        map={starTexture}
        vertexColors
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// ==========================================
// 🎥 镜头导演：由近及远
// ==========================================
function CameraController({ setProgress }: { setProgress: (p: number) => void }) {
  const { camera } = useThree()
  
  useEffect(() => {
    let requestRef: number;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = window.scrollY / (scrollHeight || 1)
      const progress = Math.max(0, Math.min(1, p))
      
      requestRef = requestAnimationFrame(() => {
        setProgress(progress)
        const ease = 1 - Math.pow(1 - progress, 2.5) 
        
        // 🚀 配合 FOV 变大，稍微拉近一点初始物理距离（200 -> 180），让星系更有包裹感
        const currentY = 120 + ease * 2500
        const currentZ = 180 + ease * 3500 
        
        camera.position.set(0, currentY, currentZ)
        camera.lookAt(0, 0, 0)
      })
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => {
      window.removeEventListener("scroll", handleScroll)
      cancelAnimationFrame(requestRef)
    }
  }, [camera, setProgress])

  return null
}

// ==========================================
// 🚀 主画布组件
// ==========================================
export function ScrollBackground() {
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  
  // 🚀 新增：判断是否为移动端
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setMounted(true)
    let lastWidth = window.innerWidth

    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
      // 🚀 初始化时判断是否为手机尺寸 (768px 以下算手机)
      setIsMobile(window.innerWidth < 768)
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
          backdropFilter: `blur(${Math.max(0, 8 * (1 - progress * 4))}px)`,
          background: `radial-gradient(circle at center, 
            rgba(2, 2, 5, ${0.3 * (1 - progress)}) 0%, 
            rgba(2, 2, 5, ${0.7 + progress * 0.3}) 100%)`
        }}
      />
      
      <Canvas
        // 🚀 性能优化与视角：FOV 加大到 75 度，更有深空广角感
        camera={{ position: [0, 120, 180], fov: 75, near: 1, far: 15000 }}
        // 🚀 性能大杀器：限制 DPR，关闭抗锯齿，开启高性能模式
        dpr={[1, 1.5]} 
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#010103"]} />
        <fog attach="fog" args={["#010103", 3000, 12000]} />
        
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#fff4e0" />
          <pointLight intensity={2.5} distance={800} decay={2} color="#ffccaa" />
        </mesh>

        {/* 🚀 根据设备自适应星星数量：电脑 9万，手机 3.5万 */}
        <MilkyWay count={isMobile ? 35000 : 90000} scrollProgress={progress} isMobile={isMobile} />
        <CameraController setProgress={setProgress} />
      </Canvas>
    </div>
  )
}