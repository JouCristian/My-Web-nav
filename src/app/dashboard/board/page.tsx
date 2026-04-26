// src/app/dashboard/board/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BroadcastCard } from "@/components/broadcast-card"
import { CreateBroadcastModal } from "@/components/create-broadcast-modal"

export default async function BroadcastBoardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const broadcasts = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" }
  })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! } })
  const isManager = dbUser?.role === "OWNER" || dbUser?.role === "ADMIN"

  return (
    /* 🚀 视野大升级：取消 max-w 限制，改用宽屏流体布局 */
    <main className="min-h-screen py-12 px-8 xl:px-24 text-white relative overflow-hidden">
      
      {/* 🚀 移植全舰统一核心脉冲动画 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes button-breathe {
          0%, 100% { transform: scale(1); border-color: rgba(255, 255, 255, 0.1); }
          50% { transform: scale(1.02); border-color: rgba(59, 130, 246, 0.3); } /* 配合星光蓝 */
        }
        @keyframes core-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(59, 130, 246, 0.8); }
          50% { transform: scale(1.3); box-shadow: 0 0 24px rgba(59, 130, 246, 1); }
        }
        .animate-button-breathe {
          animation: button-breathe 3s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-core-pulse {
          animation: core-pulse 2s ease-in-out infinite;
        }
      `}} />

      {/* 🌌 深空环境背景 (星光蓝主题) */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 gap-8 border-b border-white/10 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
              <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.5em]">Module A: Live Broadcast</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              全舰公告大屏
            </h1>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            {isManager && <CreateBroadcastModal />}
            
            {/* 🚀 统一 UI：Apple HIG 磨砂呼吸脉冲按钮 */}
            <Link href="/dashboard" className="animate-button-breathe group flex items-center gap-4 bg-black/60 px-6 py-3.5 rounded-2xl border border-white/10 backdrop-blur-md hover:border-blue-500/50 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors overflow-hidden">
                {/* 蓝色能量点 */}
                <div className="animate-core-pulse w-2.5 h-2.5 rounded-full bg-blue-400" />
                {/* 环绕光圈 */}
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_3s_infinite]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-mono group-hover:text-blue-400 transition-colors">Return</span>
                <span className="text-base font-bold text-white tracking-[0.15em] font-[family-name:var(--font-space)]">返回中枢</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 🚀 卡片阵列布局：超宽屏显示更多列 */}
        {broadcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {broadcasts.map((item) => (
              <BroadcastCard key={item.id} announcement={item} isManager={isManager} />
            ))}
          </div>
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[3rem] text-zinc-600 font-mono tracking-widest italic backdrop-blur-sm">
            <div className="text-5xl mb-6 opacity-20">📡</div>
            <p className="text-lg">目前尚未接收到任何深空广播信号...</p>
          </div>
        )}
      </div>
    </main>
  )
}