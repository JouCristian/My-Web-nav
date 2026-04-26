"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { toggleAdminRole } from "@/app/dashboard/crew/actions"

export function AdminAuthModal({ users }: { users: any[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  useEffect(() => { setIsMounted(true) }, [])

  // 🚀 弹窗防闪烁生命周期
  const openModal = () => { setIsClosing(false); setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  const closeModal = () => { setIsClosing(true); setIsAnimating(false); setTimeout(() => setIsOpen(false), 600); }

  const handleToggle = async (userId: string, currentRole: string) => {
    if (loadingId) return
    setLoadingId(userId)
    const makeAdmin = currentRole !== "ADMIN"
    try {
      await toggleAdminRole(userId, makeAdmin)
    } catch (error) {
      console.error(error)
    } finally {
      setLoadingId(null)
    }
  }

  // 过滤出可以被操作的船员 (排除 OWNER 自身 和 PENDING 新兵)
  const eligibleUsers = users.filter(u => u.role === "MEMBER" || u.role === "ADMIN")

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景高斯模糊 */}
      <div className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      <div className={`relative w-full max-w-2xl z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        
        {/* 🚀 动态呼吸灯核心：注入舰长专属的 日冕金 (Yellow/Gold) 光晕 */}
        <div 
          className="quantum-breathe-dynamic w-full rounded-[3.5rem] bg-[#060813]/95 p-8 md:p-12 flex flex-col relative overflow-hidden"
          style={{ '--modal-glow': 'rgba(234, 179, 8, 0.2)', '--modal-shadow': 'rgba(234, 179, 8, 0.4)', '--modal-border': 'rgba(234, 179, 8, 0.5)' } as React.CSSProperties}
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_15px_rgba(234,179,8,0.8)]"></div>
              <span className="text-sm font-mono font-bold tracking-[0.3em] uppercase text-yellow-500">Commander Override</span>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-white tracking-[0.1em] font-[family-name:var(--font-space)] mb-8 leading-tight relative z-10 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            舰队权限中枢
          </h2>

          {/* 🚀 深渊容器：高度锁死 + 幽灵滚动条 */}
          <div className="relative z-10 bg-black/40 border border-white/5 rounded-[2rem] p-4 md:p-6 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto ios-scrollbar pr-2 md:pr-4">
              
              {eligibleUsers.map(user => {
                const isAdmin = user.role === "ADMIN"
                const avatar = user.customAvatar || user.image || user.avatarUrl || "https://github.com/ghost.png"
                
                return (
                  <div key={user.id} className="group relative flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-500 overflow-hidden">
                    <div className="flex items-center gap-4 relative z-10">
                      <img src={avatar} alt="avatar" className={`w-10 h-10 rounded-full border-2 transition-all duration-500 ${isAdmin ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'border-zinc-700'}`} />
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white tracking-wider font-[family-name:var(--font-space)]">{user.realName || user.nickname || "未知"}</span>
                        <div className="flex gap-2 items-center mt-1">
                          <span className={`text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-md border ${isAdmin ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 🚀 Apple HIG 极简顺滑 Switch */}
                    <div className="flex items-center gap-4 relative z-10">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">
                        {loadingId === user.id ? 'Processing...' : (isAdmin ? 'Admin' : 'Member')}
                      </span>
                      <button 
                        onClick={() => handleToggle(user.id, user.role)}
                        disabled={loadingId === user.id}
                        className={`relative w-12 h-6 rounded-full transition-all duration-500 ${isAdmin ? "bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)]" : "bg-zinc-800"}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${isAdmin ? "translate-x-6" : ""} ${loadingId === user.id ? "animate-pulse" : ""}`}></div>
                      </button>
                    </div>
                  </div>
                )
              })}

            </div>
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#060813] to-transparent pointer-events-none rounded-b-[2rem]"></div>
          </div>

          <div className="flex justify-end items-center mt-10 relative z-10">
            <button onClick={closeModal} className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold tracking-[0.2em] uppercase text-[10px] hover:bg-white/10 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.02)] hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">
              关闭加密通道
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

        @keyframes dynamic-breathe { 
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px var(--modal-glow), inset 0 0 20px var(--modal-glow); border: 1px solid rgba(255,255,255,0.1); } 
          50% { transform: scale(1.02); box-shadow: 0 0 100px var(--modal-shadow), inset 0 0 40px var(--modal-glow); border: 1px solid var(--modal-border); } 
        }
        .quantum-breathe-dynamic { animation: dynamic-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        .ios-scrollbar::-webkit-scrollbar { width: 6px; }
        .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ios-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; background-clip: padding-box; transition: all 0.3s ease; }
        .ios-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(234, 179, 8, 0.5); } /* 滚动时呈现金光 */
      `}} />

      {/* 🚀 触发入口：舰长专属金色 Card 按钮 */}
      <div 
        onClick={openModal}
        className="cursor-pointer group hover-breathe flex items-center gap-4 bg-black/60 px-6 py-3.5 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.3)] shrink-0"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-yellow-500/20 transition-colors duration-500 overflow-hidden">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 group-hover-pulse transition-all duration-500" />
          <div className="absolute inset-0 rounded-full border border-yellow-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] transition-all duration-500" />
        </div>
        <div className="flex flex-col items-start text-left">
          <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-mono group-hover:text-yellow-500 transition-colors duration-500">Override</span>
          <span className="text-base font-bold text-white tracking-[0.15em] font-[family-name:var(--font-space)]">权限任命</span>
        </div>
      </div>

      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}