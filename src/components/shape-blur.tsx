"use client"

import { useRef, useEffect, useMemo } from "react"
import * as THREE from "three"

interface ShapeBlurProps {
  variation?: number
  shapeSize?: number
  roundness?: number
  borderSize?: number
  circleSize?: number
  circleEdge?: number
  className?: string
}

export default function ShapeBlur({
  variation = 0,
  shapeSize = 1,
  roundness = 0.5,
  borderSize = 0.05,
  circleSize = 0.5,
  circleEdge = 1,
  className,
}: ShapeBlurProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const materialRef = useRef<THREE.ShaderMaterial | null>(null)
  const animationRef = useRef<number | null>(null)

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const fragmentShader = useMemo(() => `
    uniform float uTime;
    uniform float uVariation;
    uniform float uShapeSize;
    uniform float uRoundness;
    uniform float uBorderSize;
    uniform float uCircleSize;
    uniform float uCircleEdge;
    uniform vec2 uResolution;
    varying vec2 vUv;

    vec3 palette(float t) {
      vec3 a = vec3(0.5, 0.5, 0.5);
      vec3 b = vec3(0.5, 0.5, 0.5);
      vec3 c = vec3(1.0, 1.0, 1.0);
      vec3 d = vec3(0.263, 0.416, 0.557);
      return a + b * cos(6.28318 * (c * t + d));
    }

    float sdRoundedBox(vec2 p, vec2 b, float r) {
      vec2 q = abs(p) - b + r;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
      
      float angle = uTime * 0.3 + uVariation;
      mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      uv *= rot;

      float d = sdRoundedBox(uv, vec2(uShapeSize), uRoundness);
      
      vec3 color = palette(d * 0.5 + uTime * 0.2);
      
      float alpha = 1.0 - smoothstep(0.0, uBorderSize, abs(d));
      alpha += smoothstep(uCircleSize, uCircleSize * uCircleEdge, length(uv)) * 0.3;
      
      gl_FragColor = vec4(color * alpha, alpha * 0.8);
    }
  `, [])

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Setup
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10)
    camera.position.z = 1
    cameraRef.current = camera

    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "low-power"
    })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uVariation: { value: variation },
        uShapeSize: { value: shapeSize },
        uRoundness: { value: roundness },
        uBorderSize: { value: borderSize },
        uCircleSize: { value: circleSize },
        uCircleEdge: { value: circleEdge },
        uResolution: { value: new THREE.Vector2(width, height) },
      },
      transparent: true,
    })
    materialRef.current = material

    const geometry = new THREE.PlaneGeometry(2, 2)
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    // Animation
    const animate = () => {
      if (materialRef.current) {
        materialRef.current.uniforms.uTime.value += 0.01
      }
      renderer.render(scene, camera)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth
      const newHeight = container.clientHeight
      renderer.setSize(newWidth, newHeight)
      if (materialRef.current) {
        materialRef.current.uniforms.uResolution.value.set(newWidth, newHeight)
      }
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      container.removeChild(renderer.domElement)
    }
  }, [fragmentShader, variation, shapeSize, roundness, borderSize, circleSize, circleEdge])

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full ${className || ""}`}
    />
  )
}
