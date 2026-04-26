"use client"

import { useState } from "react"
import { deleteBroadcast } from "@/app/dashboard/board/actions"

export function BroadcastCard({ announcement, isManager }: { announcement: any, isManager: boolean }) {
  const [isDeleting, setIsDeleting] = useState(false)

  // 🚀 针对不同等级分配专属能量光色
  const typeStyles: Record<string, { border: string, text: string, shadow: string, label: string }> = {
    INFO: { border: "border-blue-500/30", text: "text-blue-400", shadow: "rgba(59, 130, 246, 0.2)", label: "舰队简讯" },
    UPDATE: { border: "border-emerald-500/30", text: "text-emerald-400", shadow: "rgba(16, 185, 129, 0.2)", label: "系统更新" },
    ALERT: { border: "border-red-500/30", text: "text-red-400", shadow: "rgba(239, 68, 68, 0.2)", label: "紧急警报" }
  }

  const style = typeStyles[announcement.type] || typeStyles.INFO

  return (
    <div className={`group relative p-8 rounded-[2.5rem] border backdrop-blur-xl bg-black/40 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.02] hover:bg-black/60 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_0_50px_-10px_${style.shadow}] ${style.border}`}>
      
      {/* 🚀 内部能量流光效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none"></div>
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-700`} style={{ backgroundColor: style.shadow }}></div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: style.shadow, boxShadow: `0 0 10px ${style.shadow}` }}></div>
            <span className={`text-[10px] font-mono font-bold tracking-[0.3em] uppercase ${style.text}`}>
              {style.label}
            </span>
          </div>
          
          {isManager && (
            <button 
              onClick={() => deleteBroadcast(announcement.id)}
              className="opacity-0 group-hover:opacity-60 hover:!opacity-100 text-zinc-500 hover:text-red-500 transition-all text-xs font-mono"
            >
              [ 销毁记录 ]
            </button>
          )}
        </div>

        <h3 className="text-xl font-bold text-white tracking-wider mb-4 font-[family-name:var(--font-space)] group-hover:translate-x-1 transition-transform">
          {announcement.title}
        </h3>
        
        <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-light tracking-wide line-clamp-3">
          {announcement.content}
        </p>

        <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-mono text-zinc-600 tracking-widest uppercase">
          <span>By {announcement.author?.realName || "舰队指挥部"}</span>
          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  )
}