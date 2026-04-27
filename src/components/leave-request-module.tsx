// src/components/leave-request-module.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { submitLeaveRequestAction, getLeaveRequestsAction, updateLeaveStatusAction, revokeLeaveRequestAction } from "@/app/actions"

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED"

type LeaveRequest = {
  id: string;
  applicant: string;
  reason: string;
  startTime: string;
  endTime: string;
  status: RequestStatus;
  createdAt: number;
}

// 🚀 纯手写的科幻级 3 栏时间滚轮下拉框 (彻底解决原生组件崩溃与丑陋问题)
const SciFiDateTimePicker = ({ isOpen, onConfirm, onCancel }: { isOpen: boolean, onConfirm: (iso: string) => void, onCancel: () => void }) => {
  const [dIdx, setDIdx] = useState(0)
  const [hIdx, setHIdx] = useState(12)
  const [mIdx, setMIdx] = useState(0)

  // 预生成未来 60 天的数据矩阵
  const days = Array.from({length: 60}).map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
  const hours = Array.from({length: 24}, (_, i) => i)
  const mins = Array.from({length: 60}, (_, i) => i)

  if (!isOpen) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: -15, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -10, scale: 0.95, filter: "blur(10px)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="absolute top-[110%] left-0 w-full bg-[#060813]/95 border border-amber-500/40 rounded-2xl p-4 z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.15)] backdrop-blur-2xl"
      onClick={e => e.stopPropagation()} // 防止点击穿透关闭
    >
      <div className="flex justify-between text-[10px] font-mono text-amber-500/60 uppercase tracking-widest mb-3 px-2">
        <span>Date</span><span>Hour</span><span>Minute</span>
      </div>
      <div className="flex h-40 gap-2 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#060813] via-transparent to-[#060813] pointer-events-none z-10" />
        
        {/* 日期滚轮 */}
        <div className="flex-[2] h-full overflow-y-auto amber-scrollbar relative z-0 pr-1 text-center space-y-1">
          {days.map((d, i) => (
            <div key={i} onClick={() => setDIdx(i)} className={`relative cursor-pointer py-2 rounded-xl text-sm transition-all duration-300 ${dIdx === i ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-amber-200'}`}>
              {dIdx === i && <motion.div layoutId="picker-d" className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 rounded-xl z-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
              <span className="relative z-10">{d.getMonth()+1}月{d.getDate()}日</span>
            </div>
          ))}
        </div>
        <div className="w-px bg-white/5 my-2" />
        {/* 小时滚轮 */}
        <div className="flex-1 h-full overflow-y-auto amber-scrollbar relative z-0 px-1 text-center space-y-1">
          {hours.map((h, i) => (
            <div key={i} onClick={() => setHIdx(i)} className={`relative cursor-pointer py-2 rounded-xl font-mono text-sm transition-all duration-300 ${hIdx === i ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-amber-200'}`}>
              {hIdx === i && <motion.div layoutId="picker-h" className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 rounded-xl z-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
              <span className="relative z-10">{String(h).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
        <div className="w-px bg-white/5 my-2" />
        {/* 分钟滚轮 */}
        <div className="flex-1 h-full overflow-y-auto amber-scrollbar relative z-0 pl-1 text-center space-y-1">
          {mins.map((m, i) => (
            <div key={i} onClick={() => setMIdx(i)} className={`relative cursor-pointer py-2 rounded-xl font-mono text-sm transition-all duration-300 ${mIdx === i ? 'text-amber-400 font-bold' : 'text-zinc-500 hover:text-amber-200'}`}>
              {mIdx === i && <motion.div layoutId="picker-m" className="absolute inset-0 bg-amber-500/20 border border-amber-500/50 rounded-xl z-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]" initial={false} transition={{ type: "spring", stiffness: 500, damping: 30 }} />}
              <span className="relative z-10">{String(m).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2 mt-4 relative z-20">
        <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold text-xs hover:bg-white/10 transition-all active:scale-95">取消</button>
        <button type="button" onClick={() => {
          const finalDate = new Date(days[dIdx])
          finalDate.setHours(hours[hIdx], mins[mIdx], 0, 0)
          onConfirm(finalDate.toISOString())
        }} className="flex-1 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold text-xs hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95">确认时空坐标</button>
      </div>
    </motion.div>
  )
}

export function LeaveRequestModule({ userRole, userName = "Unknown" }: { userRole: string, userName?: string }) {
  const [mounted, setMounted] = useState(false)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null) 
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  // 🚀 核心焦点与拾色器控制引擎
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null)

  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    let isFetching = false
    const fetchRequests = async () => {
      if (isFetching) return
      isFetching = true
      try {
        const res = await getLeaveRequestsAction()
        setRequests(res)
      } catch (e) {} finally {
        isFetching = false
      }
    }
    fetchRequests() 
    const interval = setInterval(fetchRequests, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !startTime || !endTime) return
    setIsSubmitting(true)
    
    try {
      await submitLeaveRequestAction(reason, startTime, endTime)
      setIsModalOpen(false)
      setReason(""); setStartTime(""); setEndTime("");
      const res = await getLeaveRequestsAction()
      setRequests(res)
    } catch (e) {
      alert("提交申请失败，请检查通讯模块！")
    } finally {
      setIsSubmitting(false)
    }
  }

  const executeRevoke = async (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id))
    setRevokeTargetId(null) 
    try { await revokeLeaveRequestAction(id) } catch (e) {}
  }

  const handleApproval = async (id: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req))
    try { await updateLeaveStatusAction(id, newStatus) } catch (e) {}
  }

  const pendingRequests = requests.filter(r => r.status === "PENDING")
  const processedRequests = requests.filter(r => r.status !== "PENDING")
  const displayList = [...pendingRequests, ...processedRequests]

  // 列表里用的简易时间格式
  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }
  
  // 占位符用的高精度时间格式
  const formatDisplayTime = (isoString: string) => {
    if (!isoString) return ""
    const d = new Date(isoString)
    return `${d.getFullYear()} / ${String(d.getMonth() + 1).padStart(2,'0')} / ${String(d.getDate()).padStart(2,'0')}  -  ${String(d.getHours()).padStart(2,'0')} : ${String(d.getMinutes()).padStart(2,'0')}`
  }

  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(15px)", transition: { duration: 0.4 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }
  }
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(20px) brightness(0.5)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.85, filter: "blur(30px) brightness(0.2)", transition: { duration: 0.3, ease: "easeOut" } }
  }
  const bouncySpring = { type: "spring", stiffness: 500, damping: 25, mass: 1 }

  // 🚀 跑车级非线性悬挂：用于对焦光圈在不同输入框间丝滑飞行
  const focusRingSpring = { type: "spring", stiffness: 500, damping: 25, mass: 0.8 }

  if (!mounted) return null

  const StatusBadge = ({ status }: { status: RequestStatus }) => {
    switch(status) {
      case "PENDING": return <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-[10px] font-bold tracking-widest animate-pulse">审批中</span>
      case "APPROVED": return <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold tracking-widest">已批准</span>
      case "REJECTED": return <span className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] font-bold tracking-widest">已驳回</span>
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .amber-scrollbar::-webkit-scrollbar { width: 4px; } 
        .amber-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .amber-scrollbar::-webkit-scrollbar-thumb { background: rgba(245, 158, 11, 0.3); border-radius: 10px; border: 1px solid transparent; background-clip: padding-box; } 
        .amber-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(245, 158, 11, 0.6); }
      `}} />

      <div className="w-full rounded-[3.5rem] border border-amber-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-[0_0_100px_rgba(245,158,11,0.05)] flex flex-col h-full relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,1) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,1) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(245,158,11,0.05),transparent)] bg-[length:200%_200%] animate-[shimmer-seamless_4s_linear_infinite] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)]">休眠/离舰申请</h2>
              <p className="text-amber-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Leave Request & Approval</p>
            </div>
          </div>
          
          {!isManager && (
            <button onClick={() => { setIsModalOpen(true); setFocusedInput(null); setActivePicker(null); }} className="px-6 py-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-xl font-bold text-sm tracking-widest hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              + 填写申请单
            </button>
          )}
        </div>

        <div className="bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
          <div className="h-[320px] overflow-y-auto amber-scrollbar pr-2 flex flex-col gap-4 relative">
            <AnimatePresence mode="popLayout">
              {displayList.length > 0 ? displayList.map(req => (
                <motion.div 
                  layout
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.25 } }}
                  transition={bouncySpring}
                  className={`group relative p-5 rounded-2xl border transition-all ${req.status === 'PENDING' ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-white/5 border-white/10 opacity-70 hover:opacity-100'}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-white tracking-wider">{req.applicant}</span>
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-zinc-400 text-sm tracking-wide mb-3">{req.reason}</p>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-500 bg-black/40 px-3 py-2 rounded-lg border border-white/5 inline-flex">
                        <span>{formatTime(req.startTime)}</span>
                        <span className="text-amber-500/50">➔</span>
                        <span>{formatTime(req.endTime)}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 ml-4 opacity-30 group-hover:opacity-100 transition-opacity duration-300">
                      {isManager && req.status === "PENDING" && (
                        <>
                          <button onClick={() => handleApproval(req.id, "APPROVED")} className="group/op relative w-9 h-9 rounded-xl bg-black/40 border border-white/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all flex items-center justify-center active:scale-90" title="批准">
                            <div className="absolute inset-0 rounded-xl bg-emerald-500/20 opacity-0 group-hover/op:opacity-100 group-hover/op:animate-pulse pointer-events-none" />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-500 group-hover/op:text-emerald-400 transition-colors relative z-10"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </button>
                          <button onClick={() => handleApproval(req.id, "REJECTED")} className="group/op relative w-9 h-9 rounded-xl bg-black/40 border border-white/5 hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center active:scale-90" title="驳回">
                            <div className="absolute inset-0 rounded-xl bg-amber-500/20 opacity-0 group-hover/op:opacity-100 group-hover/op:animate-pulse pointer-events-none" />
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-zinc-500 group-hover/op:text-amber-400 transition-colors relative z-10"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </>
                      )}
                      
                      {(isManager || (!isManager && req.status === "PENDING" && req.applicant === userName)) && (
                        <button 
                          onClick={() => setRevokeTargetId(req.id)} 
                          className="group/del relative w-9 h-9 rounded-xl bg-black/40 border border-white/5 hover:bg-red-500/10 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all flex items-center justify-center active:scale-90 overflow-hidden" 
                          title={isManager ? "永久销毁档案" : "撤回申请"}
                        >
                          <div className="absolute inset-0 rounded-xl bg-red-500/20 opacity-0 group-hover/del:opacity-100 group-hover/del:animate-pulse pointer-events-none" />
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-zinc-500 group-hover/del:text-red-400 transition-all duration-300 group-hover/del:scale-110 relative z-10">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <motion.div key="empty" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600 font-mono text-xs tracking-widest gap-4">
                  <span className="text-4xl opacity-30">📭</span>
                  {isManager ? "NO PENDING REQUESTS" : "NO LEAVE HISTORY"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {mounted && createPortal(
        <>
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-[20px]" onClick={() => setIsModalOpen(false)} />
                
                {/* 🚀 核心防遮罩修复：移除外层 overflow-hidden，让下拉框肆意舒展 */}
                <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 w-full max-w-md">
                  <form onSubmit={handleSubmit} className="w-full bg-[#060813]/95 border-2 border-amber-500/50 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(245,158,11,0.2)] relative">
                    <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
                      <h2 className="text-xl font-bold text-amber-400 tracking-[0.2em]">新建离舰申请</h2>
                      <span className="text-amber-500/60 font-mono text-[10px]">Awaiting Submit</span>
                    </div>

                    <div className="space-y-6 mb-8 relative z-10">
                      
                      {/* 事由输入框 */}
                      <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">离舰事由 / Reason</label>
                        <div 
                          className="relative cursor-text rounded-xl"
                          onClick={() => { setFocusedInput('reason'); setActivePicker(null); }}
                        >
                          <input 
                            type="text" required value={reason} onChange={e => setReason(e.target.value)} 
                            placeholder="如：返回地球探亲" 
                            className="relative z-10 w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none disabled:opacity-50 transition-colors" 
                            disabled={isSubmitting} 
                          />
                          {/* 🚀 Q弹飞行的光环核心 */}
                          {focusedInput === 'reason' && (
                            <motion.div layoutId="leave-focus-ring" className="absolute inset-0 rounded-xl border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] pointer-events-none z-20" transition={focusRingSpring} />
                          )}
                        </div>
                      </div>
                      
                      {/* 起始时间下拉触发器 */}
                      <div className="space-y-2 relative">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">离舰时间 / Start Time</label>
                        <div 
                          className="relative cursor-pointer rounded-xl"
                          onClick={() => { setFocusedInput('startTime'); setActivePicker('start'); }}
                        >
                          <div className={`relative z-10 w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm outline-none transition-colors flex items-center justify-between ${startTime ? 'text-amber-300 font-mono font-bold' : 'text-zinc-600 font-mono'}`}>
                             <span>{startTime ? formatDisplayTime(startTime) : "YYYY / MM / DD  -  -- : --"}</span>
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          </div>
                          {focusedInput === 'startTime' && (
                            <motion.div layoutId="leave-focus-ring" className="absolute inset-0 rounded-xl border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] pointer-events-none z-20" transition={focusRingSpring} />
                          )}
                        </div>
                        {/* 🚀 自定义时间选择下拉窗 */}
                        <AnimatePresence>
                           {activePicker === 'start' && (
                             <SciFiDateTimePicker 
                               isOpen={true} 
                               onCancel={() => { setActivePicker(null); setFocusedInput(null); }}
                               onConfirm={(iso) => { setStartTime(iso); setActivePicker(null); }} 
                             />
                           )}
                        </AnimatePresence>
                      </div>

                      {/* 归舰时间下拉触发器 */}
                      <div className="space-y-2 relative">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">归舰时间 / End Time</label>
                        <div 
                          className="relative cursor-pointer rounded-xl"
                          onClick={() => { setFocusedInput('endTime'); setActivePicker('end'); }}
                        >
                          <div className={`relative z-10 w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm outline-none transition-colors flex items-center justify-between ${endTime ? 'text-amber-300 font-mono font-bold' : 'text-zinc-600 font-mono'}`}>
                             <span>{endTime ? formatDisplayTime(endTime) : "YYYY / MM / DD  -  -- : --"}</span>
                             <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 opacity-50"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                          </div>
                          {focusedInput === 'endTime' && (
                            <motion.div layoutId="leave-focus-ring" className="absolute inset-0 rounded-xl border border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] pointer-events-none z-20" transition={focusRingSpring} />
                          )}
                        </div>
                        {/* 🚀 自定义时间选择下拉窗 */}
                        <AnimatePresence>
                           {activePicker === 'end' && (
                             <SciFiDateTimePicker 
                               isOpen={true} 
                               onCancel={() => { setActivePicker(null); setFocusedInput(null); }}
                               onConfirm={(iso) => { setEndTime(iso); setActivePicker(null); }} 
                             />
                           )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="flex gap-4 relative z-10">
                      <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95 disabled:opacity-50">取消</button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold tracking-widest text-xs hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95 disabled:opacity-50">
                        {isSubmitting ? "传输中..." : "提交申请"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {revokeTargetId && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-[20px]" onClick={() => setRevokeTargetId(null)} />
                <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 w-full max-w-sm">
                  <div className="w-full bg-[#060813]/95 border-2 border-red-500/50 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(239,68,68,0.2)] overflow-hidden relative text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-400 tracking-widest mb-2 font-[family-name:var(--font-space)]">
                      {isManager ? "永久销毁档案" : "撤回离舰申请"}
                    </h3>
                    <p className="text-zinc-400 text-xs tracking-wider mb-8">此操作将从星舰主控台中永久抹除该数据，确认执行？</p>
                    
                    <div className="flex gap-4">
                      <button onClick={() => setRevokeTargetId(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95">取消</button>
                      <button onClick={() => executeRevoke(revokeTargetId)} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-bold tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95">确认执行</button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      , document.body)}
    </>
  )
}