// src/components/crew-action-buttons.tsx
"use client"

import { useState } from "react"
import { approveUser, rejectUser } from "../app/dashboard/crew/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isPending, setIsPending] = useState(false)
  
  // 🚀 双相状态机：isMounted 控制 DOM 存在，isAnimating 控制粒子聚合/消散状态
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const openModal = (type: 'approve' | 'reject') => {
    setModalType(type)
    // 延迟一帧，触发粒子聚合动画
    requestAnimationFrame(() => setIsAnimating(true))
  }

  const closeModal = () => {
    if (isPending) return
    setIsAnimating(false) // 触发粒子消散动画
    // 严格等待 600ms (与下方 CSS 动画时长对齐) 后彻底卸载 DOM
    setTimeout(() => setModalType(null), 600)
  }

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
      {/* 🔮 注入顶级非线性粒子动画与呼吸引擎 */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 极致非线性贝塞尔曲线: 爆发式起步，丝滑减速 */
        :root {
          --quantum-easing-in: cubic-bezier(0.16, 1, 0.3, 1);
          --quantum-easing-out: cubic-bezier(0.7, 0, 0.84, 0);
        }

        /* 粒子聚合 (入场) */
        .quantum-particle-in {
          animation: aggregate 0.8s var(--quantum-easing-in) forwards;
          will-change: transform, filter, opacity;
        }

        /* 粒子消散 (退场) */
        .quantum-particle-out {
          animation: dissipate 0.6s var(--quantum-easing-out) forwards;
          will-change: transform, filter, opacity;
        }

        /* 深空呼吸放大引擎 */
        .quantum-breathe {
          animation: core-breathe 4s ease-in-out infinite;
        }

        @keyframes aggregate {
          0% {
            opacity: 0;
            filter: blur(40px) brightness(2);
            transform: scale(1.15) translateZ(0);
          }
          100% {
            opacity: 1;
            filter: blur(0px) brightness(1);
            transform: scale(1) translateZ(0);
          }
        }

        @keyframes dissipate {
          0% {
            opacity: 1;
            filter: blur(0px) brightness(1);
            transform: scale(1) translateZ(0);
          }
          100% {
            opacity: 0;
            filter: blur(40px) brightness(0.5);
            transform: scale(0.85) translateZ(0);
          }
        }

        @keyframes core-breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); } /* 呼吸放大 2% */
        }
      `}} />

      {/* ========================================== */}
      {/* 🌌 全息量子弹窗 (Quantum Holographic Modal) */}
      {/* ========================================== */}
      {modalType && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-0 perspective-1000">
          
          {/* 顶级全屏高斯模糊遮罩层 - 独立控制显隐 */}
          <div 
            className={`absolute inset-0 bg-[#02040a]/60 backdrop-blur-[60px] transition-all duration-700 ease-out ${
              isAnimating ? "opacity-100" : "opacity-0 backdrop-blur-none"
            }`}
            onClick={closeModal}
          ></div>
          
          {/* 动画分离外壳：负责粒子聚合/消散 */}
          <div className={`relative w-full max-w-[440px] z-10 ${isAnimating ? "quantum-particle-in" : "quantum-particle-out"}`}>
            
            {/* 呼吸引擎内壳：负责无限律动，并绑定对应阵营的发光色彩 */}
            <div 
              className="quantum-breathe w-full h-full rounded-[2.5rem] border bg-[#060813]/80 p-8 md:p-10 flex flex-col items-center text-center overflow-hidden"
              style={{
                borderColor: modalType === 'approve' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)',
                boxShadow: modalType === 'approve' 
                  ? '0 0 100px -20px rgba(16,185,129,0.2), inset 0 0 40px -10px rgba(16,185,129,0.1)' 
                  : '0 0 100px -20px rgba(239,68,68,0.2), inset 0 0 40px -10px rgba(239,68,68,0.1)'
              }}
            >
              {/* 赛博网格背景叠加 (致敬白皮书设计语言) */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

              {/* 核心状态徽章 */}
              <div className="relative w-20 h-20 rounded-full flex items-center justify-center mb-6">
                <div className={`absolute inset-0 rounded-full border border-t-transparent animate-spin ${modalType === 'approve' ? 'border-emerald-500/50 duration-1000' : 'border-red-500/50 duration-700'}`}></div>
                <div className={`absolute inset-2 rounded-full blur-[10px] ${modalType === 'approve' ? 'bg-emerald-500/30' : 'bg-red-500/30'}`}></div>
                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border bg-black/50 ${modalType === 'approve' ? 'border-emerald-500/50 text-emerald-400' : 'border-red-500/50 text-red-500'}`}>
                  {modalType === 'approve' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  )}
                </div>
              </div>

              {/* 指令层级标题 */}
              <h3 className={`text-xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] mb-4 ${modalType === 'approve' ? 'text-emerald-400' : 'text-red-400'}`}>
                {modalType === 'approve' ? '授权重组序列' : '不可逆覆写协议'}
              </h3>
              
              {/* 终端解码文案 */}
              <div className="text-zinc-400/80 text-sm mb-10 leading-loose font-mono tracking-wider z-10">
                {modalType === 'approve' ? (
                  <p>
                    正在将新兵 <span className="text-emerald-300 font-bold">[{realName}]</span> <br/>
                    编入主序列。此操作将解密全舰星际通讯协议。
                  </p>
                ) : (
                  <p>
                    检测到抹除指令。<br/>
                    目标 <span className="text-red-400 font-bold">[{realName}]</span> 的物理与数字痕迹<br/>
                    将化为宇宙尘埃，确定执行吗？
                  </p>
                )}
              </div>

              {/* 量子操作面板 */}
              <div className="flex w-full gap-5 z-10">
                <button 
                  onClick={closeModal}
                  disabled={isPending}
                  className="flex-1 py-4 rounded-2xl bg-black/40 border border-white/10 text-zinc-500 font-bold tracking-[0.2em] text-xs hover:text-white hover:border-white/30 transition-all duration-300 disabled:opacity-50"
                >
                  取消序列
                </button>
                <button 
                  onClick={executeAction}
                  disabled={isPending}
                  className={`flex-1 py-4 rounded-2xl font-bold tracking-[0.2em] text-xs transition-all duration-500 flex items-center justify-center relative overflow-hidden group ${
                    modalType === 'approve'
                      ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]'
                      : 'bg-red-500/10 border border-red-500/40 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                  ) : (
                    modalType === 'approve' ? '确认同步' : '销毁目标'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 原始列表触发按钮区 */}
      {/* ========================================== */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => openModal('approve')}
          className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[80px]"
        >
          核准入舰
        </button>

        <button 
          onClick={() => openModal('reject')}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center min-w-[80px]"
        >
          驳回清除
        </button>
      </div>
    </>
  )
}