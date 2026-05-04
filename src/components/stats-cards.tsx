"use client"

import { useState } from "react"
import GlassSurface from "./GlassSurface"

// SVG 图标组件
function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function VisitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CrewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  accentColor: string
  borderColor: string
}

function StatCard({ icon, label, value, accentColor, borderColor }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // Apple 风格贝塞尔曲线: cubic-bezier(0.25, 0.1, 0.25, 1)
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        transition: 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)'
      }}
    >
      <GlassSurface
        width="auto"
        height="auto"
        borderRadius={20}
        brightness={120}
        opacity={0.4}
        blur={20}
        displace={1.2}
        mixBlendMode="normal"
        backgroundOpacity={0.12}
        className="min-w-[140px]"
      >
        <div className={`flex items-center gap-4 px-5 py-4 border-l-2 ${borderColor}`}>
          {/* 图标容器 */}
          <div className={`shrink-0 w-10 h-10 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center`}>
            <div className={`w-5 h-5 ${accentColor}`}>
              {icon}
            </div>
          </div>
          
          {/* 文字内容 */}
          <div className="flex flex-col">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
            <span className={`text-2xl font-bold ${accentColor} font-[family-name:var(--font-space)] tracking-wide`}>
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
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="flex flex-wrap justify-center gap-4">
        <StatCard
          icon={<BookmarkIcon className="w-full h-full" />}
          label="收藏书签"
          value={safeStats.bookmarkCount}
          accentColor="text-cyan-400"
          borderColor="border-cyan-500"
        />
        <StatCard
          icon={<VisitIcon className="w-full h-full" />}
          label="今日访问"
          value={safeStats.todayVisits}
          accentColor="text-amber-400"
          borderColor="border-amber-500"
        />
        <StatCard
          icon={<CrewIcon className="w-full h-full" />}
          label="船员人数"
          value={safeStats.crewCount}
          accentColor="text-purple-400"
          borderColor="border-purple-500"
        />
      </div>
    </div>
  )
}
