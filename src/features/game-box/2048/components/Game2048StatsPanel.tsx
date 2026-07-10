import { formatDuration, formatNumber } from "../lib/format"
import type { Game2048Status } from "../types"

interface Game2048StatsPanelProps {
  score: number
  bestScore: number
  maxTile: number
  movesCount: number
  durationMs: number
  status: Game2048Status
  isLoggedIn: boolean
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="game-2048-stat-cell border-b border-[#0e0e0e] p-4 last:border-b-0 lg:p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-space)] text-3xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}

export function Game2048StatsPanel({ score, bestScore, maxTile, movesCount, durationMs, status, isLoggedIn }: Game2048StatsPanelProps) {
  return (
    <aside className="game-2048-panel game-2048-stats-panel border border-[#0e0e0e] bg-[#f4f1ea]">
      <StatCell label="Score / 分数" value={formatNumber(score)} />
      <StatCell label="Best score / 最高分" value={formatNumber(bestScore)} />
      <StatCell label="Best tile / 最大数字" value={maxTile || 0} />
      <StatCell label="Moves / 移动" value={movesCount} />
      <StatCell label="Time / 用时" value={formatDuration(durationMs)} />
      <StatCell label="Mode / 模式" value="Classic" />
      <StatCell label="Status / 状态" value={status.replace("_", " ")} />
      <div className="game-2048-storage-cell p-4 lg:p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">Storage / 存储</p>
        <p className="mt-2 text-sm font-semibold leading-relaxed tracking-[0.08em] text-[#77736b]">
          {isLoggedIn ? "已登录：本局结束后提交服务端重放验证，并写入账号战绩。" : "游客模式：只在本浏览器临时游玩，登录后保存成绩。"}
        </p>
      </div>
    </aside>
  )
}
