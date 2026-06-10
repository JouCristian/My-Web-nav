// src/app/profile/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { TransitionLink } from "@/components/transition-link"
import { ProfileForm } from "@/components/profile-form"
import { BackButton } from "@/components/back-button"

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) redirect("/login")

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!dbUser) redirect("/login")

  const role = dbUser.role || "PENDING";

  async function updateProfile(formData: FormData) {
    "use server"
    const session = await auth()
    if (!session?.user?.id) return

    const nickname = formData.get("nickname") as string
    const avatar = formData.get("avatar") as string 
    const feishuLink = formData.get("feishuLink") as string
    const studentId = formData.get("studentId") as string
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: { nickname, customAvatar: avatar, feishuLink, studentId }
    })

    revalidatePath("/profile")
    revalidatePath("/")
  }

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
        };
    }
  };

  const ui = getRoleUI(role);

  return (
    <main className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:p-10 sm:pt-24 md:pt-10 flex flex-col items-center justify-center relative overflow-x-hidden">
      
      {/* 🚀 注入 Apple 风格弹簧阻尼动画 */}
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
          /* cubic-bezier(0.34, 1.56, 0.64, 1) 是极为经典的物理回弹曲线 */
          animation: apple-spring-entry 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      {/* 返回按钮：绝对定位至左上角 */}
      <div className="absolute top-6 left-4 sm:top-10 sm:left-10 z-50">
        <BackButton />
      </div>

      {/* 🚀 卡片容器：缩小为 max-w-md (448px)，并包裹弹簧动画层 */}
      <div className="max-w-md w-full relative z-10 animate-apple-spring opacity-0">
        
        {/* 卡片本体：稍微收紧了 Padding 和圆角，显得更加紧凑精致 */}
        <div className={`relative bg-[#0a0a0c]/80 p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] backdrop-blur-xl animate-flame-active transition-all duration-700 ${ui.wrapper}`}>
          <div className="flex flex-col items-center mb-8 border-b border-white/5 pb-8">
             {ui.icon}
             <h2 className={`text-2xl sm:text-3xl font-bold font-[family-name:var(--font-space)] tracking-widest text-center mt-2 ${ui.titleStyle}`}>
               {ui.title}
             </h2>
             <p className={`text-[10px] uppercase tracking-[0.3em] mt-3 font-mono text-center font-bold ${ui.subtitleStyle}`}>
               {ui.subtitle}
             </p>
          </div>
          
          <div className="relative z-10">
            <ProfileForm user={dbUser} onUpdate={updateProfile} />
          </div>
        </div>
      </div>
      
    </main>
  )
}
