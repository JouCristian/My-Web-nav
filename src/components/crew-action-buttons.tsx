// src/components/crew-action-buttons.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { approveUser, rejectUser } from "../app/dashboard/crew/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isPending, setIsPending] = useState(false)
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = (type: 'approve' | 'reject') => {
    setModalType(type)
    requestAnimationFrame(() => setIsAnimating(true))
  }

  const closeModal = () => {
    if (isPending) return
    setIsAnimating(false) 
    setTimeout(() => setModalType(null), 600)
  }

  const executeAction = async () => {
    if (!modalType) return
    setIsPending(true)
    try {
      if (modalType === 'approve') await approveUser(userId)
      else await rejectUser(userId)
    } catch (error) { console.error(error) } 
    finally { setIsPending(false); closeModal(); }
  }

  const modalContent = modalType ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-0" style={{ perspective: '1000px' }}>
      <div 
        className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[60px] transition-all duration-700 ease-out ${
          isAnimating ? "opacity-100" : "opacity-0 backdrop-blur-none"
        }`}
        onClick={closeModal}
      ></div>
      
      <div className={`relative w-full max-w-[440px] z-10 ${isAnimating ? "quantum-particle-in" : "quantum-particle-out"}`}>
        <div 
          className="quantum-breathe w-full h-full rounded-[2.5rem] border bg-[#060813]/80 p-10 flex flex-col items-center text-center overflow-hidden shadow-[0_0_60px_-15px_rgba(59,130,246,0.3)]"
          style={{ borderColor: modalType === 'approve' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}
        >
          {/* ...量子弹窗内容保持不变... */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6">
            <div className={`absolute inset-0 rounded-full border border-t-transparent animate-spin ${modalType === 'approve' ? 'border-emerald-500/50' : 'border-red-500/50'}`}></div>
            <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border bg-black/50 ${modalType === 'approve' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-500'}`}>
              {modalType === 'approve' ? '✔' : '✖'}
            </div>
          </div>
          <h3 className={`text-xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] mb-4 ${modalType === 'approve' ? 'text-emerald-400' : 'text-red-400'}`}>{modalType === 'approve' ? '授权重组序列' : '不可逆覆写协议'}</h3>
          <div className="text-zinc-400/80 text-sm mb-10 leading-loose font-mono tracking-wider">
             {modalType === 'approve' ? <p>正在将新兵 <span className="text-emerald-300 font-bold">[{realName}]</span> 编入主序列。</p> : <p>目标 <span className="text-red-400 font-bold">[{realName}]</span> 的档案将化为尘埃。</p>}
          </div>
          <div className="flex w-full gap-5">
            <button onClick={closeModal} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-black/40 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-[10px] hover:text-white transition-all">取消序列</button>
            <button onClick={executeAction} disabled={isPending} className={`flex-1 py-4 rounded-2xl font-bold tracking-[0.2em] text-[10px] transition-all ${modalType === 'approve' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400' : 'bg-red-500/20 border border-red-500/50 text-red-500'}`}>
              {isPending ? '...' : '执行指令'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --quantum-easing-in: cubic-bezier(0.16, 1, 0.3, 1); --quantum-easing-out: cubic-bezier(0.7, 0, 0.84, 0); }
        .quantum-particle-in { animation: aggregate 0.8s var(--quantum-easing-in) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s var(--quantum-easing-out) forwards; }
        .quantum-breathe { animation: core-breathe 4s ease-in-out infinite; }
        @keyframes aggregate { 0% { opacity: 0; filter: blur(40px) brightness(2); transform: scale(1.15); } 100% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } }
        @keyframes dissipate { 0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 100% { opacity: 0; filter: blur(40px) brightness(0.5); transform: scale(0.85); } }
        @keyframes core-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />

      {/* 🚀 顶级重绘：战术指令按钮区  */}
      <div className="flex items-center gap-4">
        {/* 核准按钮 */}
        <button 
          onClick={() => openModal('approve')}
          className="group relative px-6 py-3 rounded-2xl bg-[#060813]/60 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-[0.3em] uppercase overflow-hidden transition-all duration-500 hover:border-emerald-500 hover:shadow-[0_0_25px_rgba(16,185,129,0.2)] active:scale-95"
        >
          {/* 流光能量条 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          <div className="relative flex items-center gap-3">
            <span className="text-sm">✔</span>
            <span className="border-l border-emerald-500/20 pl-3">允许加入</span>
          </div>
        </button>

        {/* 驳回按钮 */}
        <button 
          onClick={() => openModal('reject')}
          className="group relative px-6 py-3 rounded-2xl bg-[#060813]/60 border border-red-500/30 text-red-500 text-[10px] font-bold tracking-[0.3em] uppercase overflow-hidden transition-all duration-500 hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
          <div className="relative flex items-center gap-3">
            <span className="text-sm">✖</span>
            <span className="border-l border-red-500/20 pl-3">驳回申请</span>
          </div>
        </button>
      </div>

      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}