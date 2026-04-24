// src/app/dashboard/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { updateRecruitProfile, revokeRecruitProfile } from "@/app/actions"
import Link from "next/link"

const ModuleCard = ({ moduleId, title, subtitle, icon, link, isActive }: {
  moduleId: string; title: string; subtitle: string; icon: string; link: string; isActive: boolean;
}) => {
  return (
    <Link 
      href={isActive ? link : "#"} 
      className={`group relative h-80 rounded-[3rem] border border-purple-500/20 bg-[#06060a]/95 p-10 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:border-purple-500/60 active:scale-[0.97] ${isActive ? 'animate-module-card shadow-[0_0_40px_rgba(168,85,247,0.05)]' : 'opacity-60 grayscale'}`}
    >
      <div className="absolute inset-0 animate-purple-flow opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/10 blur-[60px] rounded-full group-hover:bg-purple-500/25 transition-all duration-700"></div>
      <div className="relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 text-3xl shadow-[0_0_20px_rgba(168,85,247,0.1)] group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-white tracking-[0.15em] font-[family-name:var(--font-space)] mb-3">{title}</h3>
        <p className="text-sm text-purple-200/40 font-mono tracking-widest leading-relaxed">{subtitle}</p>
      </div>
      <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-purple-400/40 uppercase tracking-[0.3em] border-t border-white/5 pt-6">
        <span>{moduleId}</span>
        <span className={`flex items-center gap-2 transition-all duration-500 ${isActive ? 'text-purple-400 group-hover:gap-4' : 'text-zinc-700'}`}>
          {isActive ? 'Authorize Access' : 'System Locked'}
          <span className="text-lg">➔</span>
        </span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })
  if (!dbUser) redirect("/")

  // @ts-ignore
  const isCaptain = session.user.isCaptain;
  const isProfileIncomplete = !dbUser.realName || !dbUser.studentId;

  // ==========================================
  // 🚨 拦截器：状态 1 (新兵无档案，防爆门拦截)
  // ==========================================
  if (!isCaptain && isProfileIncomplete) {
    return (
      <main className="min-h-screen bg-[#020205] flex items-center justify-center p-6">
        <div className="relative z-10 w-full max-w-lg bg-[#06060a]/95 border border-red-500/30 p-10 rounded-[2.5rem] backdrop-blur-xl animate-flame-active">
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
      </main>
    )
  }

  // ==========================================
  // ⏳ 拦截器：状态 2 (档案审核中：量子审核舱 UI)
  // ==========================================
  if (!isCaptain && dbUser.role === "PENDING") {
    return (
      <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-blue-500/5 -rotate-12 blur-[120px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-2xl bg-[#06060a]/90 border border-blue-500/20 p-10 md:p-16 rounded-[3.5rem] backdrop-blur-2xl shadow-[0_0_80px_rgba(59,130,246,0.1)] text-center animate-module-card">
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
            <Link href="/" className="group flex items-center gap-4 bg-black/40 px-8 py-4 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors">
                <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-blue-400 transition-colors">Safety Exit</span>
                <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回安全区</span>
              </div>
            </Link>
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

  // ==========================================
  // ✅ 状态 3：大气场指挥中枢大屏
  // ==========================================
  return (
    <main className="min-h-screen p-12 md:p-20 text-white max-w-7xl mx-auto flex flex-col gap-16 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/10 pb-12">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.5em]">Sector: Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-[0.1em] font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
            星际舰队指挥大屏
          </h1>
        </div>

        <Link href="/" className="group flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors">
            <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-blue-400 transition-colors">Return Path</span>
            <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回导航站</span>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <ModuleCard moduleId="Module A" title="公告大屏" subtitle="Fleet-wide Broadcast System" icon="📢" link="/dashboard/board" isActive={false} />
        <ModuleCard moduleId="Module B" title="船员档案室" subtitle="Starship Crew Database" icon="👥" link="/dashboard/crew" isActive={true} />
        <ModuleCard moduleId="Module C" title="跃迁集结" subtitle="Attendance & Leave Requests" icon="⏳" link="/dashboard/attendance" isActive={false} />
      </div>

      <div className="mt-auto flex justify-between items-center opacity-20 pointer-events-none border-t border-white/5 pt-8">
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