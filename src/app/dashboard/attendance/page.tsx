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
  if (!session?.user?.id) redirect("/")

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!dbUser) redirect("/")

  const allUsers = await prisma.user.findMany({
    where: { 
      role: { in: ["MEMBER", "ADMIN", "OWNER"] }
    }
  })
  
  const managersData = allUsers
    .filter(u => u.role === "ADMIN" || u.role === "OWNER")
    .map(u => ({
      name: (u.realName || u.name || u.nickname || u.githubName || "Commander") as string,
      role: u.role as string,
      image: (u.image || u.customAvatar || null) as string | null
    }))

  const crewMembers = allUsers
    .filter(u => u.role === "MEMBER")
    .map(u => (u.realName || u.name || u.nickname || u.githubName || "Unknown") as string)

  const currentUserName = (dbUser.realName || dbUser.name || dbUser.nickname || dbUser.githubName || "Unknown") as string

  return (
    <main className="min-h-screen py-16 px-8 xl:px-24 text-white relative flex flex-col gap-12 overflow-x-hidden">
      
      {/* 🚀 注入全舰统一的网格卡片引擎样式 */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 核心网格卡片样式：应用到所有 Module 容器 */
        .attendance-grid-card {
          position: relative;
          background: rgba(6, 8, 15, 0.4) !important;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 2.5rem !important;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }

        /* 渲染量子网格线条 */
        .attendance-grid-card::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 32px 32px;
          pointer-events: none;
          z-index: 0;
          mask-image: radial-gradient(circle at center, black, transparent 80%);
        }

        .attendance-grid-card:hover {
          border-color: rgba(245, 158, 11, 0.3) !important;
          background: rgba(10, 12, 24, 0.6) !important;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        }
      `}} />
      
      {/* 环境氛围光 */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-amber-500/5 blur-[150px] rounded-full pointer-events-none z-0"></div>

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
            <div className="flex flex-col items-start text-left">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-amber-400 transition-colors duration-500">Abort Mission</span>
              <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回主控台</span>
            </div>
          </TransitionLink>
        </div>
      </div>

      <div className="relative z-10 w-full flex flex-col gap-8 mb-8">
        
        {/* 🚀 核心更新：使用统一的 .attendance-grid-card 类名包裹各个模块 */}
        <div className="attendance-grid-card p-1">
          <FleetAttendanceModule userRole={dbUser.role || "PENDING"} userName={currentUserName} crewMembers={crewMembers} />
        </div>
        
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="attendance-grid-card p-1 h-full">
            <LeaveRequestModule userRole={dbUser.role || "PENDING"} userName={currentUserName} />
          </div>
          <div className="attendance-grid-card p-1 h-full">
            <AttendanceDashboardModule managers={managersData} crewMembers={crewMembers} />
          </div>
        </div>

      </div>

      <footer className="w-full mt-auto pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 select-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600 tracking-[0.2em] uppercase">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
            <span className="text-emerald-500/80 font-bold">Uplink Active</span>
          </div>
          <span className="hidden md:inline opacity-30">/</span>
          <span className="hidden md:inline">Sec-Level: Omega</span>
          <span className="hidden md:inline opacity-30">/</span>
          <span className="hidden md:inline">Node: Sector-7G</span>
        </div>
        <div className="text-[10px] font-mono text-zinc-600 tracking-[0.3em] uppercase text-center opacity-50 hover:opacity-100 hover:text-amber-500/50 transition-colors duration-500">
          END OF SECURE DATA STREAM &copy; {new Date().getFullYear()} STARFLEET.
        </div>
        <div className="flex items-center gap-1 opacity-30">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`w-1.5 h-3 skew-x-[-20deg] ${i === 5 ? 'bg-amber-500 animate-pulse shadow-[0_0_10px_#f59e0b]' : 'bg-white/40'}`}></div>
          ))}
        </div>
      </footer>
    </main>
  )
}