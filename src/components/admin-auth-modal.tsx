"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toggleAdminRole } from "@/app/dashboard/crew/actions"

export function AdminAuthModal({ users }: { users: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => { setIsClosing(false); setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  
  const closeModalWithAnimation = async () => {
    setIsClosing(true); setIsAnimating(false);
    await new Promise(resolve => setTimeout(resolve, 600));
    setIsOpen(false);
  }

  const handleToggle = async (userId: string, currentRole: string) => {
    // 🚀 这里我们可以在 Switch 拨动时不需要关闭弹窗，
    // 但如果舰长点击“关闭加密通道”，则触发粒子消散。
    const makeAdmin = currentRole !== "ADMIN"
    try { await toggleAdminRole(userId, makeAdmin) } 
    catch (error) { console.error(error) }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={() => closeModalWithAnimation()}></div>
      <div className={`relative w-full max-w-2xl z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="quantum-breathe-dynamic w-full rounded-[3.5rem] bg-[#060813]/95 p-12 flex flex-col overflow-hidden" style={{ '--modal-glow': 'rgba(234, 179, 8, 0.2)', '--modal-shadow': 'rgba(234, 179, 8, 0.4)', '--modal-border': 'rgba(234, 179, 8, 0.5)' } as React.CSSProperties}>
          <h2 className="text-3xl font-bold text-white tracking-[0.1em] mb-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">舰队权限中枢</h2>
          <div className="bg-black/40 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] max-h-[40vh] overflow-y-auto ios-scrollbar">
            {users.filter(u => u.role !== "OWNER").map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 mb-3 rounded-2xl border border-white/5 bg-white/[0.02]">
                <span className="text-white font-bold">{user.realName || user.nickname}</span>
                <button 
                  onClick={() => handleToggle(user.id, user.role)} 
                  className={`relative w-12 h-6 rounded-full transition-all duration-500 ${user.role === 'ADMIN' ? "bg-yellow-500" : "bg-zinc-800"}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${user.role === 'ADMIN' ? "translate-x-6" : ""}`}></div>
                </button>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-10">
            {/* 🚀 点击关闭，粒子消散 */}
            <button onClick={() => closeModalWithAnimation()} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all">关闭加密通道</button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <div onClick={openModal} className="cursor-pointer group flex items-center gap-4 bg-black/60 px-6 py-3.5 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 hover:shadow-2xl">
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
        <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">权限任命</span>
      </div>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}