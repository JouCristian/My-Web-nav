"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { formatDuration, formatNumber } from "../lib/format"
import { game2048ModeCopy } from "../lib/modes"
import type { Game2048Mode, Game2048RankSummary } from "../types"

interface Game2048ResultModalProps {
  open: boolean
  score: number
  maxTile: number
  movesCount: number
  durationMs: number
  bestScore: number
  isLoggedIn: boolean
  saveMessage: string
  saveState: string
  rankSummary: Game2048RankSummary
  mode: Game2048Mode
  onPlayAgain: () => void
  onViewLeaderboard: () => void
  onClose: () => void
}

export function Game2048ResultModal({
  open,
  score,
  maxTile,
  movesCount,
  durationMs,
  bestScore,
  isLoggedIn,
  saveMessage,
  saveState,
  rankSummary,
  mode,
  onPlayAgain,
  onViewLeaderboard,
  onClose,
}: Game2048ResultModalProps) {
  const playAgainRef = useRef<HTMLButtonElement>(null)
  const [shouldRender, setShouldRender] = useState(open)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    let timeout: number | null = null
    const frame = window.requestAnimationFrame(() => {
      if (open) {
        setShouldRender(true)
        setClosing(false)
        timeout = window.setTimeout(() => playAgainRef.current?.focus(), 0)
        return
      }

      if (!shouldRender) return
      setClosing(true)
      timeout = window.setTimeout(() => {
        setShouldRender(false)
        setClosing(false)
      }, 190)
    })

    return () => {
      window.cancelAnimationFrame(frame)
      if (timeout) window.clearTimeout(timeout)
    }
  }, [open, shouldRender])

  if (!shouldRender) return null

  function closeWithMotion() {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClose, 190)
  }

  function viewLeaderboardWithMotion() {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      onClose()
      window.setTimeout(onViewLeaderboard, 80)
    }, 190)
  }

  const rankLabel =
    saveState === "saving"
      ? "VERIFYING"
      : rankSummary.weekly || rankSummary.allTime
        ? `W#${rankSummary.weekly ?? "-"} / A#${rankSummary.allTime ?? "-"}`
        : "NOT RANKED"

  return (
    <div
      className={`game-2048-result ${closing ? "is-closing" : ""} fixed inset-0 z-[260] flex items-center justify-center bg-[#0e0e0e]/72 p-4 text-[#0e0e0e]`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-2048-result-title"
    >
      <div className="game-2048-result-card max-h-[calc(100vh-2rem)] w-full max-w-3xl overflow-y-auto border border-[#0e0e0e] bg-[#f4f1ea]">
        <div className="grid border-b border-[#0e0e0e] sm:grid-cols-[minmax(0,1fr)_minmax(220px,320px)_64px]">
          <div className="min-w-0 p-6">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">{game2048ModeCopy[mode].label} run / 本局结束</p>
            <h2 id="game-2048-result-title" className="mt-3 font-[family-name:var(--font-space)] text-5xl font-black uppercase leading-none">
              RUN COMPLETE
            </h2>
          </div>
          <div className="min-w-0 border-t border-[#0e0e0e] p-6 pr-4 font-mono text-xs font-bold uppercase leading-relaxed tracking-[0.14em] text-[#77736b] sm:border-l sm:border-t-0">
            {mode === "zen" ? "Zen mode stays in this browser only / 放松模式仅保存在当前浏览器。" : isLoggedIn ? saveMessage || "Score verification pending." : "登录后可保存成绩和进入排行榜。"}
          </div>
          <button
            type="button"
            onClick={closeWithMotion}
            aria-label="关闭战绩弹窗"
            className="game-2048-result-close game-2048-modal-button flex h-14 items-center justify-center border-t border-[#0e0e0e] bg-[#f4f1ea] font-mono text-2xl font-black leading-none transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] sm:h-auto sm:border-l sm:border-t-0"
          >
            ×
          </button>
        </div>

        <div className="grid border-b border-[#0e0e0e] sm:grid-cols-3">
          <Metric label="Score / 分数" value={formatNumber(score)} />
          <Metric label="Best tile / 最大数字" value={maxTile} />
          <Metric label="Moves / 移动" value={movesCount} />
          <Metric label="Time / 用时" value={formatDuration(durationMs)} />
          <Metric label="Personal best / 个人最佳" value={formatNumber(bestScore)} />
          <Metric label={mode === "sprint" ? "Sprint rank / 竞速排名" : "Rank / 排名"} value={rankLabel} />
        </div>

        <div className={`grid gap-3 p-6 font-mono text-xs font-bold uppercase tracking-[0.14em] ${mode === "zen" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
          <button
            ref={playAgainRef}
            type="button"
            onClick={onPlayAgain}
            className="game-2048-modal-button border border-[#0e0e0e] px-4 py-3 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
          >
            Play again / 再来一局
          </button>
          <Link
            href="/game-box"
            className="game-2048-modal-button border border-[#0e0e0e] px-4 py-3 text-[#ff3b30] transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
          >
            Back to Game Box / 返回游戏盒子
          </Link>
          {mode !== "zen" ? (
            <button
              type="button"
              onClick={viewLeaderboardWithMotion}
              className="game-2048-modal-button border border-[#0e0e0e] px-4 py-3 text-left transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
            >
              View leaderboard / 查看排行榜
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-[#0e0e0e] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-space)] text-3xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}
