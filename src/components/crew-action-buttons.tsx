// src/components/crew-action-buttons.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { approveCrew, rejectCrew } from "@/app/actions" // 假设您的 action 在这里

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<"APPROVE" | "REJECT" | null>(null)
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleAction = async () => {
    setIsPending(true)
    try {
      if (modalType === "APPROVE") {
        await approveCrew(userId)
      } else {
        await rejectCrew(userId)
      }
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Action failed:", error)
    } finally {
      setIsPending(false)
    }
  }

  const openModal = (type: "APPROVE" | "REJECT") => {
    setModalType(type)
    setIsOpen(true)
  }

  return (
    <>
      {/* 🚀 外部控制按钮组 */}
      <div className="flex gap-3">
        <button
          onClick={() => openModal("APPROVE")}
          className="group relative px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 text-xs font-bold tracking-widest uppercase transition-all hover:border-emerald-500 hover:bg-emerald-500/10 active:scale-95"
        >
          批准入舰
        </button>
        <button
          onClick={() => openModal("REJECT")}
          className="group relative px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/5 text-red-400 text-xs font-bold tracking-widest uppercase transition-all hover:border-red-500 hover:bg-red-500/10 active:scale-95"
        >
          拒绝
        </button>
      </div>

      {/* 🚀 指令确认终端 (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          {/* 背景遮罩：深邃且带模糊 */}
          <div 
            className="absolute inset-0 bg-[#020205]/80 backdrop-blur-sm animate-in fade-in duration-500" 
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* 弹窗主体：延续 Module A 的设计语言 */}
          <div className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] border backdrop-blur-2xl bg-black/60 shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)] transition-all duration-500 animate-in zoom-in-95 slide-in-from-bottom-8 
            ${modalType === "APPROVE" ? 'border-emerald-500/30' : 'border-red-500/30'}`}
          >
            {/* 顶部能量条装饰 */}
            <div className={`h-1.5 w-full ${modalType === "APPROVE" ? 'bg-emerald-500/40' : 'bg-red-500/40'} relative overflow-hidden`}>
               <div className={`absolute inset-0 w-1/2 animate-[shimmer_2s_infinite] ${modalType === "APPROVE" ? 'bg-emerald-400' : 'bg-red-400'}`} />
            </div>

            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-3 h-3 rounded-full animate-pulse ${modalType === "APPROVE" ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'}`} />
                <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-zinc-500 uppercase">
                  Security Protocol
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white tracking-wider mb-2 font-[family-name:var(--font-space)]">
                {modalType === "APPROVE" ? "确认批准入舰？" : "确认拒绝申请？"}
              </h2>
              
              <p className="text-zinc-400 text-sm leading-relaxed mb-10">
                正在处理 <span className="text-white font-bold mx-1">{realName}</span> 的船员档案。
                {modalType === "APPROVE" 
                  ? "批准后，该成员将获得基础甲板通行权限。" 
                  : "拒绝后，该申请将被永久移出待处理队列。"}
              </p>

              <div className="flex gap-4">
                <button
                  disabled={isPending}
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-zinc-400 text-xs font-bold tracking-[0.2em] uppercase transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
                >
                  取消发送
                </button>
                <button
                  disabled={isPending}
                  onClick={handleAction}
                  className={`flex-1 px-6 py-4 rounded-2xl text-black text-xs font-bold tracking-[0.2em] uppercase transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2
                    ${modalType === "APPROVE" ? 'bg-emerald-400 hover:bg-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.3)]' : 'bg-red-500 hover:bg-red-400 shadow-[0_0_30px_rgba(239,68,68,0.3)]'}`}
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  ) : (
                    "确认执行"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}