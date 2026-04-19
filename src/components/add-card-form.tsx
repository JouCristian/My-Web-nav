import { addBookmark } from "@/app/actions"

export function AddCardForm() {
  return (
    <form 
      action={addBookmark} 
      className="mb-12 p-6 rounded-3xl bg-white/5 border border-white/10 max-w-2xl mx-auto flex flex-col md:flex-row gap-4 items-end transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 hover:border-white/20 hover:shadow-2xl"
    >
      <div className="flex-1 space-y-2">
        <label className="text-xs text-zinc-500 ml-2">网站名称</label>
        <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="网址名" />
      </div>
      <div className="flex-1 space-y-2">
        <label className="text-xs text-zinc-500 ml-2">网址 URL</label>
        <input name="url" type="url" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="请输入网址" />
      </div>
      <div className="flex-[2] space-y-2">
        <label className="text-xs text-zinc-500 ml-2">简介</label>
        <input name="description" required className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-white/30 transition-colors" placeholder="一句话描述这个网站" />
      </div>
      <button type="submit" className="bg-white text-black px-6 py-2 rounded-xl font-medium hover:bg-zinc-200 transition-colors">
        添加
      </button>
    </form>
  )
}