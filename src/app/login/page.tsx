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
    // 🚀 核心修复：彻底移除 bg-black，改为 bg-transparent，让你的全局背景 100% 露出来！
    <main className="min-h-screen w-full relative flex items-center justify-center overflow-hidden bg-transparent text-white">
      
      {/* 🚀 贝塞尔曲线呼吸引擎 (非线性方程) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bezier-breathe {
          0%, 100% {
            box-shadow: 0 0 30px rgba(34, 211, 238, 0.05), inset 0 0 20px rgba(34, 211, 238, 0.02);
            border-color: rgba(34, 211, 238, 0.1);
          }
          50% {
            /* 极强的光晕爆发 */
            box-shadow: 0 0 120px rgba(34, 211, 238, 0.6), inset 0 0 60px rgba(34, 211, 238, 0.2);
            border-color: rgba(34, 211, 238, 0.8);
          }
        }
        .animate-bezier-breathe {
          /* 采用经典的标准缓动非线性贝塞尔曲线 */
          animation: bezier-breathe 4s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
        }
      `}} />

      {/* 左上角返回按钮 */}
      <div className="absolute top-8 left-8 z-20">
        <button className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/10 transition-all backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-pulse" />
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono text-cyan-500/60 uppercase tracking-widest">Mission Control</span>
            <span className="text-xs font-bold tracking-widest">返回主站</span>
          </div>
        </button>
      </div>

      {/* 右下角深空苏醒按钮 */}
      <div className="absolute bottom-8 right-8 z-20">
        <button className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/10 transition-all backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6] animate-pulse" />
          <div className="flex flex-col items-start">
            <span className="text-[8px] font-mono text-blue-500/60 uppercase tracking-widest">Spacetime Shift</span>
            <span className="text-xs font-bold tracking-widest">深空苏醒</span>
          </div>
        </button>
      </div>

      {/* 🚀 中央全息登录舱 (极致通透 + 强力呼吸灯) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, filter: "blur(20px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative z-10 w-full max-w-[420px] bg-white/[0.01] backdrop-blur-[30px] border border-cyan-500/30 rounded-[3rem] p-12 flex flex-col items-center text-center animate-bezier-breathe"
      >
        {/* 顶部盾牌图标 (自带常驻微发光) */}
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(34,211,238,0.3)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-cyan-400">
            <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-.966-.134l-.062.043-9.5 7.5A.75.75 0 002 10.5v8.5a3 3 0 003 3h14a3 3 0 003-3v-8.5a.75.75 0 00-.236-.615l-.052-.047-9.196-7.168zM12 4.582l8 6.234V19a1.5 1.5 0 01-1.408 1.493L18.5 20.5H5a1.5 1.5 0 01-1.493-1.408L3.5 19v-8.184l8.5-6.234z" clipRule="evenodd" />
            <path d="M12 3L2.5 10.5v8.5A3 3 0 005.5 22h13a3 3 0 003-3v-8.5L12 3z" fill="currentColor"/>
          </svg>
        </div>

        {/* 标题 */}
        <h1 className="text-2xl font-bold tracking-[0.25em] text-white font-[family-name:var(--font-space)] mb-1 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          身份校验
        </h1>
        <p className="text-[10px] font-mono text-cyan-500/60 uppercase tracking-[0.4em] mb-12">
          Identity Verification
        </p>

        <div className="w-full space-y-5">
          {/* 1. GitHub 授权按钮 */}
          <button 
            onClick={handleGithubLogin}
            disabled={isGithubLoading || isGiteeLoading}
            className="group relative overflow-hidden w-full h-14 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-white/20 hover:border-white/40 transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.2),transparent)] -translate-x-full group-hover:animate-[shimmer-seamless_2s_infinite] pointer-events-none" />
            {isGithubLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.085.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                GitHub 授权接入
              </>
            )}
          </button>

          {/* 科技感分割线 */}
          <div className="flex items-center justify-center gap-4 py-2 opacity-60">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
            <span className="text-[10px] font-mono text-cyan-400 tracking-[0.2em] shadow-[0_0_10px_rgba(34,211,238,0.5)]">OR</span>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
          </div>

          {/* 2. Gitee 授权按钮 */}
          <button 
            onClick={handleGiteeLogin}
            disabled={isGithubLoading || isGiteeLoading}
            className="group relative overflow-hidden w-full h-14 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-sm tracking-widest flex items-center justify-center gap-3 hover:bg-red-500/20 hover:border-red-500/60 hover:text-red-300 transition-all duration-300 active:scale-[0.98] shadow-[0_0_20px_rgba(239,68,68,0.1)] disabled:opacity-50"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(239,68,68,0.2),transparent)] -translate-x-full group-hover:animate-[shimmer-seamless_2s_infinite] pointer-events-none" />
            {isGiteeLoading ? (
              <span className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin relative z-10"></span>
            ) : (
              <span className="relative z-10 flex items-center gap-3">
                <span className="text-xl font-bold font-mono drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">G</span>
                Gitee 国内直连
              </span>
            )}
          </button>
        </div>

        <p className="mt-12 text-[8px] font-mono text-cyan-500/40 uppercase tracking-[0.3em]">
          Authorization required for captain privileges
        </p>
      </motion.div>
    </main>
  )
}