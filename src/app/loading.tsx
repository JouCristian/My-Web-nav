"use client"

import { useEffect } from "react"

export default function Loading() {
  useEffect(() => {
    // 🚀 核心：强制点击函数
    const forceShift = () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shiftBtn = buttons.find(btn => 
        btn.textContent?.includes('SPACETIME SHIFT') || 
        btn.textContent?.includes('时空') || 
        btn.textContent?.includes('航线')
      );
      if (shiftBtn) shiftBtn.click();
    };

    // 🚀 仅仅在挂载瞬间立刻触发一次（进入跃迁状态）
    forceShift();
    
    // 删除了 return () => forceShift(); 不再拉回视角！
  }, []);

  return (
    <main className="min-h-screen bg-transparent p-10 text-white font-[family-name:var(--font-space)]">
      {/* 顶部骨架 */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-16 h-10 border-b border-white/5 pb-6">
        <div className="w-40 h-8 rounded-lg bg-white/5 animate-pulse"></div>
        <div className="w-32 h-8 rounded-2xl bg-white/5 animate-pulse"></div>
      </div>

      {/* 中央系统同步单元 */}
      <div className="flex flex-col items-center mb-20 max-w-md mx-auto p-8 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-xl animate-flame-active relative overflow-hidden">
        <h1 className="text-sm font-bold tracking-[0.3em] font-mono text-center uppercase text-blue-400/80 mb-6">System Loading / 同步中</h1>
        <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 mb-4 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-white/50 animate-spin"></div>
          <div className="w-6 h-6 rounded-full border-b-2 border-white animate-pulse"></div>
        </div>
        <p className="text-[10px] text-zinc-600 font-mono tracking-tighter opacity-60">Syncing with Starbase...</p>
      </div>

      {/* 书签卡片 Grid 骨架 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative h-44 rounded-3xl bg-black/40 border border-white/10 p-6 animate-pulse"></div>
        ))}
      </div>
    </main>
  )
}