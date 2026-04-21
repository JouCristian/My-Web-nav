"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ==========================================
// 🌌 真实感非对称银河系
// ==========================================
function MilkyWay({ count = 80000, scrollProgress = 0 }) {
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
    const spin = 0.6 // 降低卷曲度使其更自然

    for (let i = 0; i < count; i++) {
      // 🚀 核心改进：让最中心有 80 单位的空隙，防止初始视角过白
      const r = (Math.pow(Math.random(), 1.3) * radius) + 80 
      const branchAngle = ((i % branches) / branches) * Math.PI * 2
      
      // 🚀 核心改进：非对称扰动。越往外星星越“乱跑”，打破几何对称感
      const randomnessPower = 3
      const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (r / 4)
      const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (r / 8)
      const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * (r / 4)

      pos[i * 3 + 0] = Math.cos(branchAngle + r * 0.0008) * r + randomX
      pos[i * 3 + 1] = randomY
      pos[i * 3 + 2] = Math.sin(branchAngle + r * 0.0008) * r + randomZ

      // 颜色过渡：深橙 -> 亮白 -> 幽蓝
      const color = new THREE.Color()
      const colorProgress = r / radius
      if (colorProgress < 0.15) {
        color.setHSL(0.08, 0.7, 0.5) // 深暖色核心
      } else if (colorProgress < 0.5) {
        color.setHSL(0.6, 0.3, 0.6)  // 蓝白中段
      } else {
        color.setHSL(0.75, 0.4, 0.3) // 幽紫边缘
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
        size={10}
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
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = window.scrollY / (scrollHeight || 1)
      const progress = Math.max(0, Math.min(1, p))
      setProgress(progress)

      // 🚀 核心改进：初始位置 (0, 120, 200)，避开发光死角
      const ease = 1 - Math.pow(1 - progress, 2.5) // 更加顺滑的平移曲线
      
      const currentY = 120 + ease * 2500
      const currentZ = 200 + ease * 3500
      
      camera.position.set(0, currentY, currentZ)
      camera.lookAt(0, 0, 0)
    }
    
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [camera, setProgress])

  return null
}

// ==========================================
// 🚀 主画布组件
// ==========================================
export function ScrollBackground() {
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) return <div className="fixed inset-0 bg-[#020205] z-[-1]" />

  return (
      // 🚀 关键修改：用 100vw 和 100dvh 钉死尺寸，脱离文档流的挤压
      <div 
      className="fixed z-[-1] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        width: '100vw',
        height: '100dvh', // 使用动态视口高度，防止地址栏伸缩引发重绘卡顿
        backgroundColor: '#020205'
      }}
      >
      {/* 🧠 动态毛玻璃 UI 保护层 
        - 初始状态：强模糊 + 深色遮罩，确保文字清晰
        - 滚动过程：模糊度线性消失，遮罩变透明
      */}
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
        camera={{ position: [0, 120, 200], fov: 50, near: 1, far: 15000 }}
        gl={{ antialias: true, alpha: false }}
      >
        <color attach="background" args={["#010103"]} />
        <fog attach="fog" args={["#010103", 3000, 12000]} />
        
        {/* 中心恒星：降低了光照强度，防止晃眼 */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshBasicMaterial color="#fff4e0" />
          <pointLight intensity={2.5} distance={800} decay={2} color="#ffccaa" />
        </mesh>

        <MilkyWay count={90000} scrollProgress={progress} />
        <CameraController setProgress={setProgress} />
      </Canvas>
    </div>
  )
}