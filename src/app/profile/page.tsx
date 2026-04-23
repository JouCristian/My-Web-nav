// src/app/profile/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!dbUser) redirect("/login")

  const role = dbUser.role || "PENDING";

  async function updateProfile(formData: FormData) {
    "use server"
    const session = await auth()
    if (!session?.user?.email) return

    const nickname = formData.get("nickname") as string
    const avatar = formData.get("avatar") as string 
    
    await prisma.user.update({
      where: { email: session.user.email },
      data: { nickname, customAvatar: avatar }
    })

    revalidatePath("/profile")
    revalidatePath("/")
  }

  // 🚀 核心：根据不同军衔动态生成专属 UI 风格配置
  const getRoleUI = (currentRole: string) => {
    switch (currentRole) {
      case "OWNER":
        return {
          wrapper: "border-2 border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)]",
          glow: "bg-yellow-500/15",
          icon: (
            <div className="w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(234,179,8,0.4)] relative">
              <div className="absolute inset-0 rounded-full border border-yellow-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <span className="text-2xl">👑</span>
            </div>
          ),
          title: "舰长专属舱室",
          subtitle: "Supreme Commander / 最高裁决者",
          titleStyle: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200",
          subtitleStyle: "text-yellow-500/80"
        };
      case "ADMIN":
        return {
          wrapper: "border border-purple-500/40 shadow-[0_0_40px_rgba(168,85,247,0.15)]",
          glow: "bg-purple-500/15",
          icon: (
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <span className="text-2xl">🔮</span>
            </div>
          ),
          title: "领航员指挥台",
          subtitle: "Navigation Control / 舰队管理组",
          titleStyle: "text-purple-300",
          subtitleStyle: "text-purple-400/80"
        };
      case "MEMBER":
        return {
          wrapper: "border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]",
          glow: "bg-blue-500/10",
          icon: (
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
              <span className="text-xl">🛡️</span>
            </div>
          ),
          title: "标准船员舱",
          subtitle: "Verified Crew Member / 注册船员",
          titleStyle: "text-blue-100",
          subtitleStyle: "text-blue-400/60"
        };
      case "PENDING":
      default:
        return {
          wrapper: "border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]",
          glow: "bg-white/5",
          icon: (
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-600 flex items-center justify-center mb-4 opacity-50">
              <span className="text-lg">👤</span>
            </div>
          ),
          title: "临时访客舱",
          subtitle: "Awaiting Clearance / 新兵或未核准人员",
          titleStyle: "text-zinc-300",
          subtitleStyle: "text-zinc-500"
        };
    }
  };

  const roleUI = getRoleUI(role);

  return (
    <main className="min-h-screen p-10 flex flex-col items-center bg-[#020205] relative overflow-hidden">
      
      {/* 动态全屏背景光晕 */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] blur-[120px] rounded-full pointer-events-none opacity-50 ${roleUI.glow}`}></div>

      <div className="max-w-xl w-full relative z-10">
        
        {/* 返回导航按钮 */}
        <div className="flex justify-end mb-8">
          <Link href="/" className="group flex items-center gap-4 bg-black/40 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/10 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
            </div>
            
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-blue-400 transition-colors">
                Return Path
              </span>
              <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
                返回导航站
              </span>
            </div>
          </Link>
        </div>

        {/* 🚀 身份专属大卡片 */}
        <div className={`relative bg-[#0a0a0c]/80 p-8 rounded-[2.5rem] backdrop-blur-xl overflow-hidden animate-flame-active transition-all duration-500 ${roleUI.wrapper}`}>
          
          {/* 卡片内部顶部环境光 */}
          <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 blur-[80px] rounded-full pointer-events-none ${roleUI.glow}`}></div>

          <div className="flex flex-col items-center mb-8 relative z-10 border-b border-white/5 pb-8">
             {roleUI.icon}
             <h2 className={`text-3xl font-bold font-[family-name:var(--font-space)] tracking-widest text-center ${roleUI.titleStyle}`}>
               {roleUI.title}
             </h2>
             <p className={`text-[10px] uppercase tracking-[0.3em] mt-3 font-mono text-center ${roleUI.subtitleStyle}`}>
               {roleUI.subtitle}
             </p>
          </div>
          
          <div className="relative z-10">
            <ProfileForm user={dbUser} onUpdate={updateProfile} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 relative z-10">
            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-mono">
              Starbase Profile System v2.0 • Security Level: {role}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}