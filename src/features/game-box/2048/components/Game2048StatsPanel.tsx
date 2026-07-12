"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { formatDuration, formatNumber } from "../lib/format"
import { game2048ModeCopy, game2048Modes } from "../lib/modes"
import type { Game2048Mode, Game2048Status } from "../types"

interface Game2048StatsPanelProps {
  score: number
  bestScore: number
  maxTile: number
  movesCount: number
  durationMs: number
  status: Game2048Status
  isLoggedIn: boolean
  mode: Game2048Mode
  canChangeMode: boolean
  onModeChange: (mode: Game2048Mode) => void
}

const statusLabel: Record<Game2048Status, string> = {
  idle: "IDLE",
  playing: "PLAYING",
  paused: "PAUSED",
  won: "KEEP GOING",
  game_over: "COMPLETE",
}

const modeTone: Record<Game2048Mode, string> = {
  classic: "is-classic",
  sprint: "is-sprint",
  zen: "is-zen",
  daily: "is-daily",
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="game-2048-stat-cell border-b border-[#0e0e0e] p-4 last:border-b-0 lg:p-5">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-space)] text-3xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}

function ModeStatCell({
  mode,
  canChangeMode,
  onModeChange,
}: {
  mode: Game2048Mode
  canChangeMode: boolean
  onModeChange: (mode: Game2048Mode) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({})
  const cellRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isOpen) return

    function syncMenuPosition() {
      const rect = cellRef.current?.getBoundingClientRect()
      if (!rect) return
      setMenuStyle({
        left: rect.left,
        bottom: window.innerHeight - rect.top + 8,
        width: rect.width,
      })
    }

    syncMenuPosition()
    window.addEventListener("resize", syncMenuPosition)
    window.addEventListener("scroll", syncMenuPosition, true)
    return () => {
      window.removeEventListener("resize", syncMenuPosition)
      window.removeEventListener("scroll", syncMenuPosition, true)
    }
  }, [isOpen])

  function chooseMode(nextMode: Game2048Mode) {
    onModeChange(nextMode)
    setIsOpen(false)
  }

  return (
    <div ref={cellRef} className="game-2048-stat-cell game-2048-mode-stat relative border-b border-[#0e0e0e] p-4 lg:p-5">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-2048-mode-stat-button,
            .game-2048-mode-option {
              transition:
                background-color 190ms cubic-bezier(0.16, 1, 0.3, 1),
                color 190ms cubic-bezier(0.16, 1, 0.3, 1),
                border-color 190ms cubic-bezier(0.16, 1, 0.3, 1),
                transform 220ms cubic-bezier(0.16, 1, 0.3, 1),
                opacity 190ms cubic-bezier(0.16, 1, 0.3, 1);
            }

            .game-2048-mode-stat-button:hover:not(:disabled),
            .game-2048-mode-stat-button:focus-visible:not(:disabled) {
              transform: translateY(1px);
              background: #0e0e0e !important;
              color: #f4f1ea !important;
              border-color: #0e0e0e !important;
            }

            .game-2048-mode-stat {
              container-type: inline-size;
            }

            .game-2048-mode-stat-inner {
              align-items: center;
            }

            .game-2048-mode-copy {
              max-width: calc(100% - 104px);
            }

            .game-2048-mode-value {
              margin-top: 6px !important;
              font-size: clamp(1.1rem, 7.2cqw, 1.55rem);
              line-height: 0.96;
              overflow-wrap: anywhere;
              text-wrap: balance;
            }

            .game-2048-mode-zh {
              margin-top: 6px !important;
              font-size: clamp(0.72rem, 3.6cqw, 0.88rem);
              line-height: 1.18;
              overflow-wrap: anywhere;
              text-wrap: balance;
            }

            .game-2048-mode-picker {
              animation: game-2048-mode-picker-in 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
              transform-origin: center bottom;
            }

            .game-2048-mode-option:hover,
            .game-2048-mode-option:focus-visible {
              transform: translateY(2px) scale(0.992);
              border-color: #0e0e0e;
              box-shadow: inset 0 1px 0 rgba(14, 14, 14, 0.22), 0 10px 18px rgba(14, 14, 14, 0.1);
            }

            .game-2048-mode-option.is-active {
              border-color: #0e0e0e;
              box-shadow: inset 0 0 0 2px #0e0e0e;
            }

            .game-2048-mode-option.is-classic {
              background: #f4f1ea;
            }

            .game-2048-mode-option.is-sprint {
              background: #ffe2dc;
            }

            .game-2048-mode-option.is-zen {
              background: #eef0e7;
            }

            .game-2048-mode-option.is-daily {
              background: #fff7c9;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-stat-button {
              background: #0e0e0e;
              color: #f4f1ea;
              border-color: rgba(244, 241, 234, 0.72);
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-stat-button:hover:not(:disabled),
            :root[data-game-box-theme="dark"] .game-2048-mode-stat-button:focus-visible:not(:disabled) {
              background: #d7ff00 !important;
              color: #0e0e0e !important;
              border-color: #d7ff00 !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-stat .game-2048-mode-stat-button:hover:not(:disabled),
            :root[data-game-box-theme="dark"] .game-2048-mode-stat .game-2048-mode-stat-button:focus-visible:not(:disabled),
            :root[data-game-box-theme="dark"] .game-2048-mode-stat .game-2048-mode-stat-button[data-hover="true"] {
              background-color: #d7ff00 !important;
              color: #0e0e0e !important;
              border-color: #d7ff00 !important;
              opacity: 1 !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-picker {
              background: #0e0e0e;
              color: #f4f1ea;
              border-color: rgba(244, 241, 234, 0.72);
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-option {
              border-color: rgba(244, 241, 234, 0.48);
              color: #f4f1ea;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-option.is-classic {
              background: #111111;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-option.is-sprint {
              background: #301815;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-option.is-zen {
              background: #1b2118;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-option.is-daily {
              background: #273000;
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-option.is-active {
              border-color: #d7ff00;
              box-shadow: inset 0 0 0 2px #d7ff00;
            }

            @keyframes game-2048-mode-picker-in {
              from { opacity: 0; transform: translateY(16px) scaleY(0.94); filter: blur(4px); }
              70% { opacity: 1; transform: translateY(-2px) scaleY(1.015); filter: blur(0); }
              to { opacity: 1; transform: translateY(0) scaleY(1); filter: blur(0); }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-2048-mode-stat-button,
              .game-2048-mode-option,
              .game-2048-mode-picker {
                transition-duration: 1ms !important;
                animation-duration: 1ms !important;
                transform: none !important;
                filter: none !important;
              }
            }

            @container (max-width: 220px) {
              .game-2048-mode-copy {
                max-width: 100%;
              }

              .game-2048-mode-stat-inner {
                align-items: stretch;
                flex-direction: column;
              }

              .game-2048-mode-stat-button {
                width: 100%;
              }
            }
          `,
        }}
      />

      <div className="game-2048-mode-stat-inner flex min-w-0 justify-between gap-3">
        <div className="game-2048-mode-copy min-w-0">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">Mode / 模式</p>
          <p className="game-2048-mode-value mt-2 break-words font-[family-name:var(--font-space)] font-black uppercase">{game2048ModeCopy[mode].label}</p>
          <p className="game-2048-mode-zh mt-2 font-bold tracking-[0.06em] text-[#77736b]">{game2048ModeCopy[mode].zh}</p>
        </div>
        <button
          type="button"
          disabled={!canChangeMode}
          aria-expanded={isOpen}
          aria-label="切换 2048 模式"
          onClick={() => setIsOpen((value) => !value)}
          className="game-2048-mode-stat-button shrink-0 self-center border border-[#0e0e0e] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Change
        </button>
      </div>

      {isOpen ? (
        <>
          <button type="button" aria-label="关闭模式菜单" className="fixed inset-0 z-[210] cursor-default bg-transparent" onClick={() => setIsOpen(false)} />
          <div className="game-2048-mode-picker fixed z-[220] border border-[#0e0e0e] bg-[#f4f1ea] p-2" style={menuStyle}>
            <div className="grid gap-2">
              {game2048Modes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => chooseMode(item)}
                  className={`game-2048-mode-option ${modeTone[item]} ${mode === item ? "is-active" : ""} border border-[#0e0e0e]/55 p-3 text-left`}
                >
                  <span className="block font-mono text-xs font-bold uppercase tracking-[0.16em]">{game2048ModeCopy[item].label}</span>
                  <span className="mt-1 block text-xs font-bold tracking-[0.04em] text-[#77736b]">{game2048ModeCopy[item].zh}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export function Game2048StatsPanel({
  score,
  bestScore,
  maxTile,
  movesCount,
  durationMs,
  status,
  isLoggedIn,
  mode,
  canChangeMode,
  onModeChange,
}: Game2048StatsPanelProps) {
  return (
    <aside className="game-2048-panel game-2048-stats-panel border border-[#0e0e0e] bg-[#f4f1ea]">
      <StatCell label="Score / 分数" value={formatNumber(score)} />
      <StatCell label="Best score / 最高分" value={formatNumber(bestScore)} />
      <StatCell label="Best tile / 最大数字" value={maxTile || 0} />
      <StatCell label="Moves / 移动" value={movesCount} />
      <StatCell label="Time / 用时" value={formatDuration(durationMs)} />
      <ModeStatCell mode={mode} canChangeMode={canChangeMode} onModeChange={onModeChange} />
      <StatCell label="Status / 状态" value={statusLabel[status]} />
      <div className="game-2048-storage-cell p-4 lg:p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">Storage / 存储</p>
        <p className="mt-2 text-xs font-semibold leading-normal tracking-[0.04em] text-[#77736b] [text-wrap:pretty]">
          {mode === "zen"
            ? "放松模式只保存在当前浏览器。"
            : isLoggedIn
              ? "已登录：进度保存至账号，结束后提交校验。"
              : "游客模式：进度只保存在当前浏览器。"}
        </p>
      </div>
    </aside>
  )
}
