"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { signOut } from "next-auth/react" // 🚀 使用客户端 signOut 方便控制时机

export function SignOutButton() {
  const [isExiting, setIsExiting] = useState(false)

  const handleSignOut = async () => {
    setIsExiting(true)
    
    // 🚀 给予 1.5 秒的“离线序列”动画时间
    setTimeout(() => {
      signOut({ callbackUrl: "/" })
    }, 1500)
  }

  return (
    <>
      {/* 🚀 1. 退出按钮本体 */}
      <button 
        onClick={handleSignOut}
        disabled={isExiting}
        className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-red-500/30 transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
      >
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/10 transition-colors">
          <div className={`w-2.5 h-2.5 rounded-full ${isExiting ? 'bg-zinc-600' : 'bg-red-500 animate-pulse'} shadow-[0_0_12px_rgba(239,68,68,0.9)]`} />
          {!isExiting && (
            <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          )}
        </div>
        <div className="flex flex-col items-start">
          <span className={`text-[10px] uppercase tracking-widest font-mono transition-colors ${isExiting ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-red-400'}`}>
            {isExiting ? "Status: Disconnecting..." : "Status: Online"}
          </span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
            退出登录
          </span>
        </div>
      </button>

      {/* 🚀 2. 全息离线遮罩 (System Shutdown Overlay) */}
      <AnimatePresence>
        {isExiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xl flex flex-col items-center justify-center pointer-events-none"
          >
            {/* 红色扫描线 */}
            <motion.div 
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 1.2, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-red-500 shadow-[0_0_20px_rgba(239,68,68,1)] z-10"
            />

            {/* 状态文字 */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-red-500 font-mono text-xs tracking-[0.5em] mb-4 animate-pulse">
                CRITICAL: TERMINATING SESSION
              </div>
              <div className="text-white font-bold text-2xl tracking-[0.2em] font-[family-name:var(--font-space)]">
                > CONNECTION CLOSED
              </div>
              
              {/* 装饰条 */}
              <div className="mt-8 flex gap-2 justify-center">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                    className="w-2 h-2 bg-red-500 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}