"use client"

import { useState } from "react"
import { approveUser, rejectUser } from "@/app/dashboard/crew/actions"

export function CrewActionButtons({ userId, realName }: { userId: string, realName: string }) {
  const [isPending, setIsPending] = useState(false)

  const handleApprove = async () => {
    if (confirm(`是否确认将新兵 [${realName}] 授勋为正式船员？`)) {
      setIsPending(true)
      await approveUser(userId)
      setIsPending(false)
    }
  }

  const handleReject = async () => {
    if (confirm(`警告：此操作将永久抹除 [${realName}] 的档案，是否继续？`)) {
      setIsPending(true)
      await rejectUser(userId)
      setIsPending(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {/* 核准按钮 */}
      <button 
        onClick={handleApprove}
        disabled={isPending}
        className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-widest hover:bg-emerald-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {isPending ? "..." : "核准入舰"}
      </button>

      {/* 驳回按钮 */}
      <button 
        onClick={handleReject}
        disabled={isPending}
        className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 disabled:opacity-50"
      >
        {isPending ? "..." : "驳回清除"}
      </button>
    </div>
  )
}