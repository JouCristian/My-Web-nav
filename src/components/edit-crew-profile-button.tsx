// src/components/edit-crew-profile-button.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { updateCrewProfile } from "@/app/dashboard/crew/actions"

interface EditCrewProfileButtonProps {
  currentData: {
    crewNickname?: string | null
    crewStudentId?: string | null
    crewFeishuLink?: string | null
    realName?: string | null
    studentId?: string | null
    feishuLink?: string | null
  }
}

export function EditCrewProfileButton({ currentData }: EditCrewProfileButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 表单状态 - 优先使用档案室专用字段，否则使用原字段
  const [nickname, setNickname] = useState(currentData.crewNickname || currentData.realName || "")
  const [studentId, setStudentId] = useState(currentData.crewStudentId || currentData.studentId || "")
  const [feishuLink, setFeishuLink] = useState(currentData.crewFeishuLink || currentData.feishuLink || "")

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => {
    setError(null)
    setIsClosing(false)
    setIsOpen(true)
    setTimeout(() => setIsAnimating(true), 10)
  }

  const closeModalWithAnimation = async () => {
    setIsClosing(true)
    setIsAnimating(false)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsOpen(false)
  }

  const handleSubmit = async () => {
    if (isPending) return
    setIsPending(true)
    setError(null)

    try {
      await updateCrewProfile({
        crewNickname: nickname,
        crewStudentId: studentId,
        crewFeishuLink: feishuLink,
      })
      await closeModalWithAnimation()
    } catch (err: any) {
      setError(err.message || "更新失败，请重试")
    } finally {
      setIsPending(false)
    }
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div 
        className={`absolute inset-0 bg-[#02040a]/70 backdrop-blur-[12px] transition-all duration-500 ${isAnimating ? "opacity-100" : "opacity-0"}`} 
        onClick={() => !isPending && closeModalWithAnimation()}
      />
      
      {/* 模态框主体 */}
      <div className={`relative w-full max-w-lg z-10 ${isClosing ? "quantum-particle-out" : isAnimating ? "animate-slide-up-elastic" : "opacity-0"}`}>
        <div className="w-full rounded-[2rem] border border-cyan-500/30 bg-[#060813]/95 p-8 shadow-2xl shadow-cyan-500/10 overflow-hidden">
          
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
            backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} />
          
          {/* 标题 */}
          <div className="relative flex items-center gap-4 mb-8">
            <div className="relative w-14 h-14 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-cyan-500/30 border-t-transparent animate-spin" style={{ animationDuration: '3s' }} />
              <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-[0.15em] font-[family-name:var(--font-space)] text-cyan-400">
                编辑档案信息
              </h3>
              <p className="text-xs text-zinc-500 mt-1 tracking-wider">修改你在船员档案室中的显示信息</p>
            </div>
          </div>

          {/* 表单 */}
          <div className="relative space-y-5">
            {/* 昵称 */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                档案室昵称
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="输入你希望在档案室显示的昵称"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300"
              />
            </div>

            {/* 学号 */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                学号
              </label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="输入你的学号"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300"
              />
            </div>

            {/* 飞书链接 */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-mono tracking-[0.3em] text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                飞书链接
              </label>
              <input
                type="url"
                value={feishuLink}
                onChange={(e) => setFeishuLink(e.target.value)}
                placeholder="https://www.feishu.cn/..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300"
              />
              <p className="text-[10px] text-zinc-600 pl-1">请输入有效的飞书链接地址</p>
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs text-red-400">{error}</span>
              </div>
            )}
          </div>

          {/* 按钮区 */}
          <div className="flex w-full gap-4 mt-8 relative z-10">
            <button 
              onClick={() => closeModalWithAnimation()} 
              disabled={isPending} 
              className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-[10px] hover:text-white hover:border-white/20 transition-all duration-300 disabled:opacity-50"
            >
              取消
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={isPending} 
              className="flex-1 py-4 rounded-2xl bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 font-bold tracking-[0.2em] text-[10px] hover:bg-cyan-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? (
                <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  保存修改
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* 动画样式 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slide-up-elastic { 
          0% { opacity: 0; transform: translateY(60px) scale(0.95); } 
          100% { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-slide-up-elastic { 
          animation: slide-up-elastic 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
        }
        .quantum-particle-out { 
          animation: dissipate 0.5s cubic-bezier(0.7, 0, 0.84, 0) forwards; 
        }
        @keyframes dissipate { 
          0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 
          100% { opacity: 0; filter: blur(15px) brightness(0.6); transform: scale(0.9); } 
        }
      `}} />
    </div>
  ) : null

  return (
    <>
      {/* 编辑按钮 */}
      <button
        onClick={openModal}
        className="group relative flex items-center gap-2 bg-[#060813]/60 border border-cyan-500/20 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl overflow-hidden transition-all duration-500 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]"
      >
        {/* 高光扫过效果 */}
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent" />
        </span>
        
        <svg className="w-3.5 h-3.5 text-cyan-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span className="text-[9px] sm:text-[10px] text-cyan-400 font-mono uppercase tracking-[0.15em] font-bold relative z-10">
          编辑档案
        </span>
      </button>
      
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}
