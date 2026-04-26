// src/components/create-broadcast-modal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { createBroadcast } from "@/app/dashboard/board/actions"

export function CreateBroadcastModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  // 🚀 下拉框状态
  const [selectOpen, setSelectOpen] = useState(false)
  const [selectedType, setSelectedType] = useState({ value: 'INFO', label: 'INFO - 日常简讯' })

  // 🚀 量子焦点环：追踪当前选中框的位置
  const [focusStyle, setFocusStyle] = useState<{ top: number, height: number, opacity: number }>({ top: 0, height: 0, opacity: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => { setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  const closeModal = () => { setIsAnimating(false); setTimeout(() => setIsOpen(false), 600); }

  // 计算焦点环位置的函数
  const handleFocus = (e: any) => {
    const { offsetTop, offsetHeight } = e.target;
    setFocusStyle({ top: offsetTop, height: offsetHeight, opacity: 1 });
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* 🚀 调优：降低模糊度至 20px，背景更通透 */}
      <div className={`absolute inset-0 bg-[#02040a]/40 backdrop-blur-[20px] transition-all duration-700 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      {/* 🚀 弹窗本体：注入聚合/消散动画 & 2s/1.05倍呼吸 */}
      <div className={`relative w-full max-w-xl z-10 ${isAnimating ? "quantum-particle-in" : "quantum-particle-out"}`}>
        <div className="quantum-breathe-heavy w-full rounded-[3.5rem] border border-blue-500/30 bg-[#060813]/95 p-12 shadow-[0_0_80px_rgba(59,130,246,0.3)] overflow-hidden">
          
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

          <h2 className="text-2xl font-bold text-white tracking-[0.3em] mb-10 font-[family-name:var(--font-space)] text-center">发布全舰广播</h2>
          
          <form action={async (fd) => { fd.append('type', selectedType.value); await createBroadcast(fd); closeModal(); }} className="relative space-y-8" ref={containerRef}>
            
            {/* 🚀 量子焦点环：带非线性飞跃动效 */}
            <div 
              className="absolute left-0 w-full border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] rounded-2xl pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
              style={{ top: focusStyle.top, height: focusStyle.height, opacity: focusStyle.opacity }}
            ></div>

            {/* 自定义星舰下拉组件 */}
            <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-4">广播级别</label>
              <div className="relative">
                <div 
                  onClick={() => setSelectOpen(!selectOpen)}
                  className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white cursor-pointer flex justify-between items-center transition-all hover:bg-white/5 ${selectOpen ? 'border-blue-500/50' : ''}`}
                >
                  <span>{selectedType.label}</span>
                  <span className={`transition-transform duration-300 ${selectOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
                
                {/* 🚀 下拉菜单：贝塞尔缩放动效 */}
                <div className={`absolute top-[120%] left-0 w-full bg-[#0d1117]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-2 z-50 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
                  {[
                    { v: 'INFO', l: 'INFO - 日常简讯' },
                    { v: 'UPDATE', l: 'UPDATE - 系统更新' },
                    { v: 'ALERT', l: 'ALERT - 紧急警报' }
                  ].map((opt) => (
                    <div 
                      key={opt.v}
                      onClick={() => { setSelectedType({ value: opt.v, label: opt.l }); setSelectOpen(false); }}
                      className="px-6 py-4 rounded-2xl text-sm text-zinc-400 hover:text-white hover:bg-blue-600/20 transition-colors cursor-pointer"
                    >
                      {opt.l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-4">广播标题</label>
              <input 
                name="title" 
                required 
                onFocus={handleFocus}
                onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none" 
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-4">详细内容</label>
              <textarea 
                name="content" 
                rows={4} 
                required 
                onFocus={handleFocus}
                onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none resize-none" 
              />
            </div>

            <div className="flex gap-5 pt-6">
              <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/5 text-zinc-500 font-bold tracking-widest text-xs hover:text-white transition-all">取消</button>
              <button type="submit" className="flex-1 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/50 text-blue-400 font-bold tracking-widest text-xs hover:bg-blue-600 hover:text-white transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]">发射广播信号</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --quantum-easing: cubic-bezier(0.16, 1, 0.3, 1); }
        .quantum-particle-in { animation: aggregate 0.8s var(--quantum-easing) forwards; }
        .quantum-particle-out { animation: dissipate 0.6s cubic-bezier(0.7, 0, 0.84, 0) forwards; }
        .quantum-breathe-heavy { animation: heavy-breathe 2s ease-in-out infinite; }
        
        @keyframes aggregate { 
          0% { opacity: 0; filter: blur(40px) brightness(2); transform: scale(1.15); } 
          100% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 
        }
        @keyframes dissipate { 
          0% { opacity: 1; filter: blur(0px) brightness(1); transform: scale(1); } 
          100% { opacity: 0; filter: blur(40px) brightness(0.5); transform: scale(0.85); } 
        }
        @keyframes heavy-breathe { 
          0%, 100% { transform: scale(1); box-shadow: 0 0 60px rgba(59,130,246,0.2); } 
          50% { transform: scale(1.05); box-shadow: 0 0 100px rgba(59,130,246,0.4); } 
        }
      `}} />

      <button onClick={openModal} className="group relative px-8 py-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        + 发布全舰广播
      </button>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}