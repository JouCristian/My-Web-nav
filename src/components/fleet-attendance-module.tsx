// src/components/fleet-attendance-module.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

// 模拟舰队成员名单
const FLEET_CREW = ["Cmdr. Shepard", "Lt. Ripley", "Eng. Isaac", "Pilot Cooper", "Dr. Brand", "Spec. Nova"]

type RollCallLog = {
  id: string;
  timestamp: number;
  present: string[];
  missing: string[];
}

export function FleetAttendanceModule({ userRole, userName = "Captain" }: { userRole: string, userName?: string }) {
  const [mounted, setMounted] = useState(false)
  
  // 📅 日历状态
  const [viewDate, setViewDate] = useState(new Date())
  const [logs, setLogs] = useState<Record<string, RollCallLog[]>>({})
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null)
  const [calendarDirection, setCalendarDirection] = useState(1) // 控制月份翻转方向
  
  // ⏱️ 实时集结状态机
  const [isRollCallActive, setIsRollCallActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [inputMins, setInputMins] = useState("01")
  const [inputSecs, setInputSecs] = useState("00")
  
  // 🚀 自定义时间选择器状态
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [tempMins, setTempMins] = useState("01")
  const [tempSecs, setTempSecs] = useState("00")
  
  // 👥 人员状态
  const [presentCrew, setPresentCrew] = useState<string[]>([])
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isManager = userRole === "OWNER" || userRole === "ADMIN"
  const allCrew = isManager ? [...FLEET_CREW] : [userName, ...FLEET_CREW]

  useEffect(() => { 
    setMounted(true)
    const saved = localStorage.getItem("STARFLEET_ATTENDANCE_V3")
    if (saved) try { setLogs(JSON.parse(saved)) } catch (e) { console.error(e) }
  }, [])
  
  useEffect(() => { 
    if (mounted) localStorage.setItem("STARFLEET_ATTENDANCE_V3", JSON.stringify(logs)) 
  }, [logs, mounted])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRollCallActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
        if (Math.random() < 0.15) {
          const missing = allCrew.filter(c => !presentCrew.includes(c))
          if (missing.length > 0) {
            const randomCrew = missing[Math.floor(Math.random() * missing.length)]
            setPresentCrew(prev => [...prev, randomCrew])
          }
        }
      }, 1000)
    } else if (isRollCallActive && countdown === 0) {
      setIsRollCallActive(false)
      setIsSummaryOpen(true)
    }
    return () => clearTimeout(timer)
  }, [isRollCallActive, countdown, presentCrew, allCrew])

  const startRollCall = () => {
    const totalSecs = (parseInt(inputMins) || 0) * 60 + (parseInt(inputSecs) || 0)
    if (totalSecs <= 0) return
    setCountdown(totalSecs)
    setPresentCrew([]) 
    setIsRollCallActive(true)
  }

  const startHold = () => {
    if (presentCrew.includes(userName)) return
    setIsHolding(true)
    holdTimerRef.current = setTimeout(() => {
      setPresentCrew(prev => [...prev, userName])
      setIsHolding(false)
    }, 1500) 
  }
  const stopHold = () => {
    setIsHolding(false)
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
  }

  const handleSaveAndClose = () => {
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    const missing = allCrew.filter(c => !presentCrew.includes(c))
    const newLog: RollCallLog = { id: Date.now().toString(), timestamp: Date.now(), present: presentCrew, missing: missing }
    setLogs(prev => ({ ...prev, [todayKey]: [...(prev[todayKey] || []), newLog] }))
    setIsSummaryOpen(false)
  }

  const changeMonth = (dir: number) => {
    setCalendarDirection(dir)
    setViewDate(new Date(year, month + dir))
  }

  // 🚀 日历强制 42 宫格计算 (防止高度跳变)
  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const totalCells = 42; // 6 行 7 列恒定
  
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const trailingBlanks = Array.from({ length: totalCells - days.length - blanks.length }, (_, i) => i + 1)
  
  const getDateKey = (y: number, m: number, d: number) => `${y}-${m + 1}-${d}`
  const formatTime = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  const uiSpring = { type: "spring", stiffness: 300, damping: 25 }

  if (!mounted) return null

  const currentDayLogs = selectedDateKey ? logs[selectedDateKey] || [] : []
  const activeDetail = currentDayLogs.find(l => l.id === selectedLogId)

  // ===================== 弹窗 UI 动画配置 =====================
  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(15px)", transition: { duration: 0.4 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }
  }
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.85, y: 30, filter: "blur(10px) brightness(1)" },
    visible: { opacity: 1, scale: 1, y: 0, filter: "blur(0px) brightness(1)", transition: { type: "spring", stiffness: 350, damping: 25, mass: 1 } },
    exit: { opacity: 0, scale: 0.9, y: 10, filter: "blur(20px) brightness(0.4)", transition: { duration: 0.3 } }
  }
  const listVariants = {
    hidden: { opacity: 0, x: -30, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, x: -30, scale: 0.95, transition: { duration: 0.2 } }
  }
  const detailVariants = {
    hidden: { opacity: 0, x: 30, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, x: 30, scale: 0.95, transition: { duration: 0.2 } }
  }

  const summaryModal = (
    <AnimatePresence>
      {isSummaryOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-[#02040a]/60" />
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative w-full max-w-xl z-10">
            <div className="animate-modal-heavy-breathe w-full rounded-[2.5rem] bg-[#060813]/95 border-2 border-amber-500/50 p-8 md:p-10 shadow-[0_0_80px_rgba(245,158,11,0.2)] overflow-hidden">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                <h2 className="text-2xl font-bold text-amber-400 tracking-[0.2em] font-[family-name:var(--font-space)]">集结通道已关闭</h2>
                <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">Synchronization Complete</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-widest mb-3 flex justify-between"><span>已就位 (Synced)</span><span>{presentCrew.length}</span></div>
                  <div className="space-y-2 h-[250px] overflow-y-auto emerald-scrollbar pr-1">
                    {presentCrew.map(c => <div key={c} className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">{c}</div>)}
                    {presentCrew.length === 0 && <div className="text-xs text-zinc-600 italic">无人响应...</div>}
                  </div>
                </div>
                <div className="bg-black/40 border border-red-500/20 rounded-2xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="text-[10px] text-red-500/60 font-mono uppercase tracking-widest mb-3 flex justify-between"><span>未响应 (Missing)</span><span>{allCrew.length - presentCrew.length}</span></div>
                  <div className="space-y-2 h-[250px] overflow-y-auto red-scrollbar pr-1">
                    {allCrew.filter(c => !presentCrew.includes(c)).map(c => <div key={c} className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{c}</div>)}
                    {allCrew.length === presentCrew.length && <div className="text-xs text-emerald-500/50 italic">全员集结完毕！</div>}
                  </div>
                </div>
              </div>
              <button onClick={handleSaveAndClose} className="w-full py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95">刻录入舰队档案</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  const historyModal = (
    <AnimatePresence>
      {selectedDateKey && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-[#02040a]/60" onClick={() => { setSelectedDateKey(null); setSelectedLogId(null); }} />
          
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10">
            {/* 🚀 layout 属性让容器尺寸在列表和详情切换时，如橡皮筋般平滑过渡 */}
            <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 25 }} className="animate-modal-heavy-breathe w-[500px] md:w-[600px] bg-[#060813]/95 border-2 border-amber-500/50 rounded-[2.5rem] shadow-[0_0_80px_rgba(245,158,11,0.2)] p-8 overflow-hidden relative">
              
              <AnimatePresence mode="wait">
                {!selectedLogId ? (
                  <motion.div key="list" variants={listVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col">
                    <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
                      <h2 className="text-xl font-bold text-amber-400 tracking-[0.2em] font-[family-name:var(--font-space)]">历史集结档案</h2>
                      <span className="text-amber-500/60 font-mono text-sm">{selectedDateKey}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto amber-scrollbar pr-2 space-y-3 mb-6 max-h-[350px] min-h-[250px]">
                      {currentDayLogs.length > 0 ? (
                        currentDayLogs.map(log => (
                          <div key={log.id} onClick={() => setSelectedLogId(log.id)} className="group relative flex justify-between items-center bg-black/40 border border-white/10 hover:border-amber-500/40 p-4 rounded-xl cursor-pointer transition-all active:scale-[0.98] overflow-hidden">
                            {/* 🚀 记录条流光扫描特效 */}
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.1),transparent)] -translate-x-full group-hover:animate-[shimmer-seamless_1.5s_infinite] pointer-events-none"></div>
                            
                            <div className="relative z-10">
                              <div className="text-sm font-bold text-white mb-1 group-hover:text-amber-300 transition-colors">
                                签到记录 / {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </div>
                              <div className="text-xs font-mono text-zinc-500">响应率: {log.present.length} / {log.present.length + log.missing.length}</div>
                            </div>
                            <div className="text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform relative z-10">➔</div>
                          </div>
                        ))
                      ) : (
                        <div className="h-full min-h-[200px] flex flex-col items-center justify-center text-zinc-600 font-mono text-xs tracking-widest gap-4">
                          <span className="text-4xl opacity-30">📭</span>
                          NO RECORDS FOUND
                        </div>
                      )}
                    </div>
                    
                    <button onClick={() => setSelectedDateKey(null)} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all active:scale-95">关闭档案</button>
                  </motion.div>
                ) : (
                  <motion.div key="detail" variants={detailVariants} initial="hidden" animate="visible" exit="exit" className="flex flex-col">
                    <div className="flex items-center gap-4 mb-6 border-b border-amber-500/20 pb-4">
                      <button onClick={() => setSelectedLogId(null)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 transition-all">◀</button>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-amber-400 tracking-[0.2em] font-[family-name:var(--font-space)]">档案详情</h2>
                        {activeDetail && <span className="text-amber-500/60 font-mono text-[10px] tracking-widest uppercase">Ref: {new Date(activeDetail.timestamp).toLocaleString()}</span>}
                      </div>
                    </div>

                    {activeDetail && (
                      <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                          <div className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-widest mb-3 flex justify-between"><span>已就位</span><span>{activeDetail.present.length}</span></div>
                          {/* 🚀 严格限制高度，配置绿色滚动条 */}
                          <div className="space-y-2 h-[250px] overflow-y-auto emerald-scrollbar pr-1">
                            {activeDetail.present.map(c => <div key={c} className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">{c}</div>)}
                          </div>
                        </div>
                        <div className="bg-black/40 border border-red-500/20 rounded-2xl p-4 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                          <div className="text-[10px] text-red-500/60 font-mono uppercase tracking-widest mb-3 flex justify-between"><span>未响应</span><span>{activeDetail.missing.length}</span></div>
                          {/* 🚀 严格限制高度，配置红色滚动条 */}
                          <div className="space-y-2 h-[250px] overflow-y-auto red-scrollbar pr-1">
                            {activeDetail.missing.map(c => <div key={c} className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{c}</div>)}
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes modal-heavy-breathe {
          0%, 100% { box-shadow: 0 0 40px rgba(245,158,11,0.2), inset 0 0 20px rgba(245,158,11,0.1); border-color: rgba(245,158,11,0.4); }
          50% { box-shadow: 0 0 100px rgba(245,158,11,0.6), inset 0 0 50px rgba(245,158,11,0.3); border-color: rgba(245,158,11,0.8); }
        }
        .animate-modal-heavy-breathe { animation: modal-heavy-breathe 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        
        .amber-scrollbar::-webkit-scrollbar { width: 4px; } 
        .amber-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .amber-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; border: 1px solid transparent; background-clip: padding-box; } 
        .amber-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.6); }
        
        .emerald-scrollbar::-webkit-scrollbar { width: 4px; } 
        .emerald-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .emerald-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; border: 1px solid transparent; background-clip: padding-box; } 
        .emerald-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6); }

        .red-scrollbar::-webkit-scrollbar { width: 4px; } 
        .red-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .red-scrollbar::-webkit-scrollbar-thumb { background: rgba(239, 68, 68, 0.3); border-radius: 10px; border: 1px solid transparent; background-clip: padding-box; } 
        .red-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(239, 68, 68, 0.6); }

        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}} />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-4">
        
        {/* ================= 左舷：打卡控制中枢 ================= */}
        <div className="lg:col-span-2 rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-2xl flex flex-col h-full relative">
          
          <div className="absolute inset-0 rounded-[3.5rem] overflow-hidden pointer-events-none z-0">
            <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]"><span className="text-2xl">⏳</span></div>
              <div><h2 className="text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]">跃迁集结序列</h2><p className="text-amber-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Fleet Synchronization Protocol</p></div>
            </div>
            {isRollCallActive && <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 font-mono text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.4)]">SYNC IN PROGRESS</div>}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-[#02040a]/60 border border-white/5 rounded-[2rem] p-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
            
            {!isRollCallActive && (
              <div className="w-full max-w-md flex flex-col items-center gap-8 relative">
                {isManager ? (
                  <>
                    <div className="text-center mb-4 relative z-20">
                      <div className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-4">Set Countdown Window</div>
                      <div className="relative">
                        <div onClick={() => { setTempMins(inputMins); setTempSecs(inputSecs); setIsTimePickerOpen(true); }} className="flex items-center justify-center gap-4 cursor-pointer group" >
                          {/* 🚀 调小数字框，防止下拉舱横向溢出 */}
                          <div className="w-20 bg-black/50 border border-amber-500/30 rounded-2xl p-3 text-center text-4xl font-mono text-amber-400 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">{inputMins}</div>
                          <span className="text-4xl text-amber-500/50 font-bold group-hover:text-amber-400 transition-colors">:</span>
                          <div className="w-20 bg-black/50 border border-amber-500/30 rounded-2xl p-3 text-center text-4xl font-mono text-amber-400 group-hover:border-amber-400 group-hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">{inputSecs}</div>
                        </div>

                        <AnimatePresence>
                          {isTimePickerOpen && (
                            <>
                              <div className="fixed inset-0 z-[40] cursor-default" onClick={(e) => { e.stopPropagation(); setIsTimePickerOpen(false); }} />
                              <motion.div 
                                initial={{ opacity: 0, scale: 0.9, y: -20, filter: "blur(10px)" }}
                                animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                                exit={{ opacity: 0, scale: 0.9, y: -10, filter: "blur(10px)" }}
                                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                                className="absolute top-[120%] left-1/2 -translate-x-1/2 z-[50] w-64 overflow-x-hidden" // 强制干掉横向滚动条
                              >
                                <div className="w-full bg-[#060813]/95 border border-amber-500/40 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] p-4 flex flex-col gap-4 backdrop-blur-xl overflow-x-hidden">
                                  <div className="flex justify-between items-center px-4 font-mono text-[10px] text-amber-500/60 tracking-widest uppercase"><span>MINUTES</span><span>SECONDS</span></div>
                                  <div className="flex gap-2 h-40 relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#060813] via-transparent to-[#060813] pointer-events-none z-10" />
                                    <div className="flex-1 h-full overflow-y-auto overflow-x-hidden amber-scrollbar relative z-0 pr-1 text-center space-y-1">
                                      {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(m => (
                                        <div key={`m-${m}`} onClick={() => setTempMins(m)} className={`cursor-pointer py-1.5 rounded-xl font-mono text-base transition-all duration-300 ${tempMins === m ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold scale-110' : 'text-zinc-500 hover:text-amber-200'}`}>{m}</div>
                                      ))}
                                    </div>
                                    <div className="w-px bg-amber-500/20 my-2 z-0"></div>
                                    <div className="flex-1 h-full overflow-y-auto overflow-x-hidden amber-scrollbar relative z-0 pl-1 text-center space-y-1">
                                      {Array.from({length: 60}, (_, i) => String(i).padStart(2, '0')).map(s => (
                                        <div key={`s-${s}`} onClick={() => setTempSecs(s)} className={`cursor-pointer py-1.5 rounded-xl font-mono text-base transition-all duration-300 ${tempSecs === s ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] font-bold scale-110' : 'text-zinc-500 hover:text-amber-200'}`}>{s}</div>
                                      ))}
                                    </div>
                                  </div>
                                  {/* 🚀 中文修正 */}
                                  <button onClick={() => { setInputMins(tempMins); setInputSecs(tempSecs); setIsTimePickerOpen(false); }} className="w-full py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold tracking-[0.2em] text-[10px] hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.1)]">确认时间</button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* 🚀 脉冲特效按钮：悬浮呼吸 + 金色脉冲 */}
                    <button onClick={startRollCall} className="relative group w-full py-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold tracking-[0.3em] text-lg transition-all duration-500 ease-out hover:bg-amber-500 hover:text-black hover:scale-[1.02] shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95 z-10 overflow-hidden">
                      <div className="absolute inset-0 rounded-2xl border-2 border-amber-400 opacity-0 group-hover:animate-ping pointer-events-none"></div>
                      <span className="relative z-10">发起全舰集结指令</span>
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center opacity-50">
                    <div className="w-20 h-20 border-4 border-dashed border-zinc-600 rounded-full animate-[spin_10s_linear_infinite] mb-6"></div>
                    <span className="font-mono tracking-[0.3em] text-zinc-400 uppercase">Awaiting Command...</span>
                    <span className="text-xs text-zinc-600 mt-2">等待舰长开启跃迁通道</span>
                  </div>
                )}
              </div>
            )}

            {isRollCallActive && (
              <div className="w-full flex flex-col items-center">
                <div className={`text-7xl md:text-9xl font-bold font-mono tracking-tighter mb-12 transition-colors duration-500 ${countdown <= 10 ? 'text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse' : 'text-amber-400 drop-shadow-[0_0_40px_rgba(245,158,11,0.6)]'}`}>
                  {formatTime(countdown)}
                </div>

                <div className="w-full max-w-2xl grid grid-cols-2 md:grid-cols-3 gap-3 mb-10">
                  {allCrew.map(crew => {
                    const isSynced = presentCrew.includes(crew)
                    return (
                      <div key={crew} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${isSynced ? 'bg-amber-500/10 border-amber-500/30' : 'bg-black/40 border-white/5 opacity-50'}`}>
                        <div className={`w-2 h-2 rounded-full ${isSynced ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.8)]' : 'bg-zinc-600'}`}></div>
                        <span className={`text-xs font-bold font-mono truncate ${isSynced ? 'text-amber-300' : 'text-zinc-500'}`}>{crew}</span>
                      </div>
                    )
                  })}
                </div>

                {!isManager && (
                  <button 
                    onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold}
                    disabled={presentCrew.includes(userName)}
                    className="relative overflow-hidden w-full max-w-md h-16 rounded-2xl bg-white/5 border border-white/10 group active:scale-[0.98] transition-transform select-none"
                  >
                    <div className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600 to-amber-400 transition-all ${isHolding ? 'w-full duration-[1500ms] ease-linear' : 'w-0 duration-300 ease-out'}`} />
                    <div className="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none z-10">
                      {/* 🚀 中文修正 */}
                      <span className="text-white font-bold tracking-[0.4em] font-mono drop-shadow-md">{presentCrew.includes(userName) ? '✓ 已成功连接' : '长按完成签到'}</span>
                    </div>
                    {!presentCrew.includes(userName) && !isHolding && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        {/* 🚀 中文修正 */}
                        <span className="text-zinc-500 font-bold tracking-[0.4em] font-mono transition-opacity duration-300 group-hover:text-amber-500/50">长按完成签到</span>
                      </div>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= 右舷：时空日历矩阵 ================= */}
        <div className="lg:col-span-1 rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 shadow-[0_0_100px_rgba(245,158,11,0.1)] flex flex-col h-full relative overflow-hidden group">
          
          {/* 🚀 高级日历网格光效 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(245,158,11,0.08),transparent)] bg-[length:200%_200%] animate-[shimmer-seamless_4s_linear_infinite] pointer-events-none"></div>

          <div className="flex items-center justify-between mb-8 px-2 relative z-10">
            <div className="flex flex-col"><div className="flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]"></span><span className="text-amber-500/60 font-mono text-[9px] uppercase tracking-[0.4em]">Temporal Logs</span></div><h2 className="text-xl font-bold tracking-[0.1em] font-[family-name:var(--font-space)] text-white">集结档案</h2></div>
            <div className="flex items-center bg-amber-500/10 border border-amber-500/20 p-1 rounded-lg">
              <button onClick={() => changeMonth(-1)} className="w-6 h-6 flex items-center justify-center hover:bg-amber-500/20 rounded transition-all text-amber-400">◀</button>
              <div className="px-2 text-[10px] font-mono font-bold text-amber-300 tracking-tighter w-12 text-center">{month+1}月</div>
              <button onClick={() => changeMonth(1)} className="w-6 h-6 flex items-center justify-center hover:bg-amber-500/20 rounded transition-all text-amber-400">▶</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-5 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10 overflow-hidden">
            <div className="grid grid-cols-7 gap-1 mb-3 border-b border-white/5 pb-3">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-mono text-zinc-500">{d}</div>)}
            </div>
            
            {/* 🚀 月份翻转动画 & 强制高度稳定机制 */}
            <div className="flex-1 relative">
              <AnimatePresence initial={false} custom={calendarDirection} mode="wait">
                <motion.div 
                  key={viewDate.toISOString()}
                  custom={calendarDirection}
                  initial={(d: number) => ({ opacity: 0, x: d * 30 })}
                  animate={{ opacity: 1, x: 0 }}
                  exit={(d: number) => ({ opacity: 0, x: d * -30 })}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className="absolute inset-0 grid grid-cols-7 gap-1"
                >
                  {blanks.map(i => <div key={`b-${i}`} className="aspect-square" />)}
                  
                  {days.map(day => {
                    const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                    const logKey = getDateKey(year, month, day);
                    const hasLog = logs[logKey] && logs[logKey].length > 0;
                    return (
                      <motion.div 
                        key={day} 
                        // 🚀 核心修改：无论有无记录，全都允许点击触发弹窗
                        onClick={() => setSelectedDateKey(logKey)} 
                        whileHover={{ scale: 1.15, zIndex: 10 }} 
                        className={`cursor-pointer aspect-square rounded-xl flex items-center justify-center relative transition-colors duration-300 ${hasLog ? 'bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400' : isToday ? "bg-white/5 border border-white/10 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"}`}
                      >
                        {isToday && <div className="absolute inset-0 rounded-xl border border-white/20 opacity-50 animate-ping"></div>}
                        <span className="text-[10px] font-mono font-bold relative z-10">{day}</span>
                        {hasLog && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"></div>}
                      </motion.div>
                    )
                  })}

                  {/* 填补空位，保证恒定 42 宫格 */}
                  {trailingBlanks.map(i => <div key={`tb-${i}`} className="aspect-square" />)}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
      
      {mounted && createPortal(<>{summaryModal}{historyModal}</>, document.body)}
    </>
  )
}