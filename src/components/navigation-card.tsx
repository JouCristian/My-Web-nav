"use client" // 🚀 就是这一行！告诉 Next.js：这是一个需要在浏览器运行的“活”组件

import { deleteBookmark } from "@/app/actions"

interface NavigationCardProps {
  id: number
  title: string
  description: string
  url: string
}

export function NavigationCard({ id, title, description, url }: NavigationCardProps) {
  return (
    <div className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      {/* 删除按钮 */}
      <button 
        onClick={async (e) => {
          e.preventDefault(); // 防止点击删除按钮时跳转到链接
          if (confirm("确定要删除这个书签吗？")) {
            await deleteBookmark(id)
          }
        }}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500 hover:text-red-400 p-2 z-10"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      </button>

      <a href={url} target="_blank" rel="noopener noreferrer" className="block">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm">{description}</p>
      </a>
    </div>
  )
}