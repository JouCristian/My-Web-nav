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

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 200,
  stackDistance = 25,
  stackPosition = 0.2,
  baseScale = 0.8,
  rotationAmount = 0.7,
  blurAmount = 0.5,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLElement[]>([])
  const [isReady, setIsReady] = useState(false)
  const rafRef = useRef<number | null>(null)

  const updateCards = useCallback(() => {
    const scroller = scrollerRef.current
    if (!scroller || !cardsRef.current.length) return

    const scrollTop = scroller.scrollTop
    const containerHeight = scroller.clientHeight
    const stackPositionPx = containerHeight * stackPosition

    cardsRef.current.forEach((card, i) => {
      if (!card) return

      const cardTop = card.offsetTop
      const triggerStart = cardTop - stackPositionPx - stackDistance * i
      const triggerEnd = cardTop - containerHeight * 0.1
      
      // Calculate scale progress
      let scaleProgress = 0
      if (scrollTop >= triggerStart && scrollTop <= triggerEnd) {
        scaleProgress = (scrollTop - triggerStart) / (triggerEnd - triggerStart)
      } else if (scrollTop > triggerEnd) {
        scaleProgress = 1
      }
      
      const targetScale = baseScale + i * 0.03
      const scale = 1 - scaleProgress * (1 - targetScale)
      const rotation = rotationAmount * i * scaleProgress
      
      // Calculate blur based on depth
      let blur = 0
      if (blurAmount > 0) {
        let topCardIndex = 0
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = cardsRef.current[j].offsetTop
          const jTriggerStart = jCardTop - stackPositionPx - stackDistance * j
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j
          }
        }
        if (i < topCardIndex) {
          blur = (topCardIndex - i) * blurAmount
        }
      }

      // Calculate sticky position
      let translateY = 0
      const pinStart = cardTop - stackPositionPx - stackDistance * i
      const lastCard = cardsRef.current[cardsRef.current.length - 1]
      const pinEnd = lastCard ? lastCard.offsetTop - containerHeight * 0.3 : pinStart + 500

      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPositionPx + stackDistance * i
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + stackDistance * i
      }

      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`
      card.style.filter = blur > 0 ? `blur(${blur}px)` : ''
      card.style.zIndex = String(cardsRef.current.length - i)
      
      // Check if stack is complete (last card is in view)
      if (i === cardsRef.current.length - 1 && scrollTop >= pinStart) {
        onStackComplete?.()
      }
    })
  }, [stackPosition, stackDistance, baseScale, rotationAmount, blurAmount, onStackComplete])

  const handleScroll = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }
    rafRef.current = requestAnimationFrame(updateCards)
  }, [updateCards])

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return

    // Get all card elements
    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card')) as HTMLElement[]
    cardsRef.current = cards

    // Set initial margin between cards
    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`
      }
      card.style.willChange = 'transform, filter'
      card.style.transformOrigin = 'top center'
    })

    setIsReady(true)
    
    // Initial update
    updateCards()

    // Add scroll listener
    scroller.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      scroller.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [itemDistance, handleScroll, updateCards])

  return (
    <div 
      ref={scrollerRef} 
      className={`scroll-stack-scroller ${className}`.trim()}
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
