// src/app/dashboard/pending/loading.tsx
"use client"

import { useEffect } from "react"

export default function PendingLoading() {
  useEffect(() => {
    // 🚀 同步触发时空跃迁
    const buttons = Array.from(document.querySelectorAll('button'));
    const shiftBtn = buttons.find(btn => {
      const text = btn.textContent || "";
      return text.includes('SPACETIME') || text.includes('时空') || text.includes('航线') || text.includes('星际') || text.includes('轨道') || text.includes('深空') || text.includes('默认');
    });
    if (shiftBtn) shiftBtn.click();
  }, []);

  return (
    <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* 专属的审核舱量子骨架 */}
      <div className="w-full max-w-2xl bg-[#06060a]/90 border border-blue-500/20 p-10 md:p-16 rounded-[3.5rem] backdrop-blur-2xl text-center">
        
        {/* 顶部扫描仪占位 */}
        <div className="w-24 h-24 mx-auto mb-10 rounded-full border-2 border-blue-500/20 flex items-center justify-center relative">
           <div className="absolute inset-0 rounded-full border-t-2 border-blue-400/50 animate-spin"></div>
           <div className="w-10 h-10 rounded-full bg-blue-500/10 animate-pulse"></div>
        </div>

        {/* 文字占位 */}
        <div className="w-64 h-8 bg-blue-500/20 rounded-lg animate-pulse mx-auto mb-4"></div>
        <div className="w-48 h-4 bg-blue-500/10 rounded-full animate-pulse mx-auto mb-12"></div>

        {/* 返回按钮占位 */}
        <div className="w-48 h-16 bg-white/5 rounded-2xl animate-pulse mx-auto mb-16"></div>

        {/* 底部双按钮占位 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-10">
          <div className="h-14 bg-emerald-500/10 rounded-2xl animate-pulse"></div>
          <div className="h-14 bg-red-500/10 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    </main>
  )
}