import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { prisma } from "@/lib/db"
import { auth, signIn, signOut } from "@/auth" // 🚀 引入安检函数

// 1. 定义书签的“结构体” (Interface)
// 这能确保无论在本地还是云端，TypeScript 都能看懂数据库返回的是什么
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
    <main className="min-h-screen bg-black p-10 text-white">
    <div className="max-w-5xl mx-auto text-center">
      
      {/* 🚀 升级后的舰长控制台按钮 */}
      <div className="flex justify-end mb-8">
        {session ? (
          <form action={async () => { "use server"; await signOut(); }}>
            <button className="group flex items-center gap-2 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 transition-all duration-300 ease-in-out hover:scale-105 hover:border-white/20 animate-flame-hover">
              <span className="text-zinc-400 group-hover:text-red-400 transition-colors">●</span>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white">登出舰长账号</span>
            </button>
          </form>
        ) : (
          <form action={async () => { "use server"; await signIn("github"); }}>
            <button className="group flex items-center gap-2 bg-white/5 px-6 py-2 rounded-2xl border border-white/10 transition-all duration-300 ease-in-out hover:scale-105 hover:border-white/20 animate-flame-hover">
              <span className="text-blue-400 animate-pulse">●</span>
              <span className="text-sm font-medium text-zinc-300 group-hover:text-white">舰长登录</span>
            </button>
          </form>
        )}
      </div>

      <h1 className="text-4xl font-bold mb-4 tracking-widest italic">我的星际导航站</h1>
      {/* 🚀 修改这里的逻辑：根据 isCaptain 状态显示不同的文字 */}
<p className="text-zinc-500 mb-10">
  {isCaptain ? (
    "星际数据库已连通，欢迎回来，舰长"
  ) : (
    "你的星际导航站！如需修改导航卡片，请让舰长JouCristian登录"
  )}
</p>
        
        {/* 🛡️ 只有舰长才能看到添加表单 */}
        {isCaptain && <AddCardForm />}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {links.map((link) => (
            <NavigationCard 
              key={link.id}
              id={link.id}
              title={link.name}
              description={link.description}
              url={link.url}
              // 🛡️ 只有舰长才能看到删除按钮（需要传给组件）
              showDelete={isCaptain} 
            />
          ))}
        </div>
      </div>
    </main>
  )
}

