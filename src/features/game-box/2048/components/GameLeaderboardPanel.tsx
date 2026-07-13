"use client"

import { useState } from "react"
import { useGameLeaderboard } from "../hooks/useGameLeaderboard"
import { formatDuration, formatNumber } from "../lib/format"
import { game2048ModeCopy, getBoard2048SizeLabel } from "../lib/modes"
import type { Board2048, Board2048Size, Competitive2048Mode, LeaderboardEntry, LeaderboardPeriod } from "../types"
import { GameLeaderboardRow } from "./GameLeaderboardRow"

const periods: Array<{ id: LeaderboardPeriod; label: string; zh: string }> = [
  { id: "weekly", label: "Weekly", zh: "近 7 天" },
  { id: "all_time", label: "All Time", zh: "总榜" },
]

interface GameLeaderboardPanelProps {
  mode: Competitive2048Mode
  boardSize: Board2048Size
}

export function GameLeaderboardPanel({ mode, boardSize }: GameLeaderboardPanelProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly")
  const [selectedEntry, setSelectedEntry] = useState<LeaderboardEntry | null>(null)
  const { entries, myRank, isLoading, error, reload } = useGameLeaderboard(period, mode, boardSize)
  const activeMode = game2048ModeCopy[mode]

  return (
    <aside id="game-2048-leaderboard" className="game-2048-panel border border-[#0e0e0e] bg-[#f4f1ea]">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-leaderboard-row {
              --gb-row-ease: cubic-bezier(0.16, 1, 0.3, 1);
              transition:
                background-color 220ms var(--gb-row-ease),
                box-shadow 260ms var(--gb-row-ease),
                transform 260ms var(--gb-row-ease),
                border-color 220ms var(--gb-row-ease);
            }

            .game-leaderboard-row:hover,
            .game-leaderboard-row:focus-visible {
              transform: translateY(2px);
              background: rgba(14, 14, 14, 0.055);
              box-shadow:
                inset 0 1px 0 rgba(14, 14, 14, 0.22),
                0 8px 18px rgba(14, 14, 14, 0.10);
            }

            .game-leaderboard-tab {
              transition:
                background-color 180ms var(--gb-row-ease),
                color 180ms var(--gb-row-ease),
                transform 180ms var(--gb-row-ease),
                border-color 180ms var(--gb-row-ease);
            }

            .game-leaderboard-tab:hover,
            .game-leaderboard-tab:focus-visible {
              transform: translateY(1px);
            }

            .game-leaderboard-content {
              animation: leaderboard-mode-in 220ms var(--gb-row-ease) both;
            }

            .leaderboard-detail-overlay {
              --gb-modal-ease: cubic-bezier(0.16, 1, 0.3, 1);
              animation: leaderboard-detail-fade-in 220ms var(--gb-modal-ease) both;
            }

            .leaderboard-detail-overlay.is-closing {
              animation: leaderboard-detail-fade-out 180ms var(--gb-modal-ease) both;
            }

            .game-2048-leaderboard-detail {
              animation: leaderboard-detail-card-in 260ms var(--gb-modal-ease) both;
            }

            .leaderboard-detail-overlay.is-closing .game-2048-leaderboard-detail {
              animation: leaderboard-detail-card-out 180ms var(--gb-modal-ease) both;
            }

            .leaderboard-mini-board {
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              gap: 4px;
              border: 1px solid #0e0e0e;
              padding: 6px;
            }

            .leaderboard-mini-cell {
              aspect-ratio: 1;
              border: 1px solid rgba(14, 14, 14, 0.22);
              display: grid;
              place-items: center;
              font-family: var(--font-space), system-ui, sans-serif;
              font-size: clamp(0.55rem, 1.2vw, 0.85rem);
              font-weight: 900;
              line-height: 1;
              background: rgba(14, 14, 14, 0.035);
            }

            .leaderboard-detail-close {
              transition:
                background-color 180ms var(--gb-modal-ease),
                color 180ms var(--gb-modal-ease),
                border-color 180ms var(--gb-modal-ease),
                transform 180ms var(--gb-modal-ease);
            }

            .leaderboard-detail-close:hover,
            .leaderboard-detail-close:focus-visible {
              transform: translateY(1px);
              background: #0e0e0e !important;
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] .game-leaderboard-row:hover,
            :root[data-game-box-theme="dark"] .game-leaderboard-row:focus-visible {
              background: rgba(244, 241, 234, 0.08);
              box-shadow:
                inset 0 1px 0 rgba(244, 241, 234, 0.22),
                0 8px 18px rgba(0, 0, 0, 0.34);
            }

            :root[data-game-box-theme="dark"] .game-leaderboard-row-name,
            :root[data-game-box-theme="dark"] .game-leaderboard-row-score {
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] .game-leaderboard-tab.is-active {
              background: #f4f1ea !important;
              color: #0e0e0e !important;
            }

            :root[data-game-box-theme="dark"] .game-leaderboard-tab.is-active span {
              color: #0e0e0e !important;
            }

            :root[data-game-box-theme="dark"] .leaderboard-detail-overlay {
              background: rgba(0, 0, 0, 0.78) !important;
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-leaderboard-detail,
            :root[data-game-box-theme="dark"] .leaderboard-detail-close {
              background: #0e0e0e !important;
              color: #f4f1ea !important;
              border-color: rgba(244, 241, 234, 0.72) !important;
            }

            :root[data-game-box-theme="dark"] .leaderboard-detail-close:hover,
            :root[data-game-box-theme="dark"] .leaderboard-detail-close:focus-visible {
              background: #d7ff00 !important;
              color: #0e0e0e !important;
              border-color: #d7ff00 !important;
            }

            :root[data-game-box-theme="dark"] .leaderboard-mini-board,
            :root[data-game-box-theme="dark"] .leaderboard-mini-cell {
              border-color: rgba(244, 241, 234, 0.42);
            }

            :root[data-game-box-theme="dark"] .leaderboard-mini-cell {
              background: rgba(244, 241, 234, 0.05);
            }

            @keyframes leaderboard-detail-fade-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes leaderboard-mode-in {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }

            @keyframes leaderboard-detail-fade-out {
              from { opacity: 1; }
              to { opacity: 0; }
            }

            @keyframes leaderboard-detail-card-in {
              from { opacity: 0; transform: translateY(18px) scale(0.985); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes leaderboard-detail-card-out {
              from { opacity: 1; transform: translateY(0) scale(1); }
              to { opacity: 0; transform: translateY(12px) scale(0.992); }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-leaderboard-row,
              .game-leaderboard-tab,
              .game-leaderboard-content,
              .leaderboard-detail-overlay,
              .game-2048-leaderboard-detail {
                transition-duration: 1ms !important;
                animation-duration: 1ms !important;
                transform: none !important;
              }
            }
          `,
        }}
      />
      <div className="border-b border-[#0e0e0e] p-5">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">Leaderboard / 排行榜</p>
        <h2 className="mt-3 font-[family-name:var(--font-space)] text-3xl font-black uppercase leading-none">2048</h2>
        <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#ff3b30]">
          {activeMode.label} {getBoard2048SizeLabel(boardSize)} / {activeMode.zh}
        </p>
      </div>

      {mode === "daily" ? (
        <div className="border-b border-[#0e0e0e] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.12em] text-[#77736b]">
          Daily board / 今日棋盘
        </div>
      ) : (
        <div className="grid grid-cols-2 border-b border-[#0e0e0e]" role="tablist" aria-label="2048 leaderboard period">
        {periods.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={period === item.id}
            onClick={() => setPeriod(item.id)}
            className={`game-leaderboard-tab border-r border-[#0e0e0e] px-4 py-3 text-left font-mono text-xs font-bold uppercase tracking-[0.14em] last:border-r-0 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] ${
              period === item.id ? "is-active bg-[#0e0e0e] text-[#f4f1ea]" : "text-[#0e0e0e] hover:bg-[#ff3b30]/16"
            }`}
          >
            {item.label}
            <span className="mt-1 block font-sans text-[11px] tracking-[0.08em] opacity-70">{item.zh}</span>
          </button>
        ))}
        </div>
      )}

      <div key={`${mode}-${boardSize}`} className="game-leaderboard-content min-h-[320px] py-3">
        {isLoading ? (
          <div className="p-5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#77736b]">Loading board / 正在加载</div>
        ) : error ? (
          <div className="p-5">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#ff3b30]">Board offline</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="game-2048-control-button mt-5 border border-[#0e0e0e] px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-150"
            >
              Retry / 重试
            </button>
          </div>
        ) : entries.length > 0 ? (
          <>
            {entries.map((entry) => (
              <GameLeaderboardRow key={`${mode}-${boardSize}-${period}-${entry.rank}-${entry.userId}`} entry={entry} onSelect={setSelectedEntry} />
            ))}
            {myRank ? (
              <div className="mt-3 border-t border-[#0e0e0e] pt-3">
                <GameLeaderboardRow entry={myRank} isCurrentUser onSelect={setSelectedEntry} />
              </div>
            ) : null}
          </>
        ) : (
          <div className="p-5">
            <p className="font-[family-name:var(--font-space)] text-2xl font-black uppercase">No verified runs</p>
            <p className="mt-3 text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
              还没有通过服务器验证的成绩。完成一局 2048 后，登录用户的成绩会进入这里。
            </p>
          </div>
        )}
      </div>

      {selectedEntry ? <LeaderboardDetailModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} /> : null}
    </aside>
  )
}

function LeaderboardDetailModal({ entry, onClose }: { entry: LeaderboardEntry; onClose: () => void }) {
  const [closing, setClosing] = useState(false)

  function closeWithMotion() {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 190)
  }

  return (
    <div
      className={`leaderboard-detail-overlay ${closing ? "is-closing" : ""} fixed inset-0 z-[260] flex items-center justify-center bg-[#0e0e0e]/72 p-4 text-[#0e0e0e]`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="leaderboard-run-title"
      onClick={closeWithMotion}
    >
      <div className="game-2048-leaderboard-detail max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto border border-[#0e0e0e] bg-[#f4f1ea]" onClick={(event) => event.stopPropagation()}>
        <div className="grid border-b border-[#0e0e0e] sm:grid-cols-[1fr_64px]">
          <div className="flex min-w-0 items-center gap-4 p-6">
            <span className="grid h-16 w-16 shrink-0 overflow-hidden bg-[#0e0e0e]">
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
            <div className="min-w-0">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">Rank {String(entry.rank).padStart(2, "0")} / 记录详情</p>
              <h2 id="leaderboard-run-title" className="mt-2 truncate font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none">
                {entry.displayName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            aria-label="关闭排行榜详情"
            onClick={closeWithMotion}
            className="leaderboard-detail-close flex h-14 items-center justify-center border-t border-[#0e0e0e] font-mono text-2xl font-black sm:h-auto sm:border-l sm:border-t-0"
          >
            ×
          </button>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr]">
          <div className="border-b border-[#0e0e0e] p-5 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">Final board / 最终棋盘</p>
            <div className="mt-4">
              <MiniBoard board={entry.finalBoard} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3">
            <DetailMetric label="Score / 分数" value={formatNumber(entry.score)} />
            <DetailMetric label="Best tile / 最大数字" value={entry.maxTile} />
            <DetailMetric label="Moves / 移动" value={entry.movesCount} />
            <DetailMetric label="Time / 用时" value={formatDuration(entry.durationMs)} />
            <DetailMetric label="Undo used / 使用回退" value={entry.usedUndo ? "YES / 是" : "NO / 否"} />
            <DetailMetric label="Undo count / 回退次数" value={entry.undoCount || 0} />
            <DetailMetric label="Finished / 完成时间" value={new Date(entry.finishedAt).toLocaleString()} />
            <DetailMetric label="Verification / 验证状态" value={entry.verified ? "VERIFIED" : "PENDING"} />
            <DetailMetric label="Mode / 模式" value={`${(entry.mode || "classic").toUpperCase()} ${entry.boardSize || 4}x${entry.boardSize || 4}`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniBoard({ board }: { board?: Board2048 | null }) {
  const size = board ? Math.sqrt(board.length) : 4
  const safeSize = Number.isInteger(size) && size >= 4 && size <= 7 ? size : 4
  const cells = board && board.length === safeSize * safeSize ? board : Array.from({ length: safeSize * safeSize }, () => 0)
  return (
    <div className="leaderboard-mini-board" aria-label="Final 2048 board" style={{ gridTemplateColumns: `repeat(${safeSize}, minmax(0, 1fr))` }}>
      {cells.map((value, index) => (
        <div key={`${index}-${value}`} className="leaderboard-mini-cell">
          {value > 0 ? value : ""}
        </div>
      ))}
    </div>
  )
}

function DetailMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-r border-[#0e0e0e] p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#77736b]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-space)] text-2xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}
