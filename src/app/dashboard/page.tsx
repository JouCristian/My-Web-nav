// src/app/dashboard/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { updateRecruitProfile } from "@/app/actions"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  
  // 如果连基础登录都没有，直接踢回首页
  if (!session?.user?.email) {
    redirect("/")
  }

  // 获取该用户的最新数据库完整状态
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!dbUser) redirect("/")

  // 🎯 拦截器核心判断逻辑
  // 1. 判断是否缺失必填档案 
  const isProfileIncomplete = !dbUser.realName || !dbUser.studentId;
  // 2. 舰长特权直通车：无视一切拦截 [cite: 17, 18]
  // @ts-ignore
  const isCaptain = session.user.isCaptain;

  // ==========================================
  // 🚨 状态 1：新兵无档案，触发强制录入防爆门 
  // ==========================================
  if (!isCaptain && isProfileIncomplete) {
    return (
      <main className="min-h-screen bg-[#020205] flex items-center justify-center p-6 relative overflow-hidden">
        {/* 红色警报背景光晕 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none animate-pulse"></div>
        
        <div className="relative z-10 w-full max-w-lg bg-black/60 border border-red-500/30 p-8 md:p-10 rounded-[2.5rem] backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          
          <div className="flex items-center gap-4 mb-8 border-b border-red-500/20 pb-6">
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-widest font-[family-name:var(--font-space)]">新兵档案录入</h1>
              <p className="text-red-400/80 text-sm font-mono mt-1 uppercase tracking-widest">Access Restricted / 准入受限</p>
            </div>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed mb-8">
            检测到您的星际档案缺失核心信息。在进入「一生一芯」指挥中枢前，必须录入您的真实身份标识。
          </p>

          <form action={updateRecruitProfile} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">真实姓名 / Real Name <span className="text-red-500">*</span></label>
              <input type="text" name="realName" required placeholder="请输入您的真实姓名" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 transition-all text-white placeholder:text-zinc-700" />
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">学号 / Student ID <span className="text-red-500">*</span></label>
              <input type="text" name="studentId" required placeholder="请输入您的学号" className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 transition-all text-white placeholder:text-zinc-700" />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">飞书链接 / Feishu Link (可选)</label>
              <input type="url" name="feishuLink" placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 transition-all text-white placeholder:text-zinc-700" />
            </div>

            <button type="submit" className="w-full mt-6 bg-red-500/20 border border-red-500/50 text-red-400 font-bold py-4 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-[0.98] tracking-widest">
              提交建档申请
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-zinc-600 text-xs hover:text-zinc-400 transition-colors font-mono uppercase tracking-widest">
              ← 返回安全区 (Home)
            </Link>
          </div>
        </div>
      </main>
    )
  }

  // ==========================================
  // ⏳ 状态 2：档案已提交，等待领航员核准 
  // ==========================================
  if (!isCaptain && dbUser.role === "PENDING") {
    return (
      <main className="min-h-screen bg-[#020205] flex items-center justify-center p-6 relative">
        <div className="text-center animate-pulse">
          <div className="w-20 h-20 border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent rounded-full animate-spin mx-auto mb-6 opacity-50"></div>
          <h2 className="text-2xl font-bold text-white tracking-widest font-[family-name:var(--font-space)] mb-3">您的新兵档案正在等待核准</h2>
          <p className="text-zinc-500 font-mono text-sm">Awaiting clearance from Command Group...</p>
          <Link href="/" className="inline-block mt-8 text-blue-400/60 hover:text-blue-400 text-sm font-mono tracking-widest transition-colors">
            返回安全区
          </Link>
        </div>
      </main>
    )
  }

  // ==========================================
  // ✅ 状态 3：已核准放行 / 舰长直通车 [cite: 21, 22]
  // ==========================================
  return (
    <main className="min-h-screen p-10 text-white max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] text-blue-400">指挥中枢大屏</h1>
          <p className="text-zinc-500 mt-2 font-mono text-sm tracking-wider">Module: Dashboard Alpha / 身份: {isCaptain ? "最高裁决者 (OWNER)" : "已核准船员"}</p>
        </div>
        <Link href="/" className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-mono text-sm">
          返回主站
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 这里先放占位符，后续我们逐一开发 Module A 到 E */}
        <div className="h-64 rounded-3xl border border-white/10 bg-black/40 p-6 flex items-center justify-center text-zinc-600 font-mono">Module A: 公告大屏 (待装载)</div>
        <div className="h-64 rounded-3xl border border-white/10 bg-black/40 p-6 flex items-center justify-center text-zinc-600 font-mono">Module B: 船员档案 (待装载)</div>
        <div className="h-64 rounded-3xl border border-white/10 bg-black/40 p-6 flex items-center justify-center text-zinc-600 font-mono">Module C: 跃迁集结 (待装载)</div>
      </div>
    </main>
  )
}