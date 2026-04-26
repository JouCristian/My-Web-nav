// src/components/dashboard-clock.tsx
"use client"

import { useState, useEffect } from "react"

export function DashboardClock() {
  const [time, setTime] = useState<Date | null>(null)

  // 🚀 挂载后启动实时星历计算，精确到秒
  useEffect(() => {
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 渲染前的骨架屏，防止服务端与客户端时间不一致导致的水合报错 (Hydration Error)
  if (!time) {
    return <div className="hidden lg:block w-[260px] h-[76px] bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
  }

  // 格式化时间与日期
  const dateStr = time.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
  const weekdayStr = time.toLocaleDateString('zh-CN', { weekday: 'long' })
  const timeStr = time.toLocaleTimeString('zh-CN', { hour12: false })

  return (
    <div className="hidden lg:flex group relative w-[260px] h-[76px] flex-col justify-center px-5 rounded-2xl border border-white/10 bg-[#060813]/60 backdrop-blur-md transition-all duration-500 hover:border-blue-500/40 hover:bg-[#060813]/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden shrink-0">
      
      {/* 悬浮扫描流光 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

      {/* 🚀 右上角精确到秒的动态时间 */}
      <div className="absolute top-2.5 right-4 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
        <span className="text-[11px] font-mono font-bold text-blue-400 tracking-[0.1em]">{timeStr}</span>
      </div>

      {/* 主体日历信息 */}
      <div className="flex items-center gap-4 mt-1.5 relative z-10">
        <div className="flex items-center justify-center w-10 h-10 rounded-[0.8rem] bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-mono">{weekdayStr}</span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">{dateStr}</span>
        </div>
      </div>
    </div>
  )
}