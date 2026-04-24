"use client"

import { useEffect } from "react"

export default function CrewLoading() {
  useEffect(() => {
    const forceShift = () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const shiftBtn = buttons.find(btn => btn.textContent?.includes('时空') || btn.textContent?.includes('航线'));
      if (shiftBtn) shiftBtn.click();
    };
    
    // 🚀 仅触发一次
    forceShift();
  }, []);

  return (
    <main className="min-h-screen bg-transparent p-6 md:p-10 text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6 gap-6">
          <div className="space-y-4">
            <div className="w-24 h-4 bg-white/10 rounded-full animate-pulse"></div>
            <div className="w-64 h-10 bg-white/10 rounded-xl animate-pulse"></div>
          </div>
          <div className="flex gap-4">
            <div className="w-36 h-14 bg-white/5 rounded-2xl animate-pulse"></div>
            <div className="w-36 h-14 bg-white/5 rounded-2xl animate-pulse"></div>
          </div>
        </div>
        
        {/* 档案列表骨架 */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl border border-white/5 bg-black/40 animate-pulse"></div>
          ))}
        </div>
      </div>
    </main>
  )
}