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
    feishuLink?: string | null;
    studentId?: string | null;
    role?: string;
  }
  onUpdate: (formData: FormData) => Promise<void>;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [initialNickname, setInitialNickname] = useState(user.nickname || "")
  const [initialAvatar, setInitialAvatar] = useState(user.customAvatar || user.image || "")
  const [initialFeishu, setInitialFeishu] = useState(user.feishuLink || "")
  const [initialStudentId, setInitialStudentId] = useState(user.studentId || "")

  const [nickname, setNickname] = useState(initialNickname)
  const [preview, setPreview] = useState(initialAvatar)
  const [feishu, setFeishu] = useState(initialFeishu)
  const [studentId, setStudentId] = useState(initialStudentId)
  const [isUploading, setIsUploading] = useState(false)
  
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: "success" | "error" | "warning" }>({
    visible: false, message: "", type: "success"
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const hasChanged = nickname !== initialNickname || preview !== initialAvatar || feishu !== initialFeishu || studentId !== initialStudentId

  const showToast = (message: string, type: "success" | "error" | "warning") => {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000)
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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
        .from('avatars').upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars').getPublicUrl(filePath)

      setPreview(publicUrl)
    } catch (error) {
      showToast("建立连接失败，请检查 Supabase 跃迁协议", "error")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!hasChanged) return
    
    setIsUploading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("avatar", preview) 
    
    await onUpdate(formData)
    
    showToast("档案已完美同步至星际数据库", "success")
    setInitialNickname(nickname)
    setInitialAvatar(preview)
    setInitialFeishu(feishu)
    setInitialStudentId(studentId)
    setIsUploading(false)
    router.refresh()
  }

  return (
    <>
      <div className={`fixed top-20 sm:top-24 md:top-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] sm:w-auto max-w-md transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${toast.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}`}>
        <div className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl backdrop-blur-xl border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.25)]' : toast.type === 'error' ? 'bg-red-500/10 border-red-500/40 shadow-[0_0_40px_rgba(239,68,68,0.25)]' : 'bg-blue-500/10 border-blue-500/40 shadow-[0_0_40px_rgba(59,130,246,0.25)]'}`}>
          <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border ${toast.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-blue-500/20 border-blue-500/50 text-blue-500'}`}>
            <div className={`absolute inset-0 rounded-full animate-ping opacity-30 ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <span className="relative z-10 text-lg">{toast.type === 'success' ? '✔' : toast.type === 'error' ? '✖' : 'ℹ'}</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${toast.type === 'success' ? 'text-emerald-400/80' : toast.type === 'error' ? 'text-red-500/80' : 'text-blue-500/80'}`}>
              {toast.type === 'success' ? 'Sync Success' : toast.type === 'error' ? 'Sync Failed' : 'Sync Warning'}
            </span>
            <span className={`text-sm font-bold tracking-widest font-[family-name:var(--font-space)] ${toast.type === 'success' ? 'text-emerald-400' : toast.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
              {toast.message}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white/20 p-1 mb-4 group cursor-pointer overflow-hidden bg-zinc-900 shadow-[0_0_30px_rgba(255,255,255,0.05)]" onClick={() => !isUploading && fileInputRef.current?.click()}>
            {isUploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div></div>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Avatar" className="w-full h-full rounded-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-40" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          <p className="text-[13px] text-blue-400/80 font-bold uppercase tracking-[0.15em] mb-1">点击头像即可修改</p>
          <p className="text-[12px] text-zinc-500 font-mono tracking-tighter opacity-80">{user.email}</p>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">识别昵称 / Nickname</label>
          <input 
            name="nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} required
            className="w-full bg-black/50 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-white/30 transition-all text-white font-[family-name:var(--font-space)] text-base"
          />
        </div>

        {/* 🚀 飞书链接：正式船员及管理层（包含式权限）均可见 */}
        {user.role !== "PENDING" && (
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">飞书个人链接 / Feishu Link</label>
            <input 
              name="feishuLink" value={feishu} onChange={(e) => setFeishu(e.target.value)}
              placeholder="https://www.feishu.cn/invitation/..."
              className="w-full bg-black/50 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-white/30 transition-all text-white font-mono text-sm"
            />
            <p className="text-[9px] text-zinc-500 ml-2 italic opacity-80">* 缺失此通讯链接将无法接收舰队跃迁集结通知</p>
          </div>
        )}

        {/* 🚀 核心修复：基于包含式权限，只要不是新兵，都可以拥有学号 */}
        {user.role !== "PENDING" && (
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">学号 / Student ID</label>
            <input 
              name="studentId" value={studentId} onChange={(e) => setStudentId(e.target.value)} 
              // 🚀 细节：普通人员必填，管理层可选填（无视 required 拦截）
              required={user.role === "MEMBER"} 
              placeholder={user.role === "MEMBER" ? "请输入您的学号" : "指挥组可选填"}
              className="w-full bg-black/50 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 outline-none focus:border-blue-500/30 transition-all text-white font-mono text-sm"
            />
          </div>
        )}

        <button 
          type="submit" disabled={!hasChanged || isUploading}
          className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold tracking-[0.15em] sm:tracking-[0.2em] text-sm sm:text-base transition-all duration-500 mt-4 flex items-center justify-center gap-3 ${!hasChanged ? "bg-zinc-900 border border-zinc-800 text-zinc-600 cursor-not-allowed opacity-80" : "bg-white text-black hover:bg-emerald-500 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]" }`}
        >
          {isUploading ? (
            <><div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></div><span>正在写入数据库...</span></>
          ) : !hasChanged ? <span>档案已是最新状态</span> : <span>同步修改至控制中心</span>}
        </button>
      </form>
    </>
  )
}
