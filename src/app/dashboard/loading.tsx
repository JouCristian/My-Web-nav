"use client"

import { useEffect } from "react"

export default function Loading() {
  useEffect(() => {
    // 🚀 雷达轮询扫描机制：确保每次局部路由切换也能精准捕捉并按下跃迁按钮
    let attempts = 0;
    
    const radarScan = setInterval(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shiftBtn = buttons.find(btn => {
        const text = btn.textContent || "";
        // 匹配新的 Aurora 剧本名称或旧的时空剧本名称
        return text.includes('Aurora') || text.includes('SPACETIME') || 
               text.includes('静谧') || text.includes('极光') || 
               text.includes('星云') || text.includes('深渊') ||
               text.includes('时空') || text.includes('航线') || 
               text.includes('星际') || text.includes('轨道') || 
               text.includes('深空') || text.includes('默认');
      });

      if (shiftBtn) {
        shiftBtn.click();
        clearInterval(radarScan);
      }

      attempts++;
      if (attempts >= 10) {
        clearInterval(radarScan);
      }
    }, 50);

    return () => clearInterval(radarScan);
  }, []);

  return (
    // 🚀 固定在全屏最顶层，彻底覆盖切换时的空白
    <main className="fixed inset-0 z-[100] bg-transparent flex flex-col items-center justify-center font-[family-name:var(--font-space)] overflow-hidden pointer-events-none">
      
      {/* 顶部极光扫掠 */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent w-full opacity-50 animate-[slide_3s_ease-in-out_infinite_alternate]"></div>
      
      {/* 中心巨大的幽蓝/暗紫混合光晕 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[80px] animate-[pulse_4s_ease-in-out_infinite]"></div>

      {/* ⚛️ 核心动态流光环 */}
      <div className="relative flex items-center justify-center">
        
        {/* 外围轨道流光 */}
        <div className="absolute w-[320px] h-[320px] rounded-full bg-[conic-gradient(from_0deg,transparent_0_280deg,rgba(59,130,246,0.8)_360deg)] animate-spin" style={{ animationDuration: '2s' }}></div>
        <div className="absolute w-[318px] h-[318px] rounded-full bg-[#020205]/40 backdrop-blur-sm"></div>

        {/* 反向内侧轨道流光 */}
        <div className="absolute w-[240px] h-[240px] rounded-full bg-[conic-gradient(from_0deg,transparent_0_200deg,rgba(168,85,247,0.6)_360deg)] animate-[spin_3s_linear_infinite_reverse]"></div>
        <div className="absolute w-[238px] h-[238px] rounded-full bg-[#020205]/60 backdrop-blur-md"></div>

        {/* 核心准星与状态文字 */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 flex items-center justify-center mb-6">
            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-ping"></div>
            <div className="absolute inset-2 rounded-full border border-white/20 animate-[spin_4s_linear_infinite]"></div>
            <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)] animate-pulse"></div>
          </div>

          <h2 className="text-xl font-bold tracking-[0.4em] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            Spacetime
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="w-8 h-[1px] bg-blue-500/50"></span>
            <span className="text-[10px] font-mono text-blue-400 tracking-[0.4em]">SYNCING</span>
            <span className="w-8 h-[1px] bg-blue-500/50"></span>
          </div>
        </div>

      </div>

      {/* 底部随机跳动的数据流 */}
      <div className="absolute bottom-20 flex gap-1.5 items-end h-8">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="w-1 bg-white/20 rounded-full animate-pulse"
            style={{ 
              height: `${Math.random() * 100}%`,
              animationDelay: `${i * 100}ms`,
              animationDuration: '600ms'
            }}
          ></div>
        ))}
      </div>

    </main>
  )
}
