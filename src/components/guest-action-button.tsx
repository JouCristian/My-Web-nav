// src/components/guest-action-button.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function GuestActionButton({ btnText, targetHref }: { btnText: string, targetHref: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      {/* 🚀 主按钮：保持原本的白色高亮 UI */}
      <button 
        onClick={() => setIsOpen(true)}
        className="group/btn flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] bg-white text-black hover:bg-blue-400 hover:text-white"
      >
        <span>{btnText}</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1">
          <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
        </svg>
      </button>

      {/* 🚀 全息拦截弹窗 (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          
          <div className="relative w-[90%] max-w-md bg-[#06060a]/95 border border-blue-500/30 p-8 md:p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(59,130,246,0.15)] text-center overflow-hidden">
            
            {/* 背景动态光晕 */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none animate-pulse"></div>
            
            {/* 顶部雷达扫描锁芯图标 */}
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-4 rounded-full bg-blue-500/10 flex items-center justify-center">
                 <span className="text-3xl animate-pulse drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]">🔒</span>
              </div>
            </div>

            {/* 文字信息 */}
            <h3 className="text-2xl font-bold text-white tracking-[0.1em] font-[family-name:var(--font-space)] mb-3">
              访问系统受限
            </h3>
            <p className="text-zinc-400 text-sm mb-10 leading-relaxed font-mono tracking-widest">
              检测到您当前为游离状态。<br/>
              加入星际舰队前，必须先前往安全协议区进行<span className="text-blue-400 font-bold">身份校验</span>。
            </p>

            {/* 双通道操作按钮 */}
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setIsOpen(false)}
                className="flex-1 py-4 rounded-xl border border-white/10 text-zinc-400 font-bold tracking-widest hover:bg-white/5 hover:text-white transition-all active:scale-95"
              >
                取 消
              </button>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  router.push(targetHref);
                }}
                className="flex-1 py-4 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-bold tracking-widest hover:bg-blue-500 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
              >
                进行身份校验
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  )
}