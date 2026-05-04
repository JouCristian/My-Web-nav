"use client"

import { useState, useEffect} from "react"
import { createPortal } from "react-dom"
import { deleteBookmark } from "@/app/actions"

type BookmarkCategory = 'TOOL' | 'DOC' | 'TUTORIAL' | 'RESOURCE' | 'COMMUNITY' | 'OTHER'

const CATEGORY_CONFIG: Record<BookmarkCategory, { label: string; color: string; borderColor: string; bgColor: string }> = {
  TOOL: { label: '工具', color: 'text-cyan-400', borderColor: 'border-cyan-500/30', bgColor: 'bg-cyan-500/10' },
  DOC: { label: '文档', color: 'text-blue-400', borderColor: 'border-blue-500/30', bgColor: 'bg-blue-500/10' },
  TUTORIAL: { label: '教程', color: 'text-green-400', borderColor: 'border-green-500/30', bgColor: 'bg-green-500/10' },
  RESOURCE: { label: '资源', color: 'text-yellow-400', borderColor: 'border-yellow-500/30', bgColor: 'bg-yellow-500/10' },
  COMMUNITY: { label: '社区', color: 'text-purple-400', borderColor: 'border-purple-500/30', bgColor: 'bg-purple-500/10' },
  OTHER: { label: '其他', color: 'text-gray-400', borderColor: 'border-gray-500/30', bgColor: 'bg-gray-500/10' },
}

interface NavigationCardProps {
  id: number;
  title: string;
  description: string;
  url: string;
  showDelete: boolean;
  category?: BookmarkCategory;
  iconSvg?: string | null;
}

export function NavigationCard({ id, title, description, url, showDelete, category = 'OTHER', iconSvg }: NavigationCardProps) {
  // 🚀 新增：控制弹窗显示和删除中状态
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  // 确保在客户端渲染时才能使用 document.body 挂载 Portal
  const [mounted, setMounted] = useState(false);

    // 🚀 修复：必须放在 useEffect 里，确保组件真正挂载后才执行
    useEffect(() => {
      setMounted(true);
    }, []);

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname;
    } catch (e) {
      return url;
    }
  };

  // 优先使用预存的图标，否则回退到 Google favicon 服务
  const faviconUrl = iconSvg || `https://www.google.com/s2/favicons?domain=${getDomain(url)}&sz=64`;
  const categoryConfig = CATEGORY_CONFIG[category];

  // 处理删除逻辑
  const handleDelete = async () => {
    setIsDeleting(true);
    await deleteBookmark(id);
    // 动作完成后，不用特意关闭弹窗，因为整个卡片组件会被重渲染摧毁
  };

  return (
    <>
      {/* 卡片主体（保持原有逻辑不变，只改了按钮的 onClick） */}
      <div className="relative group h-full animate-flame-hover rounded-3xl">
        {showDelete && (
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); 
              // 🚀 核心修改：不再调用 confirm，而是打开我们的自定义弹窗
              setShowModal(true);
            }}
            // 🚀 移动端：常显删除按钮（无 hover 概念）；桌面端：hover 才显示
            className="absolute -top-1 -right-1 z-50 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 bg-red-500 hover:bg-red-600 text-white p-1.5 sm:p-2 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95"
            title="删除书签"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5Zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6Z"/>
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1ZM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118ZM2.5 3h11V2h-11v1Z"/>
            </svg>
          </button>
        )}

        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className={`block h-full bg-black/75 p-5 rounded-3xl border transition-all duration-200 active:scale-[0.98] overflow-hidden ${categoryConfig.borderColor} group-hover:border-white/30`}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`shrink-0 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center overflow-hidden p-1 border ${categoryConfig.borderColor} group-hover:border-white/40 transition-colors`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={faviconUrl} alt="logo" className="w-full h-full object-contain rounded-full" />
                </div>
                <h3 className="text-lg font-semibold text-white truncate font-[family-name:var(--font-space)] tracking-wide">
                  {title}
                </h3>
              </div>
              {/* 分类标签 */}
              <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium ${categoryConfig.bgColor} ${categoryConfig.color} border ${categoryConfig.borderColor}`}>
                {categoryConfig.label}
              </span>
            </div>
            <p className="text-zinc-300 text-sm line-clamp-2 leading-relaxed flex-1">
              {description}
            </p>
            <div className="mt-4 text-[10px] text-zinc-500 font-mono tracking-wider uppercase group-hover:text-zinc-400 transition-colors">
              {getDomain(url)}
            </div>
          </div>
        </a>
      </div>

      {/* 🚀 核心新增：独立的高清科幻风确认弹窗 */}
      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          
          {/* 这里的 animate-flame-active 调用了你之前加的自动呼吸动画 */}
          {/* 这里的 bg-[#0a0a0c]/90 降低了透明度，背景更深，确保文字绝佳清晰 */}
          <div className="relative bg-[#0a0a0c]/95 border border-red-500/20 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.15)] flex flex-col items-center text-center animate-flame-active">
            
            {/* 警告图标 */}
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
              <div className="relative flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,1)]" />
                <div className="absolute inset-0 rounded-full border border-red-500/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
              </div>
            </div>

            {/* 文字信息 */}
            <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-space)] tracking-widest">
              确认擦除记录？
            </h3>
            <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
              即将从星际导航网络中永久抹除 <span className="text-zinc-200 font-semibold">{title}</span> 的坐标。此操作不可逆。
            </p>

            {/* 操作按钮区 */}
            <div className="flex gap-4 w-full">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium transition-all hover:bg-white/10 hover:text-white active:scale-95 disabled:opacity-50"
              >
                取消
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-5 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-bold transition-all hover:bg-red-500 hover:text-white active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    擦除中
                  </>
                ) : (
                  "确认擦除"
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
