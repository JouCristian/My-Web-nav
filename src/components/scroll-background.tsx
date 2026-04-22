"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom" // 🚀 新增：用于将按钮渲染到最顶层
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const NOISE_STYLE: React.CSSProperties = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  filter: 'contrast(150%) brightness(100%)',
  transform: 'translateZ(0)',
};

// 🌌 MilkyWay 组件保持不变
function MilkyWay({ count = 80000, scrollProgressRef, isMobile = false }: { count?: number; scrollProgressRef: React.MutableRefObject<number>; isMobile?: boolean; }) {
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
      if (colorProgress < 0.15) color.setHSL(0.08, 0.7, 0.5)
      else if (colorProgress < 0.5) color.setHSL(0.6, 0.3, 0.6)
      else color.setHSL(0.75, 0.4, 0.3)
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
      <pointsMaterial size={isMobile ? 5 : 10} map={starTexture} vertexColors transparent depthWrite={false} depthTest={true} blending={THREE.AdditiveBlending} sizeAttenuation />
    </points>
  )
}

// 🌍 RealisticEarth 组件保持不变
function RealisticEarth({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number>; }) {
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
      vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uFade; varying vec3 vNormal; void main() { float intensity = pow(max(0.0, 0.85 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0); vec3 glowColor = vec3(1.0, 1.0, 1.0); gl_FragColor = vec4(glowColor * intensity * 1.5 * uFade, 1.0); }`,
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false 
    })
  }, [])

  useFrame((state, delta) => {
    if (earthRef.current) earthRef.current.rotation.y += delta * 0.05
    if (cloudsRef.current) { cloudsRef.current.rotation.y += delta * 0.07; cloudsRef.current.rotation.z += delta * 0.01 }
    if (atmosphereRef.current) atmosphereRef.current.rotation.y += delta * 0.05
    const progress = scrollProgressRef.current
    const ease = 1 - Math.pow(1 - progress, 2.5) 
    currentFade.current = THREE.MathUtils.lerp(currentFade.current, 1.0 - ease, 0.02)
    atmosphereMaterial.uniforms.uFade.value = currentFade.current
  })

  return (
    <group position={[0, 0, 0]}>
      <mesh ref={earthRef}><sphereGeometry args={[25, 64, 64]} /><meshPhongMaterial map={colorMap} normalMap={normalMap} specularMap={specularMap} specular={new THREE.Color('grey')} shininess={15} /></mesh>
      <mesh ref={cloudsRef}><sphereGeometry args={[25.3, 64, 64]} /><meshPhongMaterial map={cloudsMap} transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
      <mesh ref={atmosphereRef}><sphereGeometry args={[28.5, 64, 64]} /><primitive object={atmosphereMaterial} attach="material" /></mesh>
    </group>
  )
}

// ==========================================
// 🚀 核心更新：引入四大剧本数组
// ==========================================
const SCRIPT_NAMES = ["默认航线", "星际穿越", "轨道空降", "深空苏醒"];
const SCRIPTS = [
  // 剧本 0: 默认航线
  [
    { progress: 0.0, pos: new THREE.Vector3(0, 150, 3500), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.35, pos: new THREE.Vector3(1200, 300, 1800), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.65, pos: new THREE.Vector3(-600, 1200, 800), lookAt: new THREE.Vector3(0, 50, -200) },
    { progress: 1.0, pos: new THREE.Vector3(0, 2000, 1700), lookAt: new THREE.Vector3(0, 0, 0) }
  ],
  // 剧本 1: 星际穿越 (史诗感大弧线)
  [
    { progress: 0.0, pos: new THREE.Vector3(0, 100, 4000), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.30, pos: new THREE.Vector3(-2500, 400, 1500), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.65, pos: new THREE.Vector3(-300, 10, 500), lookAt: new THREE.Vector3(1000, 0, -1000) },
    { progress: 1.0, pos: new THREE.Vector3(800, 200, -2000), lookAt: new THREE.Vector3(0, 0, 0) }
  ],
  // 剧本 2: 轨道空降 (紧张坠落感)
  [
    { progress: 0.0, pos: new THREE.Vector3(0, 3500, 0), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.40, pos: new THREE.Vector3(1500, 1200, 1500), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.70, pos: new THREE.Vector3(0, 150, 800), lookAt: new THREE.Vector3(0, 400, -1000) },
    { progress: 1.0, pos: new THREE.Vector3(-800, -300, 1200), lookAt: new THREE.Vector3(0, 100, 0) }
  ],
  // 剧本 3: 深空苏醒 (悬疑推进)
  [
    { progress: 0.0, pos: new THREE.Vector3(2000, 500, 3000), lookAt: new THREE.Vector3(4000, 1000, 0) },
    { progress: 0.35, pos: new THREE.Vector3(1200, 200, 2500), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 0.75, pos: new THREE.Vector3(200, 50, 600), lookAt: new THREE.Vector3(0, 0, 0) },
    { progress: 1.0, pos: new THREE.Vector3(0, 0, 200), lookAt: new THREE.Vector3(0, 0, -2000) }
  ]
];

// 🎥 CameraController 接收当前的 scriptIndex
function CameraController({ scrollProgressRef, scriptIndex }: { scrollProgressRef: React.MutableRefObject<number>, scriptIndex: number }) {
  const { camera } = useThree()
  const currentPos = useRef(new THREE.Vector3(0, 150, 3500))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  // 动态获取当前激活的剧本
  const keyframes = SCRIPTS[scriptIndex];

  useFrame(() => {
    const progress = scrollProgressRef.current

    let startIndex = 0
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].progress) startIndex = i
    }
    const endIndex = Math.min(startIndex + 1, keyframes.length - 1)
    
    const startFrame = keyframes[startIndex]
    const endFrame = keyframes[endIndex]

    let localProgress = 0
    if (endFrame.progress > startFrame.progress) {
      localProgress = (progress - startFrame.progress) / (endFrame.progress - startFrame.progress)
    }

    const easeProgress = localProgress < 0.5 
      ? 2 * localProgress * localProgress 
      : 1 - Math.pow(-2 * localProgress + 2, 2) / 2

    const targetPos = new THREE.Vector3().lerpVectors(startFrame.pos, endFrame.pos, Math.max(0, Math.min(1, easeProgress)))
    const targetLookAt = new THREE.Vector3().lerpVectors(startFrame.lookAt, endFrame.lookAt, Math.max(0, Math.min(1, easeProgress)))

    // 🪶 核心：因为 currentPos 一直保留，所以 targetPos 瞬间突变时，这里依然会以 0.05 的速度平滑追击！
    currentPos.current.lerp(targetPos, 0.02)
    currentLookAt.current.lerp(targetLookAt, 0.02)

    camera.position.copy(currentPos.current)
    camera.lookAt(currentLookAt.current)
  })

  return null
}

export function ScrollBackground() {
  const [mounted, setMounted] = useState(false)
  const [fixedHeight, setFixedHeight] = useState("100vh")
  const [isMobile, setIsMobile] = useState(false)
  const [uiProgress, setUiProgress] = useState(0)
  
  // 🚀 新增：控制当前剧本状态
  const [scriptIndex, setScriptIndex] = useState(0)
  const scrollProgressRef = useRef(0)

  useEffect(() => {
    setMounted(true)
    let lastWidth = window.innerWidth
    const lockHeight = () => {
      setFixedHeight(`${window.innerHeight}px`)
      const isSmallScreen = window.innerWidth <= 1366;
      const isTouchDevice = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;
      const isMacPad = /Macintosh/i.test(navigator.userAgent) && isTouchDevice;
      setIsMobile((isSmallScreen && isTouchDevice) || isMacPad);
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
    <>
      {/* 🚀 新增：传送到最上层 (z-[100]) 的时空切换按钮 */}
      {createPortal(
        <div className="fixed top-8 left-8 z-[100]">
          <button
            onClick={() => setScriptIndex((prev) => (prev + 1) % SCRIPTS.length)}
            className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
          >
            {/* 炫酷的动态指示灯 */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-white/10 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-zinc-400 transition-colors">
                Spacetime Shift
              </span>
              <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
                {SCRIPT_NAMES[scriptIndex]}
              </span>
            </div>
          </button>
        </div>,
        document.body
      )}

      {/* 3D 背景层 */}
      <div 
        className="fixed z-[-1] overflow-hidden"
        style={{ top: 0, left: 0, width: '100vw', height: fixedHeight, backgroundColor: '#020205' }}
      >
        <div 
          className="absolute inset-0 z-10 pointer-events-none transition-all duration-150 ease-linear"
          style={{
            backdropFilter: `blur(${Math.max(0, 7 * (1 - uiProgress * 4))}px)`,
            background: `radial-gradient(circle at center, rgba(2, 2, 5, ${0.3 * (1 - uiProgress)}) 0%, rgba(2, 2, 5, ${0.7 + uiProgress * 0.3}) 100%)`
          }}
        />

        <div className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-overlay" style={NOISE_STYLE} />
        
        <Canvas camera={{ position: [0, 150, 180], fov: 75, near: 1, far: 20000 }} dpr={isMobile ? 1 : [1, 1.5]} gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}>
          <color attach="background" args={["#010103"]} />
          <fog attach="fog" args={["#010103", 8000, 18000]} /> 
          <ambientLight intensity={4.5} color="#ffffff" />
          <directionalLight position={[50, 20, 30]} intensity={2.0} color="#ffffff" />

          <RealisticEarth scrollProgressRef={scrollProgressRef} />
          <MilkyWay count={isMobile ? 90000 : 130000} scrollProgressRef={scrollProgressRef} isMobile={isMobile} />
          
          {/* 将 scriptIndex 传入镜头导演 */}
          <CameraController scrollProgressRef={scrollProgressRef} scriptIndex={scriptIndex} />
        </Canvas>
      </div>
    </>
  )
}