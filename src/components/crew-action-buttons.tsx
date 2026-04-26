"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { approveCrew, rejectCrew } from "@/app/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = (type: "APPROVE" | "REJECT") => {
    setModalType(type)
    setIsClosing(false)
    setIsOpen(true)
    setTimeout(() => setIsAnimating(true), 10)
  }

  const closeModal = () => {
    setIsClosing(true)
    setIsAnimating(false)
    setTimeout(() => { setIsOpen(false); setModalType(null); }, 600)
  }

  const handleAction = async () => {
    setIsPending(true)
    try {
      if (modalType === "APPROVE") await approveCrew(userId)
      else await rejectCrew(userId)
      closeModal()
    } catch (error) {
      console.error(error)
    } finally {
      setIsPending(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩：低模糊、高通透 */}
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[10px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      {/* 🚀 弹窗本体：从下弹入弹性动效 */}
      <div className={`relative w-full max-w-md z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className={`w-full rounded-[2.5rem] border bg-[#060813]/95 p-10 shadow-2xl text-center overflow-hidden 
          ${modalType === 'APPROVE' ? 'border-emerald-500/30 shadow-emerald-500/10' : 'border-red-500/30 shadow-red-500/10'}`}>
          
          {/* 经典的网格背景 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          {/* 动态图标状态机 */}
          <div className={`relative w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 
            ${modalType === 'APPROVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
            <div className={`absolute inset-0 rounded-full border border-t-transparent animate-spin ${modalType === 'APPROVE' ? 'border-emerald-500/40' : 'border-red-500/40'}`}></div>
            {modalType === 'APPROVE' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
          
          <h3 className={`text-xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] mb-4 ${modalType === 'APPROVE' ? 'text-emerald-400' : 'text-red-400'}`}>
            {modalType === 'APPROVE' ? '授权重组序列' : '不可逆覆写协议'}
          </h3>
          
          <div className="text-zinc-400 text-sm mb-10 leading-loose font-mono">
             正在对新兵 <span className="text-white font-bold">[{realName}]</span> <br/> 
             执行 {modalType === 'APPROVE' ? '编入主序列' : '档案沙盒化'} 动作。
          </div>
          
          <div className="flex w-full gap-4 relative z-10">
            <button onClick={closeModal} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-[10px] hover:text-white transition-all">取消序列</button>
            <button 
              onClick={handleAction} 
              disabled={isPending} 
              className={`flex-1 py-4 rounded-2xl font-bold tracking-[0.2em] text-[10px] transition-all flex items-center justify-center 
                ${modalType === 'APPROVE' ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-emerald-500/20' : 'bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-500 hover:text-white shadow-red-500/20'}`}
            >
              {isPending ? <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : '执行指令'}
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