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
        {/* 登录/退出按钮 */}
        <div className="flex justify-end mb-4">
          {session ? (
            <form action={async () => { "use server"; await signOut(); }}>
              <button className="text-xs text-zinc-500 hover:text-white">退出舰长账号</button>
            </form>
          ) : (
            <form action={async () => { "use server"; await signIn("github"); }}>
              <button className="text-xs text-zinc-500 hover:text-white">舰长登录</button>
            </form>
          )}
        </div>

        <h1 className="text-4xl font-bold mb-4 italic">我的星际导航站</h1>
        
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

