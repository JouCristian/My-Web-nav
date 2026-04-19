import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { prisma } from "@/lib/db"

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
  // 2. 显式声明 links 是一个 Bookmark 数组
  const links: Bookmark[] = await prisma.bookmark.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return (
    <main className="min-h-screen bg-black p-10 text-white text-center">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 tracking-widest italic">
          我的星际导航站
        </h1>
        <p className="text-zinc-500 mb-10">
          星际数据库已连通，跨星际随时随地管理你的书签
        </p>
        
        {/* 新增表单 */}
        <AddCardForm />
        
        {/* 卡片展示区 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {links.map((link) => (
            <NavigationCard
              key={link.id}
              id={link.id}
              title={link.name}
              description={link.description}
              url={link.url}
            />
          ))}
        </div>

        {/* 如果数据库是空的，给个温馨提示 */}
        {links.length === 0 && (
          <div className="mt-20 text-zinc-600 italic">
            这里空空如也，快在上方添加第一个书签吧！
          </div>
        )}
      </div>
    </main>
  );
}