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
    {/* iOS 26 Liquid Glass 风格卡片 */}
    <div className="relative group h-full rounded-3xl liquid-glass liquid-glass-hover liquid-glass-chromatic">
      
      {showDelete && (
        <button 
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation(); 
            if (confirm("确定要删除这个书签吗？")) {
              await deleteBookmark(id)
            }
          }}
          className="absolute -top-2 -right-2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 liquid-button text-white p-2 rounded-full cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 bg-red-500/80 hover:bg-red-500"
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
        className="block h-full p-5 rounded-3xl transition-all duration-200 active:scale-[0.98] overflow-hidden relative z-10"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Liquid Glass 图标容器 */}
              <div className="shrink-0 w-10 h-10 rounded-2xl liquid-glass liquid-glass-glow flex items-center justify-center overflow-hidden p-1.5 group-hover:scale-110 transition-transform duration-300">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={faviconUrl} alt="logo" className="w-full h-full object-contain rounded-xl" />
              </div>
              
              <h3 className="text-lg font-semibold text-white truncate font-[family-name:var(--font-space)] tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                {title}
              </h3>
            </div>
            
            {/* Liquid 光点装饰 */}
            <span className="shrink-0 w-2 h-2 rounded-full bg-white/30 group-hover:bg-white/80 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.8)] transition-all duration-300 mt-2" />
          </div>

          <p className="text-zinc-300/90 text-sm line-clamp-2 leading-relaxed flex-1">
            {description}
          </p>
          
          <div className="mt-4 text-[10px] text-zinc-500 font-mono tracking-wider uppercase group-hover:text-white/70 transition-colors duration-300">
            {getDomain(url)}
          </div>
        </div>
      </a>
    </div>
  );
}
