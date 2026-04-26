// src/components/broadcast-card.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { deleteBroadcast } from "@/app/actions" // 🚀 修正导入路径，防止删除时崩掉

export function BroadcastCard({ announcement, isManager }: { announcement: any, isManager: boolean }) {
  // 🚀 核心动效：量子消散状态机
  const [isVanishing, setIsVanishing] = useState(false)
  
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

  // 🚀 执行销毁：视觉先行，同步粒子消散与弹簧吸附
  const executeDelete = async () => {
    if (isPending) return
    setIsPending(true)
    
    // 1. 关闭确认弹窗
    await closeDelModalWithAnimation()
    
    // 2. 触发列表卡片本体的量子消散
    setIsVanishing(true)
    
    // 3. 强制等待 600ms，确保非线性消散与高度收缩完整呈现
    await new Promise(resolve => setTimeout(resolve, 600))
    
    try { 
      await deleteBroadcast(announcement.id) 
    } catch (error) { 
      console.error(error)
      setIsVanishing(false) // 失败回滚
      setIsPending(false) 
    } 
  }

  const typeStyles: Record<string, any> = {
    INFO: { shadow: "rgba(59, 130, 246, 0.6)", glow: "rgba(59, 130, 246, 0.2)", border: "rgba(59, 130, 246, 0.5)", text: "text-blue-400", bg: "bg-blue-500/[0.02]", borderHover: "group-hover:border-blue-500/30", label: "INFO" },
    UPDATE: { shadow: "rgba(16, 185, 129, 0.6)", glow: "rgba(16, 185, 129, 0.2)", border: "rgba(16, 185, 129, 0.5)", text: "text-emerald-400", bg: "bg-emerald-500/[0.02]", borderHover: "group-hover:border-emerald-500/30", label: "UPDATE" },
    ALERT: { shadow: "rgba(239, 68, 68, 0.6)", glow: "rgba(239, 68, 68, 0.2)", border: "rgba(239, 68, 68, 0.5)", text: "text-red-400", bg: "bg-red-500/[0.02]", borderHover: "group-hover:border-red-500/30", label: "ALERT" }
  }
  const style = typeStyles[announcement.type] || typeStyles.INFO

  // 阅读弹窗 (保持原样)
  const readModalContent = isReadOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px] transition-all duration-500 ${isReadAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeReadModal}></div>
      <div className={`relative w-full max-w-2xl z-10 ${isReadClosing ? "quantum-particle-out" : isReadAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="quantum-breathe-dynamic w-full rounded-[3.5rem] bg-[#060813]/95 p-8 md:p-12 flex flex-col relative overflow-hidden" style={{ '--modal-glow': style.glow, '--modal-shadow': style.shadow, '--modal-border': style.border } as React.CSSProperties}>
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8 relative z-10">
            <div className="flex items-center gap-4"><div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: style.shadow, boxShadow: `0 0 15px ${style.shadow}` }}></div><span className={`text-sm font-mono font-bold tracking-[0.3em] uppercase ${style.text}`}>{style.label} Broadcast</span></div>
            <span className="text-xs font-mono text-zinc-500 tracking-widest">{new Date(announcement.createdAt).toLocaleString()}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-[0.1em] font-[family-name:var(--font-space)] mb-8 leading-tight relative z-10">{announcement.title}</h2>
          <div className="relative z-10 bg-black/40 border border-white/5 rounded-[2rem] p-6 md:p-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
            <div className="max-h-[40vh] overflow-y-auto ios-scrollbar pr-4 text-zinc-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">{announcement.content}</div>
          </div>
          <button onClick={closeReadModal} className="mt-8 self-end px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">关闭加密档案</button>
        </div>
      </div>
    </div>
  ) : null;

  // 删除确认弹窗
  const delModalContent = isDelOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[10px] transition-all duration-500 ${isDelAnimating ? "opacity-100" : "opacity-0"}`} onClick={() => !isPending && closeDelModalWithAnimation()}></div>
      <div className={`relative w-full max-w-md z-10 ${isDelClosing ? "quantum-particle-out" : isDelAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="w-full rounded-[2.5rem] border border-red-500/30 bg-[#060813]/95 p-10 shadow-2xl text-center overflow-hidden">
          <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          <h3 className="text-xl font-bold tracking-[0.2em] mb-3 text-red-500 font-[family-name:var(--font-space)]">不可逆覆写协议</h3>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed">目标 <span className="text-white font-bold">[{announcement.title}]</span> 的档案将转化为尘埃。</p>
          <div className="flex w-full gap-4 relative z-10">
            <button onClick={closeDelModalWithAnimation} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-500 font-bold text-[10px] tracking-widest">取消序列</button>
            <button onClick={executeDelete} disabled={isPending} className="flex-1 py-4 rounded-2xl bg-red-600/20 border border-red-500/50 text-red-400 font-bold text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-red-500/20 flex items-center justify-center">
              {isPending ? <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : '执行指令'}
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    /* 🚀 物理弹簧吸附层：当 isVanishing 为 true 时，使用贝塞尔曲线快速缩减高度并消失 */
    <div className={`transition-all duration-[600ms] ease-[cubic-bezier(0.5,1.5,0.5,1.25)] overflow-hidden ${isVanishing ? 'max-h-0 opacity-0 mb-0 pointer-events-none scale-x-95 translate-y-[-20px]' : 'max-h-[500px] mb-4'}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes vanish-dissipate { 
          0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 
          100% { opacity: 0; filter: blur(20px) brightness(2); transform: scale(1.05); } 
        }
        .animate-vanish-dissipate { animation: vanish-dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        
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
        {announcement.isPinned && <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,1)] animate-pulse"></div>}

        <div className="flex flex-col items-center justify-center min-w-[90px] border-r border-white/5 pr-8 relative z-10">
          <div className={`text-[10px] font-mono font-bold tracking-widest mb-1 ${style.text}`}>{style.label}</div>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: style.shadow, boxShadow: `0 0 10px ${style.shadow}` }}></div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 overflow-hidden relative z-10">
          <h3 className={`text-lg font-bold text-white tracking-wide shrink-0 font-[family-name:var(--font-space)] transition-colors duration-300 ${style.text.replace('text-', 'group-hover:text-')}`}>{announcement.title}</h3>
          <p className="text-zinc-500 text-sm font-light truncate max-w-xl">{announcement.content}</p>
        </div>

        <div className="flex items-center gap-8 shrink-0 relative z-10">
          <div className="flex flex-col items-end opacity-40 text-[9px] font-mono tracking-widest uppercase"><span className="text-zinc-400">By {announcement.author?.realName || "HQ"}</span><span>{new Date(announcement.createdAt).toLocaleDateString()}</span></div>
          {isManager && (<button onClick={(e) => { e.stopPropagation(); openDelModal(); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-zinc-700 hover:text-red-500 transition-all active:scale-90">✕</button>)}
        </div>
      </div>

      {isMounted && createPortal(<>{readModalContent}{delModalContent}</>, document.body)}
    </div>
  )
}