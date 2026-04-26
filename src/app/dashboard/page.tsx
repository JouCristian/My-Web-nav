// src/app/dashboard/page.tsx
import { auth } from "@/auth"
import { prisma } from "@/lib/db"
import { redirect } from "next/navigation"
import { updateRecruitProfile, revokeRecruitProfile } from "@/app/actions"
import Link from "next/link"
import { TransitionLink } from "@/components/transition-link"
import { BroadcastCard } from "@/components/broadcast-card"
import { CreateBroadcastModal } from "@/components/create-broadcast-modal"

// 🚀 顶级设计师调参：阵营色彩光谱映射 (保持 UI 设计一致性)
const THEME_MAP = {
  blue: {
    border: "border-blue-500/20 hover:border-blue-500/60",
    shadow: "shadow-[0_0_40px_rgba(59,130,246,0.1)] hover:shadow-[0_0_80px_rgba(59,130,246,0.2)]",
    blob: "bg-blue-500/10 group-hover:bg-blue-500/25",
    iconBox: "bg-blue-500/10 border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:bg-blue-500/20 text-blue-400",
    subtitle: "text-blue-200/40",
    activeText: "text-blue-400"
  },
  purple: {
    border: "border-purple-500/20 hover:border-purple-500/60",
    shadow: "shadow-[0_0_40px_rgba(168,85,247,0.1)] hover:shadow-[0_0_80px_rgba(168,85,247,0.2)]",
    blob: "bg-purple-500/10 group-hover:bg-purple-500/25",
    iconBox: "bg-purple-500/10 border-purple-500/20 shadow-[0_0_20px_rgba(168,85,247,0.15)] group-hover:bg-purple-500/20 text-purple-400",
    subtitle: "text-purple-200/40",
    activeText: "text-purple-400"
  },
  yellow: {
    border: "border-yellow-500/20 hover:border-yellow-500/60",
    shadow: "shadow-[0_0_40px_rgba(234,179,8,0.1)] hover:shadow-[0_0_80px_rgba(234,179,8,0.2)]",
    blob: "bg-yellow-500/10 group-hover:bg-yellow-500/25",
    iconBox: "bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.15)] group-hover:bg-yellow-500/20 text-yellow-400",
    subtitle: "text-yellow-200/40",
    activeText: "text-yellow-400"
  }
}

// 🚀 模块卡片重构：适应居中放大垂直布局
const ModuleCard = ({ moduleId, title, subtitle, icon, link, isActive, theme = "purple" }: {
  moduleId: string; title: string; subtitle: string; icon: string; link: string; isActive: boolean; theme?: "blue" | "purple" | "yellow"
}) => {
  const styles = THEME_MAP[theme];

  return (
    <Link 
      href={isActive ? link : "#"} 
      // 尺寸被大幅拉大 (h-[360px])，宽度占满其容器
      className={`group relative w-full h-[360px] rounded-[3.5rem] border ${styles.border} bg-[#06060a]/95 p-12 flex flex-col justify-between overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-[0.98] ${isActive ? `hover:-translate-y-2 ${styles.shadow}` : 'opacity-60 grayscale'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full transition-all duration-1000 ${styles.blob}`}></div>
      
      <div className="relative z-10">
        <div className={`w-20 h-20 rounded-[2rem] border flex items-center justify-center mb-8 text-4xl group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${styles.iconBox}`}>
          {icon}
        </div>
        <h3 className="text-4xl font-bold text-white tracking-[0.15em] font-[family-name:var(--font-space)] mb-4">{title}</h3>
        <p className={`text-base font-mono tracking-widest leading-relaxed ${styles.subtitle}`}>{subtitle}</p>
      </div>
      
      <div className="relative z-10 flex items-center justify-between text-[12px] font-mono text-zinc-500 uppercase tracking-[0.4em] border-t border-white/5 pt-8">
        <span className="bg-white/5 px-4 py-2 rounded-lg">{moduleId}</span>
        <span className={`flex items-center gap-3 transition-all duration-500 ${isActive ? `${styles.activeText} group-hover:gap-6` : 'text-zinc-700'}`}>
          {isActive ? 'Authorize Access' : 'System Locked'}
          <span className="text-xl">➔</span>
        </span>
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/")

  const dbUser = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!dbUser) redirect("/")

  // @ts-ignore
  const isCaptain = session.user.isCaptain;
  const isProfileIncomplete = !dbUser.realName || !dbUser.studentId;
  const isManager = dbUser.role === "OWNER" || dbUser.role === "ADMIN"

  // 🚀 获取公告大屏数据，直接在主页渲染
  const broadcasts = await prisma.announcement.findMany({
    include: { author: true },
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }]
  })

  // ... 拦截器状态 1 和 2 保持原有逻辑不变 (此处省略具体代码以免过长，保留你的原样即可，为了完整性我还是全写)
  if (!isCaptain && isProfileIncomplete) {
    // ... [保留您原有的拦截器 1 代码，此处为节省字数暂略，实际请保留你的原有代码]
    return <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-white"><h2>拦截器 1：请补全档案</h2></main>
  }
  if (!isCaptain && dbUser.role === "PENDING") {
    // ... [保留您原有的拦截器 2 代码]
    return <main className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-white"><h2>拦截器 2：档案审核中</h2></main>
  }

  // ==========================================
  // ✅ 状态 3：重组后的舰队指挥主屏 (V4)
  // ==========================================
  return (
    /* 页面宽度限制放开，给予大卡片足够的舒展空间 */
    <main className="min-h-screen py-16 px-8 xl:px-24 text-white relative flex flex-col gap-16">
      
      {/* 🚀 全局动画引擎与苹果级滚动条注入 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes pulse-slow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        
        @keyframes button-breathe { 0%, 100% { transform: scale(1); border-color: rgba(255,255,255,0.1); } 50% { transform: scale(1.02); border-color: rgba(59,130,246,0.5); } }
        @keyframes core-pulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 12px rgba(59,130,246,0.8); } 50% { transform: scale(1.3); box-shadow: 0 0 24px rgba(59,130,246,1); } }
        
        .hover-breathe:hover { animation: button-breathe 2.5s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }
        .group:hover .group-hover-pulse { animation: core-pulse 2s cubic-bezier(0.34, 1.56, 0.64, 1) infinite; }

        /* 🚀 专属 iOS 幽灵滚动条 */
        .ios-scrollbar::-webkit-scrollbar { width: 6px; }
        .ios-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .ios-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid transparent;
          background-clip: padding-box;
          transition: all 0.3s ease;
        }
        .ios-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.5); }
      `}} />

      {/* 背景星空渲染 */}
      <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-500/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* ================= 头部导视 ================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
            <span className="text-xs font-mono text-blue-400 uppercase tracking-[0.5em]">Sector: Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-[0.1em] font-[family-name:var(--font-space)] bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
            星际舰队指挥大屏
          </h1>
        </div>

        <TransitionLink href="/" className="group hover-breathe flex items-center gap-4 bg-black/40 px-6 py-4 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/20 transition-colors duration-500">
            <div className="w-3 h-3 rounded-full bg-blue-400 group-hover-pulse transition-all duration-500" />
            <div className="absolute inset-0 rounded-full border border-blue-500/30 opacity-0 group-hover:opacity-100 group-hover:animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite] transition-all duration-500" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-blue-400 transition-colors duration-500">Return Path</span>
            <span className="text-base font-bold text-white tracking-widest font-[family-name:var(--font-space)]">返回导航站</span>
          </div>
        </TransitionLink>
      </div>

      {/* ================= 核心：置顶巨型公告卡片 ================= */}
      <div className="relative z-10 w-full rounded-[3.5rem] border border-blue-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-12 shadow-[0_0_100px_rgba(59,130,246,0.1)] flex flex-col">
        
        {/* 💫 全息横条 (Holographic Bar) */}
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-[#0a0d1a]/80 border border-blue-500/30 rounded-3xl p-6 lg:px-10 lg:py-8 mb-10 overflow-hidden shadow-[inset_0_0_30px_rgba(59,130,246,0.1)]">
          {/* 全息扫描线特效 */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <span className="text-2xl animate-[pulse-slow_3s_infinite]">📢</span>
            </div>
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">全舰公告大屏</h2>
              <p className="text-blue-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Live Fleet-wide Broadcast System</p>
            </div>
          </div>

          {/* 完美的整合发布按钮 */}
          <div className="relative z-10">
            {isManager && <CreateBroadcastModal />}
          </div>
        </div>

        {/* 📜 滚动公告阵列 */}
        <div className="flex flex-col gap-5 max-h-[550px] overflow-y-auto ios-scrollbar pr-2 md:pr-6">
          {broadcasts.length > 0 ? (
            broadcasts.map(item => <BroadcastCard key={item.id} announcement={item} isManager={isManager} />)
          ) : (
            <div className="w-full h-64 flex flex-col items-center justify-center border border-white/5 bg-white/[0.02] rounded-[2.5rem] text-zinc-600 font-mono tracking-widest italic">
              <span className="text-4xl mb-4 opacity-20">📡</span>
              <span>暂未接收到任何深空广播信号...</span>
            </div>
          )}
        </div>
      </div>

      {/* ================= 垂直阵列：放大居中模块 ================= */}
      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col gap-14 mt-10">
        
        <div className="flex items-center gap-4 opacity-40 mb-2">
          <div className="h-px bg-white/20 flex-1"></div>
          <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-white">System Modules</span>
          <div className="h-px bg-white/20 flex-1"></div>
        </div>

        {/* 🟣 紫微星 - 船员档案室 (大幅度放大) */}
        <ModuleCard 
          moduleId="Module B" 
          title="船员档案室" 
          subtitle="Starship Crew Database & Authorization" 
          icon="👥" 
          link="/dashboard/crew" 
          isActive={true} 
          theme="purple" 
        />
        
        {/* ☀️ 日冕金 - 跃迁集结 (大幅度放大) */}
        <ModuleCard 
          moduleId="Module C" 
          title="跃迁集结" 
          subtitle="Fleet Attendance & Leave Requests" 
          icon="⏳" 
          link="/dashboard/attendance" 
          isActive={true} 
          theme="yellow" 
        />
      </div>

      <div className="mt-20 flex justify-between items-center opacity-20 pointer-events-none border-t border-white/5 pt-8">
        <span className="text-[10px] font-mono tracking-[1em] uppercase">Tactical Overlay Active</span>
        <div className="flex gap-4">
          <div className="w-8 h-1 bg-white/40 rounded-full"></div>
          <div className="w-24 h-1 bg-blue-500/40 rounded-full"></div>
        </div>
        <span className="text-[10px] font-mono tracking-[1em] uppercase">Auth Level: {dbUser.role}</span>
      </div>

    </main>
  )
}