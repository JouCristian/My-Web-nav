import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form" // <-- 导入输入框组件
import { prisma } from "@/lib/db"

export default async function Home() {
  // 从数据库倒序拉取数据
  const links = await prisma.bookmark.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="text-4xl font-bold mb-4 text-center tracking-widest">我的导航站</h1>
      <p className="text-zinc-500 text-center mb-10">云端数据库已连通，随时随地管理你的书签</p>
      
      {/* 把新增表单放在卡片列表的上方 */}
      <AddCardForm />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
      {links.map((link: { id: number; name: string; url: string; description: string }) => (
          <NavigationCard 
            key={link.id}
            id={link.id}
            title={link.name}
            description={link.description}
            url={link.url}
          />
        ))}
      </div>
    </main>
  );
}