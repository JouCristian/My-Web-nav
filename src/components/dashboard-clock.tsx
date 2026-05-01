// src/components/dashboard-clock.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

// 🚀 轻量级视觉模拟：用于在不引入庞大库的情况下，复刻截图中的上下双层日期视觉
const STARFLEET_PHASES = [
  "初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十",
  "十一", "十二", "十三", "十四", "十五", "十六", "十七", "十八", "十九", "二十",
  "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十", "卅一"
];

// 🚀 与 flight-log-calendar 完全一致的 spring 配置，保证全站弹窗动画一致性
const uiSpring = { type: "spring" as const, stiffness: 350, damping: 25 }

export function DashboardClock() {
  const [time, setTime] = useState<Date | null>(null)
  
  // 🚀 简化的弹窗状态：仅用 isOpen，进出场全交给 AnimatePresence + motion 处理
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setTime(new Date())
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const openModal = () => setIsOpen(true)
  const closeModal = () => setIsOpen(false)

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
  // 📅 星际日历弹窗（与航行日志弹窗使用完全相同的 framer-motion 进出场）
  // ==========================================
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景高斯模糊 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]"
            onClick={closeModal}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
            transition={uiSpring}
            className="relative w-full max-w-md sm:max-w-lg z-10 my-auto"
          >
            {/* 🚀 动态呼吸容器，整体瘦身：宽度 max-w-lg、内边距更紧凑、高度自适应不再触发滚动条 */}
            <div 
              className="quantum-breathe-dynamic w-full rounded-[2rem] sm:rounded-[2.5rem] bg-[#060813]/95 p-4 sm:p-6 flex flex-col relative max-h-[90vh] [overflow-x:hidden] [overflow-y:auto] ios-scrollbar"
              style={{ '--modal-glow': 'rgba(59, 130, 246, 0.2)', '--modal-shadow': 'rgba(59, 130, 246, 0.6)', '--modal-border': 'rgba(59, 130, 246, 0.5)' } as React.CSSProperties}
            >
              {/* 完美的网格背景 */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              <div className="flex items-end justify-between border-b border-white/10 pb-3 sm:pb-4 mb-4 sm:mb-5 relative z-10 gap-3">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-[0.05em] sm:tracking-[0.08em] font-[family-name:var(--font-space)] drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] truncate">
                    {time.toLocaleDateString('zh-CN', { month: 'long' })}
                  </h2>
                  <p className="text-blue-400 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-1">Starfleet Standard Calendar • {year}</p>
                </div>
                
                {/* 弹窗内的实时秒表 */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-500/10 border border-blue-500/20 px-2.5 sm:px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                  <span className="text-xs sm:text-sm font-mono font-bold text-blue-400 tracking-wider">{timeStr}</span>
                </div>
              </div>

              {/* 🚀 核心内部容器：装载日历阵列（紧凑版） */}
              <div className="relative z-10 bg-black/40 border border-white/5 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                
                {/* 星期表头 */}
                <div className="grid grid-cols-7 gap-y-1.5 sm:gap-y-2 gap-x-1 text-center mb-2 sm:mb-3">
                  {weekDays.map((day, idx) => (
                    <div key={`header-${idx}`} className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest border-b border-white/10 pb-1.5 sm:pb-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* 渲染占位空天数 */}
                  {emptyDays.map(empty => (
                    <div key={`empty-${empty}`} className="h-9 sm:h-11"></div>
                  ))}
                  
                  {/* 渲染实际天数 */}
                  {monthDays.map(day => {
                    const isToday = day === date;
                    const phaseIndex = (day + 5) % 30; // 模拟一个错位的伪农历索引，制造视觉效果
                    const phase = STARFLEET_PHASES[phaseIndex];

                    return (
                      <div key={`day-${day}`} className="relative h-9 sm:h-11 flex flex-col items-center justify-center group/day">
                        {/* 🚀 当日高亮锁定圈 */}
                        {isToday ? (
                          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.8)] font-bold text-xs sm:text-sm relative">
                               {/* 当日的光晕扩散圈 */}
                               <div className="absolute inset-0 rounded-full border border-blue-400 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                               {day}
                            </div>
                            <span className="text-[8px] sm:text-[9px] text-blue-300 font-mono mt-0.5 font-bold tracking-wider">{phase}</span>
                          </div>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/day:opacity-100 rounded-lg transition-opacity duration-300"></div>
                            <span className="text-xs sm:text-sm font-bold text-zinc-300 group-hover/day:text-white transition-colors relative z-10">{day}</span>
                            <span className="text-[8px] sm:text-[9px] text-zinc-600 font-mono group-hover/day:text-zinc-400 transition-colors relative z-10 tracking-wider">{phase}</span>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-4 sm:mt-5 relative z-10 gap-3">
                <div className="text-[9px] sm:text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] shrink-0"></span>
                  Current Temporal Coordinates
                </div>
                <button onClick={closeModal} className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-[0.15em] uppercase text-[10px] hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                  关闭时间中枢
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 🚀 仅保留呼吸光晕（box-shadow + border-color），进出场动画交给 framer-motion */
        @keyframes dynamic-breathe { 
          0%, 100% { box-shadow: 0 0 60px var(--modal-glow), inset 0 0 20px var(--modal-glow); border-color: rgba(255,255,255,0.1); } 
          50% { box-shadow: 0 0 100px var(--modal-shadow), inset 0 0 40px var(--modal-glow); border-color: var(--modal-border); } 
        }
        .quantum-breathe-dynamic { border: 1px solid rgba(255,255,255,0.1); animation: dynamic-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .ios-scrollbar::-webkit-scrollbar { width: 6px; }
        .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ios-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; background-clip: padding-box; }
        .ios-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
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
