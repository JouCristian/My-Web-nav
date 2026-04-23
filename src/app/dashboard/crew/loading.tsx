// src/app/dashboard/crew/loading.tsx

"use client"
import { useEffect } from "react"


export default function CrewLoading() {

// 🚀 核心动效注入：无侵入式触发“时空切换”
useEffect(() => {
    const triggerSpacetimeShift = () => {
      // 自动在全局寻找那个带有“航线”或“时空”字样的切换按钮并点击它
      const buttons = Array.from(document.querySelectorAll('button'));
      const shiftBtn = buttons.find(btn => 
        btn.textContent?.includes('时空') || btn.textContent?.includes('航线')
      );
      if (shiftBtn) {
        shiftBtn.click();
      }
    };

    // 1. 挂载时（开始 Loading）：触发镜头下沉，进入跃迁状态
    triggerSpacetimeShift();

    // 2. 卸载时（Loading 结束）：再次触发，镜头平滑拉回正常视角
    return () => {
      triggerSpacetimeShift();
    };
  }, []);

    return (
      <main className="min-h-screen bg-transparent p-6 md:p-10 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* 顶部导航区骨架 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6 gap-6">
            <div>
              <div className="w-24 h-4 bg-white/10 rounded-full animate-pulse mb-4"></div>
              <div className="w-64 h-10 bg-white/10 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex gap-4">
              <div className="w-36 h-14 bg-white/5 rounded-2xl animate-pulse hidden md:block"></div>
              <div className="w-36 h-14 bg-white/5 rounded-2xl animate-pulse"></div>
            </div>
          </div>
  
          {/* 列表骨架 */}
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border border-white/5 bg-black/40 animate-pulse">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-white/10"></div>
                  <div className="flex flex-col gap-3">
                    <div className="w-32 h-6 bg-white/10 rounded-md"></div>
                    <div className="w-24 h-4 bg-white/5 rounded-md"></div>
                  </div>
                </div>
                <div className="mt-4 md:mt-0 flex flex-col items-end gap-2">
                  <div className="w-16 h-3 bg-white/5 rounded-md"></div>
                  <div className="w-20 h-5 bg-white/10 rounded-md"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    )
  }