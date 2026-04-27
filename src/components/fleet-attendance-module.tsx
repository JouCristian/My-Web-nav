// src/components/fleet-attendance-module.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

// 模拟舰队成员名单
const FLEET_CREW = ["Cmdr. Shepard", "Lt. Ripley", "Eng. Isaac", "Pilot Cooper", "Dr. Brand", "Spec. Nova"]

export function FleetAttendanceModule({ userRole, userName = "Captain" }: { userRole: string, userName?: string }) {
  const [mounted, setMounted] = useState(false)
  
  // 📅 日历状态
  const [viewDate, setViewDate] = useState(new Date())
  const [logs, setLogs] = useState<Record<string, { present: string[], missing: string[] }>>({})
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null)
  
  // ⏱️ 实时集结状态机
  const [isRollCallActive, setIsRollCallActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [inputMins, setInputMins] = useState("01")
  const [inputSecs, setInputSecs] = useState("00")
  
  // 👥 人员状态
  const [presentCrew, setPresentCrew] = useState<string[]>([])
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)

  // 🖱️ 长按蓄力状态
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isManager = userRole === "OWNER" || userRole === "ADMIN"
  const allCrew = [userName, ...FLEET_CREW]

  // 💾 本地持久化
  useEffect(() => { 
    setMounted(true)
    const saved = localStorage.getItem("STARFLEET_ATTENDANCE")
    if (saved) try { setLogs(JSON.parse(saved)) } catch (e) { console.error(e) }
  }, [])
  
  useEffect(() => { 
    if (mounted) localStorage.setItem("STARFLEET_ATTENDANCE", JSON.stringify(logs)) 
  }, [logs, mounted])

  // ⏱️ 倒计时与模拟实时签到引擎
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isRollCallActive && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => prev - 1)
        // 🚀 量子模拟引擎：每秒有 15% 的概率，随机一个未签到的 AI 船员完成签到
        if (Math.random() < 0.15) {
          const missing = FLEET_CREW.filter(c => !presentCrew.includes(c))
          if (missing.length > 0) {
            const randomCrew = missing[Math.floor(Math.random() * missing.length)]
            setPresentCrew(prev => [...prev, randomCrew])
          }
        }
      }, 1000)
    } else if (isRollCallActive && countdown === 0) {
      // 时间到！自动结束并弹出结算
      setIsRollCallActive(false)
      setIsSummaryOpen(true)
    }
    return () => clearTimeout(timer)
  }, [isRollCallActive, countdown, presentCrew])

  // 发起集结指令
  const startRollCall = () => {
    const totalSecs = (parseInt(inputMins) || 0) * 60 + (parseInt(inputSecs) || 0)
    if (totalSecs <= 0) return
    setCountdown(totalSecs)
    setPresentCrew([]) // 清空状态
    setIsRollCallActive(true)
  }

  // 长按蓄力签到系统 (Hold-to-Sync)
  const startHold = () => {
    if (presentCrew.includes(userName)) return
    setIsHolding(true)
    holdTimerRef.current = setTimeout(() => {
      setPresentCrew(prev => [...prev, userName])
      setIsHolding(false)
    }, 1500) // 1.5秒蓄力时间
  }
  const stopHold = () => {
    setIsHolding(false)
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
  }

  // 结算与保存
  const handleSaveAndClose = () => {
    const todayKey = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
    const missing = allCrew.filter(c => !presentCrew.includes(c))
    
    setLogs(prev => ({
      ...prev,
      [todayKey]: { present: presentCrew, missing: missing }
    }))
    setIsSummaryOpen(false)
  }

  // 日历相关计算
  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const getDateKey = (y: number, m: number, d: number) => `${y}-${m + 1}-${d}`

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60); const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const uiSpring = { type: "spring", stiffness: 300, damping: 25 }

  if (!mounted) return null

  const activeHistory = selectedDateKey ? logs[selectedDateKey] : null

  // ===================== 弹窗 UI 组件 =====================
  const summaryModal = (
    <AnimatePresence>
      {isSummaryOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-xl" />
          <div className="absolute inset-0 opacity-[0.1] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={uiSpring} className="relative w-full max-w-xl z-10" >
            <div className="w-full rounded-[2.5rem] bg-[#060813]/95 border border-amber-500/30 p-8 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-500 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h2 className="text-2xl font-bold text-amber-400 tracking-[0.2em] font-[family-name:var(--font-space)]">集结通道已关闭</h2>
                <p className="text-zinc-500 font-mono text-xs mt-2 uppercase tracking-widest">Synchronization Complete</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-widest mb-3 flex justify-between"><span>已就位 (Synced)</span><span>{presentCrew.length}</span></div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto emerald-scrollbar">
                    {presentCrew.map(c => <div key={c} className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">{c}</div>)}
                    {presentCrew.length === 0 && <div className="text-xs text-zinc-600 italic">无人响应...</div>}
                  </div>
                </div>
                <div className="bg-black/40 border border-red-500/20 rounded-2xl p-4">
                  <div className="text-[10px] text-red-500/60 font-mono uppercase tracking-widest mb-3 flex justify-between"><span>未响应 (Missing)</span><span>{allCrew.length - presentCrew.length}</span></div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto emerald-scrollbar">
                    {allCrew.filter(c => !presentCrew.includes(c)).map(c => <div key={c} className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{c}</div>)}
                    {allCrew.length === presentCrew.length && <div className="text-xs text-emerald-500/50 italic">全员集结完毕！</div>}
                  </div>
                </div>
              </div>

              <button onClick={handleSaveAndClose} className="w-full py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold tracking-[0.2em] hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95">
                刻录入舰队档案
              </button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-xl" onClick={() => setSelectedDateKey(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={uiSpring} className="relative w-full max-w-xl z-10" >
            <div className="w-full rounded-[2.5rem] bg-[#060813]/95 border border-amber-500/30 p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden">
              <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
                <h2 className="text-xl font-bold text-amber-400 tracking-[0.2em] font-[family-name:var(--font-space)]">历史集结档案</h2>
                <span className="text-amber-500/60 font-mono text-sm">{selectedDateKey}</span>
              </div>
              
              {activeHistory ? (
                 <div className="grid grid-cols-2 gap-6 mb-6">
                 <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4">
                   <div className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-widest mb-3">已就位 ({activeHistory.present.length})</div>
                   <div className="space-y-2 max-h-[30vh] overflow-y-auto emerald-scrollbar">
                     {activeHistory.present.map(c => <div key={c} className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/20">{c}</div>)}
                   </div>
                 </div>
                 <div className="bg-black/40 border border-red-500/20 rounded-2xl p-4">
                   <div className="text-[10px] text-red-500/60 font-mono uppercase tracking-widest mb-3">未响应 ({activeHistory.missing.length})</div>
                   <div className="space-y-2 max-h-[30vh] overflow-y-auto emerald-scrollbar">
                     {activeHistory.missing.map(c => <div key={c} className="text-sm font-bold text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{c}</div>)}
                   </div>
                 </div>
               </div>
              ) : (
                <div className="h-[20vh] flex items-center justify-center text-zinc-600 font-mono text-xs tracking-widest">
                  NO RECORDS FOUND
                </div>
              )}
              <button onClick={() => setSelectedDateKey(null)} className="w-full py-4 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-[0.2em] hover:bg-white/10 hover:text-white transition-all active:scale-95">关闭档案</button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .amber-scrollbar::-webkit-scrollbar { width: 4px; } 
        .amber-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .amber-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.2); border-radius: 10px; } 
        .amber-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.5); }
      `}} />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-4">
        
        {/* ================= 左舷：打卡控制中枢 ================= */}
        <div className="lg:col-span-2 rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-2xl flex flex-col h-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                <span className="text-2xl">⏳</span>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)]">跃迁集结序列</h2>
                <p className="text-amber-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Fleet Synchronization Protocol</p>
              </div>
            </div>
            {isRollCallActive && <div className="px-4 py-2 bg-amber-500/20 border border-amber-500/50 rounded-full text-amber-400 font-mono text-xs font-bold animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.4)]">SYNC IN PROGRESS</div>}
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-[#02040a]/60 border border-white/5 rounded-[2rem] p-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
            
            {/* 尚未开始状态：舰长设置倒计时 */}
            {!isRollCallActive && (
              <div className="w-full max-w-md flex flex-col items-center gap-8">
                {isManager ? (
                  <>
                    <div className="text-center mb-4">
                      <div className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-4">Set Countdown Window</div>
                      <div className="flex items-center justify-center gap-4">
                        <input type="number" min="0" max="59" value={inputMins} onChange={e => setInputMins(e.target.value)} className="w-24 bg-black/50 border border-amber-500/30 rounded-2xl p-4 text-center text-4xl font-mono text-amber-400 outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all" />
                        <span className="text-3xl text-amber-500/50 font-bold">:</span>
                        <input type="number" min="0" max="59" value={inputSecs} onChange={e => setInputSecs(e.target.value)} className="w-24 bg-black/50 border border-amber-500/30 rounded-2xl p-4 text-center text-4xl font-mono text-amber-400 outline-none focus:border-amber-400 focus:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all" />
                      </div>
                    </div>
                    <button onClick={startRollCall} className="w-full py-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold tracking-[0.3em] text-lg hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] active:scale-95">
                      发起全舰集结指令
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

            {/* 集结进行中状态 */}
            {isRollCallActive && (
              <div className="w-full flex flex-col items-center">
                {/* 巨大全息倒计时 */}
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

                {/* 🚀 核心交互：长按防误触签到引擎 (Hold-to-Sync) */}
                <button 
                  onPointerDown={startHold}
                  onPointerUp={stopHold}
                  onPointerLeave={stopHold}
                  disabled={presentCrew.includes(userName)}
                  className="relative overflow-hidden w-full max-w-md h-16 rounded-2xl bg-white/5 border border-white/10 group active:scale-[0.98] transition-transform select-none"
                >
                  <div className={`absolute left-0 top-0 bottom-0 bg-gradient-to-r from-amber-600 to-amber-400 transition-all ${isHolding ? 'w-full duration-[1500ms] ease-linear' : 'w-0 duration-300 ease-out'}`} />
                  
                  <div className="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
                    <span className="text-white font-bold tracking-[0.4em] font-mono">
                      {presentCrew.includes(userName) ? '✓ 已成功连接' : 'HOLD TO SYNC'}
                    </span>
                  </div>
                  
                  {/* 未按下时的默认文字，用来产生颜色对比 */}
                  {!presentCrew.includes(userName) && !isHolding && (
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                       <span className="text-zinc-500 font-bold tracking-[0.4em] font-mono transition-opacity duration-300 group-hover:text-amber-500/50">
                         HOLD TO SYNC
                       </span>
                     </div>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ================= 右舷：时空日历矩阵 ================= */}
        <div className="lg:col-span-1 rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 shadow-2xl flex flex-col h-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-amber-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          
          <div className="flex items-center justify-between mb-8 px-2 relative z-10">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]"></span>
                <span className="text-amber-500/60 font-mono text-[9px] uppercase tracking-[0.4em]">Temporal Logs</span>
              </div>
              <h2 className="text-xl font-bold tracking-[0.1em] font-[family-name:var(--font-space)] text-white">集结档案</h2>
            </div>
            
            <div className="flex items-center bg-amber-500/10 border border-amber-500/20 p-1 rounded-lg">
              <button onClick={() => setViewDate(new Date(year, month - 1))} className="w-6 h-6 flex items-center justify-center hover:bg-amber-500/20 rounded transition-all text-amber-400">◀</button>
              <div className="px-2 text-[10px] font-mono font-bold text-amber-300 tracking-tighter w-12 text-center">{month+1}月</div>
              <button onClick={() => setViewDate(new Date(year, month + 1))} className="w-6 h-6 flex items-center justify-center hover:bg-amber-500/20 rounded transition-all text-amber-400">▶</button>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#02040a]/40 border border-white/5 rounded-[2rem] p-5 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
            <div className="grid grid-cols-7 gap-1 mb-3 border-b border-white/5 pb-3">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} className="text-center text-[9px] font-mono text-zinc-500">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 flex-1">
              {blanks.map(i => <div key={`b-${i}`} className="aspect-square" />)}
              {days.map(day => {
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                const logKey = getDateKey(year, month, day);
                const hasLog = !!logs[logKey];
                
                return (
                  <motion.div 
                    key={day} 
                    onClick={() => hasLog && setSelectedDateKey(logKey)} 
                    whileHover={hasLog ? { scale: 1.15, zIndex: 10 } : {}} 
                    className={`aspect-square rounded-xl flex items-center justify-center relative transition-colors duration-300 ${hasLog ? 'cursor-pointer bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400' : isToday ? "bg-white/5 border border-white/10 text-white" : "text-zinc-600"}`}
                  >
                    {isToday && <div className="absolute inset-0 rounded-xl border border-white/20 opacity-50 animate-ping"></div>}
                    <span className="text-[10px] font-mono font-bold relative z-10">{day}</span>
                    {hasLog && <div className="absolute bottom-1 w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_5px_#f59e0b]"></div>}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
      
      {mounted && createPortal(<>{summaryModal}{historyModal}</>, document.body)}
    </>
  )
}