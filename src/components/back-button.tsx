'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.back()}
      className="group flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md transition-all hover:bg-black/60 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
    >
      <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 shrink-0 transition-colors">
        {/* 返回箭头图标 */}
        <svg 
          className="w-4 h-4 text-blue-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-mono">Go Back</span>
        <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回上一页</span>
      </div>
    </button>
  )
}
