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

  // 获取全量广播，按时间倒序
  const broadcasts = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" }
  })

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email! } })
  const isManager = dbUser?.role === "OWNER" || dbUser?.role === "ADMIN"

  return (
    <main className="min-h-screen p-8 md:p-16 text-white max-w-7xl mx-auto relative">
      {/* 🌌 深空环境背景 */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8 border-b border-white/10 pb-12">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-[0.5em]">Module A: Live Broadcast</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              全舰公告大屏
            </h1>
          </div>
          
          <div className="flex gap-6">
            {isManager && <CreateBroadcastModal />}
            <Link href="/dashboard" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-zinc-400 font-bold tracking-widest text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95">
              返回中枢
            </Link>
          </div>
        </div>

        {/* 🚀 卡片阵列布局 */}
        {broadcasts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {broadcasts.map((item) => (
              <BroadcastCard key={item.id} announcement={item} isManager={isManager} />
            ))}
          </div>
        ) : (
          <div className="h-[400px] flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[3rem] text-zinc-600 font-mono tracking-widest italic">
            <div className="text-4xl mb-4 opacity-20">📡</div>
            <p>目前尚未接收到任何深空广播信号...</p>
          </div>
        )}
      </div>
    </main>
  )
}