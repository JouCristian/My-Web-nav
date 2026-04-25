// src/components/crew-action-buttons.tsx
"use client"

import { useState } from "react"
import { approveUser, rejectUser } from "../app/dashboard/crew/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isPending, setIsPending] = useState(false)
  // 🚀 全息弹窗状态管理器：控制开关及当前操作类型
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'approve' | 'reject' | null }>({ 
    isOpen: false, 
    type: null 
  })

  // 🚀 统一的后端执行引擎
  const executeAction = async () => {
    if (!modalConfig.type) return
    setIsPending(true)
    try {
      if (modalConfig.type === 'approve') {
        await approveUser(userId)
      } else {
        await rejectUser(userId)
      }
    } catch (error) {
      console.error("执行指令失败", error)
    } finally {
      setIsPending(false)
      setModalConfig({ isOpen: false, type: null })
    }
  }

  return (
    <>
      {/* ========================================== */}
      {/* 🔮 顶级全息裁决弹窗 (Holographic Modal) */}
      {/* ========================================== */}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-0">
          {/* 深度毛玻璃遮罩层 */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xl transition-opacity animate-in fade-in duration-300" 
            onClick={() => !isPending && setModalConfig({ isOpen: false, type: null })}
          ></div>
          
          {/* 弹窗主体容器 */}
          <div className={`relative w-full max-w-md p-8 md:p-10 rounded-[2.5rem] border bg-[#06060a]/95 shadow-2xl transform transition-all animate-in fade-in zoom-in-95 duration-300 ${
            modalConfig.type === 'approve' 
              ? 'border-emerald-500/30 shadow-[0_0_80px_rgba(16,185,129,0.15)]' 
              : 'border-red-500/30 shadow-[0_0_80px_rgba(239,68,68,0.15)]'
          }`}>
            
            <div className="flex flex-col items-center text-center relative z-10">
              {/* 动态徽章 Icon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 ${
                modalConfig.type === 'approve' 
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]' 
                  : 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
              }`}>
                {modalConfig.type === 'approve' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                )}
              </div>

              {/* 标题与警告文案 */}
              <h3 className={`text-xl font-bold tracking-[0.15em] font-[family-name:var(--font-space)] mb-3 ${
                modalConfig.type === 'approve' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {modalConfig.type === 'approve' ? 'SYSTEM OVERRIDE: APPROVE' : 'SYSTEM OVERRIDE: PURGE'}
              </h3>
              
              <div className="text-zinc-400 text-sm mb-8 leading-relaxed font-mono">
                {modalConfig.type === 'approve' 
                  ? <p>是否确认将新兵 <span className="text-white font-bold">[{realName}]</span> 授勋为正式船员？<br/>此操作将为其解锁全舰通讯与跃迁集结权限。</p>
                  : <p>警告：此操作将从星际数据库中<span className="text-red-500 font-bold">永久抹除</span> <span className="text-white font-bold">[{realName}]</span> 的档案。<br/>该指令不可逆转，是否继续？</p>
                }
              </div>

              {/* 操作按钮组 */}
              <div className="flex w-full gap-4">
                <button 
                  onClick={() => setModalConfig({ isOpen: false, type: null })}
                  disabled={isPending}
                  className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-[0.2em] text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                >
                  取消指令
                </button>
                <button 
                  onClick={executeAction}
                  disabled={isPending}
                  className={`flex-1 py-4 rounded-2xl font-bold tracking-[0.2em] text-xs transition-all flex items-center justify-center ${
                    modalConfig.type === 'approve'
                      ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500 hover:text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-red-500/20 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin opacity-80"></div>
                  ) : (
                    modalConfig.type === 'approve' ? '确认授勋' : '执行抹除'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 原始列表触发按钮区 (保持原有质感) */}
      {/* ========================================== */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setModalConfig({ isOpen: true, type: 'approve' })}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[80px] shadow-[0_0_15px_rgba(16,185,129,0.05)]"
        >
          核准入舰
        </button>

        <button 
          onClick={() => setModalConfig({ isOpen: true, type: 'reject' })}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[80px] shadow-[0_0_15px_rgba(239,68,68,0.05)]"
        >
          驳回清除
        </button>
      </div>
    </>
  )
}