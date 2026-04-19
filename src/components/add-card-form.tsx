"use client"

import { useState } from "react"
import { addBookmark, fetchMetadata } from "@/app/actions"

export function AddCardForm() {
  const [url, setUrl] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isFetching, setIsFetching] = useState(false)

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

  return (
    <form 
      action={addBookmark} 
      className="mb-12 bg-white/5 p-6 rounded-3xl border border-white/10 max-w-3xl mx-auto flex flex-col gap-4 transition-all duration-500 ease-in-out hover:scale-[1.02] hover:border-white/20 animate-flame-hover"
    >
      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="url" name="url" placeholder="https://..." required 
          value={url} onChange={(e) => setUrl(e.target.value)}
          className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30"
        />
        <button 
          type="button" onClick={handleAutoFill} disabled={isFetching}
          className="bg-zinc-800 text-white px-6 py-2 rounded-xl transition-all hover:bg-zinc-700 active:scale-95"
        >
          {isFetching ? "抓取中..." : "🪄 智能提取"}
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input 
          type="text" name="name" placeholder="网站名称" required 
          value={name} onChange={(e) => setName(e.target.value)}
          className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30"
        />
        <input 
          type="text" name="description" placeholder="一句话简介" 
          value={description} onChange={(e) => setDescription(e.target.value)}
          className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-white/30"
        />
        <button type="submit" className="bg-white text-black font-bold px-8 py-2 rounded-xl transition-all hover:bg-zinc-200 active:scale-95">
          添加
        </button>
      </div>
    </form>
  )
}