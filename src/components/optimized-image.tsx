'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedAvatarProps {
  src: string | null | undefined
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackText?: string
}

const sizeMap = {
  sm: { px: 32, class: 'w-8 h-8' },
  md: { px: 40, class: 'w-10 h-10' },
  lg: { px: 64, class: 'w-16 h-16' },
  xl: { px: 96, class: 'w-24 h-24' },
}

/**
 * 优化的头像组件
 * - 使用 next/image 自动优化格式和尺寸
 * - 内置加载失败回退
 * - 懒加载提升性能
 */
export function OptimizedAvatar({ 
  src, 
  alt, 
  size = 'md', 
  className = '',
  fallbackText
}: OptimizedAvatarProps) {
  const [error, setError] = useState(false)
  const { px, class: sizeClass } = sizeMap[size]

  // 无有效 src 或加载失败时显示 fallback
  if (!src || error) {
    const initial = fallbackText?.charAt(0)?.toUpperCase() || alt.charAt(0)?.toUpperCase() || '?'
    return (
      <div 
        className={`${sizeClass} ${className} rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-zinc-400 font-medium`}
        style={{ fontSize: px * 0.4 }}
      >
        {initial}
      </div>
    )
  }

  // 检测是否为外部图片（需要通过 next/image remotePatterns）
  const isExternal = src.startsWith('http://') || src.startsWith('https://')

  return (
    <div className={`${sizeClass} ${className} relative rounded-full overflow-hidden bg-zinc-800`}>
      <Image
        src={src}
        alt={alt}
        width={px}
        height={px}
        className="object-cover w-full h-full"
        onError={() => setError(true)}
        loading="lazy"
        // 外部图片使用 unoptimized 避免配置问题，本地图片使用优化
        unoptimized={isExternal && !src.includes('githubusercontent.com') && !src.includes('googleusercontent.com') && !src.includes('blob.vercel-storage.com')}
      />
    </div>
  )
}

interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  priority?: boolean
  quality?: number
}

/**
 * 通用优化图片组件
 * - 自动格式转换 (AVIF/WebP)
 * - 响应式尺寸
 * - 懒加载
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 85
}: OptimizedImageProps) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div 
        className={`${className} bg-zinc-800 flex items-center justify-center text-zinc-500`}
        style={{ width, height }}
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const isExternal = src.startsWith('http://') || src.startsWith('https://')

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      quality={quality}
      unoptimized={isExternal && !src.includes('blob.vercel-storage.com')}
    />
  )
}
