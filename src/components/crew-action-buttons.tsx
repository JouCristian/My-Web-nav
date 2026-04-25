// src/components/crew-action-buttons.tsx
"use client"

import { useState, useEffect } from "react"
import { approveUser, rejectUser } from "../app/dashboard/crew/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isPending, setIsPending] = useState(false)
  
  // 🚀 双相状态引擎：分离“物理挂载”与“视觉显隐”，完美支持退场动画
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  // 触发打开弹窗
  const openModal = (type: 'approve' | 'reject') => {
    setModalType(type)
    // 延迟一帧触发动画，确保 DOM 已渲染
    setTimeout(() => setIsVisible(true), 10)
  }

  // 触发关闭弹窗 (先播退场动画，再卸载 DOM)
  const closeModal = () => {
    if (isPending) return
    setIsVisible(false)
    setTimeout(() => setModalType(null), 300) // 300ms 与 transition-duration 保持一致
  }

  // 后端执行引擎
  const executeAction = async () => {
    if (!modalType) return
    setIsPending(true)
    try {
      if (modalType === 'approve') {
        await approveUser(userId)
      } else {
        await rejectUser(userId)
      }
    } catch (error) {
      console.error("执行指令失败", error)
    } finally {
      setIsPending(false)
      closeModal()
    }
  }

  return (
    <>
      {/* ========================================== */}
      {/* 🌌 蓝色星光标准弹窗 (Blue Starlight Modal) */}
      {/* ========================================== */}
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-0">
          {/* 背景毛玻璃遮罩层 - 进出场动画 */}
          <div 
            className={`absolute inset-0 bg-[#020617]/70 backdrop-blur-md transition-opacity duration-300 ease-out ${
              isVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={closeModal}
          ></div>
          
          {/* 弹窗主体容器 - 蓝色星光主题与缩放动画 */}
          <div 
            className={`relative w-full max-w-[420px] p-8 md:p-10 rounded-[2.5rem] border border-blue-500/20 bg-[#060813]/95 shadow-[0_0_80px_-15px_rgba(59,130,246,0.4)] transform transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col items-center text-center ${
              isVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-8"
            }`}
          >
            {/* 动态徽章 Icon */}
            <div className="relative w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-blue-500/30 bg-blue-500/10 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
              {/* 内圈光晕 */}
              <div className="absolute inset-0 rounded-full border border-blue-400/20 animate-[spin_4s_linear_infinite]"></div>
              
              {modalType === 'approve' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-7 h-7 text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              )}
            </div>

            {/* 标题 */}
            <h3 className="text-xl font-bold tracking-widest font-[family-name:var(--font-space)] text-white mb-3">
              {modalType === 'approve' ? '执行核准程序' : '访问系统受限'}
            </h3>
            
            {/* 描述文案 */}
            <div className="text-blue-100/50 text-sm mb-10 leading-relaxed font-mono tracking-wide">
              {modalType === 'approve' ? (
                <p>
                  是否确认将新兵 <span className="text-blue-400 font-bold">[{realName}]</span> 接入指挥系统？<br/>
                  该操作将为其解锁星际舰队专属通讯与跃迁权限。
                </p>
              ) : (
                <p>
                  警告：检测到违规操作意图。<br/>
                  抹除 <span className="text-red-400 font-bold">[{realName}]</span> 的档案属不可逆指令，<br/>
                  是否强行覆写安全协议？
                </p>
              )}
            </div>

            {/* 操作按钮组 (遵循参考图的深蓝与暗黑风格) */}
            <div className="flex w-full gap-4">
              <button 
                onClick={closeModal}
                disabled={isPending}
                className="flex-1 py-3.5 rounded-2xl bg-transparent border border-white/10 text-zinc-400 font-bold tracking-[0.2em] text-xs hover:bg-white/5 transition-all disabled:opacity-50"
              >
                取消
              </button>
              <button 
                onClick={executeAction}
                disabled={isPending}
                className={`flex-1 py-3.5 rounded-2xl font-bold tracking-[0.2em] text-xs transition-all flex items-center justify-center ${
                  modalType === 'approve'
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400 hover:bg-blue-600/40 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                    : 'bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPending ? (
                  <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${modalType === 'approve' ? 'border-blue-400' : 'border-red-500'}`}></div>
                ) : (
                  modalType === 'approve' ? '确认核准' : '强行抹除'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 列表上的原始触发按钮 (保持不变) */}
      {/* ========================================== */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => openModal('approve')}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[80px] shadow-[0_0_15px_rgba(16,185,129,0.05)]"
        >
          核准入舰
        </button>

        <button 
          onClick={() => openModal('reject')}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[80px] shadow-[0_0_15px_rgba(239,68,68,0.05)]"
        >
          驳回清除
        </button>
      </div>
    </>
  )
}