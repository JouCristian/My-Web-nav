// src/app/dashboard/board/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BroadcastCard } from "@/components/broadcast-card"
import { CreateBroadcastModal } from "@/components/create-broadcast-modal"
import { BackButton } from "@/components/back-button"

export default async function BroadcastBoardPage() {
  const session = await auth()
  // 🚀 核心修复：改用 id 验证
  if (!session?.user?.id) redirect("/login")

  // 🚀 排序逻辑：置顶公告在前，其次按时间倒序
  const broadcasts = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
  })

  // 🚀 核心修复：通过物理 ID 查库
  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  const isManager = dbUser?.role === "OWNER" || dbUser?.role === "ADMIN"

  return (
    <main className="min-h-screen pt-24 pb-12 sm:pt-20 sm:pb-16 md:py-16 px-4 sm:px-6 md:px-8 xl:px-32 text-white relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes button-breathe { 0%, 100% { transform: scale(1); border-color: rgba(255,255,255,0.1); } 50% { transform: scale(1.02); border-color: rgba(59,130,246,0.4); } }
        @keyframes core-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(59,130,246,0.8); } 50% { transform: scale(1.3); box-shadow: 0 0 24px rgba(59,130,246,1); } }
        .animate-button-breathe { animation: button-breathe 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-core-pulse { animation: core-pulse 2s ease-in-out infinite; }
      `}} />

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-10 sm:mb-20 gap-5 sm:gap-8 border-b border-white/10 pb-6 sm:pb-12">
        <div>
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 flex-wrap">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping shrink-0"></span>
            <span className="text-[10px] sm:text-xs font-mono text-blue-400 uppercase tracking-[0.3em] sm:tracking-[0.5em]">Module A: Starfleet Broadcast</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">全舰公告大屏</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-6 w-full xl:w-auto">
          {isManager && <CreateBroadcastModal />}
          <BackButton />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {broadcasts.length > 0 ? broadcasts.map(item => <BroadcastCard key={item.id} announcement={item} isManager={isManager} />) : <div className="h-96 flex items-center justify-center text-zinc-600 font-mono tracking-widest italic opacity-20 text-2xl">📡 NO SIGNALS DETECTED</div>}
      </div>
    </main>
  )
}
