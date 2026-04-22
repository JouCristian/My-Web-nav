import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { prisma } from "@/lib/db"
import { auth, signIn, signOut } from "@/auth" // 🚀 引入安检函数
import Link from "next/link"

// 1. 定义书签的“结构体” (Interface)
interface Bookmark {
  id: number;
  name: string;
  url: string;
  description: string;
  createdAt: Date;
}

export default async function Home() {
  const session = await auth() // 获取当前登录状态
  const links = await prisma.bookmark.findMany({ orderBy: { createdAt: 'desc' } })

  // 💡 定义你的 GitHub 邮箱（只有这个邮箱登录才是舰长）
  const isCaptain = session?.user?.email === "zoujunyi869@gmail.com"

  return (
    // 🚀 确保 bg-transparent 配合外层的星空背景
    <main className="min-h-screen bg-transparent p-10 text-white">
      <div className="max-w-5xl mx-auto text-center">
        
{/* 🚀 舰长控制台按钮 - 顶部右侧 UI 同步 */}
<div className="flex justify-end mb-8">
  {session ? (
    <form action={async () => { "use server"; await signOut(); }}>
      <button className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]">
        {/* 动态红色指示灯：表示已登录/在线 */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/10 transition-colors">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </div>
        
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-red-400 transition-colors">
            Captain Online
          </span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
            退出舰长账号
          </span>
        </div>
      </button>
    </form>
  ) : (
    <form action={async () => { "use server"; await signIn("github"); }}>
      <button className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]">
        {/* 动态蓝色指示灯：表示待命/未登录 */}
        <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/10 transition-colors">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
          <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        </div>
        
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-blue-400 transition-colors">
            Authorization
          </span>
          <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
            舰长登录
          </span>
        </div>
      </button>
    </form>
  )}
</div>

                {/* 🚀 使用 font-[family-name:var(--font-space)] 调用新字体，去掉斜体，增加字间距和发光效果 */}
        <h1 className="text-4xl font-bold mb-4 tracking-[0.2em] font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          我的星际导航站
        </h1>
        
        <p className="text-zinc-500 mb-10">
          {isCaptain ? (
            "星际数据库已连通，欢迎回来，舰长"
          ) : (
            "你的星际导航站！如需修改导航卡片，请让舰长JouCristian登录"
          )}
        </p>

        {/* 🚀 非舰长模式显示的“联络舰长”卡片 */}
        {!isCaptain && (
          <div className="mb-12 max-w-md mx-auto">
            {/* 把 <a> 换成了 <Link>，并指向 /contact 路由 */}
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
                      <path d="M7 7h.01" /><path d="M18 7h.01" /><path d="M18 18h.01" /><path d="M7 18h.01" />
                    </svg>
                  </div>
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white transition-colors group-hover:text-white">联系 JouCristian</h4>
                  <p className="text-xs text-zinc-500 transition-colors group-hover:text-zinc-300">点击获取舰长的星际通讯码 (WeChat)</p>
                </div>
              </div>
            </Link>
          </div>
        )}
        
        {/* 🛡️ 舰长专属添加表单 */}
        {isCaptain && <AddCardForm />}
        
        {/* 导航卡片网格 - 带渐入动画 */}
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
                description={link.description}
                url={link.url}
                showDelete={isCaptain} 
              />
            </div>
          ))}
        </div>

        {/* 🚀 修改点：超级底部空间 (Deep Space) */}
        {/* h-[100vh] 代表整整一屏的高度，让页面极具延伸感 */}
        <div className="mt-32 h-[200vh] flex flex-col items-center justify-end pb-20 opacity-20 pointer-events-none">
          <div className="flex flex-col items-center gap-6">
            <p className="text-[10px] tracking-[0.8em] uppercase text-zinc-400">Deep Space Exploration</p>
            {/* 增长的引力线 */}
            <div className="w-[1px] h-64 bg-gradient-to-b from-white/0 via-white/50 to-white/0 animate-pulse" />
            <p className="text-xs tracking-[0.4em] uppercase font-light text-zinc-500">End of Sector</p>
          </div>
        </div>

      </div>
    </main>
  )
}