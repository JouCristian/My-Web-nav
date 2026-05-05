"use client"

import React, { useEffect, useRef, useCallback, useState } from 'react'
import type { ReactNode } from 'react'

export interface ScrollStackItemProps {
  children: ReactNode
  className?: string
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, className = '' }) => (
  <div className={`scroll-stack-card ${className}`.trim()}>{children}</div>
)

interface ScrollStackProps {
  className?: string
  children: ReactNode
  itemDistance?: number
  stackDistance?: number
  stackPosition?: number
  baseScale?: number
  rotationAmount?: number
  blurAmount?: number
  onStackComplete?: () => void
}

// Spring physics for smooth animation
const spring = (current: number, target: number, velocity: number, stiffness = 0.08, damping = 0.85) => {
  const force = (target - current) * stiffness
  const newVelocity = (velocity + force) * damping
  const newValue = current + newVelocity
  return { value: newValue, velocity: newVelocity }
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 60,
  stackDistance = 20,
  stackPosition = 0.15,
  baseScale = 0.92,
  rotationAmount = 0.5,
  blurAmount = 0.8,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const [isReady, setIsReady] = useState(false)
  const rafRef = useRef<number | null>(null)
  
  // Spring state for each card
  const springStatesRef = useRef<{
    scale: { value: number; velocity: number }
    translateY: { value: number; velocity: number }
    rotate: { value: number; velocity: number }
    blur: { value: number; velocity: number }
  }[]>([])

  const updateCards = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller || !cardsRef.current.length) return

    const scrollTop = scroller.scrollTop
    const containerHeight = scroller.clientHeight
    const stackPositionPx = containerHeight * stackPosition

    let needsAnotherFrame = false

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      // Initialize spring state if not exists
      if (!springStatesRef.current[i]) {
        springStatesRef.current[i] = {
          scale: { value: 1, velocity: 0 },
          translateY: { value: 0, velocity: 0 },
          rotate: { value: 0, velocity: 0 },
          blur: { value: 0, velocity: 0 }
        }
      }

      const cardRect = card.getBoundingClientRect()
      const cardTopRelative = card.offsetTop - scrollTop
      
      // Calculate how far the card is from the stack position
      const distanceFromStack = cardTopRelative - stackPositionPx
      
      // Target values
      let targetScale = 1
      let targetTranslateY = 0
      let targetRotate = 0
      let targetBlur = 0

      // When card reaches stack position, it sticks and scales down
      if (distanceFromStack <= 0) {
        // Card is at or past the stack position - stick it
        const stackIndex = cardsRef.current.filter((_, j) => {
          const jTop = cardsRef.current[j].offsetTop - scrollTop
          return jTop - stackPositionPx <= 0 && j < i
        }).length

        // Stick to stack position with offset for each stacked card
        targetTranslateY = -distanceFromStack + stackIndex * stackDistance
        
        // Scale down based on stack depth
        const depthRatio = Math.min(1, Math.abs(distanceFromStack) / (containerHeight * 0.5))
        targetScale = 1 - depthRatio * (1 - baseScale)
        
        // Slight rotation for depth effect
        targetRotate = stackIndex * rotationAmount
        
        // Blur cards that are deeper in the stack
        if (stackIndex > 0) {
          targetBlur = stackIndex * blurAmount
        }
      }

      // Apply spring physics
      const state = springStatesRef.current[i]
      const newScale = spring(state.scale.value, targetScale, state.scale.velocity)
      const newTranslateY = spring(state.translateY.value, targetTranslateY, state.translateY.velocity, 0.12, 0.8)
      const newRotate = spring(state.rotate.value, targetRotate, state.rotate.velocity)
      const newBlur = spring(state.blur.value, targetBlur, state.blur.velocity)

      state.scale = newScale
      state.translateY = newTranslateY
      state.rotate = newRotate
      state.blur = newBlur

      // Check if animation needs to continue
      const threshold = 0.01
      if (
        Math.abs(newScale.velocity) > threshold ||
        Math.abs(newTranslateY.velocity) > threshold ||
        Math.abs(newRotate.velocity) > threshold ||
        Math.abs(newBlur.velocity) > threshold
      ) {
        needsAnotherFrame = true
      }

      // Apply transforms
      card.style.transform = `translate3d(0, ${newTranslateY.value}px, 0) scale(${newScale.value}) rotate(${newRotate.value}deg)`
      card.style.filter = newBlur.value > 0.1 ? `blur(${newBlur.value}px)` : ''
      
      // Z-index: cards that are more "stuck" should be on top
      const isStuck = distanceFromStack <= 0
      card.style.zIndex = isStuck ? String(100 + i) : String(50 - i)
    })

    // Check if last card is in view for completion callback
    const lastCard = cardsRef.current[cardsRef.current.length - 1]
    if (lastCard) {
      const lastCardTop = lastCard.offsetTop - scrollTop
      if (lastCardTop <= stackPositionPx + containerHeight * 0.5) {
        onStackComplete?.()
      }
    }

    // Continue animation if needed
    if (needsAnotherFrame) {
      rafRef.current = requestAnimationFrame(updateCards)
    }
  }, [stackPosition, stackDistance, baseScale, rotationAmount, blurAmount, onStackComplete])

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(updateCards)
  }, [updateCards])

  // Animation loop for spring physics
  useEffect(() => {
    const animate = () => {
      updateCards()
      rafRef.current = requestAnimationFrame(animate)
    }
    
    if (isReady) {
      rafRef.current = requestAnimationFrame(animate)
    }
    
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [isReady, updateCards])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    // Get all card elements
    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card')) as HTMLElement[]
    cardsRef.current = cards

    // Initialize spring states
    springStatesRef.current = cards.map(() => ({
      scale: { value: 1, velocity: 0 },
      translateY: { value: 0, velocity: 0 },
      rotate: { value: 0, velocity: 0 },
      blur: { value: 0, velocity: 0 }
    }))

    // Set initial styles
    cards.forEach((card, i) => {
      card.style.position = 'relative'
      card.style.willChange = 'transform, filter'
      card.style.transformOrigin = 'top center'
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }
    })

    setIsReady(true)

    // Add scroll listener
    scroller.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scroller.removeEventListener('scroll', handleScroll)
    }
  }, [itemDistance, handleScroll])

  return (
    <div 
      ref={scrollerRef} 
      className={`scroll-stack-scroller custom-scrollbar ${className}`.trim()}
      style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.3s' }}
    >
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  )
}

export default ScrollStack
