// src/app/dashboard/attendance/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { TransitionLink } from "@/components/transition-link"
import { FleetAttendanceModule } from "@/components/fleet-attendance-module" 
import { LeaveRequestModule } from "@/components/leave-request-module" 
import { AttendanceDashboardModule } from "@/components/attendance-dashboard-module"

export default async function AttendancePage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) redirect("/")

  // 🚀 防空洞级过滤：取消 realName 必须不为空的死板限制，确保所有舰长无论有没有实名都被查出来
  const allUsers = await prisma.user.findMany({
    where: { 
      role: { in: ["MEMBER", "ADMIN", "OWNER"] }
    }
  })
  
  // 🚀 舰长专属数据流：优先用真实姓名，没有就用网名，再没有就叫 Commander
  const managersData = allUsers
    .filter(u => u.role === "ADMIN" || u.role === "OWNER")
    .map(u => ({
      name: (u.realName || u.name || u.nickname || u.githubName || "Commander") as string,
      role: u.role as string,
      image: (u.image || u.customAvatar || null) as string | null
    }))

  // 🚀 船员名单
  const crewMembers = allUsers
    .filter(u => u.role === "MEMBER")
    .map(u => (u.realName || u.name || u.nickname || u.githubName || "Unknown") as string)

  // 主集结模块用的全员名单
  const allRealNames = allUsers.map(u => (u.realName || u.name || u.nickname || u.githubName || "Unknown") as string)
  const currentUserName = (dbUser.realName || dbUser.name || dbUser.nickname || dbUser.githubName || "Unknown") as string

  return (
    <main className="min-h-screen py-16 px-8 xl:px-24 text-white relative flex flex-col gap-12 overflow-x-hidden">
      
      {/* 背景渲染 */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* 顶栏：标题与返回按钮 */}
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

      <div className="relative z-10 w-full flex flex-col gap-8">
        
        {/* 上半区：集结大盘与历史日历 */}
        <FleetAttendanceModule userRole={dbUser.role || "PENDING"} userName={currentUserName} crewMembers={allRealNames} />
        
        {/* 下半区：绝对对称的 1/2 空间分配 */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          <div className="h-full">
            <LeaveRequestModule userRole={dbUser.role || "PENDING"} userName={currentUserName} />
          </div>

          <div className="h-full">
            {/* 🚀 传入全新的长官数据字典 */}
            <AttendanceDashboardModule managers={managersData} crewMembers={crewMembers} />
          </div>

        </div>

      </div>

    </main>
  )
}