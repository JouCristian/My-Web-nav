"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
// 🚀 这里的路径和函数名已修正，对接您的 crew/actions.ts
import { approveUser, rejectUser } from "@/app/dashboard/crew/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = (type: "APPROVE" | "REJECT") => {
    setModalType(type); setIsClosing(false); setIsOpen(true);
    setTimeout(() => setIsAnimating(true), 10);
  }

  // 🚀 同步动画关闭：强制等待 600ms 消散动画
  const closeModalWithAnimation = async () => {
    setIsClosing(true); setIsAnimating(false);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsOpen(false); setModalType(null);
  }

  const handleAction = async () => {
    if (isPending) return
    setIsPending(true)
    
    // 🚀 视觉先行：先触发粒子消散，再调用后台执行
    await closeModalWithAnimation()
    
    try {
      if (modalType === "APPROVE") await approveUser(userId)
      else await rejectUser(userId)
    } catch (error) {
      console.error("执行指令失败:", error)
    } finally {
      setIsPending(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[10px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={() => !isPending && closeModalWithAnimation()}></div>
      
      <div className={`relative w-full max-w-md z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className={`w-full rounded-[2.5rem] border bg-[#060813]/95 p-10 shadow-2xl text-center overflow-hidden ${modalType === 'APPROVE' ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h3 className={`text-xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] mb-4 ${modalType === 'APPROVE' ? 'text-emerald-400' : 'text-red-400'}`}>
            {modalType === 'APPROVE' ? '授权重组序列' : '不可逆覆写协议'}
          </h3>
          <p className="text-zinc-400 text-sm mb-10 font-mono">正在对新兵 <span className="text-white font-bold">[{realName}]</span> 执行指令。</p>
          <div className="flex w-full gap-4 relative z-10">
            <button onClick={() => closeModalWithAnimation()} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-[10px] hover:text-white transition-all">取消序列</button>
            <button onClick={handleAction} disabled={isPending} className={`flex-1 py-4 rounded-2xl font-bold tracking-[0.2em] text-[10px] transition-all ${modalType === 'APPROVE' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white' : 'bg-red-600/20 text-red-400 border border-red-500/50 hover:bg-red-500 hover:text-white'}`}>
              {isPending ? 'Processing...' : '执行指令'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up-elastic { 0% { opacity: 0; transform: translateY(80px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up-elastic { animation: slide-up-elastic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        @keyframes dissipate { 0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 100% { opacity: 0; filter: blur(20px) brightness(0.5); transform: scale(0.85); } }
      `}} />
      <div className="flex gap-4">
        <button onClick={() => openModal("APPROVE")} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest uppercase hover:bg-emerald-500/20 transition-all active:scale-95">批准入舰</button>
        <button onClick={() => openModal("REJECT")} className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold tracking-widest uppercase hover:bg-red-500/20 transition-all active:scale-95">拒绝</button>
      </div>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}