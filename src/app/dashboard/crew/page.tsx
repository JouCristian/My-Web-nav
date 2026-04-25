// src/app/dashboard/crew/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CrewActionButtons } from "@/components/crew-action-buttons"

export default async function CrewArchivesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const allUsers = await prisma.user.findMany()

  // 只有填了姓名学号的人才会出现在档案室 [cite: 17]
  const validUsers = allUsers.filter((user: any) => {
    if (user.role === "PENDING") {
      return user.realName !== null && user.studentId !== null;
    }
    return true; 
  })

  // 排序权重：OWNER(4) > ADMIN(3) > MEMBER(2) > PENDING(1) [cite: 24, 30]
  const roleWeight: Record<string, number> = { OWNER: 4, ADMIN: 3, MEMBER: 2, PENDING: 1 }
  const sortedUsers = validUsers.sort((a: any, b: any) => {
    const weightA = roleWeight[a.role as string] || 0
    const weightB = roleWeight[b.role as string] || 0
    if (weightA !== weightB) return weightB - weightA
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  const dbUser: any = allUsers.find(u => u.email === session.user?.email)
  const isManager = dbUser?.role === "OWNER" || dbUser?.role === "ADMIN"

  return (
    <main className="min-h-screen bg-transparent p-6 md:p-10 text-white relative overflow-hidden">
      {/* 注入全局能量流光动画 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}} />

      {/* 顶部环境光 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-6 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <h2 className="text-sm font-bold tracking-[0.3em] font-mono text-blue-400 uppercase">Module B</h2>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] text-white">船员档案室</h1>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Link href="/dashboard" className="group flex items-center gap-3 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md hover:border-purple-500/30 transition-all active:scale-95">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-purple-500/20 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_12px_rgba(192,132,252,0.8)]" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-purple-400 transition-colors">Return</span>
                <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回中枢</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          {sortedUsers.map((user: any) => {
            const isOwner = user.role === "OWNER";
            const isAdmin = user.role === "ADMIN";
            const isPending = user.role === "PENDING";
            
            const roleStyles = isOwner 
              ? "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60 hover:shadow-[0_0_50px_-10px_rgba(234,179,8,0.2)]" 
              : isAdmin 
              ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]" 
              : "border-white/5 bg-black/40 hover:border-blue-500/40 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.2)]";
            
            const avatarFallback = user.customAvatar || user.image || user.avatarUrl || "https://github.com/ghost.png";

            return (
              <div 
                key={user.id} 
                className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-[2rem] border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.015] active:scale-[0.995] ${roleStyles}`}
              >
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="relative shrink-0">
                    <div className={`w-16 h-16 rounded-full border-2 overflow-hidden transition-transform duration-700 group-hover:rotate-[360deg] ${isOwner ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : isAdmin ? 'border-purple-500' : 'border-zinc-700'}`}>
                      <img src={avatarFallback} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    {isOwner && <div className="absolute -top-3 -right-3 text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,1)] animate-bounce">👑</div>}
                    {isAdmin && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-600 rounded-full border-2 border-black flex items-center justify-center text-[10px]">⭐</div>}
                  </div>
                  
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-4">
                      <span className={`text-xl font-bold tracking-wider font-[family-name:var(--font-space)] ${isOwner ? 'text-yellow-400' : isAdmin ? 'text-purple-300' : 'text-zinc-200'}`}>
                        {user.realName || user.nickname || "未知宇航员"}
                      </span>
                      {user.studentId && (
                        <span className="text-[10px] font-mono text-zinc-500 tracking-[0.2em] border border-white/5 bg-white/5 px-2.5 py-1 rounded-lg">
                          ID: {user.studentId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 opacity-50 group-hover:opacity-100 transition-opacity">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-zinc-500"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      <span className="text-[11px] text-zinc-500 font-mono tracking-tighter">{user.githubName || user.email?.split('@')[0] || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 md:mt-0 flex items-center gap-6 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
                  {isManager && isPending ? (
                    <CrewActionButtons userId={user.id} realName={user.realName || "未知新兵"} />
                  ) : (
                    <div className="flex items-center gap-8">
                      {!isPending && (
                        user.feishuLink ? (
                          <a 
                            href={user.feishuLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="group/fs relative flex items-center gap-3 bg-[#060813]/60 border border-teal-500/30 px-5 py-2.5 rounded-xl shrink-0 overflow-hidden transition-all duration-500 hover:border-teal-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent -translate-x-full group-hover/fs:animate-[shimmer_2s_infinite]"></div>
                            <div className="relative flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse"></div>
                              <span className="text-[10px] text-teal-300 font-mono uppercase tracking-[0.2em] font-bold">飞书学习链接就绪 点击查看</span>
                            </div>
                          </a>
                        ) : (
                          /* 🚀 升级版：缺失通讯链按钮 - 接入能量流光并支持点击跳转 */
                          <Link 
                            href="/profile" 
                            className="group/fs relative flex items-center gap-3 bg-[#060813]/60 border border-red-500/30 px-5 py-2.5 rounded-xl shrink-0 overflow-hidden transition-all duration-500 hover:border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                          >
                            {/* 红色能量流光 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/10 to-transparent -translate-x-full group-hover/fs:animate-[shimmer_2s_infinite]"></div>
                            
                            <div className="relative flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping"></div>
                              <span className="text-[10px] text-red-400 font-mono uppercase tracking-[0.2em] font-bold text-center">
                                飞书学习链接缺失 前往添加
                              </span>
                            </div>
                          </Link>
                        )
                      )}
                      <div className="flex flex-col items-end border-l border-white/10 pl-6">
                        <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-zinc-600 mb-1">Authorization</span>
                        <span className={`text-[11px] font-bold tracking-[0.2em] uppercase ${isOwner ? 'text-yellow-500' : isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  )
}