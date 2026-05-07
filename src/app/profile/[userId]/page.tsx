// src/app/profile/[userId]/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { BackButton } from "@/components/back-button"

export default async function PublicProfilePage({ 
  params 
}: { 
  params: Promise<{ userId: string }> 
}) {
  const { userId } = await params
  const session = await auth()
  
  // 如果查看的是自己的主页，跳转到可编辑的 profile 页面
  if (session?.user?.id === userId) {
    redirect("/profile")
  }

  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user) {
    notFound()
  }

  const role = user.role || "PENDING"

  const getRoleUI = (currentRole: string) => {
    switch (currentRole) {
      case "OWNER":
        return {
          wrapper: "border-2 border-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.2)]",
          icon: (
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(234,179,8,0.4)] relative">
              <div className="absolute inset-0 rounded-full border border-yellow-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <span className="text-2xl relative z-10">👑</span>
            </div>
          ),
          title: "舰长专属舱室",
          subtitle: "Supreme Commander / 最高裁决者",
          titleStyle: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200",
          subtitleStyle: "text-yellow-500/90",
          roleBadge: { label: "舰长", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/40" }
        };
      case "ADMIN":
        return {
          wrapper: "border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.15)]",
          icon: (
            <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 relative">
              <span className="text-xl relative z-10">⭐</span>
            </div>
          ),
          title: "管理员舱室",
          subtitle: "Fleet Administrator",
          titleStyle: "text-purple-100",
          subtitleStyle: "text-purple-400/60",
          roleBadge: { label: "管理员", color: "text-purple-400 bg-purple-500/20 border-purple-500/40" }
        };
      case "MEMBER":
        return {
          wrapper: "border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]",
          icon: (
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 relative">
              <span className="text-xl relative z-10">🛡️</span>
            </div>
          ),
          title: "标准船员舱",
          subtitle: "Verified Crew Member",
          titleStyle: "text-blue-100",
          subtitleStyle: "text-blue-400/60",
          roleBadge: { label: "船员", color: "text-blue-400 bg-blue-500/20 border-blue-500/40" }
        };
      default:
        return {
          wrapper: "border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]",
          icon: (
             <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4 opacity-50">👤</div>
          ),
          title: "临时访客舱",
          subtitle: "Awaiting Clearance",
          titleStyle: "text-zinc-300",
          subtitleStyle: "text-zinc-500",
          roleBadge: { label: "待审核", color: "text-zinc-400 bg-zinc-500/20 border-zinc-500/40" }
        };
    }
  };

  const ui = getRoleUI(role)

  // 获取显示信息（优先使用档案室字段）
  const displayName = user.crewNickname || user.nickname || user.realName || user.name || "未知用户"
  const displayAvatar = user.customAvatar || user.image
  const displayStudentId = user.crewStudentId || user.studentId
  const displayFeishuLink = user.crewFeishuLink || user.feishuLink

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:p-10 sm:pt-24 md:pt-10 flex flex-col items-center justify-center relative overflow-x-hidden">
      
      {/* Apple 风格弹簧动画 */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes apple-spring-entry {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(40px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-apple-spring {
          animation: apple-spring-entry 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      {/* 返回按钮 */}
      <div className="absolute top-6 left-4 sm:top-10 sm:left-10 z-50">
        <BackButton />
      </div>

      {/* 卡片容器 */}
      <div className="max-w-md w-full relative z-10 animate-apple-spring opacity-0">
        
        <div className={`relative bg-[#0a0a0c]/80 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl transition-all duration-700 ${ui.wrapper}`}>
          <div className="flex flex-col items-center mb-6 border-b border-white/5 pb-6">
             {ui.icon}
             <h2 className={`text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space)] tracking-widest text-center mt-2 ${ui.titleStyle}`}>
               {ui.title}
             </h2>
             <p className={`text-[10px] uppercase tracking-[0.3em] mt-3 font-mono text-center font-bold ${ui.subtitleStyle}`}>
               {ui.subtitle}
             </p>
          </div>
          
          {/* 用户信息展示（只读） */}
          <div className="space-y-6">
            {/* 头像 */}
            <div className="flex justify-center">
              <div className="relative">
                {displayAvatar ? (
                  <img 
                    src={displayAvatar} 
                    alt={displayName} 
                    className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border-2 border-white/20 flex items-center justify-center">
                    <span className="text-3xl text-zinc-400">{displayName.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {/* 角色徽章 */}
                {ui.roleBadge && (
                  <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] font-bold rounded-full border ${ui.roleBadge.color}`}>
                    {ui.roleBadge.label}
                  </span>
                )}
              </div>
            </div>

            {/* 昵称 */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-1">{displayName}</h3>
              {user.githubName && (
                <p className="text-xs text-zinc-500 font-mono">@{user.githubName}</p>
              )}
            </div>

            {/* 信息列表 */}
            <div className="space-y-3">
              {displayStudentId && (
                <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">学号</p>
                    <p className="text-sm text-zinc-200 font-mono">{displayStudentId}</p>
                  </div>
                </div>
              )}

              {displayFeishuLink && (
                <a 
                  href={displayFeishuLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-teal-500/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.8)]"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">飞书链接</p>
                    <p className="text-sm text-teal-400 group-hover:text-teal-300 transition-colors">点击访问</p>
                  </div>
                  <svg className="w-4 h-4 text-zinc-500 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}

              {/* 加入时间 */}
              <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10">
                <div className="w-8 h-8 rounded-lg bg-zinc-500/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">加入时间</p>
                  <p className="text-sm text-zinc-200">{new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </main>
  )
}
