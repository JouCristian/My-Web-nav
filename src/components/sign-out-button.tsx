// src/components/sign-out-button.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SignOutButton({ onSignOut }: { onSignOut: () => Promise<void> }) {
  // 🚀 核心状态机：管理 5 个精密衔接的动画相位
  const [phase, setPhase] = useState<'IDLE' | 'SHRINK' | 'MORPH' | 'EXPAND'>('IDLE')

  const handleSignOut = () => {
    // Phase 1: 瞬间高斯模糊，红圈开始从屏幕外向内塌缩
    setPhase('SHRINK')
    
    setTimeout(() => {
      // Phase 2: 红圈塌缩为红点，开始进行红->绿的色彩过渡，并触发失重水滴波动
      setPhase('MORPH')
      
      // 🚀 在水滴波动的中途（幕布全黑且最稳定时），在后台静默执行退出逻辑
      // 这时后台的页面正在重载为“未登录状态”
      setTimeout(() => {
        onSignOut()
      }, 800)

      setTimeout(() => {
        // Phase 3: 后台加载完毕，绿色水滴转化为绿环，向外爆发拉开帷幕
        setPhase('EXPAND')

        setTimeout(() => {
          // Phase 4: 动画彻底完成，清理现场
          setPhase('IDLE')
        }, 1500)
      }, 2500) // 给予足够的水滴波动时间和后台加载时间

    }, 1200) // 匹配红圈塌缩的弹簧时间
  }

  return (
    <>
      <button 
        onClick={handleSignOut}
        disabled={phase !== 'IDLE'}
        className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md hover:border-red-500/40 transition-all duration-500 active:scale-[0.95] disabled:opacity-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/10 transition-colors duration-500">
          <div className={`w-3 h-3 rounded-full ${phase !== 'IDLE' ? 'bg-zinc-600' : 'bg-red-500 group-hover:animate-pulse'} transition-all duration-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]`} />
          {phase === 'IDLE' && (
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          )}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-mono transition-colors duration-500 ${phase !== 'IDLE' ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-red-400'}`}>
            {phase !== 'IDLE' ? "Phase Shifting..." : "Status: Online"}
          </span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
            脱离指挥舱
          </span>
        </div>
      </button>

      {/* 🚀 顶级审美：SVG 量子噪点层 (Dithering)，永驻最底层防断层 */}
      <AnimatePresence>
        {phase !== 'IDLE' && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] opacity-[0.12] mix-blend-overlay pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
        )}
      </AnimatePresence>

      {/* 🚀 全息空间穿透遮罩 */}
      {phase !== 'IDLE' && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none overflow-hidden">
          
          <motion.div
            initial={{
              width: "250vmax", // 保证初始状态极大，包裹整个屏幕
              height: "250vmax",
              borderWidth: "4px",
              borderColor: "rgba(239, 68, 68, 1)",
              backgroundColor: "rgba(239, 68, 68, 0)",
              // 🚀 核心魔法：使用 200vmax 的黑色阴影充当外部遮罩。圈内透明，圈外被阴影全黑覆盖！
              boxShadow: "0 0 0 200vmax black, 0 0 0px 0px rgba(239, 68, 68, 0)", 
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderRadius: "50%",
            }}
            animate={phase}
            variants={{
              SHRINK: {
                width: "24px",
                height: "24px",
                borderWidth: "12px", // 收缩成实心小红点
                borderColor: "rgba(239, 68, 68, 1)",
                backgroundColor: "rgba(239, 68, 68, 1)",
                boxShadow: "0 0 0 200vmax black, 0 0 0px 0px rgba(239, 68, 68, 0)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "50%",
                transition: { type: "spring", stiffness: 120, damping: 20, mass: 1 }
              },
              MORPH: {
                width: "24px",
                height: "24px",
                borderWidth: "12px",
                borderColor: "rgba(16, 185, 129, 1)", // 变成幽绿色
                backgroundColor: "rgba(16, 185, 129, 1)",
                boxShadow: "0 0 0 200vmax black, 0 0 30px 10px rgba(16, 185, 129, 0.6)", // 绿色光晕
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                // 🚀 太空水滴失重波动计算矩阵
                borderRadius: ["50%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "50%"],
                transition: {
                  backgroundColor: { duration: 1.5, ease: "easeInOut" },
                  borderColor: { duration: 1.5, ease: "easeInOut" },
                  boxShadow: { duration: 1.5, ease: "easeInOut" },
                  borderRadius: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
                }
              },
              EXPAND: {
                width: "250vmax", // 变成绿环向外爆开
                height: "250vmax",
                borderWidth: "4px", // 空心化
                borderColor: "rgba(16, 185, 129, 0.8)",
                backgroundColor: "rgba(16, 185, 129, 0)", 
                boxShadow: "0 0 0 200vmax black, 0 0 0px 0px rgba(16, 185, 129, 0)", // 黑幕被推走
                backdropFilter: "blur(0px)", // 高斯模糊随着爆开非线性消散
                WebkitBackdropFilter: "blur(0px)",
                borderRadius: "50%",
                transition: { type: "spring", stiffness: 80, damping: 25, mass: 1 }
              }
            }}
          />

          {/* 🚀 状态文字浮层：配合红绿水滴的变形进行对应的文本提示 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-[10002]">
            <AnimatePresence mode="wait">
              {phase === 'SHRINK' && (
                <motion.div
                  key="shrink"
                  initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  transition={{ duration: 0.8 }}
                  className="text-center mt-32" // 偏移以不遮挡中心的水滴
                >
                  <div className="text-red-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                    CRITICAL: SYSTEM LOCKDOWN
                  </div>
                  <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4">
                    &gt; PURGING DATA
                  </div>
                </motion.div>
              )}
              {phase === 'MORPH' && (
                <motion.div
                  key="morph"
                  initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
                  transition={{ duration: 0.8 }}
                  className="text-center mt-32"
                >
                  <div className="text-emerald-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                    ESTABLISHING SECURE LINK
                  </div>
                  <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4">
                    &gt; SYNCING PHASE
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      )}
    </>
  )
}