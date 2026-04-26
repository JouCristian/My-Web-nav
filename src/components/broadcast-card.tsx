"use client"

import { deleteBroadcast } from "@/app/dashboard/board/actions"

export function BroadcastCard({ announcement, isManager }: { announcement: any, isManager: boolean }) {
  const typeStyles: Record<string, { shadow: string, text: string, label: string }> = {
    INFO: { shadow: "rgba(59, 130, 246, 0.4)", text: "text-blue-400", label: "INFO" },
    UPDATE: { shadow: "rgba(16, 185, 129, 0.4)", text: "text-emerald-400", label: "UPDATE" },
    ALERT: { shadow: "rgba(239, 68, 68, 0.4)", text: "text-red-400", label: "ALERT" }
  }
  const style = typeStyles[announcement.type] || typeStyles.INFO

  return (
    <div className={`group relative w-full flex items-center gap-8 p-6 rounded-2xl border transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.01] hover:bg-white/[0.03] backdrop-blur-md ${
      announcement.isPinned 
        ? "border-purple-500/40 bg-purple-500/[0.05] shadow-[0_0_40px_rgba(168,85,247,0.15)]" 
        : "border-white/5 bg-black/40 shadow-lg"
    }`}>
      
      {/* 🚀 置顶：紫色重力场灯带 */}
      {announcement.isPinned && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,1)] animate-pulse"></div>
      )}

      {/* 状态指示区 */}
      <div className="flex flex-col items-center justify-center min-w-[90px] border-r border-white/5 pr-8">
        <div className={`text-[10px] font-mono font-bold tracking-widest mb-1 ${style.text}`}>{style.label}</div>
        <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: style.shadow, boxShadow: `0 0 10px ${style.shadow}` }}></div>
      </div>

      {/* 内容主体 */}
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-6 overflow-hidden">
        <h3 className="text-lg font-bold text-white tracking-wide shrink-0 font-[family-name:var(--font-space)] group-hover:text-blue-400 transition-colors">
          {announcement.title}
        </h3>
        <p className="text-zinc-500 text-sm font-light truncate max-w-xl">
          {announcement.content}
        </p>
      </div>

      {/* 元数据与管理 */}
      <div className="flex items-center gap-8 shrink-0">
        <div className="flex flex-col items-end opacity-40 text-[9px] font-mono tracking-widest uppercase">
          <span className="text-zinc-400">By {announcement.author?.realName || "HQ"}</span>
          <span>{new Date(announcement.createdAt).toLocaleDateString()}</span>
        </div>
        {isManager && (
          <button onClick={() => deleteBroadcast(announcement.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/20 text-zinc-700 hover:text-red-500 transition-all">✕</button>
        )}
      </div>
    </div>
  )
}