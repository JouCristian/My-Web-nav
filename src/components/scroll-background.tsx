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
    let requestRef: number;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = window.scrollY / (scrollHeight || 1)
      const progress = Math.max(0, Math.min(1, p))
      
      // 使用 requestAnimationFrame 优化渲染性能
      requestRef = requestAnimationFrame(() => {
        setProgress(progress)

        // 🚀 核心改进：初始位置 (0, 120, 200)，避开发光死角
        const ease = 1 - Math.pow(1 - progress, 2.5) // 更加顺滑的平移曲线
        
        const currentY = 120 + ease * 2500
        const currentZ = 200 + ease * 3500
        
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
  
  // 🚀 新增：用来存固定像素高度的状态，默认 100vh 兜底
  const [fixedHeight, setFixedHeight] = useState("100vh")

  useEffect(() => {
    setMounted(true)
    
    // 记录初始宽度
    let lastWidth = window.innerWidth

    // 🚀 核心逻辑：获取真实的像素高度并锁死
    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
    }

    // 初始化执行一次
    lockHeight()

    // 监听屏幕大小变化，但排除上下滑动导致的地址栏高度变化
    const handleResize = () => {
      // 只有在屏幕宽度改变时才重新计算高度（比如横竖屏切换，或者PC端拉伸窗口）
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
    // 🚀 关键修改：把 height 绑定为算出来的固定像素高度 fixedHeight
    <div 
      className="fixed z-[-1] overflow-hidden"
      style={{
        top: 0,
        left: 0,
        width: '100vw',
        height: fixedHeight, // 此时它是个绝对值，例如 "844px"
        backgroundColor: '#020205'
      }}
    >
      {/* 🧠 动态毛玻璃 UI 保护层 */}
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