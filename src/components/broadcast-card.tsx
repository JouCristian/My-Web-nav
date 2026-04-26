// src/components/broadcast-card.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { deleteBroadcast } from "@/app/dashboard/board/actions"

export function BroadcastCard({ announcement, isManager }: { announcement: any, isManager: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false) // 🚀 终极防闪烁状态
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  // 🚀 核心修复：开启时先重置 Closing 状态，前10ms隐形，彻底消灭闪烁！
  const openModal = () => { setIsClosing(false); setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  const closeModal = () => { setIsClosing(true); setIsAnimating(false); setTimeout(() => setIsOpen(false), 600); }

  const executeDelete = async () => {
    setIsPending(true)
    try { await deleteBroadcast(announcement.id) } 
    catch (error) { console.error(error) } 
    finally { setIsPending(false); closeModal() }
  }

  const typeStyles: Record<string, { shadow: string, text: string, bg: string, borderHover: string, label: string }> = {
    INFO: { shadow: "rgba(59, 130, 246, 0.4)", text: "text-blue-400", bg: "bg-blue-500/[0.02]", borderHover: "group-hover:border-blue-500/30", label: "INFO" },
    UPDATE: { shadow: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400", bg: "bg-emerald-500/[0.02]", borderHover: "group-hover:border-emerald-500/30", label: "UPDATE" },
    ALERT: { shadow: "rgba(239, 68, 68, 0.4)", text: "text-red-400", bg: "bg-red-500/[0.02]", borderHover: "group-hover:border-red-500/30", label: "ALERT" }
  }
  const style = typeStyles[announcement.type] || typeStyles.INFO

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[10px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      {/* 🚀 状态分流：关闭时消散，开启时弹射，初始 10ms 完全透明 */}
      <div className={`relative w-full max-w-md z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="w-full rounded-[2.5rem] border border-red-500/30 bg-[#060813]/95 p-10 shadow-[0_0_80px_rgba(239,68,68,0.2)] text-center overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="w-16 h-16 mx-auto bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center mb-6 text-red-500 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          </div>
          
          <h3 className="text-xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] mb-3 text-red-500">确认销毁指令</h3>
          <p className="text-zinc-400 text-sm mb-8 leading-relaxed font-mono">
            即将从星际档案中永久抹除此广播：<br/>
            <span className="text-white font-bold">「{announcement.title}」</span><br/>
            此操作不可逆转。
          </p>

          <div className="flex w-full gap-4 relative z-10">
            <button onClick={closeModal} disabled={isPending} className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 font-bold tracking-widest text-xs hover:text-white transition-all">取消</button>
            <button onClick={executeDelete} disabled={isPending} className="flex-1 py-3.5 rounded-2xl bg-red-600/20 border border-red-500/50 text-red-500 font-bold tracking-widest text-xs hover:bg-red-600 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center">
              {isPending ? <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div> : '确认销毁'}
            </button>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up-elastic {
          0% { opacity: 0; transform: translateY(80px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slide-up-elastic { animation: slide-up-elastic 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        @keyframes dissipate { 
          0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 
          100% { opacity: 0; filter: blur(20px) brightness(0.5); transform: scale(0.85); } 
        }
      `}} />
    </div>
  ) : null;

  return (
    <>
      <div className={`group relative w-full flex items-center gap-8 p-6 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.01] backdrop-blur-md overflow-hidden ${
        announcement.isPinned ? "border-purple-500/40 bg-purple-500/[0.05] shadow-[0_0_30px_rgba(168,85,247,0.15)]" : `border-white/5 ${style.bg} ${style.borderHover} hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]`
      }`}>
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
          <div className="flex flex-col items-end opacity-40 text-[9px] font-mono tracking-widest uppercase">
            <span className="text-zinc-400">By {announcement.author?.realName || "HQ"}</span>
            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
          </div>
          {isManager && (
            <button onClick={openModal} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-zinc-700 hover:text-red-500 transition-all active:scale-90">✕</button>
          )}
        </div>
      </div>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}