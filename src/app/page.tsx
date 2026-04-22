import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { prisma } from "@/lib/db"
import { auth, signIn, signOut } from "@/auth"

interface Bookmark {
  id: number;
  name: string;
  url: string;
  description: string;
  createdAt: Date;
}

export default async function Home() {
  const session = await auth()
  const links = await prisma.bookmark.findMany({ orderBy: { createdAt: 'desc' } })

  const isCaptain = session?.user?.email === "zoujunyi869@gmail.com"

  return (
    <main className="min-h-screen bg-transparent p-10 text-white">
      <div className="max-w-5xl mx-auto text-center">
        
        {/* Liquid Glass 舰长控制台按钮 */}
        <div className="flex justify-end mb-8">
          {session ? (
            <form action={async () => { "use server"; await signOut(); }}>
              <button className="group flex items-center gap-2 liquid-button px-6 py-2.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-red-400/60 group-hover:bg-red-400 group-hover:shadow-[0_0_8px_rgba(248,113,113,0.8)] transition-all" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">退出舰长账号</span>
              </button>
            </form>
          ) : (
            <form action={async () => { "use server"; await signIn("github"); }}>
              <button className="group flex items-center gap-2 liquid-button px-6 py-2.5 rounded-2xl">
                <span className="w-2 h-2 rounded-full bg-blue-400/60 animate-pulse group-hover:bg-blue-400 group-hover:shadow-[0_0_8px_rgba(96,165,250,0.8)] transition-all" />
                <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">舰长登录</span>
              </button>
            </form>
          )}
        </div>

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

        {/* Liquid Glass 联络舰长卡片 */}
        {!isCaptain && (
          <div className="mb-12 max-w-md mx-auto">
            <a 
              href="/WeChat.png" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group block liquid-glass liquid-glass-hover rounded-2xl p-5"
            >
              <div className="flex items-center justify-center gap-4">
                {/* Liquid Glass 二维码图标 */}
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl bg-white/10 animate-ping opacity-20" />
                  <div className="relative liquid-glass liquid-glass-glow p-3 rounded-xl text-zinc-400 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="3" width="7" height="7" rx="1.5" />
                      <rect x="14" y="14" width="7" height="7" rx="1.5" />
                      <rect x="3" y="14" width="7" height="7" rx="1.5" />
                      <path d="M7 7h.01" />
                      <path d="M18 7h.01" />
                      <path d="M18 18h.01" />
                      <path d="M7 18h.01" />
                    </svg>
                  </div>
                </div>
                
                <div className="text-left">
                  <h4 className="text-sm font-semibold text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">联系 JouCristian</h4>
                  <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors">点击获取舰长的星际通讯码 (WeChat)</p>
                </div>
              </div>
            </a>
          </div>
        )}
        
        {/* 舰长专属添加表单 */}
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

        {/* 超级底部空间 (Deep Space) */}
        <div className="mt-32 h-[100vh] flex flex-col items-center justify-end pb-20 opacity-20 pointer-events-none">
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
