import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { prisma } from "@/lib/db"
import { auth, signOut } from "@/auth" 
import Link from "next/link"

// 定义书签的结构
interface Bookmark {
  id: number;
  name: string;
  url: string;
  description: string | null;
  createdAt: Date;
}

export default async function Home() {
  const session = await auth()
  
  // 1. 获取所有导航书签
  const links = await prisma.bookmark.findMany({ orderBy: { createdAt: 'desc' } })

  // 2. 权限校验：从 session 中获取我们在 auth.ts callbacks 中注入的 isCaptain 标识
  // @ts-ignore
  const isCaptain = session?.user?.isCaptain

  // 3. 获取当前登录用户的最新数据库信息（用于显示自定义昵称和头像）
  let dbUser = null
  if (session?.user?.email) {
    dbUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
  }

  return (
    <main className="min-h-screen bg-transparent p-10 text-white">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* 🚀 顶部控制台按钮区 */}
        <div className="flex justify-end mb-8 gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              {/* 个人资料入口：显示自定义昵称和头像 */}
              <Link 
                href="/profile" 
                className="group flex items-center gap-3 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all active:scale-[0.97]"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 group-hover:border-white/40 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={dbUser?.customAvatar || session.user?.image || ""} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* 🚀 专属舰长标识：如果是舰长，在头像右下角加一个金色闪烁的小圆点或图标 */}
                  {isCaptain && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-yellow-500 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_8px_rgba(234,179,8,0.6)]">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-zinc-300">
                      Profile
                    </span>
                    
                    {/* 🚀 专属舰长文字勋章：带有科幻边框和金色发光效果 */}
                    {isCaptain && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 font-bold tracking-tighter uppercase leading-none shadow-[0_0_10px_rgba(234,179,8,0.2)] group-hover:bg-yellow-500 group-hover:text-black transition-all">
                        Captain
                      </span>
                    )}
                  </div>
                  
                  <span className="text-sm font-bold text-white tracking-tight font-[family-name:var(--font-space)] flex items-center gap-1">
                    {dbUser?.nickname || session.user?.name || "未知宇航员"}
                    {/* 如果是舰长，名字后面加一颗闪亮的星星 */}
                    {isCaptain && <span className="text-yellow-500 text-xs">✦🔱✦</span>}
                  </span>
                </div>
              </Link>

              {/* 退出按钮 */}
              <form action={async () => { "use server"; await signOut(); }}>
                <button className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]">
                  <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/10 transition-colors">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
                    <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-red-400 transition-colors">
                      Status: Online
                    </span>
                    <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
                      退出登录
                    </span>
                  </div>
                </button>
              </form>
            </div>
          ) : (
            /* 未登录状态：引导至自定义登录页 */
            <Link href="/login" className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]">
              <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/10 transition-colors">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
                <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-blue-400 transition-colors">
                  Authorization
                </span>
                <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
                  开启星际之旅
                </span>
              </div>
            </Link>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4 tracking-[0.2em] font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          我的星际导航站
        </h1>
        
        <p className="text-zinc-500 mb-10">
          {isCaptain ? (
            `星际数据库已连通，欢迎回来，${dbUser?.nickname || "舰长"}`
          ) : (
            "你的星际导航站！如需修改导航卡片，请联系舰长 JouCristian"
          )}
        </p>

        {/* 🚀 非舰长模式显示的“联络舰长”卡片 */}
        {!isCaptain && (
          <div className="mb-12 max-w-md mx-auto">
            <Link 
              href="/contact" 
              className="group block bg-black/75 p-4 rounded-2xl border border-dashed border-white/20 animate-flame-hover hover:border-white/40 transition-all"
            >
              <div className="flex items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-white/10 animate-ping opacity-30" />
                  <div className="relative bg-white/5 p-3 rounded-xl border border-white/10 text-zinc-400 group-hover:bg-white group-hover:text-black group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] group-hover:rotate-3 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    </svg>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white group-hover:text-white">联系 JouCristian</h4>
                  <p className="text-xs text-zinc-500 group-hover:text-zinc-300">获取舰长的星际通讯码 (WeChat)</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* ========================================== */}
        {/* 🚀 新增：「一生一芯·指挥中枢」大型科幻面板 */}
        {/* ========================================== */}
        <div className="relative w-full rounded-[2.5rem] bg-black/40 border border-white/10 p-8 md:p-12 overflow-hidden group animate-flame-hover mb-12 text-left">
          {/* 背景微光与网格修饰 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* 左侧文字区 */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                </span>
                <h2 className="text-sm font-bold tracking-[0.3em] font-mono text-blue-400 uppercase">
                  Yishengyixin Command Center
                </h2>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white tracking-wide font-[family-name:var(--font-space)] mt-2">
                「一生一芯」星际舰队指挥中枢
              </h3>
              <p className="mt-4 text-zinc-400 text-sm max-w-xl leading-relaxed">
                全星系广播、船员档案管理、跃迁集结签到与考勤大盘。仅限授权船员与管理组访问。
              </p>
            </div>

            {/* 右侧交互区 (根据登录状态分流) */}
            <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
              {!session ? (
                // 状态0：未登录，引导去 /login
                <Link href="/login" className="block w-full text-center px-8 py-4 rounded-2xl bg-white text-black font-bold transition-all hover:bg-blue-400 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  进行身份校验接入
                </Link>
              ) : (
                // 状态1/2/3：已登录，直接进入指挥舱大屏 (前往 /dashboard)
                <Link href="/dashboard" className="group/btn flex items-center justify-center gap-3 w-full px-8 py-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold transition-all hover:bg-blue-500 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <span>进入指挥大屏</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover/btn:translate-x-1">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </Link>
              )}
            </div>
            
          </div>
        </div>
        {/* ========================================== */}
        
        {/* 🛡️ 只有真正的舰长才能看到添加表单 */}
        {isCaptain && <AddCardForm />}
        
        {/* 导航卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative z-10">
          {links.map((link: Bookmark, index: number) => (
            <div 
              key={link.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
            <NavigationCard 
              id={link.id}
              title={link.name}
              description={link.description || ""}
              url={link.url}
              // 只有舰长才能看到删除按钮
              showDelete={isCaptain} 
            />
            </div>
          ))}
        </div>

        {/* 深空延伸感 */}
        <div className="mt-32 h-[150vh] flex flex-col items-center justify-end pb-20 opacity-20 pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <p className="text-[10px] tracking-[0.8em] uppercase text-zinc-400">Deep Space Exploration</p>
            <div className="w-[1px] h-64 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
            <p className="text-xs tracking-[0.4em] uppercase font-light text-zinc-500">End of Sector</p>
          </div>
        </div>

      </div>
    </main>
  )
}