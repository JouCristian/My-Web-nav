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

  return (
    <main className="min-h-screen p-10 flex flex-col items-center">
      <div className="max-w-xl w-full">
        
        {/* 🚀 1. 返回导航按钮：位置与首页退出按钮一致，UI 风格同步 */}
        <div className="flex justify-end mb-8">
          <Link href="/" className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]">
            {/* 蓝色指示灯：表示返回/待命状态 */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/10 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
              <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
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

        {/* 🚀 2. 大卡片：改用 animate-flame-active 实现常亮呼吸效果 */}
        <div className="bg-black/50 border border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl animate-flame-active">
          <div className="mb-8">
             <h2 className="text-2xl font-bold font-[family-name:var(--font-space)] tracking-tight text-center">控制中心</h2>
          </div>
          
          <ProfileForm user={dbUser} onUpdate={updateProfile} />

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
              Starbase Profile System v2.0
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}