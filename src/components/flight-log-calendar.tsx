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
  const formRef = useRef<HTMLFormElement>(null)
  const [focusStyle, setFocusStyle] = useState({ top: 0, left: 0, width: 0, height: 0, opacity: 0 })

  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  useEffect(() => { 
    setMounted(true);
    const savedLogs = localStorage.getItem("STARFLEET_FLIGHT_LOGS");
    if (savedLogs) try { setLogs(JSON.parse(savedLogs)); } catch (e) { console.error(e); }
  }, [])
  
  useEffect(() => { 
    if (mounted) localStorage.setItem("STARFLEET_FLIGHT_LOGS", JSON.stringify(logs)); 
  }, [logs, mounted])

  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  const getDateKey = (y: number, m: number, d: number) => `${y}-${m + 1}-${d}`

  const handleFocus = (e: any) => {
    if (!formRef.current || !e.target) return;
    let top = 0, left = 0, el = e.target;
    while (el && el !== formRef.current) { top += el.offsetTop; left += el.offsetLeft; el = el.offsetParent; }
    setFocusStyle({ top, left, width: e.target.offsetWidth, height: e.target.offsetHeight, opacity: 1 });
  }

  const handleDayClick = (day: number, specificYear?: number, specificMonth?: number) => {
    const targetYear = specificYear ?? year;
    const targetMonth = specificMonth ?? month;
    const key = getDateKey(targetYear, targetMonth, day);
    
    setSelectedDateKey(key); 
    const hasLog = !!logs[key]
    
    if (!hasLog) {
      setModalMode(isManager ? "EDIT" : "VIEW");
      setEditTitle(""); 
      setEditTime(`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`); 
      setEditContent("");
    } else {
      setModalMode("VIEW");
    }
    setIsModalOpen(true); setIsTimePickerOpen(false); setFocusStyle(s => ({...s, opacity: 0}))
  }

  const handleSaveLog = () => {
    if (selectedDateKey) {
      setLogs(p => ({...p, [selectedDateKey]: { title: editTitle, time: editTime, content: editContent }}));
      setIsModalOpen(false);
    }
  }

  const handleClearLog = () => {
    if (selectedDateKey) {
      setLogs(p => { const n = {...p}; delete n[selectedDateKey]; return n; });
      setIsModalOpen(false);
    }
  }

  const handleEditExistingLog = () => {
    if (!selectedDateKey || !logs[selectedDateKey]) return
    setEditTitle(logs[selectedDateKey].title)
    setEditTime(logs[selectedDateKey].time)
    setEditContent(logs[selectedDateKey].content)
    setModalMode("EDIT") 
  }

  const updateHour = (h: string) => { const parts = editTime.split(':'); setEditTime(`${h}:${parts[1] || '00'}`); }
  const updateMinute = (m: string) => { const parts = editTime.split(':'); setEditTime(`${parts[0] || '12'}:${m}`); }

  const flipSpring = { type: "spring", stiffness: 220, damping: 14, mass: 1 }
  const uiSpring = { type: "spring", stiffness: 350, damping: 25 }

  if (!mounted) return null

  const activeLog = selectedDateKey ? logs[selectedDateKey] : null

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]" onClick={() => setIsModalOpen(false)} />
          <style dangerouslySetInnerHTML={{ __html: `
            /* 🚀 定点修复：彻底移除 scale，完美解决字体跳动 */
            @keyframes modal-breathe { 
              0%, 100% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.2); } 
              50% { box-shadow: 0 0 100px rgba(16, 185, 129, 0.35); border-color: rgba(16, 185, 129, 0.4); } 
            } 
            .animate-modal-breathe { animation: modal-breathe 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; } 
            .emerald-scrollbar::-webkit-scrollbar { width: 4px; } 
            .emerald-scrollbar::-webkit-scrollbar-track { background: transparent; } 
            .emerald-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; } 
            .emerald-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
          `}} />
          
          <motion.div initial={{ opacity: 0, scale: 0.8, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }} transition={uiSpring} className="relative w-full max-w-2xl z-10 my-auto max-h-[90vh] flex flex-col" >
            <div className="animate-modal-breathe w-full rounded-[2rem] sm:rounded-[3rem] md:rounded-[3.5rem] bg-[#060813]/95 border p-5 sm:p-8 md:p-12 overflow-hidden relative transition-all duration-500 min-h-0 flex-1">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse"></div>

              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-4 sm:pb-6 mb-5 sm:mb-8 relative z-10">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
                    {modalMode === "EDIT" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 sm:w-6 sm:h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-emerald-500 tracking-[0.1em] sm:tracking-[0.15em] font-[family-name:var(--font-space)] truncate">{modalMode === "EDIT" ? "星际日志录入" : "航行档案卷宗"}</h2>
                    <p className="text-emerald-400/50 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest mt-1 truncate">Stardate: {selectedDateKey}</p>
                  </div>
                </div>
              </div>

              {modalMode === "EDIT" && (
                <form ref={formRef} className="space-y-5 sm:space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); handleSaveLog(); }}>
                  <motion.div initial={false} animate={focusStyle} transition={uiSpring} className="absolute z-0 rounded-2xl border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] pointer-events-none" />
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 space-y-2 relative z-10">
                      <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2">日志标题 / Title</label>
                      <input required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onFocus={handleFocus} onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))} placeholder="输入巡航记录标题..." className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-white font-[family-name:var(--font-space)] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors text-base" />
                    </div>
                    
                    <div className="w-full sm:w-1/3 space-y-2 relative z-30">
                      <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2">精确时间 / Time</label>
                      <div className="relative w-full">
                        <div ref={timeInputRef} onClick={(e) => { setIsTimePickerOpen(true); if (timeInputRef.current) handleFocus({ target: timeInputRef.current }); }} className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-emerald-400 font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors cursor-pointer flex justify-between items-center relative z-10" >
                          <span className="font-bold tracking-widest">{editTime}</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-500/60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>
                        <AnimatePresence>
                          {isTimePickerOpen && (
                            <>
                              <div className="fixed inset-0 z-[40] cursor-default" onClick={(e) => { e.stopPropagation(); setIsTimePickerOpen(false); setFocusStyle(s=>({...s, opacity: 0})); }} />
                              <motion.div initial={{ opacity: 0, scale: 0.9, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: -10 }} transition={uiSpring} className="absolute top-[110%] right-0 mt-2 z-[50] w-56" >
                                <div className="animate-modal-breathe w-full h-48 bg-[#060813]/95 border border-emerald-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] p-3 flex gap-2 overflow-hidden backdrop-blur-xl">
                                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
                                  <div className="flex-1 h-full overflow-y-auto emerald-scrollbar pr-1 space-y-1 relative z-10">
                                    {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                                      <div key={`h-${h}`} onClick={() => updateHour(h)} className={`cursor-pointer py-2 text-center rounded-xl font-mono text-sm transition-all duration-300 ${editTime.split(':')[0] === h ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] font-bold scale-105' : 'text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-300'}`} >{h}</div>
                                    ))}
                                  </div>
                                  <div className="w-px bg-emerald-500/20 my-2 relative z-10"></div>
                                  <div className="flex-1 h-full overflow-y-auto emerald-scrollbar pl-1 pr-1 space-y-1 relative z-10">
                                    {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => (
                                      <div key={`m-${m}`} onClick={() => updateMinute(m)} className={`cursor-pointer py-2 text-center rounded-xl font-mono text-sm transition-all duration-300 ${editTime.split(':')[1] === m ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] font-bold scale-105' : 'text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-300'}`} >{m}</div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2 flex items-center justify-between">
                      <span>详细纪要 / Markdown Support</span><span className="text-zinc-600 font-normal tracking-normal lowercase border border-white/5 bg-white/5 px-2 py-0.5 rounded-md">.md</span>
                    </label>
                    <textarea required rows={5} value={editContent} onChange={(e) => setEditContent(e.target.value)} onFocus={handleFocus} onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))} placeholder="支持 Markdown 语法，详细记录本次舰队巡航或集结情况..." className="ios-scrollbar w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none text-zinc-300 resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors text-base" />
                  </div>

                  <div className="flex gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-emerald-500/10 relative z-20">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 sm:py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all active:scale-95">取消</button>
                    <button type="submit" className="flex-1 py-3 sm:py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2"> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg> 刻录进档案 </button>
                  </div>
                </form>
              )}

              {modalMode === "VIEW" && (
                <div className="relative z-10 flex flex-col">
                  {activeLog ? (
                    <>
                      <div className="flex items-center justify-between gap-3 px-1 sm:px-2 mb-3 sm:mb-4">
                        <h3 className="text-base sm:text-xl font-bold text-white tracking-widest font-[family-name:var(--font-space)] truncate min-w-0">{activeLog.title}</h3>
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg border border-emerald-500/20 shrink-0">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></div>
                          <span className="text-emerald-400 font-mono text-xs">{activeLog.time}</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 border border-emerald-500/20 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] max-h-[45vh] sm:max-h-[40vh] overflow-y-auto emerald-scrollbar">
                        <ReactMarkdown className="text-zinc-300 text-sm md:text-base leading-relaxed break-words" components={{ h1: ({node, ...p}) => <h1 className="text-2xl font-bold text-emerald-400 mb-4 pb-2 border-b border-emerald-500/20" {...p} />, h2: ({node, ...p}) => <h2 className="text-xl font-bold text-emerald-400/90 mt-6 mb-3" {...p} />, h3: ({node, ...p}) => <h3 className="text-lg font-bold text-emerald-400/80 mt-4 mb-2" {...p} />, p: ({node, ...p}) => <p className="mb-4 last:mb-0 leading-relaxed" {...p} />, strong: ({node, ...p}) => <strong className="text-emerald-300 font-bold" {...p} />, ul: ({node, ...p}) => <ul className="list-disc list-inside mb-4 text-zinc-300" {...p} />, ol: ({node, ...p}) => <ol className="list-decimal list-inside mb-4 text-zinc-300" {...p} />, li: ({node, ...p}) => <li className="mb-1" {...p} />, blockquote: ({node, ...p}) => <blockquote className="border-l-4 border-emerald-500/50 pl-4 py-2 mb-4 bg-emerald-500/5 rounded-r-lg text-emerald-200/80 italic" {...p} />, code: ({node, ...p}) => <code className="bg-emerald-500/10 text-emerald-300 px-1.5 py-0.5 rounded font-mono text-sm" {...p} />, pre: ({node, ...p}) => <pre className="bg-[#02040a]/80 p-4 rounded-xl border border-emerald-500/20 mb-4 overflow-x-auto emerald-scrollbar text-sm" {...p} />, a: ({node, ...p}) => <a className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4 decoration-emerald-500/30 transition-colors" target="_blank" rel="noopener noreferrer" {...p} /> }} >
                          {activeLog.content || ""}
                        </ReactMarkdown>
                      </div>
                    </>
                  ) : (
                    <div className="bg-black/40 border border-emerald-500/20 rounded-2xl sm:rounded-[2rem] p-8 sm:p-12 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center min-h-[30vh]">
                      <span className="text-4xl sm:text-5xl mb-4 sm:mb-6 opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">📭</span>
                      <span className="text-emerald-500/80 font-mono tracking-[0.2em] sm:tracking-[0.3em] text-xs sm:text-sm uppercase mb-2">No Records Found</span>
                      <span className="text-zinc-500 text-xs tracking-widest text-center">这天宇宙很平静，没有留下任何航迹...</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-5 sm:pt-8 mt-4 sm:mt-6 border-t border-emerald-500/10">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 sm:py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all active:scale-95">关闭档案</button>
                    
                    {isManager && activeLog && (
                      <button type="button" onClick={handleClearLog} className="flex-1 py-3 sm:py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        清除档案
                      </button>
                    )}

                    {isManager && activeLog && (
                      <button type="button" onClick={handleEditExistingLog} className="flex-1 py-3 sm:py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        覆写卷宗
                      </button>
                    )}
                  </div>
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
        
        <div className="flex items-center justify-between mb-5 sm:mb-8 px-1 sm:px-2 relative z-20 gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 mb-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981] shrink-0"></span>
              <span className="text-emerald-500/60 font-mono text-[9px] uppercase tracking-[0.3em] sm:tracking-[0.4em]">Stardate Logs</span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-[0.1em] sm:tracking-[0.15em] font-[family-name:var(--font-space)] text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              航行日志
            </h2>
          </div>

          <div className="flex items-center bg-[#02040a]/60 border border-emerald-500/20 p-1.5 rounded-2xl backdrop-blur-xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <AnimatePresence>
              {!isFlipped && (
                <motion.div 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 100 }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="flex items-center overflow-hidden whitespace-nowrap"
                >
                  <button onClick={() => setViewDate(new Date(year, month - 1))} className="w-7 h-7 flex items-center justify-center hover:bg-emerald-500/20 rounded-xl transition-all text-emerald-500 hover:text-emerald-300">◀</button>
                  <div className="flex-1 text-center text-[10px] font-mono font-bold text-emerald-400 tracking-widest">{year}-{String(month+1).padStart(2,'0')}</div>
                  <button onClick={() => setViewDate(new Date(year, month + 1))} className="w-7 h-7 flex items-center justify-center hover:bg-emerald-500/20 rounded-xl transition-all text-emerald-500 hover:text-emerald-300">▶</button>
                  <div className="w-px h-4 bg-emerald-500/20 mx-2 shrink-0"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={() => setIsFlipped(!isFlipped)}
              className={`group relative w-8 h-8 shrink-0 rounded-xl flex items-center justify-center transition-all duration-300 ${isFlipped ? 'bg-emerald-500 text-black' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
            >
              {!isFlipped && <div className="absolute inset-[-4px] rounded-[14px] border border-emerald-500/30 opacity-0 group-hover:opacity-100 animate-[ping_2s_infinite]"></div>}
              <motion.div animate={{ rotate: isFlipped ? 180 : 0 }} transition={uiSpring}>
                {isFlipped ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0l-7-7m7 7l-7 7"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7"/></svg>
                )}
              </motion.div>
            </button>
          </div>
        </div>

        <motion.div animate={{ rotateY: isFlipped ? 180 : 0 }} transition={flipSpring} style={{ transformStyle: "preserve-3d" }} className="relative flex-1 w-full h-full">
          
          <div className="absolute inset-0 flex flex-col" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", zIndex: isFlipped ? 0 : 10 }}>
             <div className="flex-1 flex flex-col bg-[#02040a]/40 border border-white/5 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)]">
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4 border-b border-white/5 pb-3 sm:pb-4">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-mono text-zinc-500 uppercase tracking-widest">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 lg:gap-3 flex-1">
                  {blanks.map(i => <div key={`b-${i}`} className="aspect-square" />)}
                  {days.map(day => {
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const hasLog = !!logs[getDateKey(year, month, day)];
                    return (
                      <motion.div key={day} onClick={() => handleDayClick(day)} whileHover={{ scale: 1.2, zIndex: 20 }} transition={uiSpring} className={`cursor-pointer aspect-square rounded-lg sm:rounded-2xl flex flex-col items-center justify-center relative transition-colors duration-300 ${isToday ? "bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white" : "bg-white/[0.02] border border-white/5 text-zinc-400 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-300"}`} >
                        {isToday && <div className="absolute inset-0 rounded-lg sm:rounded-2xl border-2 border-emerald-400 opacity-50 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>}
                        <span className={`text-xs sm:text-sm md:text-base font-bold relative z-10 ${isToday ? "font-[family-name:var(--font-space)]" : "font-mono"}`}>{day}</span>
                        {hasLog && <div className="absolute bottom-1 sm:bottom-2 flex gap-0.5 z-10"> <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div> </div>}
                      </motion.div>
                    )
                  })}
                </div>
             </div>
          </div>

          <div className="absolute inset-0 flex flex-col" style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", zIndex: isFlipped ? 10 : 0 }}>
             <div className="flex-1 flex flex-col bg-[#02040a]/60 border border-emerald-500/20 rounded-2xl sm:rounded-[2rem] p-3 sm:p-6 shadow-[inset_0_0_50px_rgba(16,185,129,0.1)] overflow-hidden">
                <div className="flex items-center justify-between mb-4 border-b border-emerald-500/10 pb-3">
                  <span className="text-[10px] font-mono text-emerald-400/60 uppercase tracking-[0.2em]">Stored Archives: {Object.keys(logs).length}</span>
                </div>
                <div className="flex-1 overflow-y-auto emerald-scrollbar pr-2 space-y-3">
                  {Object.entries(logs).length > 0 ? (
                    Object.entries(logs).sort((a,b) => b[0].localeCompare(a[0])).map(([key, log]) => {
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
