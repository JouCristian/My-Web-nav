"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

interface ProfileFormProps {
  user: {
    id: string;
    nickname: string | null;
    customAvatar: string | null;
    image: string | null;
    email: string | null;
  }
  onUpdate: (formData: FormData) => Promise<void>;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [preview, setPreview] = useState(user.customAvatar || user.image || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 限制 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert("图片太大啦！请上传 2MB 以内的图片。")
      return
    }

    try {
      setIsUploading(true)
      
      // 1. 生成唯一文件名 (用户ID + 时间戳)
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // 2. 上传到 Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // 3. 获取公开 URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setPreview(publicUrl)
    } catch (error) {
      console.error("上传失败:", error)
      alert("头像上传失败，请检查 Supabase Storage 设置")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsUploading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.set("avatar", preview) // 此时的 preview 是 Supabase 的 URL
    
    await onUpdate(formData)
    setIsUploading(false)
    alert("档案已同步至星际数据库")
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center mb-8">
        <div 
          className="relative w-28 h-28 rounded-full border-2 border-white/20 p-1 mb-4 group cursor-pointer overflow-hidden bg-zinc-900 shadow-[0_0_30px_rgba(255,255,255,0.05)]"
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          ) : null}
          <img 
            src={preview} 
            alt="Avatar" 
            className="w-full h-full rounded-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-40"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
            </svg>
          </div>
        </div>
        
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
        
        {/* 🚀 新增提示小字：颜色较亮，字间距宽 */}
        <p className="text-[13px] text-blue-400/80 font-bold uppercase tracking-[0.15em] mb-1">
          点击头像即可修改
        </p>
        {/* 邮箱地址：颜色较暗，区分开来 */}
        <p className="text-[12px] text-zinc-1600 font-mono tracking-tighter opacity-60">
          {user.email}
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-zinc-1000 uppercase tracking-[0.2em] ml-2">识别昵称 / Nickname</label>
        <input 
          name="nickname" 
          defaultValue={user.nickname || ""} 
          required
          className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/30 transition-all text-white font-[family-name:var(--font-space)]"
        />
      </div>

      <button 
        type="submit"
        disabled={isUploading}
        className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-blue-400 hover:text-white transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] disabled:opacity-50 mt-4"
      >
        {isUploading ? "正在上传/同步..." : "保存修改"}
      </button>
    </form>
  )
}