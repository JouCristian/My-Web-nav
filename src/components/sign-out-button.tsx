// src/components/sign-out-button.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SignOutButton({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [isExiting, setIsExiting] = useState(false)
  const [phase, setPhase] = useState<'IDLE' | 'SHUTDOWN' | 'REBOOT'>('IDLE')

  const handleSignOut = async () => {
    setIsExiting(true)
    setPhase('SHUTDOWN')
    
    // 🚀 序列 1: 执行红线落幕动画 (1.2秒)
    setTimeout(async () => {
      // 🚀 关键节点: 此时幕布已闭合，屏幕全黑
      // 执行服务端退出逻辑，页面在后台刷新
      await onSignOut()
      
      // 🚀 序列 2: 切换到绿色重启开场动画
      setPhase('REBOOT')
      
      // 🚀 序列 3: 全部结束后释放状态
      setTimeout(() => {
        setIsExiting(false)
        setPhase('IDLE')
      }, 1500)
    }, 1200)
  }

  return (
    <>
      <button 
        onClick={handleSignOut}
        disabled={isExiting}
        className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md hover:border-red-500/40 transition-all duration-500 active:scale-[0.95] disabled:opacity-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/10 transition-colors duration-500">
          <div className={`w-3 h-3 rounded-full ${isExiting ? 'bg-zinc-600' : 'bg-red-500 group-hover:animate-pulse'} transition-all duration-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]`} />
          {!isExiting && (
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          )}
        </div>
        <div className="flex flex-col items-start text-left">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-mono transition-colors duration-500 ${isExiting ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-red-400'}`}>
            {isExiting ? "Phase Shifting..." : "Status: Online"}
          </span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
            脱离指挥舱
          </span>
        </div>
      </button>

      {/* 🚀 全息相位跃迁遮罩 (覆盖全场) */}
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center pointer-events-none overflow-hidden"
          >
            {/* 🚀 顶级审美：量子噪点滤镜 - 彻底消除色彩断层(Banding) */}
            <div 
              className="absolute inset-0 opacity-[0.12] mix-blend-overlay z-0 pointer-events-none" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            ></div>

            {/* 🚀 电影级动态幕布 - 根据 Phase 状态决定是关还是开 */}
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: phase === 'SHUTDOWN' ? "51vh" : "0vh" }}
              transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
              className={`absolute top-0 left-0 w-full bg-black z-10 border-b ${phase === 'SHUTDOWN' ? 'border-red-500/20' : 'border-emerald-500/20'}`}
            />
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: phase === 'SHUTDOWN' ? "51vh" : "0vh" }}
              transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
              className={`absolute bottom-0 left-0 w-full bg-black z-10 border-t ${phase === 'SHUTDOWN' ? 'border-red-500/20' : 'border-emerald-500/20'}`}
            />

            {/* 🚀 扫描线渲染引擎 */}
            <AnimatePresence>
              {phase === 'SHUTDOWN' && (
                <motion.div 
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.2, ease: "linear" }}
                  className="absolute left-0 w-full z-20"
                >
                  <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_30px_rgba(239,68,68,1)]" />
                  <div className="w-full h-[15vh] bg-gradient-to-b from-red-500/20 to-transparent" />
                </motion.div>
              )}
              {phase === 'REBOOT' && (
                <motion.div 
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: [0, 1, 0], scaleY: [1, 2, 1] }}
                  transition={{ duration: 0.8 }}
                  className="absolute left-0 w-full h-[1px] bg-emerald-400 shadow-[0_0_50px_rgba(52,211,153,1)] z-20"
                />
              )}
            </AnimatePresence>

            {/* 🚀 文字状态核心区 */}
            <div className="text-center relative z-30">
              <AnimatePresence mode="wait">
                {phase === 'SHUTDOWN' ? (
                  <motion.div
                    key="shutdown"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                    className="space-y-4"
                  >
                    <div className="text-red-500 font-mono text-xs tracking-[0.5em] animate-pulse">TERMINATING SESSION</div>
                    <div className="text-white font-bold text-2xl tracking-[0.2em] font-[family-name:var(--font-space)]">&gt; SYSTEM OFFLINE</div>
                  </motion.div>
                ) : phase === 'REBOOT' ? (
                  <motion.div
                    key="reboot"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-emerald-500 font-mono text-xs tracking-[0.6em]">REBOOTING CORE...</div>
                    <div className="text-white font-bold text-2xl tracking-[0.3em] font-[family-name:var(--font-space)]">&gt; SYSTEM READY</div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* 底部加载点点 */}
              <div className="mt-10 flex gap-2 justify-center">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                    className={`w-1.5 h-1.5 rounded-full ${phase === 'REBOOT' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}