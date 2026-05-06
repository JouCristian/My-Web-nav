"use client"

import type { SpringOptions } from "motion/react"
import { useRef, useState } from "react"
import { motion, useMotionValue, useSpring } from "motion/react"

interface TiltedCardProps {
  imageSrc: string
  altText?: string
  containerHeight?: string
  containerWidth?: string
  imageHeight?: string
  imageWidth?: string
  scaleOnHover?: number
  rotateAmplitude?: number
  showMobileWarning?: boolean
  showTooltip?: boolean
  overlayContent?: React.ReactNode
  displayOverlayContent?: boolean
}

// 官方推荐的 spring 配置 - 更加平滑线性
const springValues: SpringOptions = {
  damping: 30,
  stiffness: 100,
  mass: 2
}

export default function TiltedCard({
  imageSrc,
  altText = "Tilted card image",
  containerHeight = "300px",
  containerWidth = "300px",
  imageHeight = "300px",
  imageWidth = "300px",
  scaleOnHover = 1.1,
  rotateAmplitude = 14,
  showMobileWarning = false,
  showTooltip = false,
  overlayContent,
  displayOverlayContent = false,
}: TiltedCardProps) {
  const ref = useRef<HTMLElement>(null)
  const [lastY, setLastY] = useState(0)

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), springValues)
  const rotateY = useSpring(useMotionValue(0), springValues)
  const scale = useSpring(1, springValues)
  const opacity = useSpring(0)
  const rotateFigcaption = useSpring(0, {
    stiffness: 350,
    damping: 30,
    mass: 1
  })

  function handleMouse(e: React.MouseEvent<HTMLElement>) {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const offsetX = e.clientX - rect.left - rect.width / 2
    const offsetY = e.clientY - rect.top - rect.height / 2

    const rotationX = (offsetY / (rect.height / 2)) * -rotateAmplitude
    const rotationY = (offsetX / (rect.width / 2)) * rotateAmplitude

    rotateX.set(rotationX)
    rotateY.set(rotationY)

    x.set(e.clientX - rect.left)
    y.set(e.clientY - rect.top)

    const velocityY = offsetY - lastY
    rotateFigcaption.set(-velocityY * 0.6)
    setLastY(offsetY)
  }

  function handleMouseEnter() {
    scale.set(scaleOnHover)
    opacity.set(1)
  }

  function handleMouseLeave() {
    opacity.set(0)
    scale.set(1)
    rotateX.set(0)
    rotateY.set(0)
    rotateFigcaption.set(0)
  }

  return (
    <figure
      ref={ref}
      className="relative flex flex-col items-center justify-center"
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: "800px"
      }}
      onMouseMove={handleMouse}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {showMobileWarning && (
        <div className="absolute top-4 text-center text-xs text-zinc-500 sm:hidden">
          在桌面端查看以获得最佳交互体验
        </div>
      )}

      <motion.div
        className="relative"
        style={{
          width: imageWidth,
          height: imageHeight,
          rotateX,
          rotateY,
          scale,
          transformStyle: "preserve-3d"
        }}
      >
        <motion.img
          src={imageSrc}
          alt={altText}
          className="absolute top-0 left-0 object-cover rounded-2xl will-change-transform"
          style={{
            width: imageWidth,
            height: imageHeight,
            transform: "translateZ(0)"
          }}
        />

        {displayOverlayContent && overlayContent && (
          <motion.div 
            className="absolute top-0 left-0 z-10 will-change-transform"
            style={{ transform: "translateZ(30px)" }}
          >
            {overlayContent}
          </motion.div>
        )}
      </motion.div>

      {showTooltip && (
        <motion.figcaption
          className="pointer-events-none absolute left-0 top-0 rounded bg-white px-2.5 py-1 text-[10px] text-zinc-800 z-20"
          style={{
            x,
            y,
            opacity,
            rotate: rotateFigcaption
          }}
        >
          {altText}
        </motion.figcaption>
      )}
    </figure>
  )
}
