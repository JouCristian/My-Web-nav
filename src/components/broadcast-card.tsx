// src/components/broadcast-card.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { deleteBroadcast } from "@/app/actions" // 🚀 修正导入路径

export function BroadcastCard({ announcement, isManager }: { announcement: any, isManager: boolean }) {
  const [isVanishing, setIsVanishing] = useState(false) // 粒子消散控制
  const [isReadOpen, setIsReadOpen] = useState(false)
  const [isReadAnimating, setIsReadAnimating] = useState(false)
  const [isReadClosing, setIsReadClosing] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [isDelAnimating, setIsDelAnimating] = useState(false)
  const [isDelClosing, setIsDelClosing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openReadModal = () => { setIsReadClosing(false); setIsReadOpen(true); setTimeout(() => setIsReadAnimating(true), 10); }
  const closeReadModal = () => { setIsReadClosing(true); setIsReadAnimating(false); setTimeout(() => setIsReadOpen(false), 600); }
  const openDelModal = () => { setIsDelClosing(false); setIsDelOpen(true); setTimeout(() => setIsDelAnimating(true), 10); }
  
  const closeDelModalWithAnimation = async () => {
    setIsDelClosing(true); setIsDelAnimating(false);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsDelOpen(false);
  }

  // 🚀 执行销毁：量子消散 -> 强制等待 -> 物理移除
  const executeDelete = async () => {
    if (isPending) return
    setIsPending(true)
    await closeDelModalWithAnimation()
    
    // 激活本体量子消散动效
    setIsVanishing(true)
    
    // 强制等待 600ms，确保粒子消散与弹簧位移被船员肉眼捕捉
    await new Promise(resolve => setTimeout(resolve, 600))
    
    try { 
      await deleteBroadcast(announcement.id) 
    } catch (error) { 
      console.error(error); setIsVanishing(false); setIsPending(false) 
    } 
  }

  const typeStyles: Record<string, any> = {
    INFO: { shadow: "rgba(59, 130, 246, 0.6)", glow: "rgba(59, 130, 246, 0.2)", border: "rgba(59, 130, 246, 0.5)", text: "text-blue-400", bg: "bg-blue-500/[0.02]", borderHover: "group-hover:border-blue-500/30", label: "INFO" },
    UPDATE: { shadow: "rgba(16, 185, 129, 0.6)", glow: "rgba(16, 185, 129, 0.2)", border: "rgba(16, 185, 129, 0.5)", text: "text-emerald-400", bg: "bg-emerald-500/[0.02]", borderHover: "group-hover:border-emerald-500/30", label: "UPDATE" },
    ALERT: { shadow: "rgba(239, 68, 68, 0.6)", glow: "rgba(239, 68, 68, 0.2)", border: "rgba(239, 68, 68, 0.5)", text: "text-red-400", bg: "bg-red-500/[0.02]", borderHover: "group-hover:border-red-500/30", label: "ALERT" }
  }
  const style = typeStyles[announcement.type] || typeStyles.INFO

  // 阅读与删除确认弹窗 (UI 保持一致性)
  const readModalContent = isReadOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px] transition-all duration-500 ${isReadAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeReadModal}></div>
      <div className={`relative w-full max-w-2xl z-10 ${isReadClosing ? "quantum-particle-out" : isReadAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="quantum-breathe-dynamic w-full rounded-[3.5rem] bg-[#060813]/95 p-8 md:p-12 flex flex-col relative overflow-hidden" style={{ '--modal-glow': style.glow, '--modal-shadow': style.shadow, '--modal-border': style.border } as React.CSSProperties}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-[0.1em] mb-8 relative z-10">{announcement.title}</h2>
          <div className="relative z-10 bg-black/40 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]"><div className="max-h-[40vh] overflow-y-auto ios-scrollbar text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{announcement.content}</div></div>
          <button onClick={closeReadModal} className="mt-8 self-end px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">关闭加密档案</button>
        </div>
      </div>
    </div>
  ) : null;

  const delModalContent = isDelOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[10px] transition-all duration-500 ${isDelAnimating ? "opacity-100" : "opacity-0"}`} onClick={() => !isPending && closeDelModalWithAnimation()}></div>
      <div className={`relative w-full max-w-md z-10 ${isDelClosing ? "quantum-particle-out" : isDelAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="w-full rounded-[2.5rem] border border-red-500/30 bg-[#060813]/95 p-10 shadow-2xl text-center">
          <h3 className="text-xl font-bold tracking-[0.2em] mb-3 text-red-500 font-[family-name:var(--font-space)]">不可逆覆写协议</h3>
          <p className="text-zinc-400 text-sm mb-10 leading-relaxed">目标 <span className="text-white font-bold">[{announcement.title}]</span> 的档案将转化为尘埃。</p>
          <div className="flex w-full gap-4 relative z-10">
            <button onClick={closeDelModalWithAnimation} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-500 font-bold text-[10px]">取消</button>
            <button onClick={executeDelete} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-red-600/20 border border-red-500/50 text-red-400 font-bold text-[10px] hover:bg-red-600 hover:text-white transition-all shadow-red-500/20">销毁档案</button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    /* 🚀 物理吸附包裹层：使用最稳定的 max-height 逻辑，辅以非线性贝塞尔曲线 */
    <div 
      className={`transition-all duration-[600ms] ease-[cubic-bezier(0.5,1.5,0.5,1.25)] overflow-hidden ${isVanishing ? 'max-h-0 opacity-0 mb-0 scale-x-95 translate-y-[-20px] pointer-events-none' : 'max-h-[500px] mb-4'}`}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vanish-dissipate { 0% { opacity: 1; filter: blur(0px) brightness(1); } 100% { opacity: 0; filter: blur(20px) brightness(3); transform: scale(1.05); } }
        .animate-vanish-dissipate { animation: vanish-dissipate 0.6s forwards; }
        @keyframes slide-up-elastic { 0% { opacity: 0; transform: translateY(80px) scale(0.9); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up-elastic { animation: slide-up-elastic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        @keyframes dissipate { 0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 100% { opacity: 0; filter: blur(20px) brightness(0.5); transform: scale(0.85); } }
        @keyframes dynamic-breathe { 0%, 100% { transform: scale(1); box-shadow: 0 0 60px var(--modal-glow), inset 0 0 20px var(--modal-glow); border: 1px solid rgba(255,255,255,0.1); } 50% { transform: scale(1.03); box-shadow: 0 0 100px var(--modal-shadow), inset 0 0 40px var(--modal-glow); border: 1px solid var(--modal-border); } }
        .quantum-breathe-dynamic { animation: dynamic-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}} />

      <div 
        onClick={openReadModal}
        className={`cursor-pointer group relative w-full flex items-center gap-8 p-6 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.015] backdrop-blur-md overflow-hidden ${
          isVanishing ? 'animate-vanish-dissipate' : announcement.isPinned ? "border-purple-500/40 bg-purple-500/[0.05] shadow-[0_0_30px_rgba(168,85,247,0.15)]" : `border-white/5 ${style.bg} ${style.borderHover}`
        }`}
      >
        <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 overflow-hidden relative z-10">
          <h3 className={`text-lg font-bold text-white shrink-0 font-[family-name:var(--font-space)] transition-colors ${style.text}`}>{announcement.title}</h3>
          <p className="text-zinc-500 text-sm font-light truncate max-w-xl">{announcement.content}</p>
        </div>
        <div className="flex items-center gap-8 shrink-0 relative z-10">
          <span className="text-[10px] text-zinc-500 font-mono">By {announcement.author?.realName || "HQ"}</span>
          {isManager && (<button onClick={(e) => { e.stopPropagation(); openDelModal(); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-zinc-700 hover:text-red-500 transition-all text-xl active:scale-90">✕</button>)}
        </div>
      </div>
      {isMounted && createPortal(<>{readModalContent}{delModalContent}</>, document.body)}
    </div>
  )
}