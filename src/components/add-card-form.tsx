"use client"

import { useState, useTransition } from "react"
import { addBookmark, fetchMetadata } from "@/app/actions"

export function AddCardForm() {
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
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
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 2000)
    })
  }

  return (
    <div className="relative mb-12 max-w-3xl mx-auto">
      {/* Liquid Glass 成功提示 */}
      <div className={`absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-2 liquid-glass rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300 text-green-300 ${showSuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 9 17l-5-5"/>
        </svg>
        导航站点已添加
      </div>
      
      {/* Liquid Glass 表单容器 */}
      <form 
        action={handleSubmit} 
        className="liquid-glass liquid-glass-hover rounded-3xl p-6 flex flex-col gap-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="url" name="url" placeholder="https://..." required 
            value={url} onChange={(e) => setUrl(e.target.value)}
            className="flex-1 min-w-0 liquid-input rounded-2xl px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />
          <button 
            type="button" onClick={handleAutoFill} disabled={isFetching}
            className="liquid-button rounded-2xl px-6 py-3 text-white font-medium whitespace-nowrap"
          >
            {isFetching ? "抓取中..." : "智能提取"}
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" name="name" placeholder="网站名称" required 
            value={name} onChange={(e) => setName(e.target.value)}
            className="flex-1 min-w-0 liquid-input rounded-2xl px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />
          <input 
            type="text" name="description" placeholder="一句话简介" 
            value={description} onChange={(e) => setDescription(e.target.value)}
            className="flex-1 min-w-0 liquid-input rounded-2xl px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />
          <button 
            type="submit" 
            disabled={isPending}
            className="liquid-button rounded-2xl px-8 py-3 font-bold whitespace-nowrap bg-white/20 hover:bg-white/30 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "添加中..." : "添加"}
          </button>
        </div>
      </form>
    </div>
  )
}
