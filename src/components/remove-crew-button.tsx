"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { expelUser } from "@/app/dashboard/crew/actions"

export function RemoveCrewButton({ userId, realName }: { userId: string, realName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => { setIsClosing(false); setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  
  const closeModalWithAnimation = async () => {
    setIsClosing(true); setIsAnimating(false);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsOpen(false);
  }

  const executeExpel = async () => {
    if (isPending) return
    setIsPending(true)
    await closeModalWithAnimation() // 视觉先行，消散退场
    try {
      await expelUser(userId)
    } catch (error) {
      console.error("执行驱逐失败:", error)
    } finally {
      setIsPending(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-0">
      <div className={`absolute inset-0 bg-[#02040a]/50 backdrop-blur-[10px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={() => !isPending && closeModalWithAnimation()}></div>
      <div className={`relative w-full max-w-[440px] z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="quantum-breathe-alert w-full rounded-[2.5rem] border border-red-500/40 bg-[#060813]/90 p-10 text-center overflow-hidden">
          <h3 className="text-xl font-bold tracking-[0.2em] mb-4 text-red-500">强制驱逐程序</h3>
          <p className="text-zinc-400 text-sm mb-10 font-mono leading-loose">确认褫夺 <span className="text-white font-bold">[{realName}]</span> 的编制？<br/>此操作不可逆。</p>
          <div className="flex w-full gap-5">
            <button onClick={() => closeModalWithAnimation()} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-black/40 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-[10px] hover:text-white transition-all">终止程序</button>
            <button onClick={executeExpel} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-red-600/20 border border-red-500/80 text-red-500 font-bold tracking-[0.2em] text-[10px] hover:bg-red-600 hover:text-white transition-all">确认除名</button>
          </div>
        </div>
      </div>
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