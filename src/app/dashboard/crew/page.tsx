// src/app/dashboard/crew/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

export default async function CrewArchivesPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  // 获取所有船员数据
  const users = await prisma.user.findMany()

  // 🚀 核心逻辑：白皮书严格排版序位 
  // 权重：OWNER(4) > ADMIN(3) > MEMBER(2) > PENDING(1)
  const roleWeight: Record<string, number> = { OWNER: 4, ADMIN: 3, MEMBER: 2, PENDING: 1 }
  
  const sortedUsers = users.sort((a, b) => {
    // 1. 先按军衔权重排序 (降序)
    if (roleWeight[a.role] !== roleWeight[b.role]) {
      return roleWeight[b.role] - roleWeight[a.role]
    }
    // 2. 军衔相同时，按加入时间先后排序 (升序，老人在前)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // 获取当前操作者身份，用于控制是否显示“手动录入”等特权按钮
  const dbUser = users.find(u => u.email === session.user?.email)
  const isManager = dbUser?.role === "OWNER" || dbUser?.role === "ADMIN"

  return (
    <main className="min-h-screen bg-[#020205] p-6 md:p-10 text-white relative overflow-hidden">
      
      {/* 背景光晕 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* 顶部导航区 */}
        <div className="flex justify-between items-end mb-10 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <h2 className="text-sm font-bold tracking-[0.3em] font-mono text-blue-400 uppercase">
                Module B
              </h2>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] font-[family-name:var(--font-space)] text-white">
              船员档案室
            </h1>
          </div>
          
          <div className="flex gap-4">
            {isManager && (
              <button className="px-5 py-2 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all font-mono text-sm tracking-widest hidden md:block">
                + 强行建档 (待开发)
              </button>
            )}
            <Link href="/dashboard" className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors font-mono text-sm tracking-widest">
              返回中枢
            </Link>
          </div>
        </div>

        {/* 舰队花名册列表 */}
        <div className="space-y-4">
          {sortedUsers.map((user) => {
            const isOwner = user.role === "OWNER";
            const isAdmin = user.role === "ADMIN";
            const isPending = user.role === "PENDING";
            
            // 样式分发
            const roleBorder = isOwner ? "border-yellow-500/40 bg-yellow-500/5" : 
                               isAdmin ? "border-purple-500/40 bg-purple-500/5" : 
                               "border-white/5 bg-black/40";
            
            const avatarFallback = user.customAvatar || user.image || user.avatarUrl || "https://github.com/ghost.png";

            return (
              <div key={user.id} className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-5 rounded-2xl border backdrop-blur-md transition-all hover:border-white/20 ${roleBorder}`}>
                
                {/* 左侧：头像与核心身份  */}
                <div className="flex items-center gap-5 w-full md:w-auto">
                  
                  {/* 头像区 */}
                  <div className="relative shrink-0">
                    <div className={`w-14 h-14 rounded-full border-2 overflow-hidden ${isOwner ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : isAdmin ? 'border-purple-500' : 'border-zinc-700'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={avatarFallback} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    {isOwner && (
                      <div className="absolute -top-3 -right-3 text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,1)] animate-bounce">👑</div>
                    )}
                    {isAdmin && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full border border-black flex items-center justify-center text-[10px]">⭐</div>
                    )}
                  </div>

                  {/* 信息区 */}
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-3">
                      <span className={`text-lg font-bold tracking-wider font-[family-name:var(--font-space)] ${isOwner ? 'text-yellow-400' : isAdmin ? 'text-purple-300' : 'text-zinc-200'}`}>
                        {user.realName || user.nickname || "未知宇航员"}
                      </span>
                      {user.studentId && (
                        <span className="text-xs font-mono text-zinc-500 tracking-widest border border-zinc-700 px-2 py-0.5 rounded-md">
                          ID: {user.studentId}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1.5">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2" fill="none" className="text-zinc-500"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {user.githubName || user.email?.split('@')[0] || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 右侧：状态指示灯与飞书警告  */}
                <div className="mt-4 md:mt-0 flex items-center gap-6 self-end md:self-auto w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  
                  {/* 飞书红灯警告逻辑：正式成员或管理员如果没填飞书 */}
                  {!user.feishuLink && !isPending && !isOwner && (
                    <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg shrink-0">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                      <span className="text-[10px] text-red-400 font-mono uppercase tracking-wider">缺失通讯链</span>
                    </div>
                  )}

                  <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 mb-1">Status</span>
                    {isPending ? (
                      <span className="text-xs text-blue-400 font-bold tracking-widest flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                        待核准
                      </span>
                    ) : (
                      <span className={`text-xs font-bold tracking-widest uppercase ${isOwner ? 'text-yellow-500' : isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  )
}