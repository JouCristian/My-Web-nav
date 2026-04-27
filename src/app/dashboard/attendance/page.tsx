// src/app/dashboard/attendance/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { TransitionLink } from "@/components/transition-link"
import { FleetAttendanceModule } from "@/components/fleet-attendance-module" // 引入我们刚才保存的组件

export default async function AttendancePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) redirect("/")

  return (
    <main className="min-h-screen py-16 px-8 xl:px-24 text-white relative flex flex-col gap-12 overflow-x-hidden">
      
      {/* 🚀 环境背景渲染 */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* 🚀 顶栏：标题与返回按钮 */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10 w-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
            <span className="text-xs font-mono text-amber-400 uppercase tracking-[0.5em]">Module C: Attendance</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.08em] font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-100 to-amber-500/50">
            跃迁集结中心
          </h1>
        </div>

        <div className="shrink-0 w-full lg:w-auto flex justify-start lg:justify-end">
          <TransitionLink href="/dashboard" className="group flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 hover:border-amber-500/40 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-amber-500/20 transition-colors duration-500">
              <div className="w-3 h-3 rounded-full bg-amber-400 transition-all duration-500 shadow-[0_0_10px_rgba(245,158,11,0.8)] group-hover:scale-125" />
              <div className="absolute inset-0 rounded-full border border-amber-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] transition-all duration-500" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-amber-400 transition-colors duration-500">Abort Mission</span>
              <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回主控台</span>
            </div>
          </TransitionLink>
        </div>
      </div>

      {/* 🚀 直接插入我们写好的独立组件 */}
      <div className="relative z-10 w-full">
        <FleetAttendanceModule userRole={dbUser.role || "PENDING"} userName={dbUser.realName || "Unknown"} />
      </div>

    </main>
  )
}