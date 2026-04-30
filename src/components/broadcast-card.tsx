// src/components/broadcast-card.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { deleteBroadcast } from "@/app/actions" 
import ReactMarkdown from "react-markdown" 
import { motion, AnimatePresence } from "framer-motion"

export function BroadcastCard({ announcement, isManager }: { announcement: any, isManager: boolean }) {
  const [isVanishing, setIsVanishing] = useState(false) 
  const [isReadOpen, setIsReadOpen] = useState(false)
  const [isDelOpen, setIsDelOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  // 🚀 核心修复 1：引力坍缩引擎
  const handleConfirmDelete = async () => {
    setIsDelOpen(false)     // 先关闭确认弹窗
    setIsVanishing(true)    // 触发卡片高度坍缩与粒子消散
    // 强制等待 600ms，让卡片的高度平滑缩小到 0，把下面的卡片吸上来
    await new Promise(resolve => setTimeout(resolve, 600))
    // 视觉上完全消失后，再执行后端的物理毁灭
    await deleteBroadcast(announcement.id)
  }

  const getTheme = () => {
    switch(announcement.type) {
      case 'INFO': return { border: 'border-blue-500/30', bg: 'bg-blue-500/5', shadow: 'rgba(59,130,246,0.5)', text: 'text-blue-400', label: 'INFO', cssVar: '--blue' }
      case 'UPDATE': return { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', shadow: 'rgba(16,185,129,0.5)', text: 'text-emerald-400', label: 'UPDATE', cssVar: '--emerald' }
      case 'ALERT': return { border: 'border-red-500/30', bg: 'bg-red-500/5', shadow: 'rgba(239,68,68,0.5)', text: 'text-red-400', label: 'ALERT', cssVar: '--red' }
      default: return { border: 'border-white/10', bg: 'bg-white/5', shadow: 'rgba(255,255,255,0.5)', text: 'text-white', label: 'MSG', cssVar: '--white' }
    }
  }
  const theme = getTheme()

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.2 } }
  }

  return (
    <>
      {/* 注入纯光效呼吸引擎，彻底移除 scale，解决文字乱跳 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pure-glow-breathe {
          0%, 100% { box-shadow: 0 0 30px var(--glow-color, rgba(59,130,246,0.2)), inset 0 0 15px var(--glow-color, rgba(59,130,246,0.1)); }
          50% { box-shadow: 0 0 80px var(--glow-strong, rgba(59,130,246,0.6)), inset 0 0 40px var(--glow-strong, rgba(59,130,246,0.3)); }
        }
        .animate-pure-glow { animation: pure-glow-breathe 3s ease-in-out infinite; }
        .markdown-body p { margin-bottom: 1rem; line-height: 1.8; color: #d4d4d8; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #fff; font-weight: bold; margin-bottom: 1rem; margin-top: 1.5rem; }
        .markdown-body blockquote { border-left: 4px solid rgba(255,255,255,0.2); padding-left: 1rem; color: #a1a1aa; font-style: italic; }
        .markdown-body code { background: rgba(255,255,255,0.1); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.8em; }
      `}} />

      {/* 🚀 卡片本体：利用 layout 属性和动态 height 实现平滑闭合 */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={
          isVanishing 
            ? { opacity: 0, scale: 0.8, filter: "blur(20px)", height: 0, margin: 0, padding: 0 } 
            : { opacity: 1, scale: 1, filter: "blur(0px)", height: "auto" }
        }
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ overflow: 'hidden' }}
        className={`group relative flex flex-col md:flex-row items-start md:items-center gap-6 p-6 rounded-[2rem] border bg-black/40 hover:bg-black/60 transition-colors cursor-pointer ${theme.border} ${announcement.isPinned ? 'ring-1 ring-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.1)]' : ''}`}
        onClick={() => setIsReadOpen(true)}
      >
        {announcement.isPinned && (
           <div className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-500 text-black text-[9px] font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.8)] z-20">PINNED</div>
        )}

        <div className="flex items-center gap-4 min-w-[90px] border-r border-white/10 pr-6 relative z-10">
          <div className={`text-[11px] font-mono font-bold tracking-widest ${theme.text}`}>{theme.label}</div>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: theme.shadow, boxShadow: `0 0 10px ${theme.shadow}` }}></div>
        </div>

        <div className="flex-1 flex flex-col justify-center overflow-hidden relative z-10">
          <h3 className={`text-lg font-bold tracking-wide shrink-0 font-[family-name:var(--font-space)] transition-colors truncate ${theme.text}`}>{announcement.title}</h3>
          <p className="text-zinc-400 text-xs font-light truncate max-w-2xl mt-1">{announcement.content}</p>
        </div>

        <div className="flex items-center gap-6 shrink-0 relative z-10">
          <div className="flex flex-col items-end opacity-60 text-[9px] font-mono tracking-widest uppercase">
            <span className="text-zinc-300">By {announcement.author?.realName || announcement.author?.name || "HQ"}</span>
            <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
          </div>
          {isManager && (
            <button
              onClick={(e) => { e.stopPropagation(); setIsDelOpen(true); }}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-90"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      </motion.div>

      {/* 🚀 弹窗系统 */}
      {mounted && createPortal(
        <AnimatePresence>
          {(isReadOpen || isDelOpen) && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-md" 
                onClick={() => { setIsReadOpen(false); setIsDelOpen(false); }} 
              />
              
              {/* 阅读弹窗 */}
              {isReadOpen && (
                <motion.div 
                  variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                  // 🚀 应用纯光效呼吸，摒弃 scale
                  style={{ '--glow-color': theme.shadow, '--glow-strong': theme.shadow.replace('0.5', '0.8') } as any}
                  className={`animate-pure-glow relative z-10 w-full max-w-2xl bg-[#060813]/95 border-2 ${theme.border} rounded-[2.5rem] p-10 max-h-[85vh] flex flex-col`}
                >
                  <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 shrink-0">
                    <div>
                      <div className={`text-[10px] font-mono tracking-[0.3em] mb-2 uppercase ${theme.text}`}>Signal Detected // {theme.label}</div>
                      <h2 className="text-3xl font-bold text-white tracking-widest font-[family-name:var(--font-space)]">{announcement.title}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-zinc-500 text-xs font-mono uppercase">Transmitter</div>
                      <div className="text-white font-bold tracking-widest">{announcement.author?.realName || announcement.author?.name || "HQ"}</div>
                      <div className="text-[10px] text-zinc-600 mt-1">{new Date(announcement.createdAt).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto pr-4 markdown-body min-h-0">
                    <ReactMarkdown>{announcement.content}</ReactMarkdown>
                  </div>

                  <div className="mt-8 pt-6 border-t border-white/10 shrink-0">
                    <button onClick={() => setIsReadOpen(false)} className={`w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-300 font-bold tracking-widest hover:text-white transition-all active:scale-95`}>
                      关闭视窗
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 删除确认弹窗 */}
              {isDelOpen && (
                <motion.div 
                  variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                  style={{ '--glow-color': 'rgba(239,68,68,0.2)', '--glow-strong': 'rgba(239,68,68,0.6)' } as any}
                  className="animate-pure-glow relative z-10 w-full max-w-sm bg-[#060813]/95 border-2 border-red-500/50 rounded-[2.5rem] p-8 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-6 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.3)]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-red-400 tracking-widest mb-2 font-[family-name:var(--font-space)]">确认抹除该指令？</h3>
                  <p className="text-xs text-red-500/60 font-mono tracking-widest mb-8">此操作不可逆，将从全舰广播中永久删除。</p>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setIsDelOpen(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 font-bold hover:bg-white/5 hover:text-white transition-all">取消</button>
                    <button onClick={handleConfirmDelete} className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.3)] active:scale-95">物理抹除</button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}