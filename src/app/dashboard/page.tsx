// src/app/dashboard/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { updateRecruitProfile, revokeRecruitProfile } from "@/app/actions"
import Link from "next/link"
import { TransitionLink } from "@/components/transition-link"
import { BroadcastCard } from "@/components/broadcast-card"
import { CreateBroadcastModal } from "@/components/create-broadcast-modal"
import { DashboardClock } from "@/components/dashboard-clock"
import { FlightLogCalendar } from "@/components/flight-log-calendar"

const THEME_MAP = {
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/60",
    shadow: "shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:shadow-[0_0_80px_rgba(59,130,246,0.2)]",
    blob: "bg-blue-500/10 group-hover:bg-blue-500/25",
    iconBox: "bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:bg-blue-500/20 text-blue-400",
    subtitle: "text-blue-200/40",
    activeText: "text-blue-400"
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/60",
    shadow: "shadow-[0_0_40px_rgba(168,85,247,0.1)] hover:shadow-[0_0_80px_rgba(168,85,247,0.2)]",
    blob: "bg-purple-500/10 group-hover:bg-purple-500/25",
    iconBox: "bg-purple-500/10 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:bg-purple-500/20 text-purple-400",
    subtitle: "text-purple-200/40",
    activeText: "text-purple-400"
  },
  yellow: {
    border: "border-amber-500/20 hover:border-amber-500/60",
    shadow: "shadow-[0_0_40px_rgba(245,158,11,0.1)] hover:shadow-[0_0_80px_rgba(245,158,11,0.2)]",
    blob: "bg-amber-500/10 group-hover:bg-amber-500/25",
    iconBox: "bg-amber-500/10 border-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] group-hover:bg-amber-500/20 text-amber-400",
    subtitle: "text-amber-200/40",
    activeText: "text-amber-400"
  }
}

const ModuleCard = ({ moduleId, title, subtitle, icon, link, isActive, theme = "purple" }: {
  moduleId: string; title: string; subtitle: string; icon: string; link: string; isActive: boolean; theme?: "blue" | "purple" | "yellow"
}) => {
  const styles = THEME_MAP[theme];

  return (
    <Link 
      href={isActive ? link : "#"} 
      className={`group relative w-full h-[360px] rounded-[3.5rem] border ${styles.border} bg-[#06060a]/95 p-10 lg:p-12 flex flex-col justify-between overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] ${isActive ? `hover:-translate-y-2 ${styles.shadow}` : 'opacity-60 grayscale'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full transition-all duration-1000 ${styles.blob}`}></div>
      
      <div className="relative z-10">
        <div className={`w-20 h-20 rounded-[2rem] border flex items-center justify-center mb-8 text-4xl group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${styles.iconBox}`}>
          {icon}
        </div>
        <h3 className="text-3xl lg:text-4xl font-bold text-white tracking-[0.15em] font-[family-name:var(--font-space)] mb-4">{title}</h3>
        <p className={`text-sm lg:text-base font-mono tracking-widest leading-relaxed ${styles.subtitle}`}>{subtitle}</p>
      </div>
      
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] lg:text-[12px] font-mono text-zinc-500 uppercase tracking-[0.4em] border-t border-white/5 pt-8">
        <span className="bg-white/5 px-4 py-2 rounded-lg shrink-0">{moduleId}</span>
        <span className={`flex items-center gap-3 transition-all duration-500 ${isActive ? `${styles.activeText} group-hover:gap-6` : 'text-zinc-700'}`}>
          {isActive ? 'Authorize Access' : 'System Locked'}
          <span className="text-xl">➔</span>
        </span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  // 🚀 核心修复：彻底消灭 session?.user?.email
  if (!session?.user?.id) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { id: session.user.id } })
  if (!dbUser) redirect("/login")

  // @ts-ignore
  const isCaptain = session.user.isCaptain;
  const isProfileIncomplete = !dbUser.realName || !dbUser.studentId;
  const isManager = dbUser.role === "OWNER" || dbUser.role === "ADMIN"

  const broadcasts = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
  })

  // 🛡️ 状态 1：拦截器逻辑
  if (!isCaptain && isProfileIncomplete) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-red-500/5 -rotate-12 blur-[100px] pointer-events-none animate-pulse"></div>
        <div className="relative z-10 w-full max-w-lg">
          <div className="flex justify-end mb-6">
            <TransitionLink href="/" className="group flex items-center gap-4 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/20 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-red-400 transition-colors">Abort Sequence</span>
                <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">撤离拦截区</span>
              </div>
            </TransitionLink>
          </div>

          <div className="bg-[#06060a]/90 border border-red-500/30 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-[0_0_80px_rgba(239,68,68,0.1)]">
            <div className="flex items-center gap-4 mb-8 border-b border-red-500/20 pb-6">
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">🛡️</div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-widest font-[family-name:var(--font-space)]">身份权限识别</h1>
                <p className="text-red-400/80 text-xs font-mono mt-1 uppercase tracking-widest">Entry Protocol Required</p>
              </div>
            </div>
            <form action={updateRecruitProfile} className="space-y-6">
               <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">真实姓名 / Real Name</label>
                <input type="text" name="realName" required className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">学号 / Student ID</label>
                <input type="text" name="studentId" required className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 text-white" />
              </div>
              <button type="submit" className="w-full bg-red-500/20 border border-red-500/50 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all tracking-[0.3em]">提交建档</button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  // 🛡️ 状态 2：拦截器逻辑
  if (!isCaptain && dbUser.role === "PENDING") {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-blue-500/5 -rotate-12 blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 w-full max-w-2xl bg-[#06060a]/90 border border-blue-500/20 p-10 md:p-16 rounded-[3.5rem] backdrop-blur-2xl shadow-[0_0_80px_rgba(59,130,246,0.1)] text-center">
          <div className="relative w-24 h-24 mx-auto mb-10">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin"></div>
            <div className="absolute inset-4 rounded-full bg-blue-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 animate-pulse">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-[0.2em] font-[family-name:var(--font-space)] mb-4">档案同步审核中</h2>
          <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-12">Awaiting Command Clearance...</p>
          <div className="flex justify-center mb-16">
            <TransitionLink href="/" className="group flex items-center gap-4 bg-black/40 px-8 py-4 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-blue-400 transition-colors">Safety Exit</span>
                <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回安全区</span>
              </div>
            </TransitionLink>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-10">
            <Link href="/contact" className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all text-sm tracking-widest">
              <span>联系舰长加速审核 ✅</span>
            </Link>
            <form action={revokeRecruitProfile}>
              <button type="submit" className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all text-sm tracking-widest">
                <span>撤销并重新填写档案 ↩</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  // ✅ 状态 3：正式指挥大屏
  return (
    <main className="min-h-screen py-16 px-8 xl:px-24 text-white relative flex flex-col gap-12">
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer-seamless { 0% { background-position: 200% center; } 100% { background-position: -200% center; } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes button-breathe { 0%, 100% { transform: scale(1); border-color: rgba(255,255,255,0.1); } 50% { transform: scale(1.02); border-color: rgba(59,130,246,0.5); } }
        @keyframes core-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(59,130,246,0.8); } 50% { transform: scale(1.3); box-shadow: 0 0 24px rgba(59,130,246,1); } }
        
        .hover-breathe:hover { animation: button-breathe 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
        .group:hover .group-hover-pulse { animation: core-pulse 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }

        .ios-scrollbar::-webkit-scrollbar { width: 5px; }
        .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ios-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          border: 1px solid transparent;
          background-clip: padding-box;
          transition: all 0.3s ease;
        }
        .ios-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.4); }
      `}} />

      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10 w-full">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.5em]">Sector: Command Center</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[0.08em] font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
            「一生一芯」·西科星际舰队
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
          <DashboardClock />

          <TransitionLink href="/" className="group hover-breathe flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] shrink-0">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors duration-500">
              <div className="w-3 h-3 rounded-full bg-blue-400 group-hover-pulse transition-all duration-500" />
              <div className="absolute inset-0 rounded-full border border-blue-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] transition-all duration-500" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-blue-400 transition-colors duration-500">Return Path</span>
              <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回导航站</span>
            </div>
          </TransitionLink>
        </div>
      </div>

      {/* ================= 模块 D & B：公告与日志 ================= */}
      <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-4">
        
        {/* 左侧：全舰公告大屏 */}
        <div className="lg:col-span-2 rounded-[3.5rem] border border-blue-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-[0_0_100px_rgba(59,130,246,0.1)] flex flex-col h-full">
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0a0d1a]/80 border border-blue-500/30 rounded-3xl p-6 lg:px-10 lg:py-6 mb-8 overflow-hidden shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]">
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(59,130,246,0.15),transparent)] bg-[length:200%_100%] animate-[shimmer-seamless_4s_linear_infinite] pointer-events-none"></div>
            
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                <span className="text-2xl animate-[pulse-slow_3s_infinite]">📢</span>
              </div>
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">全舰公告大屏</h2>
                <p className="text-blue-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Live Fleet-wide Broadcast</p>
              </div>
            </div>

            <div className="relative z-10">
              {isManager && <CreateBroadcastModal />}
            </div>
          </div>

          <div className="relative bg-[#02040a]/40 border border-white/5 rounded-[2rem] shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] overflow-hidden">
            <div className="flex flex-col gap-4 h-[420px] overflow-y-auto ios-scrollbar px-4 lg:px-8 pt-6 pb-24 relative z-10">
              {broadcasts.length > 0 ? (
                broadcasts.map(item => <BroadcastCard key={item.id} announcement={item} isManager={isManager} />)
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 font-mono tracking-widest italic">
                  <span className="text-4xl mb-4 opacity-20">📡</span>
                  <span>暂未接收到任何深空广播信号...</span>
                </div>
              )}
            </div>
            
            {broadcasts.length > 3 && (
              <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-[#060813] via-[#060813]/80 to-transparent pointer-events-none rounded-b-[2rem] z-20"></div>
            )}
          </div>
        </div>

        {/* 右侧：航行日志 */}
        <div className="lg:col-span-1 rounded-[3.5rem] border border-emerald-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-[0_0_100px_rgba(16,185,129,0.15)] flex flex-col h-full relative overflow-hidden group">
          <div className="absolute inset-0 bg-emerald-500/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          <FlightLogCalendar userRole={dbUser.role || "PENDING"} />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-8 mt-12">
        <div className="flex items-center gap-4 opacity-40 mb-2">
          <div className="h-px bg-white/20 flex-1"></div>
          <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-white">System Sub-Modules</span>
          <div className="h-px bg-white/20 flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          <ModuleCard 
            moduleId="Module B" 
            title="船员档案室" 
            subtitle="Starship Crew Database & Authorization" 
            icon="👥" 
            link="/dashboard/crew" 
            isActive={true} 
            theme="purple" 
          />
          <ModuleCard 
            moduleId="Module C" 
            title="跃迁集结" 
            subtitle="Fleet Attendance & Leave Requests" 
            icon="⏳" 
            link="/dashboard/attendance" 
            isActive={true} 
            theme="yellow" 
          />
        </div>
      </div>

      <div className="mt-16 flex justify-between items-center opacity-20 pointer-events-none border-t border-white/5 pt-8">
        <span className="text-[10px] font-mono tracking-[1em] uppercase">Tactical Overlay Active</span>
        <div className="flex gap-4">
          <div className="w-8 h-1 bg-white/40 rounded-full"></div>
          <div className="w-24 h-1 bg-blue-500/40 rounded-full"></div>
        </div>
        <span className="text-[10px] font-mono tracking-[1em] uppercase">Auth Level: {dbUser.role}</span>
      </div>

    </main>
  )
}