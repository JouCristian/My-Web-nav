"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { createBroadcast } from "@/app/dashboard/board/actions"

export function CreateBroadcastModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => { setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  const closeModal = () => { setIsAnimating(false); setTimeout(() => setIsOpen(false), 600); }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[40px] transition-all duration-700 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      <div className={`relative w-full max-w-xl z-10 ${isAnimating ? "quantum-particle-in" : "quantum-particle-out"}`}>
        <div className="quantum-breathe w-full rounded-[3rem] border border-blue-500/30 bg-[#060813]/90 p-12 shadow-[0_0_80px_rgba(59,130,246,0.15)]">
          <h2 className="text-2xl font-bold text-white tracking-[0.2em] mb-8 font-[family-name:var(--font-space)] text-center">发布全舰广播</h2>
          
          <form action={async (fd) => { await createBroadcast(fd); closeModal(); }} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">广播级别</label>
              <select name="type" className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-blue-500/50">
                <option value="INFO">INFO - 日常简讯</option>
                <option value="UPDATE">UPDATE - 系统更新</option>
                <option value="ALERT">ALERT - 紧急警报</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">广播标题</label>
              <input name="title" required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500/50" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">详细内容</label>
              <textarea name="content" rows={4} required className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-500/50" />
            </div>

            <div className="flex gap-4 pt-4">
              <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-500 font-bold tracking-widest text-xs hover:text-white transition-all">取消</button>
              <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/50 text-blue-400 font-bold tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all">发射广播信号</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button onClick={openModal} className="group relative px-8 py-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95">
        + 发布全舰广播
      </button>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}