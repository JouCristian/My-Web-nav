"use client"

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
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { stiffness: 150, damping: 15, mass: 0.1 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const mouseX = e.clientX - centerX
    const mouseY = e.clientY - centerY

    const rotateX = (mouseY / (rect.height / 2)) * -rotateAmplitude
    const rotateY = (mouseX / (rect.width / 2)) * rotateAmplitude

    x.set(rotateX)
    y.set(rotateY)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  return (
    <div
      style={{
        height: containerHeight,
        width: containerWidth,
        perspective: "1000px",
      }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: xSpring,
          rotateY: ySpring,
          scale: isHovered ? scaleOnHover : 1,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full rounded-2xl overflow-hidden cursor-pointer"
      >
        <img
          src={imageSrc}
          alt={altText}
          style={{
            height: imageHeight,
            width: imageWidth,
          }}
          className="object-cover rounded-2xl"
        />

        {displayOverlayContent && overlayContent && (
          <div className="absolute inset-0 flex items-center justify-center">
            {overlayContent}
          </div>
        )}

        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm whitespace-nowrap"
          >
            {altText}
          </motion.div>
        )}
      </motion.div>

      {showMobileWarning && (
        <p className="text-center text-xs text-zinc-500 mt-2 lg:hidden">
          在桌面端查看以获得最佳交互体验
        </p>
      )}
    </div>
  )
}
