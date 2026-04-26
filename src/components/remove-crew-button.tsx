// src/components/remove-crew-button.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { expelUser } from "../app/dashboard/crew/actions"

export function RemoveCrewButton({ userId, realName }: { userId: string, realName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => { setIsClosing(false); setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  
  // 🚀 同步动画关闭引擎
  const closeModalWithAnimation = async () => {
    setIsClosing(true)
    setIsAnimating(false)
    await new Promise(resolve => setTimeout(resolve, 600))
    setIsOpen(false)
  }

  const executeExpel = async () => {
    if (isPending) return
    setIsPending(true)
    
    // 视觉先行
    await closeModalWithAnimation()
    
    try {
      await expelUser(userId)
    } catch (error) {
      console.error("执行驱逐失败", error)
    } finally {
      setIsPending(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-0">
      <div className={`absolute inset-0 bg-[#02040a]/50 backdrop-blur-[10px] transition-all duration-500 ease-out ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={() => !isPending && closeModalWithAnimation()}></div>
      
      <div className={`relative w-full max-w-[440px] z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="quantum-breathe-alert w-full h-full rounded-[2.5rem] border bg-[#060813]/90 p-10 flex flex-col items-center text-center overflow-hidden border-red-500/40 shadow-[0_0_80px_-15px_rgba(239,68,68,0.4)]">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border border-t-transparent border-red-500/80 animate-[spin_0.5s_linear_infinite]"></div>
            <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border bg-black/80 border-red-500/80 text-red-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
          </div>
          
          <h3 className="text-xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] mb-4 text-red-500">强制驱逐程序</h3>
          <div className="text-zinc-400/80 text-sm mb-10 leading-loose font-mono tracking-wider">
            <p>警告：正在褫夺 <span className="text-white font-bold">[{realName}]</span> 的舰队编制。</p>
            <p>该操作将永久销毁其星际档案，不可逆转。</p>
          </div>
          
          <div className="flex w-full gap-5 z-10">
            <button onClick={() => closeModalWithAnimation()} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-black/40 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-[10px] hover:text-white transition-all">终止程序</button>
            <button onClick={executeExpel} disabled={isPending} className="group relative flex-1 py-4 rounded-2xl font-bold tracking-[0.2em] text-[10px] transition-all bg-red-600/20 border border-red-500/80 text-red-500 hover:bg-red-600 hover:text-white overflow-hidden flex items-center justify-center">
              {isPending ? <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : '确认除名'}
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up-elastic { 0% { opacity: 0; transform: translateY(80px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up-elastic { animation: slide-up-elastic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        @keyframes dissipate { 0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 100% { opacity: 0; filter: blur(20px) brightness(0.5); transform: scale(0.85); } }
        .quantum-breathe-alert { animation: alert-breathe 2s ease-in-out infinite; }
        @keyframes alert-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
      `}} />
    </div>
  ) : null;

  return (
    <>
      <button onClick={openModal} className="group relative flex items-center justify-center w-9 h-9 rounded-xl bg-[#060813]/60 border border-red-500/20 text-red-500/60 transition-all duration-300 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 active:scale-90 overflow-hidden">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 relative z-10"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}