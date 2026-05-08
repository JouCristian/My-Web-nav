// src/components/attendance-dashboard-module.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
// 🚀 核心修复：引入最新云端历史查询协议
import { getLeaveRequestsAction, getRollCallHistoryAction } from "@/app/actions"

type CrewStats = {
  name: string;
  present: number;
  missing: number;
  leave: number;
}

export type ManagerData = {
  id: string;
  name: string;
  role: string;
  image: string | null;
}

type CrewMemberWithJoinDate = {
  name: string;
  joinedAt: number;
}

export function AttendanceDashboardModule({ 
  managers = [], 
  crewMembers = [],
  crewMembersWithJoinDate = []
}: { 
  managers: any[], 
  crewMembers: string[],
  crewMembersWithJoinDate?: CrewMemberWithJoinDate[]
}) {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<CrewStats[]>([])
  const [maxVal, setMaxVal] = useState(5) 

  useEffect(() => { setMounted(true) }, [])

  // 🚀 核心：彻底重构云端态势感知算法
  useEffect(() => {
    if (!mounted) return
    let isFetching = false

    const fetchAllData = async () => {
      if (isFetching) return
      isFetching = true
      try {
        // 从云端交叉获取两组档案
        const [history, leaves] = await Promise.all([
          getRollCallHistoryAction(),
          getLeaveRequestsAction()
        ]);

        const map: Record<string, CrewStats> = {}
        crewMembers.forEach(c => map[c] = { name: c, present: 0, missing: 0, leave: 0 })

        // 历史数据交叉推演
        history.forEach(session => {
          const sessionTime = session.timestamp;
          
          // 在这局集结中，有谁正好处于合法请假状态？
          const activeLeaves = leaves.filter(req => {
            if (req.status !== 'APPROVED') return false;
            const start = new Date(req.startTime).getTime();
            const end = new Date(req.endTime).getTime();
            return sessionTime >= start && sessionTime <= end;
          });
          const onLeaveNames = activeLeaves.map(r => r.applicant);

          // 记录本局的签到者
          session.present.forEach(p => { if (map[p]) map[p].present++; });
          
          // 🚀 核心修复：只统计在签到发起前已加入的船员
          const eligibleCrew = crewMembersWithJoinDate.length > 0
            ? crewMembersWithJoinDate.filter(c => c.joinedAt <= sessionTime).map(c => c.name)
            : crewMembers;
          
          // 记录本局的缺勤者/休假者（仅对当时已加入的船员）
          eligibleCrew.forEach(c => {
            if (!session.present.includes(c)) {
              if (onLeaveNames.includes(c)) {
                if (map[c]) map[c].leave++; 
              } else {
                if (map[c]) map[c].missing++;
              }
            }
          });
        });

        // 大盘 UI 更新
        const arr = Object.values(map)
        const max = Math.max(...arr.map(a => Math.max(a.present, a.missing, a.leave)), 5)
        
        setMaxVal(max)
        setStats(arr)
      } catch (e) {
         console.error("Telemetry Sync Error:", e)
      } finally {
        isFetching = false
      }
    }

    fetchAllData()
    const interval = setInterval(fetchAllData, 3000)
    return () => clearInterval(interval)
  }, [mounted, crewMembers, crewMembersWithJoinDate])

  const springConfig = { type: "spring", stiffness: 300, damping: 15, mass: 0.8 }

  const Cylinder3D = ({ type, value, max }: { type: 'green'|'red'|'amber', value: number, max: number }) => {
    const heightPercent = max === 0 ? 0 : (value / max) * 100;
    
    return (
      <div className="relative group w-4 flex flex-col justify-end items-center h-full">
        <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white bg-black/80 px-2 py-1 rounded border border-white/10 z-20 pointer-events-none shadow-xl">
          {value}
        </div>
        <motion.div 
          initial={{ height: 0 }} 
          animate={{ height: `${heightPercent}%` }} 
          transition={springConfig}
          className={`w-full relative rounded-t-lg cyl-${type} origin-bottom`}
        >
          <div className={`absolute -top-1 left-0 w-full h-2 rounded-full cyl-${type}-top z-10`} />
        </motion.div>
      </div>
    )
  }

  if (!mounted) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .cyl-green { background: linear-gradient(90deg, #064e3b 0%, #10b981 50%, #022c22 100%); box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px rgba(16, 185, 129, 0.4); }
        .cyl-green-top { background: #34d399; box-shadow: inset 0 0 5px rgba(255,255,255,0.8); }

        .cyl-red { background: linear-gradient(90deg, #7f1d1d 0%, #ef4444 50%, #450a0a 100%); box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px rgba(239, 68, 68, 0.4); }
        .cyl-red-top { background: #f87171; box-shadow: inset 0 0 5px rgba(255,255,255,0.8); }

        .cyl-amber { background: linear-gradient(90deg, #78350f 0%, #f59e0b 50%, #451a03 100%); box-shadow: inset 0 0 10px rgba(0,0,0,0.5), 0 0 15px rgba(245, 158, 11, 0.4); }
        .cyl-amber-top { background: #fbbf24; box-shadow: inset 0 0 5px rgba(255,255,255,0.8); }
        
        .matrix-scrollbar::-webkit-scrollbar { width: 4px; height: 6px; } 
        .matrix-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .matrix-scrollbar::-webkit-scrollbar-thumb { background: rgba(16, 185, 129, 0.3); border-radius: 10px; } 
        .matrix-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(16, 185, 129, 0.6); }
      `}} />

      <div className="w-full rounded-[3.5rem] border border-emerald-500/20 bg-[#06060a]/80 backdrop-blur-3xl p-8 lg:p-10 shadow-[0_0_100px_rgba(16,185,129,0.05)] flex flex-col h-full relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,1) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(16,185,129,0.05),transparent)] bg-[length:200%_200%] animate-[shimmer-seamless_4s_linear_infinite] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-20 shrink-0">
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

        {/* 核心防爆层：固定高度 350px */}
        <div className="flex-1 flex gap-6 bg-[#02040a]/80 border border-white/5 rounded-[2rem] p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.6)] relative z-10 h-[350px] min-h-[350px] max-h-[350px]">
          
          <div className="w-40 md:w-48 border-r border-white/10 flex flex-col pr-4 shrink-0 min-h-0">
            <div className="text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              Commanders
            </div>
            <div className="flex-1 overflow-y-auto matrix-scrollbar space-y-3 pr-2 min-h-0 pb-4">
              {managers.length > 0 ? managers.map((m, idx) => {
                const isObj = typeof m === 'object' && m !== null;
                const userId = isObj ? m.id : null;
                const name = isObj ? (m.name || "Unknown") : String(m);
                const role = isObj ? (m.role || "ADMIN") : "ADMIN";
                const image = isObj ? m.image : null;

                return (
                  <div key={idx} className="bg-[#02040a]/60 border border-emerald-500/20 p-3 rounded-2xl flex items-center gap-3 relative overflow-hidden group hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all shadow-[inset_0_0_15px_rgba(0,0,0,0.8)]">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer-seamless_2s_infinite] pointer-events-none" />
                    
                    {userId ? (
                      <Link href={`/profile/${userId}`} className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.2)] hover:opacity-80 transition-opacity cursor-pointer">
                        {image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-emerald-500 font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
                        )}
                      </Link>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                        {image ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={image} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-emerald-500 font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col items-start overflow-hidden relative z-10">
                      <span className="text-sm font-bold text-white tracking-wider truncate w-full text-left">{name}</span>
                      <div className="flex items-center mt-1">
                        {role === 'OWNER' ? (
                          <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md font-mono flex items-center gap-1 shadow-[0_0_5px_rgba(245,158,11,0.2)]">
                            👑 CAPTAIN
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md font-mono flex items-center gap-1 shadow-[0_0_5px_rgba(16,185,129,0.2)]">
                            🛡️ ADMIN
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center py-6 text-zinc-600 font-mono text-[10px] tracking-widest">NO COMMANDERS</div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 py-8 z-0">
               {[...Array(5)].map((_, i) => <div key={i} className="border-b border-white/20 w-full flex-1" />)}
            </div>
            
            <div className="flex-1 overflow-x-auto matrix-scrollbar flex items-end gap-8 pb-2 pt-10 px-4 relative z-10 min-w-0">
              <AnimatePresence>
                {stats.length > 0 ? stats.map(s => (
                  <motion.div 
                    layout 
                    key={s.name} 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-4 shrink-0 hover:bg-white/5 p-2 rounded-xl transition-colors duration-300"
                  >
                    <div className="flex items-end gap-1.5 h-48 border-b border-white/10 pb-1 w-full justify-center">
                      <Cylinder3D type="green" value={s.present} max={maxVal} />
                      <Cylinder3D type="red" value={s.missing} max={maxVal} />
                      <Cylinder3D type="amber" value={s.leave} max={maxVal} />
                    </div>
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
