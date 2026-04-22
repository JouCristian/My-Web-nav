"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

// 1. 将噪点样式提取到组件外部，避免 React 每次滚动重新渲染时创建新对象
const NOISE_STYLE: React.CSSProperties = {
  // 使用 Base64 内联 SVG：彻底干掉网络请求，做到随页面瞬间加载
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
  filter: 'contrast(150%) brightness(100%)',
  // 开启 GPU 硬件加速，防止滚动时引发整个页面的重绘 (Repaint)
  transform: 'translateZ(0)',
};

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
          vec3 glowColor = vec3(1.0, 1.0, 1.0); 
          gl_FragColor = vec4(glowColor * intensity * 1.5 * uFade, 1.0);
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
// 🎥 镜头导演：多重关键帧 + 阻尼滑动的相机控制
// ==========================================
function CameraController({ scrollProgressRef }: { scrollProgressRef: React.MutableRefObject<number> }) {
  const { camera } = useThree()
  
  // 使用 useRef 存储当前的相机位置和观测点，用于计算阻尼缓冲
  const currentPos = useRef(new THREE.Vector3(0, 150, 3500))
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))

  // 🎬 定义镜头关键帧剧本 (可自由增删修改)
  const keyframes = useMemo(() => [
    { 
      progress: 0.0, // 滚动 0%
      pos: new THREE.Vector3(0, 150, 3500),   // 远景平视，看全貌
      lookAt: new THREE.Vector3(0, 0, 0) 
    },
    { 
      progress: 0.35, // 滚动 35%
      pos: new THREE.Vector3(1200, 300, 1800), // 侧推：向右侧拉近，带一点点高度
      lookAt: new THREE.Vector3(0, 0, 0)       // 依然死死盯住地球
    },
    { 
      progress: 0.65, // 滚动 65%
      pos: new THREE.Vector3(-600, 1200, 800), // 越过头顶：向左上方拉起
      lookAt: new THREE.Vector3(0, 50, -200)   // 视线稍微往地球后方（银河深处）看
    },
    { 
      progress: 1.0, // 滚动 100%
      pos: new THREE.Vector3(0, 2000, 1700),    // 上帝视角：正上方俯视
      lookAt: new THREE.Vector3(0, 0, 0) 
    }
  ], [])

  useFrame((state, delta) => {
    const progress = scrollProgressRef.current

    // 1. 🔍 寻找当前滚动进度所处的“关键帧区间”
    let startIndex = 0
    for (let i = 0; i < keyframes.length - 1; i++) {
      if (progress >= keyframes[i].progress) {
        startIndex = i
      }
    }
    const endIndex = Math.min(startIndex + 1, keyframes.length - 1)
    
    const startFrame = keyframes[startIndex]
    const endFrame = keyframes[endIndex]

    // 2. 🧮 计算在这个局部区间内的进度百分比 (0 ~ 1)
    let localProgress = 0
    if (endFrame.progress > startFrame.progress) {
      localProgress = (progress - startFrame.progress) / (endFrame.progress - startFrame.progress)
    }

    // （可选）给局部进度加一个缓动曲线，让分段的衔接更自然
    const easeProgress = localProgress < 0.5 
      ? 2 * localProgress * localProgress 
      : 1 - Math.pow(-2 * localProgress + 2, 2) / 2

    // 3. 🎯 计算当前这一帧“应该到达”的目标位置和目标观测点
    const targetPos = new THREE.Vector3().lerpVectors(startFrame.pos, endFrame.pos, Math.max(0, Math.min(1, easeProgress)))
    const targetLookAt = new THREE.Vector3().lerpVectors(startFrame.lookAt, endFrame.lookAt, Math.max(0, Math.min(1, easeProgress)))

    // 4. 🪶 应用阻尼 (Damping)，让相机像有惯性一样平滑跟随目标
    // 0.05 是阻尼系数，值越小相机感觉越重、越平滑；值越大跟随越紧密
    currentPos.current.lerp(targetPos, 0.05)
    currentLookAt.current.lerp(targetLookAt, 0.05)

    // 5. 📷 赋予相机最终状态
    camera.position.copy(currentPos.current)
    camera.lookAt(currentLookAt.current)
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
      
      // 1. 判断屏幕是否小于等于 1366px (包含所有手机、平板以及 12.9寸 iPad Pro 横屏)
      const isSmallScreen = window.innerWidth <= 1366;
      
      // 2. 判断设备是否有触摸屏 (笔记本电脑通常没有，以此来区分大屏平板和小屏电脑)
      const isTouchDevice = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;
      
      // 3. 苹果专属补丁：现在的 iPad 会把自己伪装成 Mac，但 Mac 没有触摸屏，如果有触摸屏的 Mac，那就是 iPad！
      const isMacPad = /Macintosh/i.test(navigator.userAgent) && isTouchDevice;

      // 最终判定：如果是小屏设备且是触摸屏，或者强行抓到了 iPad，就进入手机端降级模式
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
          backdropFilter: `blur(${Math.max(0, 7 * (1 - uiProgress * 4))}px)`,
          background: `radial-gradient(circle at center, 
            rgba(2, 2, 5, ${0.3 * (1 - uiProgress)}) 0%, 
            rgba(2, 2, 5, ${0.7 + uiProgress * 0.3}) 100%)`
        }}
      />

      {/* 🚀 高级感噪点层 (性能优化版) */}
      <div 
          className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={NOISE_STYLE}
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