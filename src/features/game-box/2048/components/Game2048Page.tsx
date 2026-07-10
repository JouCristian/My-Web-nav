"use client"

import { useRef, useState, type CSSProperties } from "react"
import Link from "next/link"
import { GameBoxThemeToggle } from "@/components/game-box/game-box-theme-toggle"
import { Game2048Board } from "./Game2048Board"
import { Game2048Controls } from "./Game2048Controls"
import { Game2048ResultModal } from "./Game2048ResultModal"
import { Game2048StatsPanel } from "./Game2048StatsPanel"
import { GameLeaderboardPanel } from "./GameLeaderboardPanel"
import { use2048Game } from "../hooks/use2048Game"

interface Game2048PageProps {
  isLoggedIn: boolean
  playerName: string
}

const stageTransitionMs = 360
const boardRevealMs = 680

const ambientCells = [
  { value: "2", tone: "is-soft" },
  { value: "", tone: "is-empty" },
  { value: "4", tone: "is-soft" },
  { value: "", tone: "is-empty" },
  { value: "", tone: "is-empty" },
  { value: "8", tone: "is-mid" },
  { value: "", tone: "is-empty" },
  { value: "16", tone: "is-mid" },
  { value: "32", tone: "is-hot" },
  { value: "", tone: "is-empty" },
  { value: "64", tone: "is-hot" },
  { value: "", tone: "is-empty" },
  { value: "", tone: "is-empty" },
  { value: "128", tone: "is-heavy" },
  { value: "", tone: "is-empty" },
  { value: "2048", tone: "is-final" },
]

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function Game2048Page({ isLoggedIn, playerName }: Game2048PageProps) {
  const boardWrapRef = useRef<HTMLDivElement>(null)
  const [stageTransition, setStageTransition] = useState<"starting" | "cancelling" | null>(null)
  const [boardRevealKey, setBoardRevealKey] = useState(0)
  const [isBoardRevealing, setIsBoardRevealing] = useState(false)
  const game = use2048Game(isLoggedIn)

  function viewLeaderboard() {
    document.getElementById("game-2048-leaderboard")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function handleStartGame() {
    if (stageTransition) return
    setStageTransition("starting")
    const transitionStartedAt = Date.now()
    await game.startNewGame()
    await wait(Math.max(0, stageTransitionMs - (Date.now() - transitionStartedAt)))
    setBoardRevealKey((value) => value + 1)
    setIsBoardRevealing(true)
    setStageTransition(null)
    window.setTimeout(() => setIsBoardRevealing(false), boardRevealMs)
  }

  async function handleCancelGame() {
    if (stageTransition) return
    setStageTransition("cancelling")
    await wait(240)
    game.resetToIdle()
    await wait(120)
    setStageTransition(null)
  }

  return (
    <main className="game-2048-page min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#0e0e0e]">
      <GameBoxThemeToggle />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-2048-page {
              --gb-paper: #f4f1ea;
              --gb-ink: #0e0e0e;
              --gb-muted: #77736b;
              --gb-red: #ff3b30;
              --gb-ease: cubic-bezier(0.16, 1, 0.3, 1);
              height: 100vh;
              overflow: hidden;
              background-image:
                linear-gradient(rgba(14,14,14,0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14,14,14,0.045) 1px, transparent 1px);
              background-size: 32px 32px;
              animation: game-2048-enter 360ms var(--gb-ease) both;
            }

            .game-2048-page a,
            .game-2048-page button {
              cursor: pointer;
            }

            .game-2048-shell {
              width: min(100%, 1520px);
              margin: 0 auto;
              border-left: 1px solid var(--gb-ink);
              border-right: 1px solid var(--gb-ink);
              display: grid;
              grid-template-rows: auto minmax(0, 1fr);
              height: 100vh;
              min-height: 0;
              overflow: hidden;
              background: rgba(244, 241, 234, 0.88);
            }

            .game-2048-layout {
              display: grid;
              grid-template-columns: minmax(210px, 280px) minmax(320px, 1fr) minmax(260px, 340px);
              align-items: start;
              height: 100%;
              min-height: 0;
              overflow: hidden;
            }

            .game-2048-layout > .game-2048-panel {
              height: 100%;
              min-height: 0;
              overflow: hidden;
            }

            .game-2048-stat-cell {
              padding-block: 14px;
            }

            .game-2048-stat-cell p:last-child {
              font-size: 1.75rem;
            }

            .game-2048-stage {
              display: grid;
              grid-template-rows: minmax(0, 1fr) auto;
              height: 100%;
              min-height: 0;
              overflow: hidden;
              padding: 24px;
            }

            .game-2048-board-frame {
              min-height: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            }

            .game-2048-board-zone {
              width: 100%;
            }

            .game-2048-board {
              touch-action: none;
              user-select: none;
              max-width: min(100%, calc(100vh - 330px), 520px) !important;
            }

            .game-2048-start-field {
              background: #ffffff !important;
              color: #0e0e0e !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-start-field {
              background: #0e0e0e !important;
              color: #f4f1ea !important;
            }

            :root:not([data-game-box-theme="dark"]) .game-2048-start-field,
            :root:not([data-game-box-theme="dark"]) .game-2048-start-field :is(p, h2, span) {
              color: #0e0e0e !important;
            }

            .game-2048-ambient {
              position: absolute;
              inset: 7%;
              display: grid;
              grid-template-columns: repeat(4, minmax(0, 1fr));
              grid-template-rows: repeat(4, minmax(0, 1fr));
              gap: 8px;
              opacity: 0.42;
              pointer-events: none;
            }

            .game-2048-ambient-cell {
              --ambient-delay: calc(var(--ambient-index) * 72ms);
              position: relative;
              display: grid;
              place-items: center;
              border: 1px solid rgba(14, 14, 14, 0.18);
              background: rgba(244, 241, 234, 0.3);
              color: rgba(14, 14, 14, 0.38);
              font-family: var(--font-space), system-ui, sans-serif;
              font-size: clamp(0.75rem, 2.2vw, 2rem);
              font-weight: 900;
              line-height: 1;
              animation: game-2048-ambient-cell 3.8s var(--gb-ease) infinite;
              animation-delay: var(--ambient-delay);
            }

            .game-2048-ambient-cell.is-empty {
              background: transparent;
              opacity: 0.45;
            }

            .game-2048-ambient-cell.is-mid {
              background: rgba(255, 183, 170, 0.22);
            }

            .game-2048-ambient-cell.is-hot {
              border-color: rgba(255, 59, 48, 0.28);
              background: rgba(255, 59, 48, 0.16);
              color: rgba(14, 14, 14, 0.48);
            }

            .game-2048-ambient-cell.is-heavy,
            .game-2048-ambient-cell.is-final {
              background: rgba(14, 14, 14, 0.07);
              color: rgba(14, 14, 14, 0.52);
            }

            .game-2048-ambient-line {
              position: absolute;
              background: rgba(14, 14, 14, 0.16);
              transform-origin: left center;
              animation: game-2048-ambient-line 4.4s var(--gb-ease) infinite;
              pointer-events: none;
            }

            .game-2048-ambient-line.is-horizontal {
              left: 12%;
              right: 12%;
              top: 50%;
              height: 1px;
            }

            .game-2048-ambient-line.is-vertical {
              bottom: 12%;
              left: 50%;
              top: 12%;
              width: 1px;
              transform-origin: center top;
              animation-delay: -1.6s;
            }

            :root[data-game-box-theme="dark"] .game-2048-ambient-cell {
              border-color: rgba(244, 241, 234, 0.2);
              background: rgba(244, 241, 234, 0.045);
              color: rgba(244, 241, 234, 0.42);
            }

            :root[data-game-box-theme="dark"] .game-2048-ambient-cell.is-mid {
              background: rgba(215, 255, 0, 0.08);
            }

            :root[data-game-box-theme="dark"] .game-2048-ambient-cell.is-hot {
              border-color: rgba(215, 255, 0, 0.28);
              background: rgba(215, 255, 0, 0.11);
              color: rgba(244, 241, 234, 0.55);
            }

            :root[data-game-box-theme="dark"] .game-2048-ambient-cell.is-heavy,
            :root[data-game-box-theme="dark"] .game-2048-ambient-cell.is-final {
              background: rgba(255, 59, 48, 0.14);
              color: rgba(244, 241, 234, 0.58);
            }

            :root[data-game-box-theme="dark"] .game-2048-ambient-line {
              background: rgba(215, 255, 0, 0.2);
            }

            .game-2048-start-copy > * {
              opacity: 0;
              animation: game-2048-start-copy-in 520ms var(--gb-ease) both;
            }

            .game-2048-start-copy > *:nth-child(1) { animation-delay: 40ms; }
            .game-2048-start-copy > *:nth-child(2) { animation-delay: 100ms; }
            .game-2048-start-copy > *:nth-child(3) { animation-delay: 160ms; }
            .game-2048-start-copy > *:nth-child(4) { animation-delay: 230ms; }

            .game-2048-transition-panel {
              --transition-bg: rgba(244, 241, 234, 0.94);
              position: absolute;
              inset: 0;
              z-index: 40;
              display: grid;
              place-items: center;
              border: 1px solid var(--gb-ink);
              background: var(--transition-bg);
              animation: game-2048-loading-in 180ms var(--gb-ease) both;
            }

            :root[data-game-box-theme="dark"] .game-2048-transition-panel {
              --transition-bg: rgba(14, 14, 14, 0.94);
            }

            .game-2048-transition-card {
              min-width: min(320px, 78%);
              border: 1px solid var(--gb-ink);
              background: var(--gb-paper);
              padding: 24px;
              text-align: left;
            }

            .game-2048-transition-bar {
              position: relative;
              margin-top: 18px;
              height: 8px;
              overflow: hidden;
              border: 1px solid var(--gb-ink);
              background: transparent;
            }

            .game-2048-transition-bar::after {
              content: "";
              position: absolute;
              inset: 0;
              width: 42%;
              background: var(--gb-red);
              animation: game-2048-loading-bar 720ms var(--gb-ease) infinite;
            }

            :root[data-game-box-theme="dark"] .game-2048-board {
              background-color: #0e0e0e !important;
              border-color: rgba(244, 241, 234, 0.76) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-tile-empty {
              background: rgba(244, 241, 234, 0.045) !important;
              border-color: rgba(244, 241, 234, 0.18) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-tile {
              border-color: rgba(244, 241, 234, 0.62) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-cancel,
            :root[data-game-box-theme="dark"] .game-2048-control-button,
            :root[data-game-box-theme="dark"] .game-2048-modal-button {
              background: #0e0e0e !important;
              color: #f4f1ea !important;
              border-color: rgba(244, 241, 234, 0.78) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-cancel:hover,
            :root[data-game-box-theme="dark"] .game-2048-cancel:focus-visible,
            :root[data-game-box-theme="dark"] .game-2048-start-button:hover,
            :root[data-game-box-theme="dark"] .game-2048-start-button:focus-visible,
            :root[data-game-box-theme="dark"] .game-2048-control-button:hover,
            :root[data-game-box-theme="dark"] .game-2048-control-button:focus-visible,
            :root[data-game-box-theme="dark"] .game-2048-modal-button:hover,
            :root[data-game-box-theme="dark"] .game-2048-modal-button:focus-visible {
              background: #d7ff00 !important;
              color: #0e0e0e !important;
              border-color: #d7ff00 !important;
            }

            .cn-keep {
              white-space: nowrap;
            }

            .game-2048-tile {
              min-width: 0;
              min-height: 0;
              transition:
                transform 150ms var(--gb-ease),
                background-color 150ms var(--gb-ease),
                color 150ms var(--gb-ease);
            }

            .game-2048-tile.is-new {
              animation: game-2048-tile-new 160ms var(--gb-ease) both;
            }

            .game-2048-tile.is-merged {
              animation: game-2048-tile-merge 180ms var(--gb-ease) both;
            }

            .game-2048-board.is-revealing .game-2048-tile,
            .game-2048-board.is-revealing .game-2048-tile-empty {
              animation: game-2048-board-cell-in 520ms var(--gb-ease) both;
              animation-delay: calc(var(--tile-index) * 30ms);
            }

            .game-2048-result {
              animation: game-2048-modal-in 220ms var(--gb-ease) both;
            }

            .game-2048-result.is-closing {
              animation: game-2048-modal-out 180ms var(--gb-ease) both;
            }

            .game-2048-result-card {
              animation: game-2048-modal-card-in 260ms var(--gb-ease) both;
            }

            .game-2048-result.is-closing .game-2048-result-card {
              animation: game-2048-modal-card-out 180ms var(--gb-ease) both;
            }

            @keyframes game-2048-enter {
              from { opacity: 0; transform: translateY(18px) scale(0.99); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes game-2048-tile-new {
              from { opacity: 0; transform: scale(0.7); }
              to { opacity: 1; transform: scale(1); }
            }

            @keyframes game-2048-tile-merge {
              0% { transform: scale(1); }
              52% { transform: scale(1.12); }
              100% { transform: scale(1); }
            }

            @keyframes game-2048-board-cell-in {
              0% { opacity: 0; transform: translateY(14px) scale(0.82); }
              58% { opacity: 1; transform: translateY(-3px) scale(1.035); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes game-2048-start-copy-in {
              from { opacity: 0; transform: translateY(14px); filter: blur(2px); }
              to { opacity: 1; transform: translateY(0); filter: blur(0); }
            }

            @keyframes game-2048-ambient-cell {
              0%, 100% { opacity: 0.42; transform: scale(1); }
              42% { opacity: 0.72; transform: scale(0.985); }
              64% { opacity: 0.5; transform: scale(1.01); }
            }

            @keyframes game-2048-ambient-line {
              0%, 100% { opacity: 0.16; transform: scaleX(0.34); }
              52% { opacity: 0.48; transform: scaleX(1); }
            }

            @keyframes game-2048-loading-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes game-2048-loading-bar {
              from { transform: translateX(-110%); }
              to { transform: translateX(250%); }
            }

            @keyframes game-2048-modal-in {
              from { opacity: 0; }
              to { opacity: 1; }
            }

            @keyframes game-2048-modal-out {
              from { opacity: 1; }
              to { opacity: 0; }
            }

            @keyframes game-2048-modal-card-in {
              from { opacity: 0; transform: translateY(18px) scale(0.985); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes game-2048-modal-card-out {
              from { opacity: 1; transform: translateY(0) scale(1); }
              to { opacity: 0; transform: translateY(12px) scale(0.992); }
            }

            @media (max-width: 1180px) {
              .game-2048-page,
              .game-2048-shell {
                height: auto;
                min-height: 100vh;
                overflow: visible;
              }

              .game-2048-layout {
                grid-template-columns: minmax(0, 1fr);
                height: auto;
                overflow: visible;
              }

              .game-2048-stage {
                order: -1;
                padding: 16px;
              }

              .game-2048-stats-panel {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
              }

              .game-2048-stats-panel .game-2048-stat-cell {
                border-right: 1px solid var(--gb-ink);
              }

              .game-2048-stats-panel .game-2048-stat-cell:nth-child(2n) {
                border-right: 0;
              }

              .game-2048-stats-panel .game-2048-storage-cell {
                grid-column: 1 / -1;
                border-top: 1px solid var(--gb-ink);
              }

              .game-2048-panel {
                border-left: 0;
                border-right: 0;
              }
            }

            @media (max-width: 680px) {
              .game-2048-shell {
                border-left: 0;
                border-right: 0;
              }

              .game-2048-page header {
                padding-right: 68px;
              }

              .game-2048-stage {
                padding: 12px;
              }

              .game-2048-board {
                max-width: min(100%, calc(100vh - 260px), 520px) !important;
              }

              .game-2048-stats-panel .game-2048-stat-cell p:last-child {
                font-size: 1.35rem;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-2048-page,
              .game-2048-tile,
              .game-2048-tile.is-new,
              .game-2048-tile.is-merged,
              .game-2048-board.is-revealing .game-2048-tile,
              .game-2048-board.is-revealing .game-2048-tile-empty,
              .game-2048-start-copy > *,
              .game-2048-ambient-cell,
              .game-2048-ambient-line,
              .game-2048-transition-panel,
              .game-2048-transition-bar::after,
              .game-2048-result,
              .game-2048-result-card {
                animation-duration: 1ms !important;
                transition-duration: 1ms !important;
                transform: none !important;
              }
            }
          `,
        }}
      />

      <div className="game-2048-shell">
        <header className="grid gap-4 border-b border-[#0e0e0e] p-5 sm:grid-cols-[1fr_auto] sm:p-6 lg:p-8">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">02 / 2048</p>
            <h1 className="mt-3 font-[family-name:var(--font-space)] text-5xl font-black uppercase leading-none sm:text-7xl">
              2048
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="font-mono text-sm font-bold uppercase tracking-[0.28em]">Number collision</p>
              <span className="h-px w-10 bg-[#0e0e0e]/40" />
              <p className="text-sm font-semibold tracking-[0.12em] text-[#77736b]">数字碰撞</p>
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 sm:items-end">
            <Link
              href="/game-box"
              className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#ff3b30] transition-colors duration-150 hover:text-[#0e0e0e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
            >
              ESC TO BOX / 返回
            </Link>
            <p className="max-w-[28ch] text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
              {isLoggedIn ? `Account mode: ${playerName}，本局结束后会进入服务端重放验证。` : "Guest mode: 本地可玩，登录后保存成绩。"}
            </p>
          </div>
        </header>

        <div className="game-2048-layout">
          <Game2048StatsPanel
            score={game.score}
            bestScore={game.bestScore}
            maxTile={game.maxTile}
            movesCount={game.movesCount}
            durationMs={game.durationMs}
            status={game.status}
            isLoggedIn={isLoggedIn}
          />

          <section ref={boardWrapRef} className="game-2048-stage relative min-w-0 border-b border-[#0e0e0e] sm:p-6 lg:border-b-0 lg:border-x">
            <div className="game-2048-board-frame">
              {game.status !== "idle" ? (
                <button
                  type="button"
                  onClick={handleCancelGame}
                  disabled={Boolean(stageTransition)}
                  className="game-2048-cancel absolute right-0 top-0 z-20 border border-[#0e0e0e] bg-[#f4f1ea] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#77736b] transition-colors duration-150 hover:bg-[#0e0e0e] hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                >
                  Cancel / 取消
                </button>
              ) : null}
              <Game2048Board
                board={game.board}
                status={game.status}
                score={game.score}
                mergedValues={game.mergedValues}
                lastAddedIndex={game.lastAddedIndex}
                revealKey={boardRevealKey}
                isRevealing={isBoardRevealing}
                onMove={game.makeMove}
              />
              {game.status === "idle" ? (
                <div className="game-2048-start-field absolute inset-0 z-10 flex items-center justify-center overflow-hidden border border-[#0e0e0e] bg-white">
                  <div className="game-2048-ambient" aria-hidden="true">
                    {ambientCells.map((cell, index) => (
                      <span
                        key={`${index}-${cell.value || "empty"}`}
                        className={`game-2048-ambient-cell ${cell.tone}`}
                        style={{ "--ambient-index": index } as CSSProperties}
                      >
                        {cell.value ? <b>{cell.value}</b> : null}
                      </span>
                    ))}
                  </div>
                  <span className="game-2048-ambient-line is-horizontal" aria-hidden="true" />
                  <span className="game-2048-ambient-line is-vertical" aria-hidden="true" />
                  <div className="game-2048-start-copy relative z-10 max-w-sm text-center">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">Ready state / 准备开始</p>
                    <h2 className="mt-4 font-[family-name:var(--font-space)] text-5xl font-black uppercase leading-none">2048</h2>
                    <p className="mt-4 text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
                      点击开始后才会计时。支持方向键、WASD，<span className="cn-keep">也支持移动端滑动操作。</span>
                    </p>
                    <button
                      type="button"
                      onClick={handleStartGame}
                      disabled={Boolean(stageTransition)}
                      className="game-2048-start-button mt-6 border border-[#0e0e0e] bg-[#ff3b30] px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#0e0e0e] transition-[background-color,color,border-color,transform] duration-200 hover:translate-y-0.5 hover:bg-[#0e0e0e] hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                    >
                      {stageTransition === "starting" ? "Loading / 加载中" : "Start run / 开始"}
                    </button>
                  </div>
                </div>
              ) : null}
              {stageTransition ? (
                <div className="game-2048-transition-panel" role="status" aria-live="polite">
                  <div className="game-2048-transition-card">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">
                      {stageTransition === "starting" ? "Loading board / 正在生成棋盘" : "Cancel run / 正在返回开始"}
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none">
                      {stageTransition === "starting" ? "2048" : "IDLE"}
                    </p>
                    <div className="game-2048-transition-bar" />
                  </div>
                </div>
              ) : null}
            </div>
            <Game2048Controls
              onNewGame={handleStartGame}
              saveState={game.saveState}
              saveMessage={game.saveMessage}
            />
          </section>

          <GameLeaderboardPanel />
        </div>
      </div>

      <Game2048ResultModal
        open={game.status === "game_over"}
        score={game.score}
        maxTile={game.maxTile}
        movesCount={game.movesCount}
        durationMs={game.durationMs}
        bestScore={game.bestScore}
        isLoggedIn={isLoggedIn}
        saveMessage={game.saveMessage}
        saveState={game.saveState}
        rankSummary={game.rankSummary}
        onPlayAgain={handleStartGame}
        onViewLeaderboard={viewLeaderboard}
        onClose={handleCancelGame}
      />
    </main>
  )
}
