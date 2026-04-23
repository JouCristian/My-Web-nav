// src/app/loading.tsx
"use client"

import { useEffect, useRef } from "react"

export default function Loading() {
  // 🚀 使用 Ref 记录：这次 Loading 是否执行了“下沉”动作
  const didShiftDown = useRef(false);

  useEffect(() => {
    // 1. 查找右下角的“时空切换”控制按钮
    const findShiftButton = () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => 
        btn.textContent?.includes('SPACETIME SHIFT') || 
        btn.textContent?.includes('时空') || 
        btn.textContent?.includes('航线')
      );
    };

    const shiftBtn = findShiftButton();

    if (shiftBtn) {
      // 🚀 核心逻辑升级：状态感知切换
      // 只有当检测到当前是“默认”状态（Normal）时，才触发点击进入“跃迁”
      const isNormalState = shiftBtn.textContent?.includes('默认');
      
      if (isNormalState) {
        shiftBtn.click();
        didShiftDown.current = true; // 标记：我们让镜头下沉了
      }
      // 如果已经是变轨状态，则保持不动，因为用户已经处于“跃迁视角”了
    }

    return () => {
      // 2. 卸载时：如果我们加载开始时让镜头下沉了，现在把它拉回来
      const endBtn = findShiftButton();
      if (didShiftDown.current && endBtn) {
        endBtn.click();
      }
    };
  }, []);

  return (
    // 保持背景透明，让底层的动态星空完全显现 
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
          <div
            key={i}
            className="relative h-44 rounded-3xl bg-black/40 border border-white/10 p-6 flex flex-col justify-between overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.02)]"
          >
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