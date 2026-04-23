// src/app/dashboard/loading.tsx

"use client"
import { useEffect } from "react"

export default function DashboardLoading() {

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
      <main className="min-h-screen p-12 md:p-20 text-white max-w-7xl mx-auto flex flex-col gap-16 relative bg-transparent">
        
        {/* 顶部导航骨架 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-12">
          <div>
            <div className="w-48 h-4 bg-white/10 rounded-full animate-pulse mb-6"></div>
            <div className="w-80 h-12 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
          <div className="w-40 h-16 bg-white/5 rounded-2xl animate-pulse"></div>
        </div>
  
        {/* 模块大卡片矩阵骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-[3rem] border border-white/5 bg-black/40 p-10 flex flex-col justify-between animate-pulse shadow-[0_0_20px_rgba(255,255,255,0.02)]">
               <div className="w-16 h-16 rounded-2xl bg-white/10 mb-8"></div>
               <div>
                 <div className="w-3/4 h-8 bg-white/10 rounded-xl mb-4"></div>
                 <div className="w-1/2 h-4 bg-white/5 rounded-full"></div>
               </div>
               <div className="mt-auto border-t border-white/5 pt-6 flex justify-between items-center">
                 <div className="w-16 h-4 bg-white/5 rounded-full"></div>
                 <div className="w-24 h-4 bg-white/5 rounded-full"></div>
               </div>
            </div>
          ))}
        </div>
      </main>
    )
  }