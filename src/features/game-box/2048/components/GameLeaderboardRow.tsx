import { formatNumber } from "../lib/format"
import type { LeaderboardEntry } from "../types"

interface GameLeaderboardRowProps {
  entry: LeaderboardEntry
  isCurrentUser?: boolean
  onSelect: (entry: LeaderboardEntry) => void
}

export function GameLeaderboardRow({ entry, isCurrentUser = false, onSelect }: GameLeaderboardRowProps) {
  const label = isCurrentUser ? "YOU" : entry.displayName

  return (
    <button
      type="button"
      onClick={() => onSelect(entry)}
      className={`game-leaderboard-row group mx-3 mb-2 grid w-[calc(100%-1.5rem)] grid-cols-[34px_48px_minmax(0,1fr)_auto] items-center gap-3 bg-transparent px-2 py-3 text-left transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] ${
        isCurrentUser ? "bg-[#ff3b30]/10" : ""
      }`}
    >
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#77736b]">
        {String(entry.rank).padStart(2, "0")}
      </span>
      <span className="relative flex h-11 w-11 overflow-hidden bg-[#0e0e0e] transition-colors duration-200 group-hover:bg-[#ff3b30]">
        {entry.imageUrl ? (
          <img src={entry.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="grid h-full w-full grid-cols-2 grid-rows-2">
            <span className="border-b border-r border-[#f4f1ea]/45" />
            <span className="border-b border-[#f4f1ea]/45 bg-[#f4f1ea]/20" />
            <span className="border-r border-[#f4f1ea]/45 bg-[#ff3b30]" />
            <span />
          </span>
        )}
      </span>
      <span className="min-w-0 truncate font-mono text-xs font-black uppercase tracking-[0.1em] text-[#0e0e0e]">
        {label}
      </span>
      <span className="font-[family-name:var(--font-space)] text-2xl font-black leading-none text-[#0e0e0e]">
        {formatNumber(entry.score)}
      </span>
    </button>
  )
}
