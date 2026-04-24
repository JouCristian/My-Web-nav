// src/app/dashboard/pending/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revokeRecruitProfile } from "@/app/actions"
import Link from "next/link"

export default async function PendingPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email }
  })

  if (!dbUser) redirect("/")

  // @ts-ignore
  const isCaptain = session.user.isCaptain;

  // 安全校验：如果已经是舰长，或者已经不是 PENDING 状态了，踢回大屏
  if (isCaptain || dbUser.role !== "PENDING") {
    redirect("/dashboard")
  }

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

        <h2 className="text-3xl font-bold text-white tracking-[0.2em] font-[family-name:var(--font-space)] mb-4">
          档案同步审核中
        </h2>
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase mb-12">
          Awaiting Command Clearance...
        </p>

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