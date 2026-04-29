// src/app/login/page.tsx
"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { motion } from "framer-motion"

export default function LoginPage() {
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGiteeLoading, setIsGiteeLoading] = useState(false)

  const handleGithubLogin = async () => {
    setIsGithubLoading(true)
    await signIn("github", { callbackUrl: "/dashboard" })
  }

  const handleGiteeLogin = async () => {
    setIsGiteeLoading(true)
    await signIn("gitee", { callbackUrl: "/dashboard" })
  }

  return (
    <main className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-black text-white">
      {/* 🚀 星空背景特效 (复刻你截图中的深空背景) */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSIgLz4KPC9zdmc+')] opacity-50 mix-blend-screen" />
      </div>

      {/* 左上角返回按钮 */}
      <div className="absolute top-8 left-8 z-20">
        <button className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">Mission Control</span>
            <span className="text-xs font-bold tracking-widest">返回主站</span>
          </div>
        </button>
      </div>

      {/* 右下角深空苏醒按钮 */}
      <div className="absolute bottom-8 right-8 z-20">
        <button className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono text-blue-500/60 uppercase tracking-widest">Spacetime Shift</span>
            <span className="text-xs font-bold tracking-widest">深空苏醒</span>
          </div>
        </button>
      </div>

      {/* 🚀 中央登录中枢卡片 */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative z-10 w-full max-w-[400px] bg-[#050914]/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-[0_0_100px_rgba(59,130,246,0.15)] flex flex-col items-center text-center"
      >
        {/* 顶部盾牌图标 */}
        <div className="w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-400">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-.966-.134l-.062.043-9.5 7.5A.75.75 0 002 10.5v8.5a3 3 0 003 3h14a3 3 0 003-3v-8.5a.75.75 0 00-.236-.615l-.052-.047-9.196-7.168zM12 4.582l8 6.234V19a1.5 1.5 0 01-1.408 1.493L18.5 20.5H5a1.5 1.5 0 01-1.493-1.408L3.5 19v-8.184l8.5-6.234z" clipRule="evenodd" />
            <path d="M12 3L2.5 10.5v8.5A3 3 0 005.5 22h13a3 3 0 003-3v-8.5L12 3z" fill="currentColor"/>
          </svg>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] mb-1">
          身份校验
        </h1>
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.3em] mb-10">
          Identity Verification
        </p>

        <div className="w-full space-y-4">
          {/* 1. GitHub 登录按钮 (白底黑字) */}
          <button 
            onClick={handleGithubLogin}
            disabled={isGithubLoading || isGiteeLoading}
            className="group relative w-full h-14 rounded-2xl bg-white text-black font-bold text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-70"
          >
            {isGithubLoading ? (
              <span className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.085.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                GitHub 授权接入
              </>
            )}
          </button>

          {/* 🚀 中间的分隔线：—— OR —— */}
          <div className="flex items-center justify-center gap-3 py-2 opacity-50">
            <div className="h-px w-full bg-gradient-to-r from-transparent to-zinc-500"></div>
            <span className="text-[10px] font-mono text-zinc-400 tracking-widest">OR</span>
            <div className="h-px w-full bg-gradient-to-l from-transparent to-zinc-500"></div>
          </div>

          {/* 2. 🚀 Gitee 登录按钮 (赛博红风格) */}
          <button 
            onClick={handleGiteeLogin}
            disabled={isGithubLoading || isGiteeLoading}
            className="group relative overflow-hidden w-full h-14 rounded-2xl bg-transparent border border-red-500/50 text-red-500 font-bold text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-red-500/10 hover:border-red-500 transition-all active:scale-[0.98] shadow-[0_0_15px_rgba(239,68,68,0.1)] disabled:opacity-70"
          >
            {/* 炫酷底光扫过特效 */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(239,68,68,0.1),transparent)] -translate-x-full group-hover:animate-[shimmer-seamless_2s_infinite] pointer-events-none" />
            
            {isGiteeLoading ? (
              <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin relative z-10"></span>
            ) : (
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-xl font-bold font-mono">G</span>
                Gitee 国内直连
              </span>
            )}
          </button>
        </div>

        <p className="mt-10 text-[8px] font-mono text-zinc-600 uppercase tracking-[0.2em]">
          Authorization required for captain privileges
        </p>
      </motion.div>
    </main>
  )
}