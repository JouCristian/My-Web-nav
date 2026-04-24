// src/components/profile-form.tsx
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
  // 1. 记录初始基准状态 (用于比对是否发生修改)
  const [initialNickname, setInitialNickname] = useState(user.nickname || "")
  const [initialAvatar, setInitialAvatar] = useState(user.customAvatar || user.image || "")

  // 2. 绑定当前正在编辑的状态
  const [nickname, setNickname] = useState(initialNickname)
  const [preview, setPreview] = useState(initialAvatar)
  const [isUploading, setIsUploading] = useState(false)
  
  // 🚀 3. 新增：全局自定义全息弹窗 (Toast) 状态
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "warning" }>({
    visible: false,
    message: "",
    type: "success"
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 🚀 核心判定：当前信息与初始信息不一致时，即视为被修改
  const hasChanged = nickname !== initialNickname || preview !== initialAvatar

  // 触发弹窗的辅助函数 (3秒后自动消失)
  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ visible: true, message, type })
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }))
    }, 3000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 限制 2MB
    if (file.size > 2 * 1024 * 1024) {
      showToast("突破质量限制！请上传 2MB 以内的图像", "warning")
      return
    }

    try {
      setIsUploading(true)
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      // 注意：这里仅仅是更新了预览图，不自动提交。所以 hasChanged 会变为 true，点亮保存按钮。
    } catch (error) {
      console.error("上传失败:", error)
      showToast("建立连接失败，请检查 Supabase 跃迁协议 (Storage)", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hasChanged) return // 安全锁：如果没修改强行拦截
    
    setIsUploading(true)
    
    const formData = new FormData(e.currentTarget)
    formData.set("avatar", preview) 
    
    await onUpdate(formData)
    
    // 成功后：触发金黄色全息弹窗
    showToast("档案已完美同步至星际数据库", "success")
    
    // 更新基准状态，让按钮重新进入休眠变灰
    setInitialNickname(nickname)
    setInitialAvatar(preview)
    
    setIsUploading(false)
    router.refresh()
  }

  return (
    <>
      {/* ========================================== */}
      {/* 🚀 专属全息弹窗 (Holographic Toast UI) */}
      {/* ========================================== */}
      <div className={`fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
        <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl backdrop-blur-xl border ${
          toast.type === 'success' 
            ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.25)]' 
            : toast.type === 'error'
            ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)]'
            : 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.25)]'
        }`}>
          {/* 图标区 */}
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border ${
            toast.type === 'success' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-500' : 
            toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-500' : 
            'bg-blue-500/20 border-blue-500/50 text-blue-500'
          }`}>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${toast.type === 'success' ? 'bg-yellow-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <span className="relative z-10 text-lg">
              {toast.type === 'success' ? '👑' : toast.type === 'error' ? '⚠️' : 'ℹ️'}
            </span>
          </div>
          {/* 文字区 */}
          <div className="flex flex-col">
            <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${
              toast.type === 'success' ? 'text-yellow-500/80' : toast.type === 'error' ? 'text-red-500/80' : 'text-blue-500/80'
            }`}>
              {toast.type === 'success' ? 'System Success' : toast.type === 'error' ? 'System Error' : 'System Notice'}
            </span>
            <span className={`text-sm font-bold tracking-widest font-[family-name:var(--font-space)] ${
              toast.type === 'success' ? 'text-yellow-400' : toast.type === 'error' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {toast.message}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* ⚛️ 表单主体 */}
      {/* ========================================== */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* 头像区 */}
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
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
          
          <p className="text-[13px] text-blue-400/80 font-bold uppercase tracking-[0.15em] mb-1">
            点击头像即可修改
          </p>
          <p className="text-[12px] text-zinc-500 font-mono tracking-tighter opacity-80">
            {user.email}
          </p>
        </div>

        {/* 昵称区 */}
        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">识别昵称 / Nickname</label>
          <input 
            name="nickname" 
            value={nickname} // 🚀 使用状态绑定，而不再是 defaultValue
            onChange={(e) => setNickname(e.target.value)} // 监听键盘输入
            required
            className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-white/30 transition-all text-white font-[family-name:var(--font-space)]"
          />
        </div>

        {/* 🚀 智能同步按钮 */}
        <button 
          type="submit"
          // 如果没有被修改，或者正在上传，就锁死按钮
          disabled={!hasChanged || isUploading}
          className={`w-full py-4 rounded-2xl font-bold tracking-[0.2em] transition-all duration-500 mt-4 flex items-center justify-center gap-3 ${
            !hasChanged
              ? "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed opacity-80" // 🔴 灰暗休眠态
              : "bg-white text-black hover:bg-blue-400 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_20px_rgba(96,165,250,0.4)]" // 🟢 激活态
          }`}
        >
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div>
              <span>正在写入数据库...</span>
            </>
          ) : !hasChanged ? (
            <span>档案已是最新状态</span>
          ) : (
            <span>同步修改至控制中心</span>
          )}
        </button>
      </form>
    </>
  )
}