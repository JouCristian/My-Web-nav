// src/components/dashboard-clock.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

// 🚀 轻量级视觉模拟：用于在不引入庞大库的情况下，复刻截图中的上下双层日期视觉
const STARFLEET_PHASES = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十", "卅一"
];

export function DashboardClock() {
  const [time, setTime] = useState<Date | null>(null)
  
  // 🚀 日历弹窗状态机
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // 🚀 弹窗生命周期控制 (防闪烁 + 非线性动画)
  const openModal = () => { setIsClosing(false); setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  const closeModal = () => { setIsClosing(true); setIsAnimating(false); setTimeout(() => setIsOpen(false), 600); }

  if (!time) {
    return <div className="w-full lg:w-[260px] h-[68px] sm:h-[76px] bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
  }

  // 格式化当前时间
  const year = time.getFullYear()
  const month = time.getMonth()
  const date = time.getDate()
  
  const dateStr = time.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')
  const weekdayStr = time.toLocaleDateString('zh-CN', { weekday: 'long' })
  const timeStr = time.toLocaleTimeString('zh-CN', { hour12: false })

  // 🚀 日历网格计算算法
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfMonth = new Date(year, month, 1).getDay() // 0 (Sun) to 6 (Sat)
  
  // 生成占位符（上个月的尾巴）
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)
  // 生成本月的天数
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  // 星期表头
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']

  // ==========================================
  // 📅 星际日历弹窗
  // ==========================================
  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景高斯模糊 */}
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      <div className={`relative w-full max-w-2xl z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        
        {/* 🚀 动态呼吸容器，注入专属的星光蓝边界光晕 */}
        <div 
          className="quantum-breathe-dynamic w-full rounded-[2rem] sm:rounded-[3rem] md:rounded-[3.5rem] bg-[#060813]/95 p-5 sm:p-8 md:p-12 flex flex-col relative overflow-hidden max-h-[90vh] overflow-y-auto"
          style={{ '--modal-glow': 'rgba(59, 130, 246, 0.2)', '--modal-shadow': 'rgba(59, 130, 246, 0.6)', '--modal-border': 'rgba(59, 130, 246, 0.5)' } as React.CSSProperties}
        >
          {/* 完美的网格背景 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="flex items-end justify-between border-b border-white/10 pb-4 sm:pb-6 mb-5 sm:mb-8 relative z-10 gap-3">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-[0.05em] sm:tracking-[0.1em] font-[family-name:var(--font-space)] drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] truncate">
                {time.toLocaleDateString('zh-CN', { month: 'long' })}
              </h2>
              <p className="text-blue-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-1 sm:mt-2">Starfleet Standard Calendar • {year}</p>
            </div>
            
            {/* 弹窗内的实时秒表 */}
            <div className="flex items-center gap-2 sm:gap-3 bg-blue-500/10 border border-blue-500/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
              <span className="text-sm sm:text-xl font-mono font-bold text-blue-400 tracking-wider sm:tracking-widest">{timeStr}</span>
            </div>
          </div>

          {/* 🚀 核心内部容器：装载日历阵列 */}
          <div className="relative z-10 bg-black/40 border border-white/5 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
            
            {/* 星期表头 */}
            <div className="grid grid-cols-7 gap-y-2 sm:gap-y-4 gap-x-1 sm:gap-x-2 text-center mb-3 sm:mb-6">
              {weekDays.map((day, idx) => (
                <div key={`header-${idx}`} className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10 pb-2 sm:pb-4">
                  {day}
                </div>
              ))}
              
              {/* 渲染占位空天数 */}
              {emptyDays.map(empty => (
                <div key={`empty-${empty}`} className="h-10 sm:h-14"></div>
              ))}
              
              {/* 渲染实际天数 */}
              {monthDays.map(day => {
                const isToday = day === date;
                const phaseIndex = (day + 5) % 30; // 模拟一个错位的伪农历索引，制造视觉效果
                const phase = STARFLEET_PHASES[phaseIndex];

                return (
                  <div key={`day-${day}`} className="relative h-10 sm:h-14 flex flex-col items-center justify-center group/day">
                    {/* 🚀 当日高亮锁定圈 */}
                    {isToday ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                        <div className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.8)] font-bold text-sm sm:text-lg relative">
                           {/* 当日的光晕扩散圈 */}
                           <div className="absolute inset-0 rounded-full border border-blue-400 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                           {day}
                        </div>
                        <span className="text-[8px] sm:text-[9px] text-blue-300 font-mono mt-0.5 sm:mt-1 font-bold tracking-wider sm:tracking-widest">{phase}</span>
                      </div>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/day:opacity-100 rounded-xl transition-opacity duration-300"></div>
                        <span className="text-sm sm:text-lg font-bold text-zinc-300 group-hover/day:text-white transition-colors relative z-10">{day}</span>
                        <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono group-hover/day:text-zinc-400 transition-colors relative z-10 tracking-wider sm:tracking-widest">{phase}</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-5 sm:mt-8 relative z-10 gap-3">
            <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0"></span>
              Current Temporal Coordinates
            </div>
            <button onClick={closeModal} className="px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-[10px] hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              关闭时间中枢
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up-elastic { 0% { opacity: 0; transform: translateY(80px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up-elastic { animation: slide-up-elastic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        @keyframes dissipate { 0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 100% { opacity: 0; filter: blur(20px) brightness(0.5); transform: scale(0.85); } }

        @keyframes dynamic-breathe { 
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px var(--modal-glow), inset 0 0 20px var(--modal-glow); border: 1px solid rgba(255,255,255,0.1); } 
          50% { transform: scale(1.03); box-shadow: 0 0 100px var(--modal-shadow), inset 0 0 40px var(--modal-glow); border: 1px solid var(--modal-border); } 
        }
        .quantum-breathe-dynamic { animation: dynamic-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}} />

      {/* 🚀 卡片升级为可点击区域；移动端也保留以便能查看完整日历 */}
      <div 
        onClick={openModal}
        className="cursor-pointer flex group relative w-full lg:w-[260px] h-[68px] sm:h-[76px] flex-col justify-center px-4 sm:px-5 rounded-2xl border border-white/10 bg-[#060813]/60 backdrop-blur-md transition-all duration-500 hover:border-blue-500/40 hover:bg-[#060813]/80 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] overflow-hidden shrink-0 active:scale-95"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>

        <div className="absolute top-2.5 right-4 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse"></div>
          <span className="text-[11px] font-mono font-bold text-blue-400 tracking-[0.1em]">{timeStr}</span>
        </div>

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

      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}
