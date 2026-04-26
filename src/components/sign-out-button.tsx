// src/components/sign-out-button.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function SignOutButton({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleSignOut = () => {
    setIsExiting(true)
    
    // 🚀 给予 1.8 秒的“电影级离线序列”时间
    setTimeout(() => {
      onSignOut()
    }, 1800)
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
        <div className="flex flex-col items-start">
          <span className={`text-[10px] uppercase tracking-[0.2em] font-mono transition-colors duration-500 ${isExiting ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-red-400'}`}>
            {isExiting ? "Terminating..." : "Status: Online"}
          </span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
            脱离指挥舱
          </span>
        </div>
      </button>

      {/* 🚀 电影级全息离线遮罩 (System Shutdown Overlay) */}
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-[#02040a]/90 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-none overflow-hidden"
          >
            {/* 🚀 顶级审美 1：SVG 量子噪点层 (Dithering)
                彻底消灭 CSS 渐变和高斯模糊叠加时产生的“色彩断层(Color Banding)”，赋予电影胶片质感 */}
            <div 
              className="absolute inset-0 opacity-[0.15] mix-blend-overlay z-0" 
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            ></div>

            {/* 🚀 顶级审美 2：电影级上下黑边闭合 (Cinematic Cut) */}
            <motion.div initial={{ height: 0 }} animate={{ height: "12vh" }} transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }} className="absolute top-0 left-0 w-full bg-black z-10 border-b border-red-500/20" />
            <motion.div initial={{ height: 0 }} animate={{ height: "12vh" }} transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }} className="absolute bottom-0 left-0 w-full bg-black z-10 border-t border-red-500/20" />

            {/* 🚀 顶级审美 3：边缘全息红光警告 */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="absolute inset-0 border-[4px] border-red-600/30 z-10 pointer-events-none box-border" />

            {/* 🚀 顶级审美 4：带有渐变尾迹的激光扫描线，两端淡出，拒绝生硬的一刀切 */}
            <motion.div 
              initial={{ top: "-20%" }}
              animate={{ top: "120%" }}
              transition={{ duration: 1.5, ease: "linear" }}
              className="absolute left-0 w-full flex flex-col items-center z-20"
            >
              {/* 极亮核心 */}
              <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_30px_rgba(239,68,68,1)]" />
              {/* 量子尾迹 */}
              <div className="w-full h-[25vh] bg-gradient-to-b from-red-500/15 to-transparent" />
            </motion.div>

            {/* 状态文字核心区 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="text-center relative z-30"
            >
              <motion.div 
                animate={{ opacity: [1, 0.4, 1, 0.8, 1] }} 
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "mirror" }}
                className="text-red-500 font-mono text-xs md:text-sm tracking-[0.5em] mb-4 drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
              >
                [ CRITICAL ] TERMINATING SESSION
              </motion.div>
              
              <div className="text-white font-bold text-3xl md:text-4xl tracking-[0.2em] font-[family-name:var(--font-space)] drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                &gt; SYSTEM OFFLINE
              </div>
              
              <div className="mt-10 flex gap-3 justify-center items-center">
                <span className="text-red-500/60 font-mono text-[10px] tracking-widest uppercase">Ejecting</span>
                <div className="flex gap-2">
                  {[...Array(4)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                      className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}