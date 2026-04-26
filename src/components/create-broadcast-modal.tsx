// src/components/create-broadcast-modal.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { createBroadcast } from "@/app/dashboard/board/actions"

export function CreateBroadcastModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  
  const [selectOpen, setSelectOpen] = useState(false)
  const [selectedType, setSelectedType] = useState({ value: 'INFO', label: 'INFO - 日常简讯' })
  const [isPinned, setIsPinned] = useState(false)

  // 🚀 量子焦点环状态
  const [focusStyle, setFocusStyle] = useState({ top: 0, height: 0, opacity: 0, width: 0, left: 0 })
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { setIsMounted(true) }, [])

  const openModal = () => { setIsOpen(true); setTimeout(() => setIsAnimating(true), 10); }
  const closeModal = () => { setIsAnimating(false); setTimeout(() => setIsOpen(false), 600); }

  // 🚀 终极物理校准：免疫 Scale 缩放的 DOM 节点坐标计算法
  const handleFocus = (e: any) => {
    if (!formRef.current || !e.target) return;
    
    let top = 0;
    let left = 0;
    let el = e.target;
    
    // 向上递归计算绝对偏移量，彻底无视外层 transform: scale 的干扰
    while (el && el !== formRef.current) {
      top += el.offsetTop;
      left += el.offsetLeft;
      el = el.offsetParent;
    }

    setFocusStyle({
      top: top,
      left: left,
      width: e.target.offsetWidth,
      height: e.target.offsetHeight,
      opacity: 1
    });
  }

  const modalContent = isOpen ? (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 bg-[#02040a]/40 backdrop-blur-[20px] transition-all duration-700 ${isAnimating ? "opacity-100" : "opacity-0"}`} onClick={closeModal}></div>
      
      <div className={`relative w-full max-w-xl z-10 ${isAnimating ? "quantum-particle-in" : "quantum-particle-out"}`}>
        <div className="quantum-breathe-heavy w-full rounded-[3.5rem] border border-blue-500/30 bg-[#060813]/95 p-12 shadow-[0_0_100px_rgba(59,130,246,0.3)]">
          <h2 className="text-2xl font-bold text-white tracking-[0.3em] mb-10 text-center font-[family-name:var(--font-space)]">发布全舰广播</h2>
          
          <form 
            ref={formRef}
            action={async (fd) => { fd.append('type', selectedType.value); fd.append('isPinned', String(isPinned)); await createBroadcast(fd); closeModal(); }} 
            className="relative space-y-8"
          >
            {/* 🚀 量子焦点环：提升 Z-index，确保完美包裹在输入框最外层 */}
            <div 
              className="absolute border-2 border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.5)] rounded-2xl pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] z-20" 
              style={{ 
                top: focusStyle.top, 
                left: focusStyle.left, 
                width: focusStyle.width, 
                height: focusStyle.height, 
                opacity: focusStyle.opacity 
              }}
            ></div>

            {/* 置顶 Switch */}
            <div className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/[0.03] border border-white/5 relative z-10">
              <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">标记为重要置顶广播</span>
              <button type="button" onClick={() => setIsPinned(!isPinned)} className={`relative w-12 h-6 rounded-full transition-all duration-500 ${isPinned ? "bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.6)]" : "bg-zinc-800"}`}>
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-500 ${isPinned ? "translate-x-6" : ""}`}></div>
              </button>
            </div>

            {/* 下拉菜单 (已修复透明度) */}
            <div className="space-y-3 relative z-[30]">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-4">广播级别</label>
              <div className="relative">
                <div onClick={() => setSelectOpen(!selectOpen)} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white cursor-pointer flex justify-between items-center hover:bg-white/5 transition-all">
                  <span>{selectedType.label}</span>
                  <span className={`transition-transform duration-300 ${selectOpen ? 'rotate-180' : ''}`}>▼</span>
                </div>
                
                <div className={`absolute top-[120%] left-0 w-full bg-[#0d1117] border border-white/10 rounded-3xl p-2 shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}`}>
                  {[
                    {v:'INFO', l:'INFO - 日常简讯'},
                    {v:'UPDATE', l:'UPDATE - 系统更新'},
                    {v:'ALERT', l:'ALERT - 紧急警报'}
                  ].map(o => (
                    <div 
                      key={o.v} 
                      onClick={() => {setSelectedType({value:o.v, label:o.l}); setSelectOpen(false);}} 
                      className="px-6 py-4 rounded-2xl text-sm text-zinc-400 hover:text-white hover:bg-blue-600/30 transition-all cursor-pointer"
                    >
                      {o.l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-4">广播标题</label>
              <input name="title" required placeholder="输入广播标题..." onFocus={handleFocus} onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none transition-colors" />
            </div>

            <div className="space-y-3 relative z-10">
              <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-4">详细内容</label>
              <textarea name="content" rows={4} required placeholder="输入详细广播内容..." onFocus={handleFocus} onBlur={() => setFocusStyle(s => ({...s, opacity: 0}))} className="ios-scrollbar w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none resize-none transition-colors" />
            </div>

            <div className="flex gap-5 pt-4 relative z-10">
              <button type="button" onClick={closeModal} className="flex-1 py-4 rounded-2xl bg-white/5 text-zinc-500 font-bold tracking-widest text-xs hover:text-white transition-all">取消</button>
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
        .quantum-particle-in { animation: aggregate 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
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
          0%, 100% { transform: scale(1); } 
          50% { transform: scale(1.05); } 
        }
        
        .ios-scrollbar::-webkit-scrollbar { width: 5px; }
        .ios-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}} />
      <button onClick={openModal} className="group px-8 py-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold tracking-[0.2em] uppercase hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.1)]">+ 发布全舰广播</button>
      {isMounted && createPortal(modalContent, document.body)}
    </>
  )
}