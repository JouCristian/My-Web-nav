// src/app/profile/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { TransitionLink } from "@/components/transition-link"
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
    const feishuLink = formData.get("feishuLink") as string
    // 🚀 新增：抓取表单中提交的学号
    const studentId = formData.get("studentId") as string
    
    // 构建更新数据载荷
    const updateData: any = { nickname, customAvatar: avatar, feishuLink }
    
    // 只有非空的时候才更新学号 (防止非船员角色意外覆盖数据)
    if (studentId !== null && studentId !== undefined) {
      updateData.studentId = studentId
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: updateData
    })

    revalidatePath("/profile")
    revalidatePath("/")
  }

  // 🛡️ 军衔 UI 配置
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
        };
      case "ADMIN":
        return {
          wrapper: "border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]",
          icon: (
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/40 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(168,85,247,0.3)] relative">
              <div className="absolute inset-0 rounded-full border border-purple-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <span className="text-2xl relative z-10">🔮</span>
            </div>
          ),
          title: "领航员指挥台",
          subtitle: "Navigation Control / 舰队管理组",
          titleStyle: "text-purple-300",
          subtitleStyle: "text-purple-400/80",
        };
      case "MEMBER":
        return {
          wrapper: "border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]",
          icon: (
            <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-full border border-blue-500/50 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
              <span className="text-xl relative z-10">🛡️</span>
            </div>
          ),
          title: "标准船员舱",
          subtitle: "Verified Crew Member / 注册船员",
          titleStyle: "text-blue-100",
          subtitleStyle: "text-blue-400/60",
        };
      default:
        return {
          wrapper: "border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]",
          icon: (
            <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-zinc-600 flex items-center justify-center mb-4 opacity-50 relative">
              <span className="text-lg">👤</span>
            </div>
          ),
          title: "临时访客舱",
          subtitle: "Awaiting Clearance / 未核准人员",
          titleStyle: "text-zinc-300",
          subtitleStyle: "text-zinc-500",
        };
    }
  };

  const ui = getRoleUI(role);

  return (
    <main className="min-h-screen bg-transparent p-10 flex flex-col items-center relative overflow-hidden">
      
      <div className="max-w-xl w-full relative z-10">
        
        <div className="flex justify-end mb-8">
          <TransitionLink href="/" className="group flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors">
              <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
              <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-blue-400 transition-colors">Return Path</span>
              <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回导航站</span>
            </div>
          </TransitionLink>
        </div>

        <div className={`relative bg-[#0a0a0c]/80 p-8 rounded-[2.5rem] backdrop-blur-xl animate-flame-active transition-all duration-700 ${ui.wrapper}`}>
          <div className="flex flex-col items-center mb-8 border-b border-white/5 pb-8">
             {ui.icon}
             <h2 className={`text-3xl font-bold font-[family-name:var(--font-space)] tracking-widest text-center mt-2 ${ui.titleStyle}`}>
               {ui.title}
             </h2>
             <p className={`text-[10px] uppercase tracking-[0.3em] mt-3 font-mono text-center font-bold ${ui.subtitleStyle}`}>
               {ui.subtitle}
             </p>
          </div>
          
          <div className="relative z-10">
            <ProfileForm user={dbUser} onUpdate={updateProfile} />
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-mono">
              Starbase Profile System v2.0 • Security Level: {role}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}