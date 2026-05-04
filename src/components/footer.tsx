'use client'

import { useRef, useState, useEffect, Children, cloneElement } from 'react'
import { motion, MotionValue, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import GlassSurface from './GlassSurface'

// 社交链接配置
const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: 'https://github.com/JouCristian',
    color: '#ffffff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    name: 'X',
    url: 'https://x.com/joubuhr?s=21',
    color: '#ffffff',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/joucristian869?igsh=MWNseWltc2tjbWF0Yw%3D%3D&utm_source=qr',
    color: '#E4405F',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@%E9%82%B9%E4%BF%8A%E6%AF%85',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'Bilibili',
    url: 'https://b23.tv/Px7T9bI',
    color: '#00A1D6',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/>
      </svg>
    ),
  },
  {
    name: 'Gitee',
    url: 'https://gitee.com/joujous',
    color: '#C71D23',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
      </svg>
    ),
  },
  {
    name: '小红书',
    url: 'https://xhslink.com/m/5MoeGYOxt4h',
    color: '#FE2C55',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14.5h-7a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2.5v-4H9a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 .5-.5h2.5V7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1.5H15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1.5v4h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5z"/>
      </svg>
    ),
  },
  {
    name: '网易云音乐',
    url: 'https://y.music.163.com/m/user?id=318147072&dlt=0846&app_version=9.5.05',
    color: '#C20C0C',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>
      </svg>
    ),
  },
]

// Dock 配置
const DOCK_CONFIG = {
  baseSize: 52,
  magnification: 72,
  distance: 140,
  spring: { mass: 0.1, stiffness: 150, damping: 12 }
}

// 单个 Dock 图标项
function DockSocialItem({ 
  link, 
  mouseX 
}: { 
  link: typeof SOCIAL_LINKS[0]
  mouseX: MotionValue<number>
}) {
  const ref = useRef<HTMLAnchorElement>(null)
  const isHovered = useMotionValue(0)
  const [showLabel, setShowLabel] = useState(false)

  // 缓存 ref 的位置，避免频繁读取 DOM 导致抖动
  const [center, setCenter] = useState(0)
  
  useEffect(() => {
    const updateCenter = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        setCenter(rect.x + rect.width / 2)
      }
    }
    updateCenter()
    window.addEventListener('resize', updateCenter)
    return () => window.removeEventListener('resize', updateCenter)
  }, [])

  // 计算鼠标与图标中心的距离
  const mouseDistance = useTransform(mouseX, val => val - center)

  // 根据距离计算放大尺寸
  const targetSize = useTransform(
    mouseDistance, 
    [-DOCK_CONFIG.distance, 0, DOCK_CONFIG.distance], 
    [DOCK_CONFIG.baseSize, DOCK_CONFIG.magnification, DOCK_CONFIG.baseSize]
  )
  const size = useSpring(targetSize, DOCK_CONFIG.spring)

  // 监听 hover 状态显示 label
  useEffect(() => {
    const unsubscribe = isHovered.on('change', latest => {
      setShowLabel(latest === 1)
    })
    return () => unsubscribe()
  }, [isHovered])

  return (
    <motion.a
      ref={ref}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ width: size, height: size }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      className="relative flex items-end justify-center"
      aria-label={`Visit ${link.name}`}
    >
      {/* Tooltip Label */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-sm border border-white/10 whitespace-nowrap z-20"
          >
            <span 
              className="text-[11px] font-medium"
              style={{ color: link.color }}
            >
              {link.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glass Icon Container */}
      <motion.div 
        className="w-full h-full"
        style={{
          filter: showLabel ? `drop-shadow(0 0 12px ${link.color}50)` : 'none',
        }}
      >
        <GlassSurface
          width="100%"
          height="100%"
          borderRadius={16}
          brightness={showLabel ? 140 : 120}
          opacity={0.4}
          blur={20}
          displace={1.2}
          mixBlendMode="normal"
          backgroundOpacity={showLabel ? 0.18 : 0.12}
        >
          <div 
            className="w-full h-full flex items-center justify-center"
            style={{
              boxShadow: showLabel ? `inset 0 0 16px ${link.color}20` : 'none',
              borderRadius: '16px',
            }}
          >
            <motion.div 
              className="w-[45%] h-[45%]"
              style={{ 
                color: showLabel ? link.color : 'rgba(161, 161, 170, 1)',
              }}
              animate={{
                color: showLabel ? link.color : 'rgba(161, 161, 170, 1)',
              }}
              transition={{ duration: 0.2 }}
            >
              {link.icon}
            </motion.div>
          </div>
        </GlassSurface>
      </motion.div>
    </motion.a>
  )
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const mouseX = useMotionValue(Infinity)

  // 滚动时重置鼠标位置，避免图标卡在放大状态
  useEffect(() => {
    const handleScroll = () => mouseX.set(Infinity)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [mouseX])

  return (
    <footer className="relative w-full mt-24 pb-8">
      {/* 顶部分割线 */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-white/20 text-xs font-mono tracking-widest">CONNECT</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-6">
        <div className="flex flex-col items-center gap-4">
          
          {/* Section Title */}
          <div className="text-center">
            <h3 className="text-sm font-medium text-zinc-400 tracking-wider mb-1">
              Follow My Journey
            </h3>
            <p className="text-xs text-zinc-600">
              Connect with me on social media
            </p>
          </div>

          {/* Dock Style Social Links - 无底座，底部对齐防止偏移 */}
          <div 
            className="flex items-end justify-center gap-3 sm:gap-4 h-[72px]"
            onMouseMove={(e) => mouseX.set(e.clientX)}
            onMouseLeave={() => mouseX.set(Infinity)}
          >
            {SOCIAL_LINKS.map((link) => (
              <DockSocialItem 
                key={link.name} 
                link={link} 
                mouseX={mouseX}
              />
            ))}
          </div>

          {/* 底部分割装饰 */}
          <div className="flex items-center gap-3 w-full max-w-[200px] mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
            <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* 版权信息 */}
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="text-zinc-500 text-sm">
              <span className="text-zinc-400 font-medium">西科星际舰队</span>
              <span className="mx-2.5 text-zinc-700">|</span>
              <span className="font-[family-name:var(--font-space)] tracking-wider text-zinc-600 text-xs">XIKE STARFLEET</span>
            </p>
            <p className="text-zinc-700 text-[11px] font-mono">
              &copy; {currentYear} All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
