// src/components/guest-action-button.tsx
"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

export function GuestActionButton({ btnText, targetHref }: { btnText: string, targetHref: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const triggerSpacetimeShift = () => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const shiftBtn = buttons.find(btn => {
      const text = btn.textContent || "";
      return text.includes('SPACETIME') || text.includes('时空') || text.includes('航线') || 
             text.includes('星际') || text.includes('轨道') || text.includes('深空') || text.includes('默认');
    });
    if (shiftBtn) shiftBtn.click();
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="group/btn flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white text-black hover:bg-blue-400 hover:text-white"
      >
        <span>{btnText}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </button>

      {/* 🚀 核心修复：createPortal 包裹 AnimatePresence，完美解决冲突！ */}
      {mounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              // 遮罩层动画
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md"
            >
              {/* 🚀 卡片出入场与呼吸动画 */}
              <motion.div 
                className="relative w-[90%] max-w-md"
                initial={{ y: 50, opacity: 0, scale: 0.9 }}
                animate={{ 
                  y: 0, 
                  opacity: 1, 
                  scale: [1, 1.02, 1], // 物理呼吸放大
                  transition: {
                    y: { type: "spring", stiffness: 300, damping: 25 },
                    scale: { repeat: Infinity, duration: 3, ease: "easeInOut" } // 持续呼吸
                  }
                }}
                exit={{ 
                  opacity: 0,
                  scale: 1.2,          // 瞬间膨胀
                  filter: "blur(20px)", // 粒子模糊崩解
                  transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                }}
              >
                
                {/* 🌌 蓝色呼吸灯发光层 */}
                <div className="absolute -inset-2 rounded-[3rem] bg-blue-500/20 blur-2xl animate-pulse pointer-events-none"></div>
                <div className="absolute inset-0 rounded-[2.5rem] border-2 border-blue-400/50 shadow-[0_0_80px_rgba(59,130,246,0.6)] animate-pulse pointer-events-none"></div>

                {/* 卡片主体 */}
                <div className="relative bg-[#06060a]/95 border border-blue-500/30 p-8 md:p-10 rounded-[2.5rem] text-center overflow-hidden">
                  
                  <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none animate-pulse"></div>
                  
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
                    <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '3s' }}></div>
                    <div className="absolute inset-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                       <span className="text-3xl animate-pulse drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]">🔒</span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white tracking-[0.1em] font-[family-name:var(--font-space)] mb-3">
                    访问系统受限
                  </h3>
                  <p className="text-zinc-400 text-sm mb-10 leading-relaxed font-mono tracking-widest">
                    检测到您当前为游离状态。<br/>
                    加入星际舰队前，必须先前往安全协议区进行<span className="text-blue-400 font-bold drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]">身份校验</span>。
                  </p>

                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setIsOpen(false)} // 点击取消，触发 exit 粒子消散动画
                      className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95"
                    >
                      取 消
                    </button>
                    <button 
                      onClick={() => {
                        triggerSpacetimeShift();
                        setIsOpen(false);
                        // 轻微延迟跳转，确保时空指令被准确捕捉
                        setTimeout(() => router.push(targetHref), 50); 
                      }}
                      className="flex-1 py-4 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                    >
                      进行身份校验
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}