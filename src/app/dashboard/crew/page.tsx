// src/app/dashboard/crew/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CrewActionButtons } from "@/components/crew-action-buttons"
import { RemoveCrewButton } from "@/components/remove-crew-button"
// 🚀 引入舰长专属授权组件
import { AdminAuthModal } from "@/components/admin-auth-modal"
// 🚀 引入编辑档案组件
import { EditCrewProfileButton } from "@/components/edit-crew-profile-button"

export default async function CrewArchivesPage() {
  const session = await auth()
  // 🚀 核心修复：改用 id 验证
  if (!session?.user?.id) redirect("/login")

  const allUsers = await prisma.user.findMany()

  const validUsers = allUsers.filter((user: any) => {
    if (user.role === "PENDING") {
      return user.realName !== null && user.studentId !== null;
    }
    return true; 
  })

  const roleWeight: Record<string, number> = { OWNER: 4, ADMIN: 3, MEMBER: 2, PENDING: 1 }
  const sortedUsers = validUsers.sort((a: any, b: any) => {
    const weightA = roleWeight[a.role as string] || 0
    const weightB = roleWeight[b.role as string] || 0
    if (weightA !== weightB) return weightB - weightA
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  // 🚀 核心修复：改用物理 ID 在内存中定位当前操作者
  const dbUser: any = allUsers.find(u => u.id === session.user?.id)
  const isManager = dbUser?.role === "OWNER" || dbUser?.role === "ADMIN"

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:p-6 md:p-10 sm:pt-24 md:pt-10 text-white relative overflow-x-hidden">
      {/* 🚀 注入全舰统一的交互引擎样式：修改为仅 Hover 触发的非线性动画 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        
        @keyframes button-breathe {
          0%, 100% { transform: scale(1); border-color: rgba(255, 255, 255, 0.1); }
          50% { transform: scale(1.02); border-color: rgba(168, 85, 247, 0.5); }
        }

        @keyframes core-pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(168, 85, 247, 0.8); }
          50% { transform: scale(1.3); box-shadow: 0 0 24px rgba(168, 85, 247, 1); }
        }

        /* 核心改动：绑定 Hover 状态，注入贝塞尔弹性曲线 */
        .hover-breathe:hover {
          animation: button-breathe 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }

        .group:hover .group-hover-pulse {
          animation: core-pulse 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
        }
      `}} />

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 border-b border-white/10 pb-5 sm:pb-6 gap-5 sm:gap-6">
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <h2 className="text-xs sm:text-sm font-bold tracking-[0.2em] sm:tracking-[0.3em] font-mono text-blue-400 uppercase">Module B</h2>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[0.15em] sm:tracking-[0.2em] font-[family-name:var(--font-space)] text-white">船员档案室</h1>
          </div>
          
          <div className="flex flex-wrap gap-3 sm:gap-4 w-full md:w-auto">
            {/* 🚀 仅当角色为最高指挥官 (OWNER) 时，才渲染此金色控制终端 */}
            {dbUser?.role === "OWNER" && (
              <AdminAuthModal users={allUsers} />
            )}

            <Link href="/dashboard" className="group hover-breathe flex items-center gap-3 sm:gap-4 bg-black/60 px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-purple-500/20 transition-all duration-500 overflow-hidden">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-400 group-hover-pulse transition-all duration-500" />
                <div className="absolute inset-0 rounded-full border border-purple-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] transition-all duration-500" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-mono group-hover:text-purple-400 transition-colors duration-500">Return</span>
                <span className="text-base font-bold text-white tracking-[0.15em] font-[family-name:var(--font-space)]">返回中枢</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {sortedUsers.map((user: any) => {
            const isOwner = user.role === "OWNER";
            const isAdmin = user.role === "ADMIN";
            const isPending = user.role === "PENDING";
            // 🚀 核心修复：改用物理 ID 进行自识别判断
            const isSelf = session.user?.id === user.id;
            
            const roleStyles = isOwner 
              ? "border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-500/60 hover:shadow-[0_0_50px_-10px_rgba(234,179,8,0.2)]" 
              : isAdmin 
              ? "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/60 hover:shadow-[0_0_50px_-10px_rgba(168,85,247,0.2)]" 
              : "border-white/5 bg-black/40 hover:border-blue-500/40 hover:shadow-[0_0_50px_-10px_rgba(59,130,246,0.2)]";
            
            const avatarFallback = user.customAvatar || user.image || user.avatarUrl || "https://github.com/ghost.png";

            return (
              <div 
                key={user.id} 
                className={`group relative flex flex-col md:flex-row items-start md:items-center justify-between p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-[1.015] gap-4 ${roleStyles}`}
              >
                <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto min-w-0">
                  <Link href={`/profile/${user.id}`} className="relative shrink-0 cursor-pointer hover:opacity-80 transition-opacity">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 overflow-hidden transition-transform duration-700 group-hover:rotate-[360deg] ${isOwner ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : isAdmin ? 'border-purple-500' : 'border-zinc-700'}`}>
                      <img src={avatarFallback} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    {isOwner && <div className="absolute -top-3 -right-3 text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(234,179,8,1)] animate-bounce">👑</div>}
                    {isAdmin && <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-purple-600 rounded-full border-2 border-black flex items-center justify-center text-[9px] sm:text-[10px]">⭐</div>}
                  </Link>
                  
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap">
                      {/* 🚀 优先使用档案室专用昵称，否则使用原字段 */}
                      <span className={`text-base sm:text-xl font-bold tracking-wider font-[family-name:var(--font-space)] truncate ${isOwner ? 'text-yellow-400' : isAdmin ? 'text-purple-300' : 'text-zinc-200'}`}>
                        {user.crewNickname || user.realName || user.nickname || "未知宇航员"}
                      </span>
                      {/* 🚀 优先使用档案室专用学号 */}
                      {(user.crewStudentId || user.studentId) && (
                        <span className="text-[10px] font-mono text-zinc-500 tracking-[0.15em] sm:tracking-[0.2em] border border-white/5 bg-white/5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shrink-0">
                          ID: {user.crewStudentId || user.studentId}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 opacity-50">
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-zinc-500 shrink-0"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                      <span className="text-[11px] text-zinc-500 font-mono tracking-tighter truncate">{user.githubName || user.name || "Unknown"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-6 self-stretch md:self-auto w-full md:w-auto justify-between md:justify-end flex-wrap md:flex-nowrap">
                  {isManager && isPending ? (
                    <CrewActionButtons userId={user.id} realName={user.realName || "未知新兵"} />
                  ) : (
                    <div className="flex items-center gap-3 sm:gap-6 md:gap-8 flex-wrap md:flex-nowrap w-full md:w-auto justify-between md:justify-end">
                      {/* 🚀 优先使用档案室专用飞书链接 */}
                        {!isPending && (() => {
                          const effectiveFeishuLink = user.crewFeishuLink || user.feishuLink;
                          return effectiveFeishuLink ? (
                            <a 
                              href={effectiveFeishuLink} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="group/fs relative flex items-center gap-2 sm:gap-3 bg-[#060813]/60 border border-teal-500/30 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shrink-0 overflow-hidden transition-all duration-500 hover:border-teal-500 hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/10 to-transparent -translate-x-full group-hover/fs:animate-[shimmer_2s_infinite]"></div>
                              <div className="relative flex items-center gap-2 sm:gap-3">
                                <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)] animate-pulse shrink-0"></div>
                                <span className="text-[9px] sm:text-[10px] text-teal-300 font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">飞书链接就绪</span>
                              </div>
                            </a>
                          ) : (
                            isSelf ? (
                              <div className="group/fs relative flex items-center gap-2 sm:gap-3 bg-[#060813]/60 border border-red-500/30 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shrink-0 overflow-hidden">
                                <div className="relative flex items-center gap-2 sm:gap-3">
                                  <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-ping shrink-0"></div>
                                  <span className="text-[9px] sm:text-[10px] text-red-400 font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">缺失飞书链接</span>
                                </div>
                              </div>
                            ) : (
                              <div className="relative flex items-center gap-2 sm:gap-3 bg-[#060813]/40 border border-red-500/10 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl shrink-0 opacity-40">
                                <div className="w-2 h-2 rounded-full bg-red-500/50 shadow-[0_0_5px_rgba(239,68,68,0.3)] shrink-0"></div>
                                <span className="text-[9px] sm:text-[10px] text-red-400/60 font-mono uppercase tracking-[0.15em] sm:tracking-[0.2em] font-bold">飞书链接缺失</span>
                              </div>
                            )
                          );
                        })()}
                        
                        {/* 🚀 自己可以编辑自己的档案室信息 */}
                        {!isPending && isSelf && (
                          <EditCrewProfileButton 
                            currentData={{
                              crewNickname: user.crewNickname,
                              crewStudentId: user.crewStudentId,
                              crewFeishuLink: user.crewFeishuLink,
                              realName: user.realName,
                              studentId: user.studentId,
                              feishuLink: user.feishuLink,
                            }}
                          />
                        )}
                      
                      <div className="flex flex-col items-end sm:border-l border-white/10 sm:pl-4 md:pl-6">
                        <span className="text-[9px] uppercase font-mono tracking-[0.3em] text-zinc-600 mb-1">Authorization</span>
                        <span className={`text-[11px] font-bold tracking-[0.2em] uppercase ${isOwner ? 'text-yellow-500' : isAdmin ? 'text-purple-400' : 'text-emerald-400'}`}>
                          {user.role}
                        </span>
                      </div>

                      {isManager && !isSelf && !isOwner && !isPending && (
                        <div className="sm:border-l border-white/10 sm:pl-4 md:pl-6 flex items-center">
                          <RemoveCrewButton userId={user.id} realName={user.realName || user.nickname || "未知宇航员"} />
                        </div>
                      )}
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
