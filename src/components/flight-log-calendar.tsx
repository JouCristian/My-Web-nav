// src/components/flight-log-calendar.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

export function FlightLogCalendar({ userRole }: { userRole: string }) {
  const [viewDate, setViewDate] = useState(new Date())
  const [mounted, setMounted] = useState(false)
  
  // 📝 日志弹窗状态机
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"VIEW" | "EDIT">("VIEW")

  // 模拟数据库日志存储
  const [logs, setLogs] = useState<Record<number, { title: string, time: string, content: string }>>({})

  // 📝 表单录入状态
  const [editTitle, setEditTitle] = useState("")
  const [editTime, setEditTime] = useState("")
  const [editContent, setEditContent] = useState("")

  // 🚀 自定义时间选择器状态
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const timeInputRef = useRef<HTMLDivElement>(null)

  // 🚀 焦点追踪框状态 (Focus Tracking)
  const formRef = useRef<HTMLFormElement>(null)
  const [focusStyle, setFocusStyle] = useState({ top: 0, left: 0, width: 0, height: 0, opacity: 0 })

  // 权限鉴定
  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  useEffect(() => { setMounted(true) }, [])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)

  // 🚀 核心修复 1：使用递归 offsetTop 算法。
  // 彻底免疫 CSS Scale 缩放带来的 getBoundingClientRect 坐标失真问题！
  const handleFocus = (e: any) => {
    if (!formRef.current || !e.target) return;
    let top = 0, left = 0, el = e.target;
    
    // 不断向上寻址，直到追溯到 form 表单的边界，从而算出绝对精准的局部坐标
    while (el && el !== formRef.current) {
      top += el.offsetTop; 
      left += el.offsetLeft; 
      el = el.offsetParent;
    }
    
    setFocusStyle({ 
      top, 
      left, 
      width: e.target.offsetWidth, 
      height: e.target.offsetHeight, 
      opacity: 1 
    });
  }
  const handleBlur = () => { setFocusStyle(prev => ({ ...prev, opacity: 0 })) }

  // 🖱️ 点击日历卡片
  const handleDayClick = (day: number) => {
    setSelectedDay(day)
    const hasLog = !!logs[day]
    
    if (!hasLog) {
      setModalMode(isManager ? "EDIT" : "VIEW")
      setEditTitle("")
      setEditTime(`${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`)
      setEditContent("")
    } else {
      setModalMode("VIEW")
    }
    setIsModalOpen(true)
    setIsTimePickerOpen(false) 
    handleBlur() // 确保每次打开都是无焦点的纯净状态
  }

  // 💾 保存日志
  const handleSaveLog = () => {
    if (!selectedDay) return
    setLogs(prev => ({
      ...prev,
      [selectedDay]: { title: editTitle, time: editTime, content: editContent }
    }))
    setIsModalOpen(false) 
    handleBlur()
  }

  // 🗑️ 清除日志 (防止点错日期)
  const handleClearLog = () => {
    if (!selectedDay) return
    setLogs(prev => {
      const newLogs = { ...prev }
      delete newLogs[selectedDay]
      return newLogs
    })
    setIsModalOpen(false) 
    handleBlur()
  }

  const handleEditExistingLog = () => {
    if (!selectedDay || !logs[selectedDay]) return
    setEditTitle(logs[selectedDay].title)
    setEditTime(logs[selectedDay].time)
    setEditContent(logs[selectedDay].content)
    setModalMode("EDIT") 
  }

  // 🍏 Apple 级非线性物理弹簧参数
  const springConfig = { type: "spring", stiffness: 350, damping: 25, mass: 1 }

  if (!mounted) return null

  const activeLog = selectedDay ? logs[selectedDay] : null

  const modalContent = (
    <AnimatePresence>
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]" 
            onClick={() => setIsModalOpen(false)}
          />
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes modal-breathe {
              0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.2); }
              50% { transform: scale(1.02); box-shadow: 0 0 100px rgba(16, 185, 129, 0.35); border-color: rgba(16, 185, 129, 0.4); }
            }
            .animate-modal-breathe { animation: modal-breathe 3.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
            
            /* 🚀 为自定义时间选择器设计的专属翡翠滚动条 */
            .emerald-scrollbar::-webkit-scrollbar { width: 4px; }
            .emerald-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .emerald-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.2); border-radius: 10px; }
            .emerald-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.5); }
          `}} />

          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
            transition={springConfig}
            className="relative w-full max-w-2xl z-10"
          >
            <div className="animate-modal-breathe w-full rounded-[3.5rem] bg-[#060813]/95 border p-8 md:p-12 overflow-hidden relative transition-all duration-500">
              
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none animate-pulse"></div>

              <div className="flex items-center justify-between border-b border-emerald-500/10 pb-6 mb-8 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    {modalMode === "EDIT" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-emerald-500 tracking-[0.15em] font-[family-name:var(--font-space)]">
                      {modalMode === "EDIT" ? "星际日志录入" : "航行档案卷宗"}
                    </h2>
                    <p className="text-emerald-400/50 font-mono text-[10px] uppercase tracking-widest mt-1">Stardate: {year}-{String(month+1).padStart(2,'0')}-{String(selectedDay).padStart(2,'0')}</p>
                  </div>
                </div>
              </div>

              {/* 🛡️ 模态 1：编辑写入模式 */}
              {modalMode === "EDIT" && (
                <form ref={formRef} className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); handleSaveLog(); }}>
                  
                  {/* 🚀 核心动画：悬浮追踪焦点框，精准贴合 */}
                  <motion.div 
                    initial={false}
                    animate={focusStyle}
                    transition={springConfig}
                    className="absolute z-0 rounded-2xl border-2 border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.6)] pointer-events-none"
                  />

                  <div className="flex gap-4">
                    <div className="flex-1 space-y-2 relative z-10">
                      <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2">日志标题 / Title</label>
                      <input 
                        required type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} 
                        onFocus={handleFocus} onBlur={handleBlur}
                        placeholder="输入巡航记录标题..." 
                        className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none text-white font-[family-name:var(--font-space)] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors" 
                      />
                    </div>
                    
                    {/* 🚀 核心重构 2：隔离层，解决跳跃 BUG */}
                    <div className="w-1/3 space-y-2 relative z-30">
                      <label className="text-[10px] text-emerald-500/60 uppercase tracking-[0.2em] ml-2">精确时间 / Time</label>
                      
                      {/* 将时间伪输入框和下拉框彻底隔离开，避免下拉框的 DOM 被注入 margins */}
                      <div className="relative w-full">
                        {/* 伪装的 Input 框 */}
                        <div 
                          ref={timeInputRef}
                          onClick={(e) => {
                            setIsTimePickerOpen(true);
                            if (timeInputRef.current) handleFocus({ target: timeInputRef.current });
                          }}
                          className="w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 text-emerald-400 font-mono shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors cursor-pointer flex justify-between items-center relative z-10"
                        >
                          <span className="font-bold tracking-widest">{editTime}</span>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-500/60"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        </div>

                        {/* 弹出的苹果级丝滑非线性菜单 */}
                        <AnimatePresence>
                          {isTimePickerOpen && (
                            <>
                              {/* 遮罩移入 Portal，点击外部即刻安全关闭 */}
                              {mounted && createPortal(
                                <div className="fixed inset-0 z-[10000]" onClick={(e) => { e.stopPropagation(); setIsTimePickerOpen(false); handleBlur(); }}></div>,
                                document.body
                              )}
                              
                              <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                transition={springConfig}
                                // 彻底漂浮，保证没有任何 layout 挤压
                                className="absolute top-[110%] right-0 mt-2 z-[10001] w-56"
                              >
                                {/* 内部继续享有 CSS 的呼吸动效，而不与 Framer Motion 的 scale 冲突 */}
                                <div className="animate-modal-breathe w-full h-48 bg-[#060813]/95 border border-emerald-500/30 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] p-3 flex gap-2 overflow-hidden backdrop-blur-xl">
                                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
                                  
                                  {/* 小时列 */}
                                  <div className="flex-1 h-full overflow-y-auto emerald-scrollbar pr-1 space-y-1 relative z-10">
                                    {Array.from({length: 24}, (_, i) => String(i).padStart(2, '0')).map(h => (
                                      <div
                                        key={`h-${h}`}
                                        onClick={() => setEditTime(`${h}:${editTime.split(':')[1]}`)}
                                        className={`cursor-pointer py-2 text-center rounded-xl font-mono text-sm transition-all duration-300 ${editTime.split(':')[0] === h ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] font-bold scale-105' : 'text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
                                      >
                                        {h}
                                      </div>
                                    ))}
                                  </div>
                                  
                                  {/* 分隔线 */}
                                  <div className="w-px bg-emerald-500/20 my-2 relative z-10"></div>
                                  
                                  {/* 分钟列 */}
                                  <div className="flex-1 h-full overflow-y-auto emerald-scrollbar pl-1 pr-1 space-y-1 relative z-10">
                                    {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => (
                                      <div
                                        key={`m-${m}`}
                                        onClick={() => setEditTime(`${editTime.split(':')[0]}:${m}`)}
                                        className={`cursor-pointer py-2 text-center rounded-xl font-mono text-sm transition-all duration-300 ${editTime.split(':')[1] === m ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.6)] font-bold scale-105' : 'text-zinc-400 hover:bg-emerald-500/20 hover:text-emerald-300'}`}
                                      >
                                        {m}
                                      </div>
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
                      <span>详细纪要 / Markdown Support</span>
                      <span className="text-zinc-600 font-normal tracking-normal lowercase border border-white/5 bg-white/5 px-2 py-0.5 rounded-md">.md</span>
                    </label>
                    <textarea 
                      required rows={6} value={editContent} onChange={(e) => setEditContent(e.target.value)} 
                      onFocus={handleFocus} onBlur={handleBlur}
                      placeholder="支持 Markdown 语法，详细记录本次舰队巡航或集结情况..." 
                      className="ios-scrollbar w-full bg-black/40 border border-emerald-500/20 rounded-2xl px-5 py-4 outline-none text-zinc-300 resize-none shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] transition-colors" 
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-emerald-500/10 relative z-20">
                    <button type="button" onClick={() => { setIsModalOpen(false); handleBlur(); }} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all active:scale-95">取消</button>
                    
                    {/* 🚀 如果该日志已经存在，则允许舰长将其彻底清除 */}
                    {activeLog && (
                      <button type="button" onClick={handleClearLog} className="flex-1 py-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold tracking-widest text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] active:scale-95 flex items-center justify-center gap-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        清除档案
                      </button>
                    )}

                    <button type="submit" className="flex-1 py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                      刻录进档案
                    </button>
                  </div>
                </form>
              )}

              {/* 🛡️ 模态 2：详情只读模式 */}
              {modalMode === "VIEW" && (
                <div className="relative z-10 flex flex-col">
                  {activeLog ? (
                    <>
                      <div className="flex items-center justify-between px-2 mb-4">
                        <h3 className="text-xl font-bold text-white tracking-widest font-[family-name:var(--font-space)]">{activeLog.title}</h3>
                        <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-emerald-400 font-mono text-xs">{activeLog.time}</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/40 border border-emerald-500/20 rounded-[2rem] p-6 md:p-8 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] max-h-[40vh] overflow-y-auto ios-scrollbar">
                        <div className="text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-mono">
                          {activeLog.content}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="bg-black/40 border border-emerald-500/20 rounded-[2rem] p-12 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center min-h-[30vh]">
                      <span className="text-5xl mb-6 opacity-30 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">📭</span>
                      <span className="text-emerald-500/80 font-mono tracking-[0.3em] text-sm uppercase mb-2">No Records Found</span>
                      <span className="text-zinc-500 text-xs tracking-widest">这天宇宙很平静，没有留下任何航迹...</span>
                    </div>
                  )}

                  <div className="flex gap-4 pt-8 mt-6 border-t border-emerald-500/10">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-400 font-bold tracking-widest text-[10px] hover:text-white hover:bg-white/10 transition-all active:scale-95">关闭档案</button>
                    {/* 🚀 舰长/管理员的专属修改权限 */}
                    {isManager && activeLog && (
                      <button type="button" onClick={handleEditExistingLog} className="flex-1 py-4 rounded-2xl bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 font-bold tracking-widest text-[10px] hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex items-center justify-center gap-2">
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
              
              // 动态判断当前日期是否有真实存入的状态
              const hasLog = !!logs[day]

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
                  {isToday && (
                    <div className="absolute inset-0 rounded-2xl border-2 border-emerald-400 opacity-50 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  )}

                  <span className={`text-sm md:text-base font-bold relative z-10 ${isToday ? "font-[family-name:var(--font-space)]" : "font-mono"}`}>{day}</span>
                  
                  {/* 当且仅当有真实存入的状态时，才显示绿点 */}
                  {hasLog && (
                    <div className="absolute bottom-2 flex gap-0.5 z-10">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></div>
                    </div>
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