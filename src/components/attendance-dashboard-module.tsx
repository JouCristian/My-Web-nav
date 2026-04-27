// src/components/attendance-dashboard-module.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { getLeaveRequestsAction } from "@/app/actions"

type CrewStats = {
  name: string;
  present: number;
  missing: number;
  leave: number;
}

export function AttendanceDashboardModule({ 
  managers = [], 
  crewMembers = [] 
}: { 
  managers: string[], 
  crewMembers: string[] 
}) {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<CrewStats[]>([])
  const [maxVal, setMaxVal] = useState(5) // Y轴基准，防止柱子撑破

  useEffect(() => { setMounted(true) }, [])

  // 🚀 核心雷达：每 3 秒统筹一次全局数据并进行计算
  useEffect(() => {
    if (!mounted) return
    let isFetching = false

    const fetchAllData = async () => {
      if (isFetching) return
      isFetching = true
      try {
        // 1. 从本地防空洞读取签到历史
        const saved = localStorage.getItem("STARFLEET_ATTENDANCE_V6")
        let parsedLogs: any = {}
        if (saved) { try { parsedLogs = JSON.parse(saved) } catch(e){} }

        // 2. 从服务器实时拉取请假数据
        const leaves = await getLeaveRequestsAction()

        // 3. 构建初始统计图谱
        const map: Record<string, CrewStats> = {}
        crewMembers.forEach(c => map[c] = { name: c, present: 0, missing: 0, leave: 0 })

        // 统计出勤与缺勤
        Object.values(parsedLogs).forEach((dayLogs: any) => {
          dayLogs.forEach((log: any) => {
            log.present?.forEach((p: string) => { if (map[p]) map[p].present++ })
            log.missing?.forEach((m: string) => { if (map[m]) map[m].missing++ })
          })
        })

        // 统计请假 (只计算已批准的)
        leaves.forEach(req => {
          if (req.status === 'APPROVED' && map[req.applicant]) {
            map[req.applicant].leave++
          }
        })

        // 计算最大值以设定 Y 轴比例
        const arr = Object.values(map)
        const max = Math.max(...arr.map(a => Math.max(a.present, a.missing, a.leave)), 5)
        
        setMaxVal(max)
        setStats(arr)
      } finally {
        isFetching = false
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, 3000)
    return () => clearInterval(interval)
  }, [mounted, crewMembers])

  // 🚀 核心动效：极致 Q弹的非线性生长弹簧
  const springConfig = { type: "spring", stiffness: 300, damping: 15, mass: 0.8 }

  // 🚀 手写的科幻 3D 圆柱体组件
  const Cylinder3D = ({ type, value, max }: { type: 'green'|'red'|'amber', value: number, max: number }) => {
    const heightPercent = max === 0 ? 0 : (value / max) * 100;
    
    return (
      <div className="relative group w-4 flex flex-col justify-end items-center h-full">
        {/* 悬浮数值提示 */}
        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded border border-white/10 z-20 pointer-events-none shadow-xl">
          {value}
        </div>
        
        {/* 动态生长的圆柱体本体 */}
        <motion.div 
          initial={{ height: 0 }} 
          animate={{ height: `${heightPercent}%` }} 
          transition={springConfig}
          className={`w-full relative rounded-t-lg cyl-${type} origin-bottom`}
        >
          {/* 圆柱顶部的 3D 拟物高光面 */}
          <div className={`absolute -top-1 left-0 w-full h-2 rounded-full cyl-${type}-top z-10`} />
        </motion.div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        /* 翠绿：出勤 */
        .cyl-green { background: linear-gradient(90deg, #064e3b 0%, #10b981 50%, #022c22 100%); box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px rgba(16, 185, 129, 0.4); }
        .cyl-green-top { background: #34d399; box-shadow: inset 0 0 5px rgba(255,255,255,0.8); }

        /* 猩红：缺勤 */
        .cyl-red { background: linear-gradient(90deg, #7f1d1d 0%, #ef4444 50%, #450a0a 100%); box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px rgba(239, 68, 68, 0.4); }
        .cyl-red-top { background: #f87171; box-shadow: inset 0 0 5px rgba(255,255,255,0.8); }

        /* 琥珀：休假 */
        .cyl-amber { background: linear-gradient(90deg, #78350f 0%, #f59e0b 50%, #451a03 100%); box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px rgba(245, 158, 11, 0.4); }
        .cyl-amber-top { background: #fbbf24; box-shadow: inset 0 0 5px rgba(255,255,255,0.8); }
        
        .matrix-scrollbar::-webkit-scrollbar { height: 6px; } 
        .matrix-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .matrix-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; } 
        .matrix-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6); }
      `}} />

      <div className="w-full rounded-[3.5rem] border border-emerald-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-[0_0_100px_rgba(16,185,129,0.05)] flex flex-col h-full relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(16,185,129,0.05),transparent)] bg-[length:200%_200%] animate-[shimmer-seamless_4s_linear_infinite] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">全舰态势感知看板</h2>
              <p className="text-emerald-400/60 font-mono text-[10px] uppercase tracking-widest mt-1">Crew Telemetry Matrix</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono tracking-widest bg-black/40 px-4 py-2 rounded-xl border border-white/5">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>出勤</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>缺勤</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div>休假</div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10 h-[350px]">
          
          {/* 左半侧：管理人员矩阵 */}
          <div className="w-32 md:w-40 border-r border-white/10 flex flex-col gap-4 pr-4 shrink-0">
            <div className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
              Commanders
            </div>
            <div className="flex-1 overflow-y-auto matrix-scrollbar space-y-2 pr-1">
              {managers.map(m => (
                <div key={m} className="bg-emerald-500/5 border border-emerald-500/20 px-3 py-3 rounded-xl flex items-center justify-center text-center">
                  <span className="text-xs font-bold text-emerald-400 tracking-wider truncate">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 右半侧：无限延展的船员 3D 统计折线矩阵 */}
          <div className="flex-1 flex flex-col relative overflow-hidden">
            
            {/* 纵坐标网格线 (Y-Axis) */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-8 z-0">
               {[...Array(5)].map((_, i) => <div key={i} className="border-b border-white/20 w-full flex-1" />)}
            </div>
            
            {/* 横向滚动视图 (X-Axis) */}
            <div className="flex-1 overflow-x-auto matrix-scrollbar flex items-end gap-8 pb-2 pt-10 px-4 relative z-10">
              <AnimatePresence>
                {stats.length > 0 ? stats.map(s => (
                  <motion.div 
                    layout 
                    key={s.name} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 shrink-0 hover:bg-white/5 p-2 rounded-xl transition-colors duration-300"
                  >
                    {/* 3D 圆柱组 */}
                    <div className="flex items-end gap-1.5 h-48 border-b border-white/10 pb-1 w-full justify-center">
                      <Cylinder3D type="green" value={s.present} max={maxVal} />
                      <Cylinder3D type="red" value={s.missing} max={maxVal} />
                      <Cylinder3D type="amber" value={s.leave} max={maxVal} />
                    </div>
                    {/* 横坐标船员姓名 */}
                    <span className="text-[10px] font-bold text-zinc-400 font-mono text-center w-16 truncate" title={s.name}>{s.name}</span>
                  </motion.div>
                )) : (
                  <div className="absolute inset-0 flex items-center justify-center text-zinc-600 font-mono text-xs tracking-widest">
                    NO CREW TELEMETRY FOUND
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}