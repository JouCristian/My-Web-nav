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
const spring = (current: number, target: number, velocity: number, stiffness = 0.1, damping = 0.8) => {
  const force = (target - current) * stiffness
  const newVelocity = (velocity + force) * damping
  const newValue = current + newVelocity
  return { value: newValue, velocity: newVelocity }
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 120,
  stackDistance = 12,
  stackPosition = 0.08,
  baseScale = 0.92,
  rotationAmount = 0.3,
  blurAmount = 0.6,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const [isReady, setIsReady] = useState(false)
  const rafRef = useRef<number | null>(null)
  const completedRef = useRef(false)
  
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
    const totalCards = cardsRef.current.length

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

      const cardTop = card.offsetTop - scrollTop
      const distanceFromStack = cardTop - stackPositionPx
      
      // Target values
      let targetScale = 1
      let targetTranslateY = 0
      let targetRotate = 0
      let targetBlur = 0
      let zIndex = totalCards - i // Default: earlier cards have higher z-index

      // When card reaches stack position
      if (distanceFromStack <= 0) {
        // Count how many cards are stacked above this one
        const stackedAbove = cardsRef.current.filter((c, j) => {
          if (j <= i || !c) return false
          const otherTop = c.offsetTop - scrollTop
          return otherTop - stackPositionPx <= 0
        }).length

        // This card is being stacked - lock to position with offset
        targetTranslateY = -distanceFromStack
        
        // Scale down based on how many cards are stacked on top
        targetScale = Math.max(baseScale, 1 - stackedAbove * (1 - baseScale) * 0.5)
        
        // Slight backward rotation for depth
        targetRotate = -stackedAbove * rotationAmount
        
        // Blur cards that have others stacked on top
        targetBlur = stackedAbove * blurAmount

        // Cards that reach stack position go to back (lower z-index)
        zIndex = i
      } else {
        // Card hasn't reached stack yet - it should be on top
        zIndex = totalCards + i
      }

      // Apply spring physics
      const state = springStatesRef.current[i]
      const newScale = spring(state.scale.value, targetScale, state.scale.velocity, 0.12, 0.75)
      const newTranslateY = spring(state.translateY.value, targetTranslateY, state.translateY.velocity, 0.15, 0.72)
      const newRotate = spring(state.rotate.value, targetRotate, state.rotate.velocity, 0.1, 0.8)
      const newBlur = spring(state.blur.value, targetBlur, state.blur.velocity, 0.1, 0.8)

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
      card.style.filter = newBlur.value > 0.1 ? `blur(${newBlur.value}px)` : 'none'
      card.style.zIndex = String(zIndex)
    })

    // Check if last card is visible
    const lastCard = cardsRef.current[totalCards - 1]
    if (lastCard && !completedRef.current) {
      const lastCardTop = lastCard.offsetTop - scrollTop
      if (lastCardTop <= containerHeight * 0.6) {
        completedRef.current = true
        onStackComplete?.()
      }
    }

    // Continue animation loop
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

  // Animation loop
  useEffect(() => {
    if (!isReady) return
    
    const animate = () => {
      updateCards()
      rafRef.current = requestAnimationFrame(animate)
    }
    
    rafRef.current = requestAnimationFrame(animate)
    
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
      card.style.zIndex = String(cards.length - i)
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }
    })

    setIsReady(true)

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
