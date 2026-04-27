// src/components/leave-request-module.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
// 🚀 引入我们刚刚新增的撤回接口
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

export function LeaveRequestModule({ userRole, userName = "Unknown" }: { userRole: string, userName?: string }) {
  const [mounted, setMounted] = useState(false)
  const [requests, setRequests] = useState<LeaveRequest[]>([])
  
  // 弹窗状态
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [revokeTargetId, setRevokeTargetId] = useState<string | null>(null) // 🚀 控制撤回确认弹窗
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reason, setReason] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  useEffect(() => { setMounted(true) }, [])

  // 实时通讯雷达
  useEffect(() => {
    if (!mounted) return
    let isFetching = false
    const fetchRequests = async () => {
      if (isFetching) return
      isFetching = true
      try {
        const res = await getLeaveRequestsAction()
        setRequests(res)
      } catch (e) {
        console.error("Failed to fetch leave requests", e)
      } finally {
        isFetching = false
      }
    }
    fetchRequests() 
    const interval = setInterval(fetchRequests, 3000)
    return () => clearInterval(interval)
  }, [mounted])

  // 提交申请
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

  // 🚀 船员执行撤回操作
  const executeRevoke = async (id: string) => {
    // 乐观更新：立刻在前端移除该条记录，实现 Q弹向上的顺位替补
    setRequests(prev => prev.filter(req => req.id !== id))
    setRevokeTargetId(null) // 关闭弹窗，触发粒子消散

    try {
      await revokeLeaveRequestAction(id)
    } catch (e) {
      console.error("Revoke failed", e)
    }
  }

  // 舰长审批操作
  const handleApproval = async (id: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req))
    try {
      await updateLeaveStatusAction(id, newStatus)
    } catch (e) {
      console.error("Approval failed", e)
    }
  }

  const pendingRequests = requests.filter(r => r.status === "PENDING")
  const processedRequests = requests.filter(r => r.status !== "PENDING")
  const displayList = [...pendingRequests, ...processedRequests]

  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
  }

  // 🚀 核心动效库
  const overlayVariants = {
    hidden: { opacity: 0, backdropFilter: "blur(0px)" },
    visible: { opacity: 1, backdropFilter: "blur(15px)", transition: { duration: 0.4 } },
    exit: { opacity: 0, backdropFilter: "blur(0px)", transition: { duration: 0.4 } }
  }
  // 粒子消散退场特效
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: "blur(20px) brightness(0.5)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px) brightness(1)", transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.85, filter: "blur(30px) brightness(0.2)", transition: { duration: 0.3, ease: "easeOut" } }
  }
  const bouncySpring = { type: "spring", stiffness: 500, damping: 25, mass: 1 }

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
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-xl font-bold text-sm tracking-widest hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              + 填写申请单
            </button>
          )}
        </div>

        {/* 🚀 核心修复：外层负责边框和背景，内层通过 h-[320px] 彻底锁死高度，触发内部滚动 */}
        <div className="bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10">
          <div className="h-[320px] overflow-y-auto amber-scrollbar pr-2 flex flex-col gap-4 relative">
            <AnimatePresence mode="popLayout">
              {displayList.length > 0 ? displayList.map(req => (
                <motion.div 
                  layout
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  // 删除时的退场动画
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.25 } }}
                  transition={bouncySpring}
                  className={`relative p-5 rounded-2xl border transition-all ${req.status === 'PENDING' ? 'bg-amber-500/5 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]' : 'bg-white/5 border-white/10 opacity-70'}`}
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

                    {/* 控制台操作区 */}
                    <div className="flex flex-col gap-2 shrink-0 ml-4">
                      {isManager && req.status === "PENDING" && (
                        <>
                          <button onClick={() => handleApproval(req.id, "APPROVED")} className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center active:scale-90" title="批准">✓</button>
                          <button onClick={() => handleApproval(req.id, "REJECTED")} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90" title="驳回">✕</button>
                        </>
                      )}
                      {/* 🚀 船员的撤回按钮 */}
                      {!isManager && req.status === "PENDING" && req.applicant === userName && (
                        <button 
                          onClick={() => setRevokeTargetId(req.id)} 
                          className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90" 
                          title="撤回申请"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

      {/* ======================= 弹窗组件群 ======================= */}
      {mounted && createPortal(
        <>
          {/* 1. 船员填写申请表单弹窗 */}
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-[20px]" onClick={() => setIsModalOpen(false)} />
                <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 w-full max-w-md">
                  <form onSubmit={handleSubmit} className="w-full bg-[#060813]/95 border-2 border-amber-500/50 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(245,158,11,0.2)] overflow-hidden relative">
                    <div className="flex justify-between items-center mb-6 border-b border-amber-500/20 pb-4">
                      <h2 className="text-xl font-bold text-amber-400 tracking-[0.2em]">新建离舰申请</h2>
                      <span className="text-amber-500/60 font-mono text-[10px]">Awaiting Submit</span>
                    </div>

                    <div className="space-y-5 mb-8 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">离舰事由 / Reason</label>
                        <input type="text" required value={reason} onChange={e => setReason(e.target.value)} placeholder="如：返回地球探亲" className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all" disabled={isSubmitting} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">离舰时间 / Start Time</label>
                        <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all" style={{ colorScheme: "dark" }} disabled={isSubmitting} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">归舰时间 / End Time</label>
                        <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all" style={{ colorScheme: "dark" }} disabled={isSubmitting} />
                      </div>
                    </div>

                    <div className="flex gap-4">
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

          {/* 🚀 2. 船员撤回操作的二次确认弹窗 */}
          <AnimatePresence>
            {revokeTargetId && (
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <motion.div variants={overlayVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-[20px]" onClick={() => setRevokeTargetId(null)} />
                <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="relative z-10 w-full max-w-sm">
                  <div className="w-full bg-[#060813]/95 border-2 border-red-500/50 rounded-[2.5rem] p-8 shadow-[0_0_80px_rgba(239,68,68,0.2)] overflow-hidden relative text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                       <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-red-400 tracking-widest mb-2 font-[family-name:var(--font-space)]">撤回离舰申请</h3>
                    <p className="text-zinc-400 text-xs tracking-wider mb-8">此操作将从星舰主控台中永久销毁该记录，确认执行？</p>
                    
                    <div className="flex gap-4">
                      <button onClick={() => setRevokeTargetId(null)} className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95">取消</button>
                      <button onClick={() => executeRevoke(revokeTargetId)} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-bold tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95">销毁记录</button>
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