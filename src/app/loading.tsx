"use client"

import { useEffect } from "react"

export default function Loading() {
  useEffect(() => {
    // 🚀 终极杀招：雷达轮询扫描机制 (解决 DOM 渲染延迟导致的按钮找不到问题)
    let attempts = 0;
    
    const radarScan = setInterval(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shiftBtn = buttons.find(btn => {
        const text = btn.textContent || "";
        return text.includes('SPACETIME') || 
               text.includes('时空') || 
               text.includes('航线') || 
               text.includes('星际') || 
               text.includes('轨道') || 
               text.includes('深空') || 
               text.includes('默认');
      });

      // 如果找到了，立刻按下，并关闭雷达扫描
      if (shiftBtn) {
        shiftBtn.click();
        clearInterval(radarScan);
      }

      // 如果扫描了 10 次 (约 500ms) 还没找到，说明当前页面真没这个按钮，安全退出
      attempts++;
      if (attempts >= 10) {
        clearInterval(radarScan);
      }
    }, 50); // 每 50ms 扫描一次

    // 组件卸载时清理定时器，防止内存泄漏
    return () => clearInterval(radarScan);
  }, []);

  return (
    // 🚀 保持全透明背景，让底层动态星空完全显现
    <main className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center font-[family-name:var(--font-space)] overflow-hidden">
      
      {/* 顶部 HUD 战术扫描线 */}
      <div className="absolute top-10 left-0 w-full flex justify-between px-10 opacity-40">
        <div className="flex gap-2">
          <div className="w-12 h-[2px] bg-blue-500 animate-pulse"></div>
          <div className="w-4 h-[2px] bg-blue-400"></div>
          <div className="w-2 h-[2px] bg-white"></div>
        </div>
        <div className="text-[10px] text-blue-400 font-mono tracking-[0.5em] uppercase animate-pulse">
          JUMP SEQUENCE INITIATED
        </div>
      </div>

      {/* 🚀 跃迁引擎核心 UI */}
      <div className="relative flex items-center justify-center">
        
        {/* 外围雷达光环 (顺时针缓动旋转) */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-white/5 border-dashed animate-[spin_20s_linear_infinite] pointer-events-none"></div>
        
        {/* 中层充能光环 (逆时针快速旋转) */}
        <div className="absolute w-[280px] h-[280px] rounded-full border-t border-r border-blue-500/30 animate-[spin_8s_linear_infinite_reverse] pointer-events-none"></div>
        <div className="absolute w-[280px] h-[280px] rounded-full border-b border-l border-purple-500/30 animate-[spin_12s_linear_infinite] pointer-events-none"></div>

        {/* 核心聚能反应堆 */}
        <div className="relative z-10 flex flex-col items-center justify-center w-64 h-64 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-[0_0_80px_rgba(59,130,246,0.15)] group">
          
          {/* 内部脉冲核心 */}
          <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping opacity-20"></div>
          
          {/* 状态指示器 */}
          <div className="w-12 h-12 rounded-full border-2 border-white/20 p-1 mb-4 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-[spin_1s_cubic-bezier(0.4,0,0.2,1)_infinite]"></div>
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]"></div>
          </div>

          <h2 className="text-xl font-bold tracking-[0.3em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Spacetime
          </h2>
          <h3 className="text-sm font-mono text-blue-400 tracking-[0.5em] mt-1 mb-3">
            SHIFTING
          </h3>
          
          {/* 数据流线 */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="w-1 bg-white/20 rounded-full animate-pulse"
                style={{ 
                  height: `${Math.random() * 12 + 4}px`,
                  animationDelay: `${i * 150}ms`,
                  animationDuration: '800ms'
                }}
              ></div>
            ))}
          </div>
        </div>

      </div>

      {/* 底部坐标解算器 */}
      <div className="absolute bottom-16 flex flex-col items-center">
        <p className="text-[10px] text-zinc-500 font-mono tracking-[0.3em] uppercase mb-2">
          Calculating Destination Coordinates...
        </p>
        <div className="w-64 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent">
          <div className="w-1/3 h-full bg-blue-500/80 animate-[slide_2s_ease-in-out_infinite_alternate]"></div>
        </div>
      </div>

    </main>
  )
}