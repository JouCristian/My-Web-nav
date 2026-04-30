// src/components/flight-log-calendar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import ReactMarkdown from "react-markdown"

export function FlightLogCalendar({ userRole }: { userRole: string }) {
  const [viewDate, setViewDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  const [isFlipped, setIsFlipped] = useState(false)
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"VIEW" | "EDIT">("VIEW")
  const [logs, setLogs] = useState<Record<string, { title: string, time: string, content: string }>>({})

  const [editTitle, setEditTitle] = useState("")
  const [editTime, setEditTime] = useState("12:00")
  const [editContent, setEditContent] = useState("")
  
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const timeInputRef = useRef<HTMLDivElement>(null)

  useEffect(() => { 
    setMounted(true)
    const saved = localStorage.getItem("STARFLEET_FLIGHT_LOGS")
    if (saved) { try { setLogs(JSON.parse(saved)) } catch(e){} }
  }, [])

  const saveLogs = (newLogs: any) => {
    setLogs(newLogs)
    localStorage.setItem("STARFLEET_FLIGHT_LOGS", JSON.stringify(newLogs))
  }

  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  const handleDayClick = (d: number, y: number, m: number) => {
    const key = `${y}-${m+1}-${d}`
    setSelectedDateKey(key)
    if (logs[key]) {
      setEditTitle(logs[key].title)
      setEditTime(logs[key].time)
      setEditContent(logs[key].content)
      setModalMode("VIEW")
    } else {
      if (!isManager) return
      setEditTitle("")
      setEditTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }))
      setEditContent("")
      setModalMode("EDIT")
    }
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!selectedDateKey || !editTitle || !editContent) return
    const newLogs = { ...logs, [selectedDateKey]: { title: editTitle, time: editTime, content: editContent } }
    saveLogs(newLogs)
    setIsModalOpen(false)
  }

  const handleDelete = () => {
    if (!selectedDateKey) return
    const newLogs = { ...logs }
    delete newLogs[selectedDateKey]
    saveLogs(newLogs)
    setIsModalOpen(false)
  }

  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const totalCells = 42
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const trailingBlanks = Array.from({ length: totalCells - days.length - blanks.length }, (_, i) => i)

  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 🚀 纯光效呼吸引擎：只改阴影和边框，不改变 scale，完美解决字体跳动 */
        @keyframes log-glow-breathe {
          0%, 100% { box-shadow: 0 0 30px rgba(16,185,129,0.1), inset 0 0 15px rgba(16,185,129,0.05); border-color: rgba(16,185,129,0.3); }
          50% { box-shadow: 0 0 80px rgba(16,185,129,0.5), inset 0 0 30px rgba(16,185,129,0.2); border-color: rgba(16,185,129,0.6); }
        }
        .animate-log-glow { animation: log-glow-breathe 3s ease-in-out infinite; }
        .log-markdown p { margin-bottom: 1rem; color: #a1a1aa; line-height: 1.8; }
        .log-markdown h1, .log-markdown h2 { color: #fff; font-weight: bold; margin-bottom: 0.5rem; margin-top: 1rem; }
        .log-markdown blockquote { border-left: 3px solid rgba(16,185,129,0.5); padding-left: 1rem; color: #6ee7b7; font-style: italic; background: rgba(16,185,129,0.05); padding-block: 0.5rem; border-radius: 0 0.5rem 0.5rem 0; }
        .log-markdown code { background: rgba(16,185,129,0.1); color: #34d399; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; }
        .emerald-scrollbar::-webkit-scrollbar { width: 5px; }
        .emerald-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius: 10px; }
      `}} />

      <div className="flex items-center justify-between mb-8 px-2 relative z-20">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-emerald-500/60 font-mono text-[9px] uppercase tracking-[0.4em]">{isFlipped ? 'Archive Data' : 'Flight Matrix'}</span>
          </div>
          <h2 className="text-xl font-bold tracking-[0.1em] font-[family-name:var(--font-space)] text-white">{isFlipped ? '历史卷宗' : '航行日志'}</h2>
        </div>
        <button onClick={() => setIsFlipped(!isFlipped)} className="group flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`w-4 h-4 text-emerald-400 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest">{isFlipped ? 'BACK TO CALENDAR' : 'SWITCH VIEW'}</span>
        </button>
      </div>

      <div className="relative z-10 w-full h-[420px]" style={{ perspective: "1200px" }}>
        <AnimatePresence initial={false} mode="wait">
          {!isFlipped ? (
             <motion.div key="front" initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: -90, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="absolute inset-0 flex flex-col bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]" style={{ transformStyle: "preserve-3d" }}>
                <div className="flex justify-between items-center mb-6">
                  <button onClick={() => setViewDate(new Date(year, month - 1))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-all">◀</button>
                  <div className="text-sm font-bold tracking-widest text-white font-[family-name:var(--font-space)]">{year} <span className="text-emerald-500">{monthNames[month]}</span></div>
                  <button onClick={() => setViewDate(new Date(year, month + 1))} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-all">▶</button>
                </div>
                
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['SUN','MON','TUE','WED','THU','FRI','SAT'].map(d=><div key={d} className="text-center text-[9px] font-mono text-zinc-600">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 flex-1">
                  {blanks.map(i => <div key={`b-${i}`} className="opacity-0 pointer-events-none" />)}
                  {days.map(day => {
                    const key = `${year}-${month+1}-${day}`;
                    const hasLog = !!logs[key];
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    return (
                      <div key={day} onClick={() => handleDayClick(day, year, month)} className={`group relative rounded-xl flex items-center justify-center cursor-pointer transition-all ${isToday ? 'border-2 border-emerald-500 bg-emerald-500/10 z-10' : hasLog ? 'border border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/20' : 'border border-transparent hover:bg-white/5'}`}>
                        <span className={`text-xs font-mono font-bold ${isToday ? 'text-emerald-400' : hasLog ? 'text-white' : 'text-zinc-500'}`}>{day}</span>
                        {hasLog && <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />}
                      </div>
                    )
                  })}
                  {trailingBlanks.map(i => <div key={`t-${i}`} className="opacity-0 pointer-events-none" />)}
                </div>
             </motion.div>
          ) : (
             <motion.div key="back" initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} exit={{ rotateY: 90, opacity: 0 }} transition={{ duration: 0.4, ease: "easeInOut" }} className="absolute inset-0 flex flex-col bg-[#02040a]/80 border border-emerald-500/20 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]" style={{ transformStyle: "preserve-3d" }}>
                <div className="flex-1 overflow-y-auto emerald-scrollbar pr-2 space-y-3">
                  {Object.keys(logs).length > 0 ? (
                    Object.keys(logs).sort((a,b)=>new Date(b).getTime() - new Date(a).getTime()).map(key => {
                      const log = logs[key];
                      const [y, m, d] = key.split('-').map(Number);
                      return (
                        <div key={key} onClick={() => handleDayClick(d, y, m - 1)} className="group/item relative p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all cursor-pointer overflow-hidden" >
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
                    <div className="h-full flex flex-col items-center justify-center text-zinc-600 italic text-xs"><span className="text-2xl mb-2 opacity-20">📡</span><span>航线库空空如也...</span></div>
                  )}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mounted && createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
              
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} 
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} 
                exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} 
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                // 🚀 应用新的无缩放呼吸动画
                className="animate-log-glow relative z-10 w-full max-w-2xl bg-[#060813]/95 border-2 rounded-[2.5rem] p-10 max-h-[85vh] flex flex-col"
              >
                {modalMode === "VIEW" ? (
                  <>
                    <div className="flex justify-between items-start border-b border-emerald-500/20 pb-6 mb-6 shrink-0">
                      <div>
                        <div className="text-[10px] font-mono text-emerald-500/60 tracking-[0.3em] uppercase mb-2">Flight Log // {selectedDateKey}</div>
                        <h2 className="text-3xl font-bold text-white tracking-widest font-[family-name:var(--font-space)]">{editTitle}</h2>
                      </div>
                      <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] px-3 py-1.5 rounded-lg">{editTime}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto emerald-scrollbar pr-4 log-markdown min-h-0">
                      <ReactMarkdown>{editContent}</ReactMarkdown>
                    </div>
                    <div className="flex gap-4 mt-8 pt-6 border-t border-white/10 shrink-0">
                      <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 font-bold hover:text-white transition-all active:scale-95">关闭档案</button>
                      {isManager && <button onClick={() => setModalMode("EDIT")} className="flex-1 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all active:scale-95">修改档案</button>}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6 border-b border-emerald-500/20 pb-4 shrink-0">
                      <h2 className="text-xl font-bold text-emerald-400 tracking-[0.2em]">覆写航行日志</h2>
                      <span className="text-emerald-500/60 font-mono text-sm">{selectedDateKey}</span>
                    </div>
                    <div className="flex-1 flex flex-col gap-4 overflow-y-auto emerald-scrollbar pr-2 min-h-0">
                      <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">日志标题 (Title)</label>
                          <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" placeholder="例如：半人马座星系巡航" />
                        </div>
                        <div className="w-32 space-y-2" ref={timeInputRef}>
                          <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">时间 (Time)</label>
                          <div className="relative">
                            <input type="text" readOnly value={editTime} onClick={() => setIsTimePickerOpen(!isTimePickerOpen)} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 font-mono text-center cursor-pointer outline-none focus:border-emerald-500/50" />
                            <AnimatePresence>
                              {isTimePickerOpen && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-[110%] right-0 bg-[#060813] border border-emerald-500/30 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 p-2 w-48 flex gap-2">
                                   <div className="flex-1 h-32 overflow-y-auto emerald-scrollbar space-y-1">
                                      {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                                        <div key={`h-${h}`} onClick={() => { setEditTime(`${h}:${editTime.split(':')[1]}`); setIsTimePickerOpen(false) }} className="text-center py-1 rounded hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 cursor-pointer font-mono">{h}</div>
                                      ))}
                                   </div>
                                   <div className="w-px bg-white/10 my-2"></div>
                                   <div className="flex-1 h-32 overflow-y-auto emerald-scrollbar space-y-1">
                                      {['00','15','30','45'].map(m => (
                                        <div key={`m-${m}`} onClick={() => { setEditTime(`${editTime.split(':')[0]}:${m}`); setIsTimePickerOpen(false) }} className="text-center py-1 rounded hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 cursor-pointer font-mono">{m}</div>
                                      ))}
                                   </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 space-y-2 flex flex-col min-h-0">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2 shrink-0 flex justify-between">
                          <span>详细战报 (Markdown Supported)</span>
                          <span className="text-emerald-500/40 font-mono">MD</span>
                        </label>
                        <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50 resize-none emerald-scrollbar font-mono text-sm leading-relaxed" placeholder="支持 Markdown 语法编排星际日记..." />
                      </div>
                    </div>
                    <div className="flex gap-4 mt-6 pt-6 border-t border-white/10 shrink-0">
                      {logs[selectedDateKey!] && <button onClick={handleDelete} className="px-6 py-4 rounded-xl border border-red-500/30 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all">删除记录</button>}
                      <button onClick={() => setModalMode("VIEW")} className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold hover:text-white transition-all">取消</button>
                      <button onClick={handleSave} className="flex-1 py-4 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)]">提交档案</button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>, document.body
      )}
    </>
  )
}