"use client"

import { useState } from "react"
import GlassSurface from "./GlassSurface"

// SVG 图标组件 - 添加动画支持
function BookmarkIcon({ className, isHovered }: { className?: string; isHovered?: boolean }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        transform: isHovered ? 'scale(1.15) rotate(-8deg)' : 'scale(1) rotate(0deg)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function VisitIcon({ className, isHovered }: { className?: string; isHovered?: boolean }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        transform: isHovered ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle 
        cx="12" 
        cy="12" 
        r="3"
        style={{
          transform: isHovered ? 'scale(1.3)' : 'scale(1)',
          transformOrigin: 'center',
          transition: 'transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1) 0.05s'
        }}
      />
    </svg>
  )
}

function CrewIcon({ className, isHovered }: { className?: string; isHovered?: boolean }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      style={{
        transform: isHovered ? 'scale(1.1) translateY(-2px)' : 'scale(1) translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

interface StatCardProps {
  icon: (props: { className?: string; isHovered?: boolean }) => React.ReactNode
  label: string
  value: number | string
  accentColor: string
}

function StatCard({ icon: Icon, label, value, accentColor }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="relative will-change-transform"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // Apple 风格贝塞尔曲线
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)',
        // 保持高光可见 - 不被裁剪
        zIndex: isHovered ? 10 : 1
      }}
    >
      <GlassSurface
        width="auto"
        height="auto"
        borderRadius={24}
        brightness={120}
        opacity={0.4}
        blur={20}
        displace={1.2}
        mixBlendMode="normal"
        backgroundOpacity={0.12}
        className="min-w-[180px] overflow-visible"
      >
        <div className="flex items-center gap-5 px-6 py-5">
          {/* 图标容器 */}
          <div className="shrink-0 w-12 h-12 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center overflow-visible">
            <div className={`w-6 h-6 ${accentColor}`}>
              <Icon className="w-full h-full" isHovered={isHovered} />
            </div>
          </div>
          
          {/* 文字内容 */}
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
            <span className={`text-3xl font-bold ${accentColor} font-[family-name:var(--font-space)] tracking-wide`}>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          </div>
        </div>
      </GlassSurface>
    </div>
  )
}

interface StatsData {
  bookmarkCount: number
  todayVisits: number
  crewCount: number
}

export function StatsCards({ stats }: { stats?: StatsData }) {
  // 添加默认值保护
  const safeStats = stats || { bookmarkCount: 0, todayVisits: 0, crewCount: 0 }
  
  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      {/* 添加 overflow-visible 确保高光不被裁剪 */}
      <div className="flex flex-wrap justify-center gap-6 sm:gap-8 overflow-visible">
        <StatCard
          icon={BookmarkIcon}
          label="收藏书签"
          value={safeStats.bookmarkCount}
          accentColor="text-cyan-400"
        />
        <StatCard
          icon={VisitIcon}
          label="今日访问"
          value={safeStats.todayVisits}
          accentColor="text-amber-400"
        />
        <StatCard
          icon={CrewIcon}
          label="船员人数"
          value={safeStats.crewCount}
          accentColor="text-purple-400"
        />
      </div>
    </div>
  )
}
