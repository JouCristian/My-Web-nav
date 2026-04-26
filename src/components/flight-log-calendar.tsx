// src/components/flight-log-calendar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"

export function FlightLogCalendar({ userRole }: { userRole: string }) {
  const [viewDate, setViewDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // 📝 状态机：日志数据、弹窗控制、3D翻转控制
  const [isFlipped, setIsFlipped] = useState(false) // 🚀 翻转状态
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"VIEW" | "EDIT">("VIEW")
  const [logs, setLogs] = useState<Record<string, { title: string, time: string, content: string }>>({})

  // 📝 编辑状态
  const [editTitle, setEditTitle] = useState("")
  const [editTime, setEditTime] = useState("")
  const [editContent, setEditContent] = useState("")
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [focusStyle, setFocusStyle] = useState({ top: 0, left: 0, width: 0, height: 0, opacity: 0 })

  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  // 💾 数据持久化
  useEffect(() => { 
    setMounted(true);
    const savedLogs = localStorage.getItem("STARFLEET_FLIGHT_LOGS");
    if (savedLogs) try { setLogs(JSON.parse(savedLogs)); } catch (e) { console.error(e); }
  }, [])
  useEffect(() => { if (mounted) localStorage.setItem("STARFLEET_FLIGHT_LOGS", JSON.stringify(logs)); }, [logs, mounted])

  // 📅 日历计算
  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const getDateKey = (day: number) => `${year}-${month + 1}-${day}`

  // 🖱️ 交互逻辑
  const handleFocus = (e: any) => {
    if (!formRef.current || !e.target) return;
    let top = 0, left = 0, el = e.target;
    while (el && el !== formRef.current) { top += el.offsetTop; left += el.offsetLeft; el = el.offsetParent; }
    setFocusStyle({ top, left, width: e.target.offsetWidth, height: e.target.offsetHeight, opacity: 1 });
  }

  const handleDayClick = (day: number, specificYear?: number, specificMonth?: number) => {
    // 允许传入特定年月（用于背面列表点击）
    const targetYear = specificYear ?? year;
    const targetMonth = specificMonth ?? month;
    const key = `${targetYear}-${targetMonth + 1}-${day}`;
    
    setSelectedDay(day); 
    const hasLog = !!logs[key]
    
    if (!hasLog) {
      setModalMode(isManager ? "EDIT" : "VIEW");
      setEditTitle(""); setEditTime("12:00"); setEditContent("");
    } else {
      setModalMode("VIEW");
    }
    setIsModalOpen(true); setIsTimePickerOpen(false); setFocusStyle(s => ({...s, opacity: 0}))
  }

  const handleSaveLog = () => {
    if (selectedDay) {
      setLogs(p => ({...p, [getDateKey(selectedDay)]: { title: editTitle, time: editTime, content: editContent }}));
      setIsModalOpen(false);
    }
  }

  // 🍏 Apple 级非线性物理弹簧（高频振荡，回弹感强）
  const flipSpring = { type: "spring", stiffness: 220, damping: 14, mass: 1 }
  const uiSpring = { type: "spring", stiffness: 350, damping: 25 }

  if (!mounted) return null

  const activeLog = selectedDay ? logs[getDateKey(selectedDay)] : null

  // 📝 弹窗渲染逻辑保持不变 (省略部分重复代码确保聚焦核心改动)
  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]" onClick={() => setIsModalOpen(false)} />
          <style dangerouslySetInnerHTML={{ __html: `@keyframes modal-breathe { 0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.2); } 50% { transform: scale(1.01); box-shadow: 0 0 100px rgba(16, 185, 129, 0.35); border-color: rgba(16, 185, 129, 0.4); } } .animate-modal-breathe { animation: modal-breathe 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }`}} />
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }} transition={uiSpring} className="relative w-full max-w-2xl z-10" >
            <div className="animate-modal-breathe w-full rounded-[3.5rem] bg-[#060813]/95 border p-8 md:p-12 overflow-hidden relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">{modalMode === "EDIT" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}</div>
                  <div><h2 className="text-2xl font-bold text-emerald-500 tracking-[0.15em] font-[family-name:var(--font-space)]">{modalMode === "EDIT" ? "星际日志录入" : "航行档案卷宗"}</h2><p className="text-emerald-400/50 font-mono text-[10px] uppercase tracking-widest mt-1">Stardate Local Synchronization Active</p></div>
                </div>
              </div>
              {modalMode === "EDIT" ? (
                <form ref={formRef} className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); handleSaveLog(); }}>
                   <motion.div initial={false} animate={focusStyle} transition={uiSpring} className="absolute z-0 rounded-2xl border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] pointer-events-none" />
                   <div className="flex gap-4">
                    <div className="flex-1 space-y-2 relative z-10"><label className="text-[10px] text-emerald-500/60 uppercase ml-2">日志标题</label><input required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onFocus={handleFocus} onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))} className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors" /></div>
                    <div className="w-1/3 space-y-2 relative z-30"><label className="text-[10px] text-emerald-500/60 uppercase ml-2">精确时间</label><div className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 text-emerald-400 font-mono flex justify-between items-center cursor-default opacity-60"><span className="font-bold">{editTime}</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div></div>
                   </div>
                   <div className="space-y-2 relative z-10"><label className="text-[10px] text-emerald-500/60 uppercase ml-2 flex items-center justify-between"><span>详细纪要 (Markdown)</span><span className="text-zinc-600 border border-white/5 bg-white/5 px-2 py-0.5 rounded-md text-[9px]">.md</span></label><textarea required rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} onFocus={handleFocus} onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))} className="ios-scrollbar w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none text-zinc-300 resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" /></div>
                   <div className="flex gap-4 pt-4 border-t border-emerald-500/10 relative z-20"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white transition-all">取消</button><button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2">刻录进档案</button></div>
                </form>
              ) : (
                <div className="relative z-10 flex flex-col">
                  {activeLog ? (
                    <>
                      <div className="flex items-center justify-between px-2 mb-4"><h3 className="text-xl font-bold text-white tracking-widest">{activeLog.title}</h3><div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-emerald-400 font-mono text-xs">{activeLog.time}</span></div></div>
                      <div className="bg-black/40 border border-emerald-500/20 rounded-[2rem] p-6 md:p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] max-h-[40vh] overflow-y-auto ios-scrollbar"><ReactMarkdown className="text-zinc-300 text-sm md:text-base leading-relaxed break-words" components={{ h1: ({node, ...p}) => <h1 className="text-2xl font-bold text-emerald-400 mb-4 pb-2 border-b border-emerald-500/20" {...p} />, p: ({node, ...p}) => <p className="mb-4 last:mb-0" {...p} />, strong: ({node, ...p}) => <strong className="text-emerald-300 font-bold" {...p} /> }} >{activeLog.content}</ReactMarkdown></div>
                    </>
                  ) : (
                    <div className="bg-black/40 border border-emerald-500/20 rounded-[2rem] p-12 flex flex-col items-center justify-center min-h-[30vh]"><span className="text-5xl mb-6 opacity-30">📭</span><span className="text-emerald-500/80 font-mono tracking-[0.3em] text-sm uppercase">No Records Found</span></div>
                  )}
                  <div className="flex gap-4 pt-8 mt-6 border-t border-emerald-500/10"><button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white transition-all active:scale-95">关闭档案</button>{isManager && activeLog && <button type="button" onClick={() => { setEditTitle(activeLog.title); setEditTime(activeLog.time); setEditContent(activeLog.content); setModalMode("EDIT"); }} className="flex-1 py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-2">覆写卷宗</button>}</div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <div className="relative h-full flex flex-col" style={{ perspective: "1500px" }}>
        
        {/* 🚀 顶栏重构：标题、微型切换、量子脉冲转换器 */}
        <div className="flex items-center justify-between mb-8 px-2 relative z-20">
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-emerald-500/60 font-mono text-[8px] uppercase tracking-[0.4em]">Stardate Module</span>
              </div>
              <h2 className="text-2xl font-bold tracking-[0.15em] font-[family-name:var(--font-space)] text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                航行日志
              </h2>
            </div>
            
            {/* 微型日期切换器 */}
            {!isFlipped && (
              <div className="flex items-center bg-emerald-500/10 border border-emerald-500/20 p-1 rounded-lg scale-90 origin-left">
                <button onClick={() => setViewDate(new Date(year, month - 1))} className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500/20 rounded transition-all text-emerald-400">◀</button>
                <div className="px-2 text-[10px] font-mono font-bold text-emerald-300 tracking-tighter w-16 text-center">{year}-{String(month+1).padStart(2,'0')}</div>
                <button onClick={() => setViewDate(new Date(year, month + 1))} className="w-6 h-6 flex items-center justify-center hover:bg-emerald-500/20 rounded transition-all text-emerald-400">▶</button>
              </div>
            )}
          </div>

          {/* 🚀 量子脉冲转换按钮 (控制 3D 翻转) */}
          <button 
            onClick={() => setIsFlipped(!isFlipped)}
            className="group relative w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center transition-all active:scale-90"
          >
            {/* 脉冲环动画 */}
            <div className="absolute inset-0 rounded-xl border border-emerald-500 opacity-0 group-hover:opacity-100 animate-[ping_2s_infinite]"></div>
            <div className="absolute inset-[-4px] rounded-xl border border-emerald-500/20 opacity-0 group-hover:opacity-100 animate-[ping_3s_infinite]"></div>
            
            <motion.div animate={{ rotate: isFlipped ? 180 : 0 }} transition={uiSpring}>
              {isFlipped ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-emerald-400"><path d="M19 11H5m14 0l-7-7m7 7l-7 7"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 text-emerald-400"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
              )}
            </motion.div>
          </button>
        </div>

        {/* 🚀 核心翻转容器 */}
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={flipSpring}
          style={{ transformStyle: "preserve-3d" }}
          className="relative flex-1"
        >
          {/* 正面：全息日历卡片 */}
          <div className="absolute inset-0 backface-hidden z-10 flex flex-col" style={{ backfaceVisibility: "hidden" }}>
             <div className="flex-1 flex flex-col bg-[#02040a]/40 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]">
                <div className="grid grid-cols-7 gap-2 mb-4 border-b border-white/5 pb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-mono text-zinc-500">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2 flex-1">
                  {blanks.map(i => <div key={`b-${i}`} className="aspect-square" />)}
                  {days.map(day => {
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const hasLog = !!logs[getDateKey(day)];
                    return (
                      <motion.div key={day} onClick={() => handleDayClick(day)} whileHover={{ scale: 1.2, zIndex: 20 }} transition={uiSpring} className={`cursor-pointer aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-colors duration-300 ${isToday ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white" : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300"}`} >
                        {isToday && <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 opacity-50 animate-[ping_2.5s_infinite]"></div>}
                        <span className={`text-sm font-bold relative z-10 ${isToday ? "font-bold" : "font-mono"}`}>{day}</span>
                        {hasLog && <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>}
                      </motion.div>
                    )
                  })}
                </div>
             </div>
          </div>

          {/* 背面：档案全集列表 (统一高度 + 内部滚动) */}
          <div className="absolute inset-0 backface-hidden z-20 flex flex-col" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}>
             <div className="flex-1 flex flex-col bg-[#02040a]/60 border border-emerald-500/20 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-emerald-500/10 pb-3">
                  <span className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-[0.2em]">Stored Archives: {Object.keys(logs).length}</span>
                  <button onClick={() => setIsFlipped(false)} className="text-[9px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1 rounded-lg transition-colors text-emerald-400 border border-emerald-500/20">BACK TO GRID</button>
                </div>
                
                {/* 滚动容器 */}
                <div className="flex-1 overflow-y-auto ios-scrollbar pr-2 space-y-3">
                  {Object.entries(logs).length > 0 ? (
                    Object.entries(logs).sort((a,b) => b[0].localeCompare(a[0])).map(([key, log]) => {
                      const [y, m, d] = key.split('-').map(Number);
                      return (
                        <div 
                          key={key}
                          onClick={() => handleDayClick(d, y, m - 1)}
                          className="group/item relative p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer overflow-hidden"
                        >
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 scale-y-0 group-hover/item:scale-y-100 transition-transform origin-top"></div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-white group-hover/item:text-emerald-300 transition-colors truncate pr-4">{log.title}</h4>
                            <span className="text-[9px] font-mono text-zinc-500 whitespace-nowrap">{key}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 line-clamp-1">{log.content.substring(0, 50)}...</p>
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-xs">
                      <span className="text-2xl mb-2 opacity-20">📡</span>
                      <span>航线库空空如也...</span>
                    </div>
                  )}
                </div>
             </div>
          </div>
        </motion.div>
      </div>
      
      {mounted && createPortal(modalContent, document.body)}
    </>
  )
}