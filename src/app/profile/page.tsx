// src/app/profile/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"
import { ProfileForm } from "@/components/profile-form"

// 🚀 核心组件：手绘铅笔风格星际背景
function SketchyBackground({ color }: { color: string }) {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#020205]">
      {/* SVG 噪声滤镜：定义手绘线条的“震颤”感 */}
      <svg className="hidden">
        <filter id="pencil-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
        </filter>
      </svg>

      <svg 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice" 
        className="w-full h-full opacity-30 transition-colors duration-1000"
        style={{ filter: "url(#pencil-texture)" }}
      >
        {/* 背景星群：手绘点状 */}
        <g fill={color}>
          {[...Array(100)].map((_, i) => (
            <circle 
              key={i} 
              cx={Math.random() * 1000} 
              cy={Math.random() * 1000} 
              r={Math.random() * 1.5} 
              className="animate-pulse"
              style={{ animationDelay: `${Math.random() * 3}s` }}
            />
          ))}
        </g>

        {/* 轨道线条：不规则圆弧 */}
        <g stroke={color} fill="none" strokeWidth="0.5" strokeDasharray="5,5">
          <circle cx="500" cy="500" r="300" className="opacity-20" />
          <circle cx="200" cy="800" r="150" className="opacity-10" />
          <ellipse cx="800" cy="200" rx="400" ry="200" transform="rotate(30, 800, 200)" className="opacity-20" />
        </g>

        {/* 手绘飞船/星球草图：使用简单的 Path 模拟 */}
        <path 
          d="M850 150 L870 170 L860 180 L840 160 Z M860 165 L880 165" 
          stroke={color} 
          strokeWidth="1" 
          fill="none" 
        />
        <path 
          d="M150 150 Q 200 100, 250 150 T 350 150" 
          stroke={color} 
          strokeWidth="0.8" 
          fill="none" 
          className="opacity-40"
        />
      </svg>

      {/* 渐变遮罩：确保内容区域清晰 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020205]/60 to-[#020205]"></div>
    </div>
  )
}

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

  // 🚀 UI 风格配置
  const getRoleUI = (currentRole: string) => {
    switch (currentRole) {
      case "OWNER":
        return {
          color: "#eab308", // 金黄色
          wrapper: "border-2 border-yellow-500/30 shadow-[0_0_60px_rgba(234,179,8,0.2)]",
          icon: "👑",
          title: "舰长专属舱室",
          subtitle: "Supreme Commander / 最高裁决者",
          titleStyle: "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-200",
        };
      case "ADMIN":
        return {
          color: "#a855f7", // 紫色
          wrapper: "border border-purple-500/40 shadow-[0_0_50px_rgba(168,85,247,0.2)]",
          icon: "🔮",
          title: "领航员指挥台",
          subtitle: "Navigation Control / 舰队管理组",
          titleStyle: "text-purple-300",
        };
      case "MEMBER":
        return {
          color: "#3b82f6", // 蓝色
          wrapper: "border border-blue-500/30 shadow-[0_0_40px_rgba(59,130,246,0.15)]",
          icon: "🛡️",
          title: "标准船员舱",
          subtitle: "Verified Crew Member / 注册船员",
          titleStyle: "text-blue-100",
        };
      default:
        return {
          color: "#ffffff", // 白色/灰色
          wrapper: "border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]",
          icon: "👤",
          title: "临时访客舱",
          subtitle: "Awaiting Clearance / 未核准人员",
          titleStyle: "text-zinc-300",
        };
    }
  };

  const ui = getRoleUI(role);

  return (
    <main className="min-h-screen p-10 flex flex-col items-center relative">
      
      {/* 🚀 方案二：手绘风格全覆盖背景 */}
      <SketchyBackground color={ui.color} />

      <div className="max-w-xl w-full relative z-10">
        
        {/* 返回按钮 */}
        <div className="flex justify-end mb-8">
          <Link href="/" className="group flex items-center gap-4 bg-black/60 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all active:scale-95">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/10 transition-colors">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
            </div>
            <div className="flex flex-col items-start">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Return Path</span>
              <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回导航站</span>
            </div>
          </Link>
        </div>

        {/* 核心卡片 */}
        <div className={`relative bg-black/60 p-8 rounded-[2.5rem] backdrop-blur-2xl animate-flame-active transition-all duration-700 ${ui.wrapper}`}>
          
          <div className="flex flex-col items-center mb-8 border-b border-white/5 pb-8">
             <div className="text-4xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{ui.icon}</div>
             <h2 className={`text-3xl font-bold font-[family-name:var(--font-space)] tracking-widest text-center ${ui.titleStyle}`}>
               {ui.title}
             </h2>
             <p className="text-[10px] uppercase tracking-[0.3em] mt-3 font-mono text-zinc-500 text-center">
               {ui.subtitle}
             </p>
          </div>
          
          <ProfileForm user={dbUser} onUpdate={updateProfile} />

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-mono">
              Starbase Profile System v2.0 • Role: {role}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}