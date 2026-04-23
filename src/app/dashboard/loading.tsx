"use client"

import { useEffect, useRef } from "react"

export default function DashboardLoading() {
  const didShiftDown = useRef(false);

  useEffect(() => {
    const findShiftButton = () => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(btn => btn.textContent?.includes('时空') || btn.textContent?.includes('航线'));
    };
    const shiftBtn = findShiftButton();
    if (shiftBtn && shiftBtn.textContent?.includes('默认')) {
      shiftBtn.click();
      didShiftDown.current = true;
    }
    return () => {
      const endBtn = findShiftButton();
      if (didShiftDown.current && endBtn) endBtn.click();
    };
  }, []);

  return (
    <main className="min-h-screen p-12 md:p-20 text-white max-w-7xl mx-auto flex flex-col gap-16 relative bg-transparent">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-12">
        <div className="space-y-4">
          <div className="w-48 h-4 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-80 h-12 bg-white/10 rounded-xl animate-pulse"></div>
        </div>
        <div className="w-40 h-16 bg-white/5 rounded-2xl animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-80 rounded-[3rem] border border-white/5 bg-black/40 p-10 animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.03)]"></div>
        ))}
      </div>
    </main>
  )
}