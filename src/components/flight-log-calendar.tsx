// src/components/flight-log-calendar.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

export function FlightLogCalendar() {
  const [viewDate, setViewDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // 📝 日志撰写卷宗弹窗状态
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // 日历核心计算
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    setIsModalOpen(true)
  }

  // 🍏 Apple 级非线性物理弹簧参数
  const springConfig = { type: "spring", stiffness: 350, damping: 25, mass: 1 }

  if (!mounted) return null

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景模糊遮罩 */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]" 
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* 🚀 航行日志撰写卷宗 (非线性弹簧入场) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
            transition={springConfig}
            className="relative w-full max-w-2xl z-10 rounded-[3.5rem] bg-[#060813]/95 border border-emerald-500/30 p-8 md:p-12 shadow-[0_0_100px_rgba(16,185,129,0.2)] overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse"></div>

            <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-emerald-500/10 pb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-500 tracking-[0.15em] font-[family-name:var(--font-space)]">星际日志录入</h2>
                <p className="text-emerald-400/50 font-mono text-[10px] uppercase tracking-widest mt-1">Stardate: {year}-{String(month+1).padStart(2,'0')}-{String(selectedDay).padStart(2,'0')}</p>
              </div>
            </div>

            <form className="space-y-6 relative z-10" onSubmit={(e) => e.preventDefault()}>
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2">日志标题 / Title</label>
                  <input type="text" placeholder="输入巡航记录标题..." className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all text-white font-[family-name:var(--font-space)] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                </div>
                <div className="w-1/3 space-y-2">
                  <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2">精确时间 / Time</label>
                  <input type="time" defaultValue={`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`} className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all text-emerald-400 font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] [color-scheme:dark]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2 flex items-center justify-between">
                  <span>详细纪要 / Markdown Support</span>
                  <span className="text-zinc-600 font-normal tracking-normal lowercase border border-white/5 bg-white/5 px-2 py-0.5 rounded-md">.md</span>
                </label>
                <textarea rows={6} placeholder="支持 Markdown 语法，详细记录本次舰队巡航或集结情况..." className="ios-scrollbar w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none focus:border-emerald-500/50 transition-all text-zinc-300 resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
              </div>

              <div className="flex gap-4 pt-4 border-t border-emerald-500/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all active:scale-95">取消</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  刻录进档案
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div className="relative h-full flex flex-col group/log">
        
        <div className="flex items-center justify-between mb-8 px-2 relative z-10">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <span className="text-emerald-500/60 font-mono text-[9px] uppercase tracking-[0.4em]">Module D</span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-[0.15em] font-[family-name:var(--font-space)] text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              航行日志
            </h2>
          </div>
          <div className="flex gap-2 bg-emerald-500/5 border border-emerald-500/20 p-1.5 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <button onClick={() => setViewDate(new Date(year, month - 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-all text-emerald-500 hover:text-white active:scale-90">◀</button>
            <div className="flex items-center justify-center px-2 text-xs font-mono font-bold text-emerald-400 tracking-widest">{year}-{String(month+1).padStart(2,'0')}</div>
            <button onClick={() => setViewDate(new Date(year, month + 1))} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-emerald-500/20 transition-all text-emerald-500 hover:text-white active:scale-90">▶</button>
          </div>
        </div>

        {/* 🚀 全息日历阵列舱 */}
        <div className="flex-1 flex flex-col bg-[#02040a]/40 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
          
          <div className="grid grid-cols-7 gap-2 mb-4 border-b border-white/5 pb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-2 lg:gap-3 flex-1">
            {blanks.map(i => <div key={`b-${i}`} className="aspect-square" />)}
            
            {days.map(day => {
              const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()
              const hasLog = day % 5 === 0 // 模拟随机几天有日志记录

              return (
                <motion.div
                  key={day}
                  onClick={() => handleDayClick(day)}
                  whileHover={{ scale: 1.2, zIndex: 20 }}
                  transition={springConfig}
                  className={`cursor-pointer aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-colors duration-300
                    ${isToday 
                      ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white" 
                      : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300"
                    }`}
                >
                  <span className={`text-sm md:text-base font-bold ${isToday ? "font-[family-name:var(--font-space)]" : "font-mono"}`}>{day}</span>
                  
                  {hasLog && !isToday && (
                    <div className="absolute bottom-2 flex gap-0.5">
                       <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
                    </div>
                  )}
                  {isToday && (
                     <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}