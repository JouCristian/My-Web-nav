// src/components/create-broadcast-modal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { createBroadcast } from "@/app/actions"
import { motion, AnimatePresence } from "framer-motion"

export function CreateBroadcastModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  const [selectOpen, setSelectOpen] = useState(false)
  const [selectedType, setSelectedType] = useState({ value: 'INFO', label: 'INFO - 日常简讯' })
  const [isPinned, setIsPinned] = useState(false)

  const [focusStyle, setFocusStyle] = useState({ top: 0, height: 0, opacity: 0, width: 0, left: 0 })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setMounted(true) }, [])

  const handleFocus = (e: any) => {
    const rect = e.target.getBoundingClientRect()
    const parentRect = formRef.current?.getBoundingClientRect()
    if (parentRect) {
      setFocusStyle({ top: rect.top - parentRect.top, left: rect.left - parentRect.left, height: rect.height, width: rect.width, opacity: 1 })
    }
  }
  const handleBlur = () => setFocusStyle(prev => ({ ...prev, opacity: 0 }))

  const handleSubmit = async (formData: FormData) => {
    formData.append("type", selectedType.value)
    formData.append("isPinned", isPinned.toString())
    await createBroadcast(formData)
    setIsOpen(false)
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, filter: "blur(10px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 300, damping: 25 } },
    exit: { opacity: 0, scale: 0.95, filter: "blur(10px)", transition: { duration: 0.2 } }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 🚀 纯光效呼吸引擎：告别 scale 带来的文字重绘抖动 */
        @keyframes create-glow-breathe {
          0%, 100% { box-shadow: 0 0 40px rgba(59,130,246,0.15), inset 0 0 20px rgba(59,130,246,0.1); border-color: rgba(59,130,246,0.3); }
          50% { box-shadow: 0 0 100px rgba(59,130,246,0.5), inset 0 0 40px rgba(59,130,246,0.25); border-color: rgba(59,130,246,0.7); }
        }
        .animate-create-glow { animation: create-glow-breathe 3s ease-in-out infinite; }
        
        .ios-scrollbar::-webkit-scrollbar { width: 5px; }
        .ios-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }

        @keyframes btn-publish-breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(59,130,246,0.3); }
          50% { transform: scale(1.03); box-shadow: 0 0 50px rgba(59,130,246,0.6); }
        }
        .hover-breathe-publish:hover { animation: btn-publish-breathe 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
      `}} />

      <button onClick={() => setIsOpen(true)} className="group relative flex items-center justify-center gap-3 bg-blue-500/20 text-blue-400 border border-blue-500/50 px-8 py-4 rounded-2xl font-bold transition-all hover:bg-blue-500 hover:text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] active:scale-95 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
        <span className="text-xl leading-none relative z-10">+</span>
        <span className="tracking-[0.2em] relative z-10">发射新信号</span>
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#02040a]/70 backdrop-blur-md" onClick={() => setIsOpen(false)} />
              
              <motion.div 
                variants={modalVariants} initial="hidden" animate="visible" exit="exit"
                className="animate-create-glow relative z-10 w-full max-w-xl bg-[#060813]/95 border-2 rounded-[2.5rem] p-10"
              >
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.4)]">
                    <span className="text-xl">🚀</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white tracking-[0.2em] font-[family-name:var(--font-space)]">全域广播序列</h2>
                    <p className="text-[10px] text-blue-400/60 font-mono uppercase tracking-widest mt-1">Initiate Starfleet Transmission</p>
                  </div>
                </div>

                <form action={handleSubmit} ref={formRef} className="space-y-6 relative">
                  <div className="absolute bg-blue-500/10 border border-blue-500/30 rounded-xl transition-all duration-500 pointer-events-none z-0" style={{ ...focusStyle, top: focusStyle.top - 4, left: focusStyle.left - 4, height: focusStyle.height + 8, width: focusStyle.width + 8, opacity: focusStyle.opacity > 0 ? 1 : 0 }} />

                  <div className="space-y-2 relative z-10">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2 flex justify-between items-center">
                      <span>信号源标题 (Title)</span>
                      <span className="text-blue-500/40 text-[9px] font-mono">MAX 50 CHARS</span>
                    </label>
                    <input type="text" name="title" required onFocus={handleFocus} onBlur={handleBlur} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-transparent transition-colors font-bold tracking-wide" placeholder="输入广播标题..." />
                  </div>

                  <div className="flex gap-4 relative z-10">
                    <div className="space-y-2 flex-1 relative">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2">威胁级别 (Type)</label>
                      <div className="relative">
                        <div onClick={() => setSelectOpen(!selectOpen)} className="w-full bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white cursor-pointer flex justify-between items-center hover:bg-white/5 transition-colors">
                          <span className={`font-bold tracking-widest text-sm ${selectedType.value === 'INFO' ? 'text-blue-400' : selectedType.value === 'UPDATE' ? 'text-emerald-400' : 'text-red-400'}`}>{selectedType.label}</span>
                          <span className={`text-xs text-zinc-500 transition-transform ${selectOpen ? 'rotate-180' : ''}`}>▼</span>
                        </div>
                        <AnimatePresence>
                          {selectOpen && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-[110%] left-0 w-full bg-[#0a0d1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
                              {[ { value: 'INFO', label: 'INFO - 日常简讯', color: 'text-blue-400' }, { value: 'UPDATE', label: 'UPDATE - 舰队更新', color: 'text-emerald-400' }, { value: 'ALERT', label: 'ALERT - 红色警报', color: 'text-red-400' } ].map(opt => (
                                <div key={opt.value} onClick={() => { setSelectedType(opt); setSelectOpen(false); }} className={`px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors font-bold tracking-widest text-sm ${opt.color}`}>{opt.label}</div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    <div className="space-y-2 flex flex-col items-center justify-center pt-6 px-2">
                      <label className="text-[10px] text-zinc-500 uppercase tracking-widest text-center cursor-pointer flex flex-col items-center gap-2 group">
                        <span className="group-hover:text-yellow-500/80 transition-colors">强制置顶</span>
                        <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isPinned ? 'bg-yellow-500/20 border-yellow-500/50' : 'bg-black/50 border-white/10'} border flex items-center px-1`} onClick={() => setIsPinned(!isPinned)}>
                          <div className={`w-4 h-4 rounded-full transition-all duration-300 shadow-md ${isPinned ? 'bg-yellow-500 translate-x-6' : 'bg-zinc-600 translate-x-0'}`} />
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 relative z-10 flex flex-col h-48">
                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-2 flex justify-between items-center">
                      <span>通讯正文 (Transmission Content)</span>
                      <span className="text-blue-500/40 text-[9px] font-mono border border-blue-500/20 px-1.5 rounded">Markdown Supported</span>
                    </label>
                    <textarea name="content" required onFocus={handleFocus} onBlur={handleBlur} className="w-full flex-1 bg-black/50 border border-white/10 rounded-xl px-5 py-4 text-white outline-none focus:border-transparent transition-colors resize-none ios-scrollbar font-mono text-sm leading-relaxed" placeholder="# 星际坐标报告\n\n- 目标系统在线...\n- 跃迁引擎准备就绪..." />
                  </div>

                  <div className="flex gap-4 pt-6 mt-6 border-t border-white/10 relative z-10">
                    <button type="button" onClick={() => setIsOpen(false)} className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95">取 消</button>
                    <button type="submit" className="hover-breathe-publish flex-1 py-4 rounded-xl bg-blue-500/20 border border-blue-500/50 text-blue-400 font-bold tracking-[0.2em] hover:bg-blue-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"><span>发射广播</span><span className="text-xl">📡</span></button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}