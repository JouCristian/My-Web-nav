"use client"

import { deleteBookmark } from "@/app/actions"

interface NavigationCardProps {
  id: number;
  title: string;
  description: string;
  url: string;
  showDelete: boolean; // 舰长权限标识
}

export function NavigationCard({ id, title, description, url, showDelete }: NavigationCardProps) {
  return (
    <div className="relative group block h-full">
      
      {/* 🛡️ 核心修改：只有当 showDelete 为 true 时，才渲染删除按钮 */}
      {showDelete && (
        <button 
          onClick={async (e) => {
            e.preventDefault();
            if (confirm("确定要删除这个书签吗？")) {
              await deleteBookmark(id)
            }
          }}
          className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/80 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
          </svg>
        </button>
      )}

      {/* 卡片主体：保持不变 */}
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full bg-white/5 p-6 rounded-3xl border border-white/10 transition-all duration-300 ease-in-out hover:scale-105 hover:border-white/20 animate-flame-hover"
      >
        <h3 className="text-xl font-semibold text-white mb-1 pr-8">{title}</h3>
        <p className="text-zinc-400 text-sm">{description}</p>
      </a>
    </div>
  );
}