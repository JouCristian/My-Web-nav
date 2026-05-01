"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Trash2, ArrowUpRight, AlertTriangle, Loader2 } from "lucide-react"
import { deleteBookmark } from "@/app/actions"
import { getDomain, getCategory, formatRelative } from "@/lib/bookmark-utils"

interface NavigationCardProps {
  id: number
  title: string
  description: string
  url: string
  showDelete: boolean
  createdAt?: Date | string | number
}

export function NavigationCard({
  id,
  title,
  description,
  url,
  showDelete,
  createdAt,
}: NavigationCardProps) {
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const domain = getDomain(url)
  const category = getCategory(url)
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteBookmark(id)
  }

  return (
    <>
      <div className="relative group h-full animate-flame-hover rounded-3xl">
        {showDelete && (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setShowModal(true)
            }}
            className="absolute top-3 right-3 z-50 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-rose-500/90 hover:bg-rose-500 text-white p-1.5 rounded-lg shadow-[0_4px_12px_rgba(244,63,94,0.4)] cursor-pointer flex items-center justify-center hover:scale-110 active:scale-95 backdrop-blur-sm"
            title="删除书签"
            aria-label="删除书签"
          >
            <Trash2 size={14} strokeWidth={2.2} />
          </button>
        )}

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-full bg-black/75 p-5 rounded-3xl border border-white/10 transition-all duration-200 group-hover:border-cyan-500/30 active:scale-[0.98] overflow-hidden"
        >
          <div className="flex flex-col h-full">
            {/* 顶部行：分类 chip + favicon + 标题 */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="shrink-0 w-9 h-9 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden p-1.5 border border-white/10 group-hover:border-cyan-500/40 transition-colors">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={faviconUrl || "/placeholder.svg"}
                    alt=""
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <h3 className="text-lg font-semibold text-white truncate font-[family-name:var(--font-space)] tracking-wide">
                  {title}
                </h3>
              </div>

              {/* 分类标签 —— 右上角彩色 chip */}
              <span
                className={`shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono tracking-[0.15em] uppercase ${category.chipClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${category.dotClass}`} />
                {category.label}
              </span>
            </div>

            {/* 描述 */}
            <p className="text-zinc-300/90 text-sm line-clamp-2 leading-relaxed flex-1 mb-4">
              {description || <span className="text-zinc-600 italic">暂无简介</span>}
            </p>

            {/* 底部行：域名 + 添加时间 + hover 才出现的"打开"箭头 */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-[10px] text-zinc-500 font-mono tracking-wider truncate group-hover:text-cyan-400 transition-colors">
                  {domain}
                </span>
                {createdAt && (
                  <>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[10px] text-zinc-600 font-mono tracking-wider shrink-0">
                      {formatRelative(createdAt)}
                    </span>
                  </>
                )}
              </div>
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-mono uppercase tracking-[0.2em] text-cyan-400/0 group-hover:text-cyan-400 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                打开
                <ArrowUpRight size={12} strokeWidth={2.5} />
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* 删除确认弹窗 —— 警示三角替换原本的红色心跳点 */}
      {mounted &&
        showModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="relative bg-[#0a0a0c]/95 border border-rose-500/30 p-8 rounded-[2rem] max-w-sm w-full shadow-[0_0_50px_rgba(244,63,94,0.2)] flex flex-col items-center text-center animate-flame-active">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-6 text-rose-400">
                <AlertTriangle size={26} strokeWidth={2} />
              </div>

              <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-space)] tracking-widest">
                确认擦除记录？
              </h3>
              <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
                即将从星际导航网络中永久抹除{" "}
                <span className="text-zinc-200 font-semibold">{title}</span>{" "}
                的坐标。此操作不可逆。
              </p>

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
                  className="flex-1 px-5 py-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-sm font-bold transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      擦除中
                    </>
                  ) : (
                    "确认擦除"
                  )}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
