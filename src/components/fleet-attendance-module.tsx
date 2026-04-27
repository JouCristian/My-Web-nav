// src/components/fleet-attendance-module.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

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
  const [isFlipping, setIsFlipping] = useState(false) // 🚀 3D 翻转控制
  
  // ⏱️ 实时集结状态
  const [isRollCallActive, setIsRollCallActive] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [inputMins, setInputMins] = useState("01")
  const [inputSecs, setInputSecs] = useState("00")
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const [tempMins, setTempMins] = useState("01")
  const [tempSecs, setTempSecs] = useState("00")
  
  const [presentCrew, setPresentCrew] = useState<string[]>([])
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null)

  const isManager = userRole === "OWNER" || userRole === "ADMIN"
  const allCrew = isManager ? [...FLEET_CREW] : [userName, ...FLEET_CREW]

  useEffect(() => { 
    setMounted(true)
    const saved = localStorage.getItem("STARFLEET_ATTENDANCE_V4")
    if (saved) try { setLogs(JSON.parse(saved)) } catch (e) { console.error(e) }
  }, [])
  
  useEffect(() => { if (mounted) localStorage.setItem("STARFLEET_ATTENDANCE_V4", JSON.stringify(logs)) }, [logs, mounted])

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

  // 🚀 月份 3D 翻转切换逻辑
  const changeMonth = async (dir: number) => {
    if (isFlipping) return
    setIsFlipping(true)
    // 给予 3D 翻转离场时间
    await new Promise(r => setTimeout(r, 300))
    setViewDate(new Date(year, month + dir))
    setIsFlipping(false)
  }

  // 🚀 强制 42 单元格物理锁死
  const year = viewDate.getFullYear(); const month = viewDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDay = new Date(year, month, 1).getDay()
  const totalCells = 42
  const blanks = Array.from({ length: firstDay }, (_, i) => i)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const trailingBlanks = Array.from({ length: totalCells - days.length - blanks.length }, (_, i) => i)
  
  const getDateKey = (y: number, m: number, d: number) => `${y}-${m + 1}-${d}`
  const formatTime = (secs: number) => `${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`

  if (!mounted) return null
  const currentDayLogs = selectedDateKey ? logs[selectedDateKey] || [] : []
  const activeDetail = currentDayLogs.find(l => l.id === selectedLogId)

  // 动画变体
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(20px) brightness(0.5)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.85, filter: "blur(30px) brightness(0.2)", transition: { duration: 0.4 } }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes star-pulse { 0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.7); } 70% { box-shadow: 0 0 0 15px rgba(245, 158, 11, 0); } 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); } }
        .animate-star-pulse { animation: star-pulse 2s infinite; }
        .amber-scrollbar::-webkit-scrollbar { width: 4px; } .amber-scrollbar::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.3); border-radius:10px; }
        .emerald-scrollbar::-webkit-scrollbar { width: 4px; } .emerald-scrollbar::-webkit-scrollbar-thumb { background: rgba(16,185,129,0.3); border-radius:10px; }
        .red-scrollbar::-webkit-scrollbar { width: 4px; } .red-scrollbar::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.3); border-radius:10px; }
      `}} />

      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-4">
        
        {/* ================= 左舷：中枢 ================= */}
        <div className="lg:col-span-2 rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-2xl flex flex-col h-full relative">
           <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl shadow-[0_0_20px_rgba(245,158,11,0.2)]">⏳</div>
              <div><h2 className="text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)]">跃迁集结序列</h2><p className="text-amber-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Fleet Synchronization Protocol</p></div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center bg-[#02040a]/60 border border-white/5 rounded-[2rem] p-8 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
            {!isRollCallActive ? (
              <div className="w-full max-w-md flex flex-col items-center gap-8 relative">
                {isManager && (
                  <>
                    <div className="text-zinc-500 font-mono text-[10px] tracking-[0.3em] uppercase mb-[-20px]">Set Countdown Window</div>
                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setIsTimePickerOpen(true)}>
                      <div className="w-20 bg-black/50 border border-amber-500/30 rounded-2xl p-3 text-center text-4xl font-mono text-amber-400 group-hover:border-amber-400 transition-all">{inputMins}</div>
                      <span className="text-4xl text-amber-500/50 font-bold">:</span>
                      <div className="w-20 bg-black/50 border border-amber-500/30 rounded-2xl p-3 text-center text-4xl font-mono text-amber-400 group-hover:border-amber-400 transition-all">{inputSecs}</div>
                    </div>
                    <button onClick={startRollCall} className="relative group w-full py-5 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-400 font-bold tracking-[0.3em] text-lg hover:bg-amber-500 hover:text-black hover:scale-[1.02] transition-all overflow-hidden active:scale-95 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                       <div className="absolute inset-0 border-2 border-amber-400 opacity-0 group-hover:animate-ping" />
                       发起全舰集结指令
                    </button>
                    {/* 时间选择器弹出舱 */}
                    <AnimatePresence>
                      {isTimePickerOpen && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-auto">
                          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={()=>setIsTimePickerOpen(false)} />
                          <motion.div initial={{scale:0.9, y:20, opacity:0}} animate={{scale:1, y:0, opacity:1}} exit={{scale:0.9, y:20, opacity:0}} transition={{type:"spring", stiffness:400, damping:30}} className="relative w-64 bg-[#0a0c14] border border-amber-500/40 rounded-[2.5rem] p-6 shadow-2xl">
                             <div className="flex gap-4 h-48 relative mb-6">
                                <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c14] via-transparent to-[#0a0c14] pointer-events-none z-10" />
                                <div className="flex-1 overflow-y-auto amber-scrollbar text-center space-y-2 z-0">
                                  {Array.from({length:60},(_,i)=>String(i).padStart(2,'0')).map(m=>(<div key={m} onClick={()=>setTempMins(m)} className={`py-2 rounded-xl font-mono cursor-pointer transition-all ${tempMins===m ? 'text-amber-400 bg-amber-500/20 scale-110 font-bold':'text-zinc-600'}`}>{m}</div>))}
                                </div>
                                <div className="flex-1 overflow-y-auto amber-scrollbar text-center space-y-2 z-0">
                                  {Array.from({length:60},(_,i)=>String(i).padStart(2,'0')).map(s=>(<div key={s} onClick={()=>setTempSecs(s)} className={`py-2 rounded-xl font-mono cursor-pointer transition-all ${tempSecs===s ? 'text-amber-400 bg-amber-500/20 scale-110 font-bold':'text-zinc-600'}`}>{s}</div>))}
                                </div>
                             </div>
                             <button onClick={()=>{setInputMins(tempMins); setInputSecs(tempSecs); setIsTimePickerOpen(false)}} className="w-full py-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-400 font-bold text-xs tracking-widest hover:bg-amber-500 hover:text-black transition-all">确认时间</button>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-col items-center">
                 <div className={`text-9xl font-bold font-mono tracking-tighter mb-12 ${countdown <= 10 ? 'text-red-500 animate-pulse':'text-amber-400'}`}>{formatTime(countdown)}</div>
                 <div className="w-full max-w-2xl grid grid-cols-3 gap-3 mb-10">
                    {allCrew.map(c => (
                      <div key={c} className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${presentCrew.includes(c)?'bg-amber-500/10 border-amber-500/40':'bg-white/5 border-white/5 opacity-40'}`}>
                        <div className={`w-2 h-2 rounded-full ${presentCrew.includes(c)?'bg-amber-400 shadow-[0_0_10px_#f59e0b]':'bg-zinc-600'}`} />
                        <span className="text-xs font-mono text-zinc-300">{c}</span>
                      </div>
                    ))}
                 </div>
                 {!isManager && (
                   <button onPointerDown={startHold} onPointerUp={stopHold} onPointerLeave={stopHold} disabled={presentCrew.includes(userName)} className="relative overflow-hidden w-full max-w-md h-16 rounded-2xl bg-white/5 border border-white/10 active:scale-95 transition-all">
                      <div className={`absolute left-0 top-0 bottom-0 bg-amber-500/40 transition-all ${isHolding?'w-full duration-[1500ms] linear':'w-0 duration-300'}`} />
                      <span className="relative z-10 font-bold tracking-[0.4em] text-amber-400">{presentCrew.includes(userName)?'✓ 已成功连接':'长按完成签到'}</span>
                   </button>
                 )}
              </div>
            )}
          </div>
        </div>

        {/* ================= 右舷：矩阵 (420px 锁死高度) ================= */}
        <div className="lg:col-span-1 rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden group">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="flex items-center justify-between mb-8 px-2 relative z-20">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1"><span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse shadow-[0_0_8px_#f59e0b]"></span><span className="text-amber-500/60 font-mono text-[9px] uppercase tracking-[0.4em]">Temporal Matrix</span></div>
              <h2 className="text-xl font-bold tracking-[0.1em] font-[family-name:var(--font-space)] text-white">集结档案</h2>
            </div>
            <div className="flex items-center bg-amber-500/10 border border-amber-500/20 p-1 rounded-lg">
              <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center hover:bg-amber-500/20 rounded-xl transition-all text-amber-400">◀</button>
              <div className="px-3 text-xs font-mono font-bold text-amber-300 w-16 text-center">{month+1}月</div>
              <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center hover:bg-amber-500/20 rounded-xl transition-all text-amber-400">▶</button>
            </div>
          </div>

          <div className="relative z-10 bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-2xl" style={{ height: "420px", perspective: "1200px" }}>
            <div className="grid grid-cols-7 gap-1 mb-4 border-b border-white/5 pb-4">
              {['S','M','T','W','T','F','S'].map(d=>(<div key={d} className="text-center text-[10px] font-mono text-zinc-600">{d}</div>))}
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={viewDate.toISOString()}
                initial={{ rotateX: 90, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: -90, opacity: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="grid grid-cols-7 gap-1 h-[320px]"
                style={{ transformStyle: "preserve-3d" }}
              >
                {blanks.map(i => <div key={`b-${i}`} className="aspect-square opacity-0" />)}
                {days.map(day => {
                  const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                  const logKey = getDateKey(year, month, day);
                  const hasLog = logs[logKey]?.length > 0;
                  return (
                    <motion.div 
                      key={day} onClick={() => setSelectedDateKey(logKey)} 
                      whileHover={{ scale: 1.1, translateZ: 20 }}
                      className={`cursor-pointer aspect-square rounded-xl flex items-center justify-center relative transition-all duration-500 ${isToday ? 'border-2 border-amber-400 bg-amber-400/20 z-10 animate-star-pulse':'border border-transparent hover:bg-white/5'}`}
                    >
                      {/* 🚀 当天金色信号波 */}
                      {isToday && (
                        <div className="absolute inset-0 rounded-xl border-2 border-amber-400 animate-[ping_1.5s_infinite] opacity-50" />
                      )}
                      <span className={`text-[11px] font-mono font-bold ${isToday ? 'text-amber-300':'text-zinc-500'}`}>{day}</span>
                      {hasLog && <div className="absolute bottom-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]" />}
                    </motion.div>
                  )
                })}
                {trailingBlanks.map(i => <div key={`t-${i}`} className="aspect-square opacity-0" />)}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* 🚀 弹窗逻辑升级：iOS 弹簧尺寸重置 */}
      {mounted && createPortal(
        <AnimatePresence>
          {selectedDateKey && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-[20px]" onClick={()=>{setSelectedDateKey(null); setSelectedLogId(null)}} />
              <motion.div layout variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 overflow-hidden rounded-[2.5rem]">
                <div className="animate-modal-heavy-breathe min-w-[500px] bg-[#060813]/95 border-2 border-amber-500/50 p-8 shadow-2xl">
                  <AnimatePresence mode="wait">
                    {!selectedLogId ? (
                      <motion.div key="list" variants={{in:{x:0, opacity:1}, out:{x:-50, opacity:0}}} initial="out" animate="in" exit="out" transition={{type:"spring", stiffness:300, damping:30}}>
                        <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
                          <h2 className="text-xl font-bold text-amber-400 tracking-[0.2em]">历史集结档案</h2>
                          <span className="text-amber-500/60 font-mono text-sm">{selectedDateKey}</span>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto amber-scrollbar pr-2 space-y-3 mb-6 min-h-[100px]">
                           {currentDayLogs.length > 0 ? currentDayLogs.map(log => (
                             <div key={log.id} onClick={() => setSelectedLogId(log.id)} className="group relative flex justify-between items-center bg-white/5 border border-white/10 hover:border-amber-500/40 p-5 rounded-2xl cursor-pointer transition-all active:scale-[0.98] overflow-hidden">
                               <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.05),transparent)] -translate-x-full group-hover:animate-[shimmer-seamless_2s_infinite] pointer-events-none" />
                               <div className="z-10"><div className="text-sm font-bold text-white group-hover:text-amber-300">签到记录 / {new Date(log.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</div><div className="text-[10px] font-mono text-zinc-500 uppercase mt-1">Status: SYNCED - {log.present.length} Crew</div></div>
                               <div className="text-amber-500/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-transform">➔</div>
                             </div>
                           )) : <div className="text-center py-10 text-zinc-600 font-mono text-xs tracking-widest">NO RECORDS ON THIS STARDATE</div>}
                        </div>
                        <button onClick={()=>setSelectedDateKey(null)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-zinc-400 font-bold hover:text-white transition-all">关闭档案室</button>
                      </motion.div>
                    ) : (
                      <motion.div key="detail" variants={{in:{x:0, opacity:1}, out:{x:50, opacity:0}}} initial="out" animate="in" exit="out" transition={{type:"spring", stiffness:300, damping:30}}>
                        <div className="flex items-center gap-4 mb-6 border-b border-amber-500/20 pb-4">
                          <button onClick={()=>setSelectedLogId(null)} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-amber-500/20 text-zinc-400 hover:text-amber-400 transition-all flex items-center justify-center">◀</button>
                          <div><h2 className="text-xl font-bold text-amber-400 tracking-[0.2em]">档案详情</h2>{activeDetail && <span className="text-[10px] font-mono text-zinc-500 uppercase">Ref: {new Date(activeDetail.timestamp).toLocaleString()}</span>}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="bg-black/40 border border-emerald-500/20 rounded-2xl p-4 h-[300px] flex flex-col">
                             <div className="text-[10px] text-emerald-500/60 font-mono uppercase mb-3">Present ({activeDetail?.present.length})</div>
                             <div className="flex-1 overflow-y-auto emerald-scrollbar space-y-2">
                               {activeDetail?.present.map(c => (<div key={c} className="text-xs font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg">{c}</div>))}
                             </div>
                           </div>
                           <div className="bg-black/40 border border-red-500/20 rounded-2xl p-4 h-[300px] flex flex-col">
                             <div className="text-[10px] text-red-500/60 font-mono uppercase mb-3">Missing ({activeDetail?.missing.length})</div>
                             <div className="flex-1 overflow-y-auto red-scrollbar space-y-2">
                               {activeDetail?.missing.map(c => (<div key={c} className="text-xs font-bold text-red-400 bg-red-500/5 border border-red-500/10 p-2 rounded-lg">{c}</div>))}
                             </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      , document.body)}
    </>
  )
}