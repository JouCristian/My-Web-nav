// src/components/onboarding-form.tsx
"use client"

import { useState, useTransition } from "react"
import Stepper, { Step } from "./stepper"
import { updateRecruitProfile, revokeRecruitProfile } from "@/app/actions"
import Link from "next/link"

export function OnboardingForm({ defaultCompleted = false }: { defaultCompleted?: boolean }) {
  const [realName, setRealName] = useState("")
  const [studentId, setStudentId] = useState("")
  const [feishuLink, setFeishuLink] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleComplete = () => {
    if (!realName || !studentId) return alert("核心坐标缺失：请填写生物学标识与学院编号")
    const formData = new FormData()
    formData.append("realName", realName)
    formData.append("studentId", studentId)
    formData.append("feishuLink", feishuLink)
    
    startTransition(() => {
      updateRecruitProfile(formData)
    })
  }

  // 🚀 核心视效：这正是第一张图片的“档案审核中”状态
  // 当点击提交，或者进入状态 2 时，它会自动丝滑撑满整个 Stepper 容器
  const completedContent = (
    <div className="flex flex-col items-center justify-center py-6 text-center animate-apple-spring">
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20"></div>
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin"></div>
        <div className="absolute inset-3 rounded-full bg-blue-500/10 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 animate-pulse">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white tracking-[0.2em] font-[family-name:var(--font-space)] mb-4">档案同步审核中</h2>
      <p className="text-zinc-500 font-mono text-xs tracking-widest uppercase mb-10">Awaiting Command Clearance...</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full border-t border-white/5 pt-8">
        <Link href="/contact" className="flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold hover:bg-emerald-500 hover:text-white transition-all text-xs tracking-widest active:scale-95">
          <span>联系舰长加速审核 ✅</span>
        </Link>
        {/* 调用了你原有的撤销建档接口 */}
        <form action={revokeRecruitProfile} className="w-full">
          <button type="submit" className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all text-xs tracking-widest active:scale-95">
            <span>撤销并重新填写档案 ↩</span>
          </button>
        </form>
      </div>
    </div>
  )

  // 根据当前状态自动切换容器边框和光晕的颜色（填表时是警告红，审核时是安全蓝）
  const isFinished = defaultCompleted || isPending;
  const borderColor = isFinished ? 'border-blue-500/30' : 'border-red-500/30';
  const shadowColor = isFinished ? 'shadow-[0_0_80px_rgba(59,130,246,0.15)]' : 'shadow-[0_0_80px_rgba(239,68,68,0.15)]';

  return (
    <Stepper
      initialStep={defaultCompleted ? 6 : 1}
      onFinalStepCompleted={handleComplete}
      completedContent={completedContent}
      backButtonText="返回 / BACK"
      nextButtonText="确认录入 / NEXT"
      completeButtonText={isPending ? "数据刻录中..." : "提交核心档案 / SUBMIT"}
      stepCircleContainerClassName={`bg-[#06060a]/90 border ${borderColor} p-6 sm:p-10 rounded-[2.5rem] backdrop-blur-2xl ${shadowColor} w-full transition-colors duration-1000`}
      nextButtonProps={{
        disabled: isPending,
        className: "bg-red-500/20 border border-red-500/50 text-red-400 font-bold py-3 px-6 rounded-2xl hover:bg-red-500 hover:text-white transition-all tracking-[0.1em] text-xs disabled:opacity-50"
      }}
      backButtonProps={{
        disabled: isPending,
        className: "text-zinc-500 hover:text-white font-mono tracking-[0.1em] text-xs px-4 transition-colors disabled:opacity-50"
      }}
    >
      <Step>
        <div className="flex items-center gap-4 mb-8 border-b border-red-500/20 pb-6">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 animate-pulse">🛡️</div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-widest font-[family-name:var(--font-space)]">舰载拦截系统启动</h1>
            <p className="text-red-400/80 text-xs font-mono mt-1 uppercase tracking-widest">Security Protocol Alpha</p>
          </div>
        </div>
        <div className="space-y-4 mb-4">
          <p className="text-zinc-400 text-sm leading-relaxed tracking-wider">
            <strong className="text-red-400">警告：检测到未授权的生命体征靠近中枢。</strong><br/>
            舰载安全系统已自动阻断您的访问请求。如果您是新分配的舰队乘员，请配合完成新兵入列程序，以获取在主星舰上的基础行动权限。
          </p>
        </div>
      </Step>
      
      <Step>
        <div className="space-y-2 py-2">
          <h2 className="text-xl font-bold text-white tracking-widest font-[family-name:var(--font-space)] mb-1">生物学标识录入</h2>
          <p className="text-red-400/80 text-xs font-mono uppercase tracking-widest mb-6">Biological Designation</p>
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">真实姓名 / Real Name</label>
          <input type="text" value={realName} onChange={e => setRealName(e.target.value)} required placeholder="在此输入您的真实姓名..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 text-white transition-colors" />
        </div>
      </Step>

      <Step>
        <div className="space-y-2 py-2">
          <h2 className="text-xl font-bold text-white tracking-widest font-[family-name:var(--font-space)] mb-1">星舰学院防伪编号</h2>
          <p className="text-red-400/80 text-xs font-mono uppercase tracking-widest mb-6">Academy Credentials</p>
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">学号 / Student ID</label>
          <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} required placeholder="在此输入您的学号..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 text-white transition-colors font-mono" />
        </div>
      </Step>

      <Step>
        <div className="space-y-2 py-2">
          <h2 className="text-xl font-bold text-white tracking-widest font-[family-name:var(--font-space)] mb-1">亚空间通讯链路</h2>
          <p className="text-red-400/80 text-xs font-mono uppercase tracking-widest mb-6">Comms Link (Optional)</p>
          <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] ml-2">飞书主页链接 / Feishu Url (选填)</label>
          <input type="text" value={feishuLink} onChange={e => setFeishuLink(e.target.value)} placeholder="粘贴飞书主页链接..." className="w-full bg-black/50 border border-white/10 rounded-2xl px-5 py-4 outline-none focus:border-red-500/50 text-white transition-colors font-mono text-sm" />
        </div>
      </Step>

      <Step>
        <div className="space-y-4 py-2">
          <h2 className="text-xl font-bold text-white tracking-widest font-[family-name:var(--font-space)] mb-1">档案终审协议</h2>
          <p className="text-red-400/80 text-xs font-mono uppercase tracking-widest mb-6">Ready for Database Transmission</p>
          
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-sm text-red-100 space-y-4 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)] backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <span className="text-red-500/60 uppercase tracking-widest text-[10px] font-mono">Designation</span>
              <span className="font-bold tracking-wider">{realName || '未检测到生命体名称'}</span>
            </div>
            <div className="flex items-center justify-between border-b border-red-500/20 pb-3">
              <span className="text-red-500/60 uppercase tracking-widest text-[10px] font-mono">Clearance ID</span>
              <span className="font-bold tracking-wider font-mono">{studentId || '未检测到合法编号'}</span>
            </div>
            <div className="flex items-center justify-between pb-1">
              <span className="text-red-500/60 uppercase tracking-widest text-[10px] font-mono">Comms Link</span>
              <span className="font-mono text-xs truncate max-w-[160px] text-zinc-400">{feishuLink || '信号未接入'}</span>
            </div>
          </div>
          <p className="text-zinc-500 text-[10px] mt-4 tracking-[0.1em] leading-relaxed">
            请最后确认您的核心坐标无误。点击提交后，数据将永久刻录至星舰数据库，并转交最高指挥官审核。
          </p>
        </div>
      </Step>
    </Stepper>
  )
}