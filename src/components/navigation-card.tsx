"use client"

import { deleteBookmark } from "@/app/actions"

interface NavigationCardProps {
  id: number;
  title: string;
  description: string;
  url: string;
  showDelete: boolean;
}

export function NavigationCard({ id, title, description, url, showDelete }: NavigationCardProps) {
  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`;

  return (
    /* 🚀 核心修复 1：外层容器必须加上 rounded-3xl，这样呼吸灯的 box-shadow 才会是圆角的 */
    /* 增加 relative 和 group 确保子元素定位和悬浮逻辑正确 */
    <div className="relative group h-full animate-flame-hover rounded-3xl">
      
      {showDelete && (
        <button 
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            if (confirm("确定要删除这个书签吗？")) {
              await deleteBookmark(id)
            }
          }}
          /* 🚀 核心修复 2：将 z-index 提到最高 (z-50)，确保它在卡片之上 */
          /* 按钮位置稍微往里收一点 (-top-1 -right-1)，确保不会被父容器可能存在的裁切影响 */
          className="absolute -top-1 -right-1 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
          title="删除书签"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
          </svg>
        </button>
      )}

      {/* 卡片主体 */}
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-full bg-black/25 p-5 rounded-3xl border border-white/10 transition-all duration-200 group-hover:border-white/20 active:scale-[0.98] overflow-hidden"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="shrink-0 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center overflow-hidden p-1 border border-white/10 group-hover:border-white/30 transition-colors">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconUrl} alt="logo" className="w-full h-full object-contain rounded-full" />
              </div>
              
              <h3 className="text-lg font-semibold text-white truncate font-[family-name:var(--font-space)] tracking-wide">
                {title}
              </h3>
            </div>
            
            <span className="shrink-0 text-white/20 group-hover:text-white/60 transition-colors mt-1">
              ✦
            </span>
          </div>

          <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
          
          <div className="mt-4 text-[10px] text-zinc-650 font-mono tracking-wider uppercase group-hover:text-zinc-50 transition-colors">
            {getDomain(url)}
          </div>
        </div>
      </a>
    </div>
  );
}