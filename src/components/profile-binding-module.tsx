// src/components/profile-binding-module.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { mergeAccountsAction, bindOAuthAction } from "@/app/actions" // 🚀 引入新的直连法术

export function ProfileBindingModule({ 
  hasGithub, 
  hasGitee, 
  isConflict 
}: { 
  hasGithub: boolean, 
  hasGitee: boolean, 
  isConflict: boolean 
}) {
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)
  const [isMerging, setIsMerging] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isConflict) {
      setIsMergeModalOpen(true)
    }
  }, [isConflict])

  const handleConfirmMerge = async () => {
    setIsMerging(true)
    const res = await mergeAccountsAction() 
    if (res?.success) {
      setIsMergeModalOpen(false)
      window.location.href = "/profile"
    }
    setIsMerging(false)
  }

  if (!mounted) return null

  return (
    <div className="w-full bg-[#02040a]/40 border border-white/5 rounded-2xl p-6 mt-8 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
      <h3 className="text-xs font-bold text-white tracking-widest mb-4 font-mono flex items-center gap-3">
        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
        身份链路矩阵 (IDENTITY MATRIX)
      </h3>

      <div className="space-y-3">
        {/* GitHub 绑定通道 */}
        <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white border border-white/10">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"/></svg>
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-200 tracking-wider">GitHub 核心档案</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                STATUS: {hasGithub ? <span className="text-cyan-400">SYNCED</span> : "OFFLINE"}
              </div>
            </div>
          </div>
          {!hasGithub ? (
            /* 🚀 改造为 Form 提交，调用服务端 action 直飞 GitHub */
            <form action={bindOAuthAction}>
              <input type="hidden" name="provider" value="github" />
              <button type="submit" className="px-4 py-2 bg-white/10 text-white text-xs font-bold rounded-lg hover:bg-white/20 transition-all active:scale-95 border border-white/20">
                授权绑定
              </button>
            </form>
          ) : (
            <div className="px-3 py-1.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold font-mono">已连接</div>
          )}
        </div>

        {/* Gitee 绑定通道 */}
        <div className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 text-red-500 font-bold flex items-center justify-center border border-red-500/30">
              <span className="text-lg font-mono">G</span>
            </div>
            <div>
              <div className="font-bold text-sm text-zinc-200 tracking-wider">Gitee 国内节点</div>
              <div className="text-[10px] text-zinc-500 font-mono mt-1 uppercase">
                STATUS: {hasGitee ? <span className="text-red-400">SYNCED</span> : "OFFLINE"}
              </div>
            </div>
          </div>
          {!hasGitee ? (
            /* 🚀 改造为 Form 提交，调用服务端 action 直飞 Gitee */
            <form action={bindOAuthAction}>
              <input type="hidden" name="provider" value="gitee" />
              <button type="submit" className="px-4 py-2 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30 hover:bg-red-500 hover:text-white transition-all active:scale-95">
                授权绑定
              </button>
            </form>
          ) : (
             <div className="px-3 py-1.5 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold font-mono">已连接</div>
          )}
        </div>
      </div>

      {/* 🚀 合并确认弹窗 */}
      <AnimatePresence>
        {isMergeModalOpen && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/80 backdrop-blur-xl" onClick={() => setIsMergeModalOpen(false)} />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="relative bg-[#060813] border-2 border-amber-500/50 rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-[0_0_80px_rgba(245,158,11,0.2)]">
              <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                <span className="text-3xl animate-pulse">⚠️</span>
              </div>
              <h2 className="text-xl font-bold text-amber-400 tracking-widest mb-3 font-[family-name:var(--font-space)]">检测到身份重叠</h2>
              <p className="text-xs text-zinc-400 mb-10 leading-relaxed tracking-wider">
                你试图绑定的账号已经存在于数据库中。是否要将该账号的历史档案强制融合到当前躯壳？
              </p>
              <div className="flex gap-4">
                <button onClick={() => setIsMergeModalOpen(false)} className="flex-1 py-3.5 bg-white/5 rounded-xl border border-white/10 text-zinc-400 text-xs font-bold tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95">终止</button>
                <button onClick={handleConfirmMerge} disabled={isMerging} className="flex-[2] py-3.5 bg-amber-500/20 text-amber-400 border border-amber-500/50 rounded-xl text-xs font-bold tracking-widest hover:bg-amber-500 hover:text-black transition-all active:scale-95 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  {isMerging ? "数据缝合中..." : "强制融合矩阵"}
                </button>
              </div>
            </motion.div>
          </div>
        , document.body)}
      </AnimatePresence>
    </div>
  )
}