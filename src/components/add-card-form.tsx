"use client"

import { useState, useTransition } from "react"
import { addBookmark, fetchMetadata } from "@/app/actions"

const CATEGORIES = [
  { value: 'TOOL', label: '工具', color: 'cyan' },
  { value: 'DOC', label: '文档', color: 'blue' },
  { value: 'TUTORIAL', label: '教程', color: 'green' },
  { value: 'RESOURCE', label: '资源', color: 'yellow' },
  { value: 'COMMUNITY', label: '社区', color: 'purple' },
  { value: 'OTHER', label: '其他', color: 'gray' },
] as const

export function AddCardForm() {
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("OTHER")
  const [isFetching, setIsFetching] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleAutoFill = async () => {
    if (!url) return alert("请先输入网址！")
    if (!url.startsWith("http")) return alert("网址请以 http:// 或 https:// 开头")
    setIsFetching(true)
    const data = await fetchMetadata(url)
    if (data.success) {
      if (data.title) setName(data.title)
      if (data.description) setDescription(data.description)
    } else {
      alert("抓取失败，请手动填写。")
    }
    setIsFetching(false)
  }

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await addBookmark(formData)
      setUrl("")
      setName("")
      setDescription("")
      setCategory("OTHER")
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    })
  }

  return (
    <div className="relative mb-8 sm:mb-12 max-w-3xl mx-auto">
      {/* 成功提示动画 */}
      <div className={`absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-green-500/20 border border-green-500/30 text-green-400 px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        导航站点已添加
      </div>
      
      <form 
          action={handleSubmit} 
          className="bg-black/25 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-white/10 flex flex-col gap-3 sm:gap-4 animate-flame-hover"
        >
      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="url" name="url" placeholder="https://..." required 
          value={url} onChange={(e) => setUrl(e.target.value)}
          className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30 text-base"
        />
        <button 
          type="button" onClick={handleAutoFill} disabled={isFetching}
          className="bg-zinc-800 text-white text-sm sm:text-base px-6 py-2.5 rounded-xl transition-all hover:bg-zinc-700 active:scale-95 shrink-0"
        >
          {isFetching ? "抓取中..." : "🪄 智能提取"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="text" name="name" placeholder="网站名称" required 
          value={name} onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30 text-base"
        />
        <input 
          type="text" name="description" placeholder="一句话简介" 
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-white/30 text-base"
        />
      </div>

      {/* 分类选择器 */}
      <div className="flex flex-wrap gap-2">
        <span className="text-white/50 text-sm py-1.5">分类:</span>
        {CATEGORIES.map((cat) => (
          <label
            key={cat.value}
            className={`cursor-pointer px-3 py-1.5 rounded-lg text-sm transition-all border ${
              category === cat.value
                ? cat.color === 'cyan' ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                : cat.color === 'blue' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                : cat.color === 'green' ? 'bg-green-500/20 border-green-500/50 text-green-400'
                : cat.color === 'yellow' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                : cat.color === 'purple' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400'
                : 'bg-gray-500/20 border-gray-500/50 text-gray-400'
                : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            <input
              type="radio"
              name="category"
              value={cat.value}
              checked={category === cat.value}
              onChange={(e) => setCategory(e.target.value)}
              className="sr-only"
            />
            {cat.label}
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-white text-black font-bold px-8 py-2.5 rounded-xl transition-all hover:bg-zinc-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {isPending ? "添加中..." : "添加"}
        </button>
      </div>
    </form>
    </div>
  )
}
