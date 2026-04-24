"use client"

import { useEffect } from "react"

export default function Loading() {
  useEffect(() => {
    // 🚀 终极状态感知跃迁引擎
    const getShiftBtn = () => {
      return Array.from(document.querySelectorAll('button')).find(btn => 
        btn.textContent?.includes('SPACETIME SHIFT') || 
        btn.textContent?.includes('时空') || 
        btn.textContent?.includes('航线')
      );
    };

    const btn = getShiftBtn();
    
    if (btn) {
      if (btn.textContent?.includes('默认')) {
        // 状态1：当前在默认航线，直接点击启动跃迁
        btn.click();
      } else {
        // 状态2：当前已经是星际穿越！
        // 先点击退回默认（产生视觉后坐力）
        btn.click(); 
        // 150毫秒后再次瞬间强制启动跃迁，确保每次加载都有强烈的推背感！
        setTimeout(() => {
          const freshBtn = getShiftBtn();
          if (freshBtn) freshBtn.click();
        }, 150);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-transparent p-10 text-white font-[family-name:var(--font-space)]">
      
      {/* 🚀 1. 模拟页眉 Skeleton */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-16 h-10 border-b border-white/5 pb-6">
        <div className="w-40 h-8 rounded-lg bg-white/5 animate-pulse"></div>
        <div className="w-32 h-8 rounded-2xl bg-white/5 animate-pulse"></div>
      </div>

      {/* 🚀 2. 中央系统处理单元 Skeleton */}
      <div className="flex flex-col items-center mb-20 max-w-md mx-auto p-8 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-xl animate-flame-active relative overflow-hidden group">
        <h1 className="text-sm font-bold tracking-[0.3em] font-mono text-center uppercase text-blue-400/80 mb-6">
          System Loading / 同步中
        </h1>
        <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 mb-4 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-white/50 animate-spin"></div>
          <div className="w-6 h-6 rounded-full border-b-2 border-white animate-pulse"></div>
        </div>
        <p className="text-[10px] text-zinc-600 font-mono tracking-tighter opacity-60">
          Fetching Mission Control protocols...
        </p>
        <div className="absolute inset-0 bg-white/2 pointer-events-none opacity-0 animate-flicker"></div>
      </div>

      {/* 🚀 3. 书签卡片 Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="relative h-44 rounded-3xl bg-black/40 border border-white/10 p-6 flex flex-col justify-between overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.02)]">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="w-3/4 h-5 rounded bg-white/10 animate-pulse"></div>
                  <div className="w-1/2 h-4 rounded bg-white/5 animate-pulse font-mono"></div>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="w-full h-3 rounded bg-white/5 animate-pulse"></div>
                <div className="w-5/6 h-3 rounded bg-white/5 animate-pulse"></div>
              </div>
            </div>
            <div className="w-24 h-5 rounded-md bg-white/5 animate-pulse mt-4 ml-auto"></div>
            <div className="absolute inset-0 bg-white/2 pointer-events-none opacity-0 animate-flicker"></div>
          </div>
        ))}
      </div>

      {/* 🚀 4. 页脚 Skeleton */}
      <div className="mt-24 pt-6 border-t border-white/5 text-center max-w-5xl mx-auto">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          Starbase Profile System v2.0
        </p>
      </div>
    </main>
  )
}