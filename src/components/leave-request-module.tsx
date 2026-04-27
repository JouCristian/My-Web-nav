// src/components/leave-request-module.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // 表单状态
  const [reason, setReason] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")

  const isManager = userRole === "OWNER" || userRole === "ADMIN"

  // 💾 持久化存储
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("STARFLEET_LEAVE_REQUESTS")
    if (saved) try { setRequests(JSON.parse(saved)) } catch(e) { console.error(e) }
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem("STARFLEET_LEAVE_REQUESTS", JSON.stringify(requests))
  }, [requests, mounted])

  // 提交申请
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason || !startTime || !endTime) return
    
    const newReq: LeaveRequest = {
      id: Date.now().toString(),
      applicant: userName,
      reason,
      startTime,
      endTime,
      status: "PENDING",
      createdAt: Date.now()
    }
    setRequests(prev => [newReq, ...prev])
    setIsModalOpen(false)
    setReason(""); setStartTime(""); setEndTime("");
  }

  // 舰长审批操作
  const handleApproval = (id: string, newStatus: RequestStatus) => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req))
  }

  // 数据分流
  const myRequests = requests.filter(r => r.applicant === userName)
  const pendingRequests = requests.filter(r => r.status === "PENDING")
  const processedRequests = requests.filter(r => r.status !== "PENDING")

  // 显示的数据源：舰长看所有待办和已处理，船员只看自己的
  const displayList = isManager ? [...pendingRequests, ...processedRequests] : myRequests

  // 🚀 核心动画库
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

  if (!mounted) return null

  // 状态徽章渲染器
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
          
          {/* 只有普通船员才需要“发起申请”按钮 */}
          {!isManager && (
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-amber-500/10 border border-amber-500/40 text-amber-400 rounded-xl font-bold text-sm tracking-widest hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              + 填写申请单
            </button>
          )}
        </div>

        {/* 申请列表展示区 */}
        <div className="flex-1 bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10 h-[350px] overflow-y-auto amber-scrollbar">
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {displayList.length > 0 ? displayList.map(req => (
                <motion.div 
                  layout
                  key={req.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
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
                        <span>{req.startTime.replace('T', ' ')}</span>
                        <span className="text-amber-500/50">➔</span>
                        <span>{req.endTime.replace('T', ' ')}</span>
                      </div>
                    </div>

                    {/* 舰长的审批控制台 */}
                    {isManager && req.status === "PENDING" && (
                      <div className="flex flex-col gap-2 shrink-0 ml-4">
                        <button onClick={() => handleApproval(req.id, "APPROVED")} className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center active:scale-90" title="批准">✓</button>
                        <button onClick={() => handleApproval(req.id, "REJECTED")} className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center active:scale-90" title="驳回">✕</button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )) : (
                <motion.div key="empty" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-16 text-zinc-600 font-mono text-xs tracking-widest gap-4">
                  <span className="text-4xl opacity-30">📭</span>
                  {isManager ? "NO PENDING REQUESTS" : "NO LEAVE HISTORY"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* 🚀 船员填写申请表单的独立弹窗 */}
      {mounted && createPortal(
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
                      <input type="text" required value={reason} onChange={e => setReason(e.target.value)} placeholder="如：返回地球探亲" className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">离舰时间 / Start Time</label>
                      <input type="datetime-local" required value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all" style={{ colorScheme: "dark" }} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">归舰时间 / End Time</label>
                      <input type="datetime-local" required value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-black/50 border border-amber-500/20 rounded-xl px-5 py-4 text-sm text-white outline-none focus:border-amber-400 focus:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all" style={{ colorScheme: "dark" }} />
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95">取消</button>
                    <button type="submit" className="flex-1 py-4 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-400 font-bold tracking-widest text-xs hover:bg-amber-500 hover:text-black transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] active:scale-95">提交申请</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      , document.body)}
    </>
  )
}