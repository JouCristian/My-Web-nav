"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// ==========================================
// 🌌 真实感非对称银河系 (极致优化版)
// ==========================================
interface MilkyWayProps {
  count?: number;
  scrollProgressRef: React.MutableRefObject<number>;
  isMobile?: boolean;
}

function MilkyWay({ count = 80000, scrollProgressRef, isMobile = false }: MilkyWayProps) {
  const pointsRef = useRef<THREE.Points>(null)

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
    const branches = 10 
    const radius = 5000

    for (let i = 0; i < count; i++) {
      const r = (Math.pow(Math.random(), 1.3) * radius) + 120 
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

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y -= delta * 0.1 
      pointsRef.current.rotation.y -= delta * (scrollProgressRef.current * 0.13)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={isMobile ? 5 : 10} 
        map={starTexture}
        vertexColors
        transparent
        depthWrite={false}
        depthTest={true} 
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}

// ==========================================
// 🌍 逼真地球 + 动态云层 + 阻尼消散大气层
// ==========================================
interface RealisticEarthProps {
  scrollProgressRef: React.MutableRefObject<number>;
}

function RealisticEarth({ scrollProgressRef }: RealisticEarthProps) {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)
  const currentFade = useRef(1.0)

  const [colorMap, normalMap, specularMap, cloudsMap] = useMemo(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    return [
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg'),
      loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png')
    ]
  }, [])

  const atmosphereMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uFade: { value: 1.0 } },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uFade;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(max(0.0, 0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
          vec3 glowColor = vec3(0.4, 0.8, 1.0); 
          gl_FragColor = vec4(glowColor * intensity * 2.5 * uFade, 1.0);
        }
      `,
      side: THREE.BackSide, 
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false 
    })
  }, [])

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.07
      cloudsRef.current.rotation.z += delta * 0.01
    }
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.05

    const progress = scrollProgressRef.current
    const ease = 1 - Math.pow(1 - progress, 2.5) 
    const targetFade = 1.0 - ease 

    currentFade.current = THREE.MathUtils.lerp(currentFade.current, targetFade, 0.02)
    atmosphereMaterial.uniforms.uFade.value = currentFade.current
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={earthRef}>
        <sphereGeometry args={[25, 64, 64]} />
        <meshPhongMaterial 
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          specular={new THREE.Color('grey')}
          shininess={15}
        />
      </mesh>
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[25.3, 64, 64]} />
        <meshPhongMaterial map={cloudsMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[28.5, 64, 64]} />
        <primitive object={atmosphereMaterial} attach="material" />
      </mesh>
    </group>
  )
}

// ==========================================
// 🎥 镜头导演：阻尼滑动的相机控制
// ==========================================
function CameraController({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree()
  const currentZ = useRef(3500)
  const currentY = useRef(2620)
  
  useFrame((state, delta) => {
    const progress = scrollProgressRef.current
    const ease = 1 - Math.pow(1 - progress, 3.0) 
    
    const targetY = 150 + ease * 1500
    const targetZ = 180 + ease * 2000 

    currentY.current = THREE.MathUtils.lerp(currentY.current, targetY, 0.09)
    currentZ.current = THREE.MathUtils.lerp(currentZ.current, targetZ, 0.09)

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
  
  const scrollProgressRef = useRef(0)
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

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const p = window.scrollY / (scrollHeight || 1)
      const progress = Math.max(0, Math.min(1, p))
      
      scrollProgressRef.current = progress
      requestAnimationFrame(() => setUiProgress(progress))
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("scroll", handleScroll, { passive: true })
    
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
        {/* 🧠 动态毛玻璃 UI 保护层 */}
        <div 
        className="absolute inset-0 z-10 pointer-events-none transition-all duration-150 ease-linear"
        style={{
          backdropFilter: `blur(${Math.max(0, 8 * (1 - uiProgress * 4))}px)`,
          background: `radial-gradient(circle at center, 
            rgba(2, 2, 5, ${0.3 * (1 - uiProgress)}) 0%, 
            rgba(2, 2, 5, ${0.7 + uiProgress * 0.3}) 100%)`
        }}
      />

      {/* 🚀 高级感噪点层 (Film Grain) */}
      <div 
        className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url('https://grainy-gradients.vercel.app/noise.svg')`,
          filter: 'contrast(150%) brightness(100%)'
        }}
      />
      
      <Canvas
        camera={{ position: [0, 150, 180], fov: 75, near: 1, far: 20000 }} 
        dpr={isMobile ? 1 : [1, 1.5]} 
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#010103"]} />
        <fog attach="fog" args={["#010103", 8000, 18000]} /> 
        
        <ambientLight intensity={4.5} color="#ffffff" />

              {/* ☀️ 新增：模拟太阳的平行光 */}
        <directionalLight 
          position={[50, 20, 30]} // 光源位置 (右上方)
          intensity={2.0}         // 光源强度，调大就会更亮
          color="#ffffff" 
        />

        <RealisticEarth scrollProgressRef={scrollProgressRef} />

        <MilkyWay 
          count={isMobile ? 90000 : 130000} 
          scrollProgressRef={scrollProgressRef} 
          isMobile={isMobile} 
        />
        
        <CameraController scrollProgressRef={scrollProgressRef} />
      </Canvas>
    </div>
  )
}