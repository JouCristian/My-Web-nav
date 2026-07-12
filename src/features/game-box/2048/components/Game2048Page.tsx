"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react"
import { GameBoxThemeToggle } from "@/components/game-box/game-box-theme-toggle"
import { formatDuration, formatNumber } from "../lib/format"
import { game2048ModeCopy } from "../lib/modes"
import { use2048Game } from "../hooks/use2048Game"
import type { Competitive2048Mode, Game2048Mode } from "../types"
import { Game2048Board } from "./Game2048Board"
import { Game2048Controls } from "./Game2048Controls"
import { Game2048ResultModal } from "./Game2048ResultModal"
import { Game2048StatsPanel } from "./Game2048StatsPanel"
import { GameLeaderboardPanel } from "./GameLeaderboardPanel"

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

const celebrationPieces = [
  { left: "12%", bottom: "18%", tx: "-7vw", ty: "-42vh", rotate: "34deg", color: "#ff3b30", delay: "0ms", shape: "is-strip" },
  { left: "16%", bottom: "20%", tx: "4vw", ty: "-50vh", rotate: "-62deg", color: "#d7ff00", delay: "18ms", shape: "is-tile" },
  { left: "20%", bottom: "16%", tx: "16vw", ty: "-46vh", rotate: "92deg", color: "#f4f1ea", delay: "42ms", shape: "is-bit" },
  { left: "23%", bottom: "22%", tx: "24vw", ty: "-58vh", rotate: "-118deg", color: "#ffb2a4", delay: "66ms", shape: "is-strip" },
  { left: "28%", bottom: "18%", tx: "8vw", ty: "-64vh", rotate: "146deg", color: "#0e0e0e", delay: "88ms", shape: "is-bit" },
  { left: "36%", bottom: "14%", tx: "-2vw", ty: "-52vh", rotate: "-24deg", color: "#d7ff00", delay: "110ms", shape: "is-slab" },
  { left: "42%", bottom: "18%", tx: "7vw", ty: "-48vh", rotate: "74deg", color: "#ff3b30", delay: "132ms", shape: "is-bit" },
  { left: "48%", bottom: "15%", tx: "-10vw", ty: "-56vh", rotate: "-96deg", color: "#f4f1ea", delay: "154ms", shape: "is-strip" },
  { left: "58%", bottom: "16%", tx: "9vw", ty: "-53vh", rotate: "128deg", color: "#d7ff00", delay: "24ms", shape: "is-bit" },
  { left: "64%", bottom: "20%", tx: "-5vw", ty: "-61vh", rotate: "-48deg", color: "#ff3b30", delay: "48ms", shape: "is-slab" },
  { left: "70%", bottom: "17%", tx: "-18vw", ty: "-49vh", rotate: "102deg", color: "#f4f1ea", delay: "72ms", shape: "is-bit" },
  { left: "76%", bottom: "22%", tx: "-24vw", ty: "-57vh", rotate: "-138deg", color: "#ffb2a4", delay: "96ms", shape: "is-strip" },
  { left: "82%", bottom: "19%", tx: "-14vw", ty: "-44vh", rotate: "58deg", color: "#d7ff00", delay: "120ms", shape: "is-tile" },
  { left: "87%", bottom: "17%", tx: "6vw", ty: "-40vh", rotate: "-78deg", color: "#ff3b30", delay: "144ms", shape: "is-bit" },
]

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function isPlainNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function Game2048Page({ isLoggedIn, playerName }: Game2048PageProps) {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<Game2048Mode>("classic")
  const game = use2048Game(isLoggedIn, selectedMode)
  const [stageTransition, setStageTransition] = useState<"starting" | "resuming" | "ending" | null>(null)
  const [routeTransition, setRouteTransition] = useState(false)
  const [boardRevealKey, setBoardRevealKey] = useState(0)
  const [isBoardRevealing, setIsBoardRevealing] = useState(false)
  const [isRewinding, setIsRewinding] = useState(false)
  const [undoToastKey, setUndoToastKey] = useState(0)
  const rewindTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    if (game.undoFlashKey === 0) return
    const frame = window.requestAnimationFrame(() => {
      setIsRewinding(true)
      setUndoToastKey((value) => value + 1)
      if (rewindTimeoutRef.current) window.clearTimeout(rewindTimeoutRef.current)
      rewindTimeoutRef.current = window.setTimeout(() => setIsRewinding(false), 360)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [game.undoFlashKey])

  useEffect(() => {
    return () => {
      if (rewindTimeoutRef.current) window.clearTimeout(rewindTimeoutRef.current)
    }
  }, [])

  function viewLeaderboard() {
    document.getElementById("game-2048-leaderboard")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  async function revealBoard() {
    setBoardRevealKey((value) => value + 1)
    setIsBoardRevealing(true)
    window.setTimeout(() => setIsBoardRevealing(false), boardRevealMs)
  }

  async function handleStartGame() {
    if (stageTransition) return
    setStageTransition("starting")
    const transitionStartedAt = Date.now()
    await game.startNewGame()
    await wait(Math.max(0, stageTransitionMs - (Date.now() - transitionStartedAt)))
    await revealBoard()
    setStageTransition(null)
  }

  async function handleResumeGame() {
    if (stageTransition || !game.savedGame) return
    setStageTransition("resuming")
    await wait(160)
    game.resumeSavedGame()
    await wait(160)
    await revealBoard()
    setStageTransition(null)
  }

  function handlePauseGame() {
    game.pauseGame()
  }

  function handleModeChange(mode: Game2048Mode) {
    if (game.status !== "idle" || stageTransition) return
    setSelectedMode(mode)
  }

  async function handleEndRun() {
    if (stageTransition) return
    setStageTransition("ending")
    await wait(180)
    await game.clearSavedGame()
    await game.resetToIdle()
    await wait(120)
    setStageTransition(null)
  }

  function handleUndo() {
    if (!game.undoLastMove()) return
  }

  function handleExitToBox(event: MouseEvent<HTMLAnchorElement>) {
    if (!isPlainNavigation(event) || routeTransition) return
    event.preventDefault()
    setRouteTransition(true)
    window.requestAnimationFrame(() => router.push("/game-box"))
  }

  const accountMessage = isLoggedIn
    ? selectedMode === "zen"
      ? "Zen mode: 本局只保存在当前浏览器。"
      : `Account mode: ${playerName}，局中状态会自动保存到账号。`
    : "Guest mode: 本地可玩，局中状态只保存在当前浏览器。"
  const leaderboardMode: Competitive2048Mode = selectedMode === "zen" ? "classic" : selectedMode

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
              --gb-acid: #d7ff00;
              --gb-ease: cubic-bezier(0.16, 1, 0.3, 1);
              height: 100vh;
              overflow: hidden;
              background-image:
                linear-gradient(rgba(14,14,14,0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14,14,14,0.045) 1px, transparent 1px);
              background-size: 32px 32px;
              animation: game-2048-enter 360ms var(--gb-ease) both;
            }

            :root:has(.game-2048-page),
            body:has(.game-2048-page) {
              height: 100%;
              overflow: hidden;
              scrollbar-gutter: stable;
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

            .game-2048-stats-panel {
              display: grid;
              grid-template-rows: repeat(7, minmax(0, 1fr)) auto;
            }

            .game-2048-stat-cell {
              min-height: 0;
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding-block: 10px !important;
            }

            .game-2048-stat-cell p:last-child {
              font-size: clamp(1.45rem, 2.2vh, 1.875rem);
            }

            .game-2048-storage-cell {
              min-height: 0;
              border-top: 1px solid var(--gb-ink);
              padding-block: 12px !important;
            }

            .game-2048-storage-cell p:last-child {
              overflow-wrap: anywhere;
              line-height: 1.55;
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

            .game-2048-board.is-rewinding {
              animation: game-2048-rewind-board 360ms var(--gb-ease) both;
            }

            .game-2048-board.is-rewinding .game-2048-tile {
              animation: game-2048-rewind-tile 360ms var(--gb-ease) both;
            }

            .game-2048-start-field,
            .game-2048-pause-field,
            .game-2048-win-field {
              background: #ffffff;
              color: var(--gb-ink);
            }

            .game-2048-start-copy > *,
            .game-2048-pause-card,
            .game-2048-win-card {
              opacity: 0;
              animation: game-2048-start-copy-in 520ms var(--gb-ease) both;
            }

            .game-2048-start-copy > *:nth-child(1) { animation-delay: 40ms; }
            .game-2048-start-copy > *:nth-child(2) { animation-delay: 100ms; }
            .game-2048-start-copy > *:nth-child(3) { animation-delay: 160ms; }
            .game-2048-start-copy > *:nth-child(4) { animation-delay: 230ms; }
            .game-2048-start-copy > *:nth-child(5) { animation-delay: 290ms; }
            .game-2048-start-copy > *:nth-child(6) { animation-delay: 350ms; }

            .game-2048-win-field {
              isolation: isolate;
              background:
                linear-gradient(rgba(14, 14, 14, 0.035) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 14, 14, 0.035) 1px, transparent 1px),
                #ffffff;
              background-size: 28px 28px;
            }

            .game-2048-celebration {
              position: absolute;
              inset: 0;
              z-index: 0;
              overflow: hidden;
              pointer-events: none;
            }

            .game-2048-celebration::before,
            .game-2048-celebration::after {
              content: "";
              position: absolute;
              bottom: 12%;
              width: min(32vw, 360px);
              height: 1px;
              background: var(--gb-red);
              opacity: 0;
              animation: game-2048-celebration-ray 900ms var(--gb-ease) both;
            }

            .game-2048-celebration::before {
              left: 6%;
              transform-origin: left center;
            }

            .game-2048-celebration::after {
              right: 6%;
              transform-origin: right center;
              animation-delay: 42ms;
            }

            .game-2048-confetti {
              position: absolute;
              left: var(--confetti-left);
              bottom: var(--confetti-bottom);
              width: 18px;
              height: 6px;
              border: 1px solid var(--gb-ink);
              background: var(--confetti-color);
              opacity: 0;
              transform: translate(0, 0) rotate(0deg) scale(0.62);
              animation: game-2048-confetti-burst 1080ms var(--gb-ease) both;
              animation-delay: var(--confetti-delay);
            }

            .game-2048-confetti.is-bit {
              width: 8px;
              height: 8px;
            }

            .game-2048-confetti.is-tile {
              width: 14px;
              height: 14px;
            }

            .game-2048-confetti.is-slab {
              width: 26px;
              height: 10px;
            }

            .game-2048-win-card {
              position: relative;
              z-index: 1;
              overflow: hidden;
              background: #f4f1ea !important;
              transform-origin: center;
            }

            .game-2048-win-card::before {
              content: "";
              position: absolute;
              inset: 0;
              z-index: -1;
              background:
                linear-gradient(90deg, #d7ff00 0 20%, transparent 20% 48%, #ff3b30 48% 54%, transparent 54%),
                linear-gradient(rgba(14, 14, 14, 0.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 14, 14, 0.04) 1px, transparent 1px);
              background-size: 100% 12px, 24px 24px, 24px 24px;
              background-position: 0 0, 0 0, 0 0;
              opacity: 0.86;
            }

            .game-2048-win-header {
              display: grid;
              grid-template-columns: minmax(0, 1fr) auto;
              gap: 24px;
              align-items: start;
              background: rgba(244, 241, 234, 0.94);
            }

            .game-2048-win-mark {
              display: grid;
              width: 88px;
              border: 1px solid var(--gb-ink);
              grid-template-columns: repeat(2, minmax(0, 1fr));
              grid-template-rows: repeat(2, 40px);
              background: #f4f1ea;
              animation: game-2048-win-mark-in 520ms var(--gb-ease) 120ms both;
            }

            .game-2048-win-mark span {
              border-right: 1px solid var(--gb-ink);
              border-bottom: 1px solid var(--gb-ink);
            }

            .game-2048-win-mark span:nth-child(2) {
              border-right: 0;
              background: #d7ff00;
            }

            .game-2048-win-mark span:nth-child(3) {
              border-bottom: 0;
              background: #0e0e0e;
            }

            .game-2048-win-mark span:nth-child(4) {
              border-right: 0;
              border-bottom: 0;
              background: #ff3b30;
            }

            .game-2048-win-title {
              color: #0e0e0e;
              text-wrap: balance;
            }

            .game-2048-win-title strong {
              display: inline-block;
              margin-left: 0.08em;
              padding-inline: 0.12em;
              background: #d7ff00;
              color: #0e0e0e;
            }

            .game-2048-win-stats {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              border-top: 1px solid var(--gb-ink);
              border-bottom: 1px solid var(--gb-ink);
              background: rgba(244, 241, 234, 0.96);
            }

            .game-2048-win-stat {
              min-width: 0;
              border-right: 1px solid var(--gb-ink);
              padding: 14px 16px;
            }

            .game-2048-win-stat:last-child {
              border-right: 0;
              background: #ff3b30;
              color: #0e0e0e;
            }

            .game-2048-win-actions {
              background: rgba(244, 241, 234, 0.94);
            }

            .game-2048-current-mode-label {
              max-width: 100%;
              font-size: clamp(0.68rem, 2.6vw, 0.875rem);
              letter-spacing: 0.18em;
              line-height: 1.15;
              overflow-wrap: anywhere;
              text-wrap: balance;
            }

            @media (max-width: 520px) {
              .game-2048-current-mode-label {
                letter-spacing: 0.12em;
              }
            }

            .game-2048-mode-button {
              transition:
                background-color 180ms var(--gb-ease),
                color 180ms var(--gb-ease),
                border-color 180ms var(--gb-ease),
                transform 180ms var(--gb-ease);
            }

            .game-2048-mode-button:hover:not(:disabled),
            .game-2048-mode-button:focus-visible:not(:disabled) {
              transform: translateY(1px);
              background: var(--gb-ink);
              color: var(--gb-paper);
            }

            .game-2048-mode-button.is-active {
              background: var(--gb-ink);
              color: var(--gb-paper);
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
              top: 12%;
              bottom: 12%;
              left: 50%;
              width: 1px;
              transform-origin: center top;
              animation-delay: -1.6s;
            }

            .game-2048-transition-panel {
              position: absolute;
              inset: 0;
              z-index: 40;
              display: grid;
              place-items: center;
              border: 1px solid var(--gb-ink);
              background: rgba(244, 241, 234, 0.94);
              animation: game-2048-loading-in 180ms var(--gb-ease) both;
            }

            .game-2048-transition-card,
            .game-2048-route-card {
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
            }

            .game-2048-transition-bar::after {
              content: "";
              position: absolute;
              inset: 0;
              width: 42%;
              background: var(--gb-red);
              animation: game-2048-loading-bar 720ms var(--gb-ease) infinite;
            }

            .game-2048-route-loader {
              position: fixed;
              inset: 0;
              z-index: 300;
              display: grid;
              place-items: center;
              background:
                linear-gradient(rgba(14, 14, 14, 0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 14, 14, 0.045) 1px, transparent 1px),
                rgba(244, 241, 234, 0.96);
              background-size: 32px 32px;
              animation: game-2048-route-loader-in 180ms var(--gb-ease) both;
            }

            .game-2048-undo-toast {
              position: absolute;
              right: 12px;
              top: 58px;
              z-index: 24;
              border: 1px solid var(--gb-ink);
              background: var(--gb-red);
              color: var(--gb-ink);
              padding: 8px 10px;
              font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
              font-size: 10px;
              font-weight: 900;
              letter-spacing: 0.16em;
              text-transform: uppercase;
              animation: game-2048-undo-toast 700ms var(--gb-ease) both;
            }

            .game-2048-undo,
            .game-2048-pause,
            .game-2048-control-button,
            .game-2048-start-button,
            .game-2048-modal-button {
              transition:
                background-color 180ms var(--gb-ease),
                color 180ms var(--gb-ease),
                border-color 180ms var(--gb-ease),
                transform 180ms var(--gb-ease),
                opacity 180ms var(--gb-ease);
            }

            .game-2048-undo:not(:disabled):hover,
            .game-2048-undo:not(:disabled):focus-visible,
            .game-2048-pause:not(:disabled):hover,
            .game-2048-pause:not(:disabled):focus-visible,
            .game-2048-control-button:hover,
            .game-2048-control-button:focus-visible,
            .game-2048-start-button:hover,
            .game-2048-start-button:focus-visible,
            .game-2048-modal-button:hover,
            .game-2048-modal-button:focus-visible {
              transform: translateY(1px);
              background: var(--gb-ink) !important;
              color: var(--gb-paper) !important;
            }

            .game-2048-undo:disabled {
              cursor: not-allowed;
              opacity: 0.54;
              background: rgba(119, 115, 107, 0.12) !important;
              color: var(--gb-muted) !important;
              border-color: rgba(119, 115, 107, 0.55) !important;
            }

            .game-2048-tile {
              min-width: 0;
              min-height: 0;
              transition:
                transform 160ms var(--gb-ease),
                background-color 160ms var(--gb-ease),
                color 160ms var(--gb-ease),
                filter 160ms var(--gb-ease);
            }

            .game-2048-tile.is-new {
              animation: game-2048-tile-new 160ms var(--gb-ease) both;
            }

            .game-2048-tile.is-merged {
              animation: game-2048-tile-merge 160ms var(--gb-ease) both;
              filter: contrast(1.08) saturate(1.06);
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

            :root[data-game-box-theme="dark"] .game-2048-page {
              background-color: #0e0e0e;
              color: #f4f1ea;
              background-image:
                linear-gradient(rgba(244,241,234,0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244,241,234,0.055) 1px, transparent 1px);
            }

            :root[data-game-box-theme="dark"] .game-2048-shell,
            :root[data-game-box-theme="dark"] .game-2048-panel,
            :root[data-game-box-theme="dark"] .game-2048-start-field,
            :root[data-game-box-theme="dark"] .game-2048-pause-field,
            :root[data-game-box-theme="dark"] .game-2048-win-field,
            :root[data-game-box-theme="dark"] .game-2048-transition-card,
            :root[data-game-box-theme="dark"] .game-2048-route-card {
              background: #0e0e0e !important;
              color: #f4f1ea !important;
              border-color: rgba(244, 241, 234, 0.72) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-board {
              background-color: #0e0e0e !important;
              border-color: rgba(244, 241, 234, 0.76) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-tile-empty {
              background: rgba(244, 241, 234, 0.045) !important;
              border-color: rgba(244, 241, 234, 0.18) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-undo,
            :root[data-game-box-theme="dark"] .game-2048-pause,
            :root[data-game-box-theme="dark"] .game-2048-control-button,
            :root[data-game-box-theme="dark"] .game-2048-modal-button {
              background: #0e0e0e !important;
              color: #f4f1ea !important;
              border-color: rgba(244, 241, 234, 0.78) !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-undo:not(:disabled):hover,
            :root[data-game-box-theme="dark"] .game-2048-pause:not(:disabled):hover,
            :root[data-game-box-theme="dark"] .game-2048-control-button:hover,
            :root[data-game-box-theme="dark"] .game-2048-start-button:hover,
            :root[data-game-box-theme="dark"] .game-2048-start-button:focus-visible,
            :root[data-game-box-theme="dark"] .game-2048-modal-button:hover {
              background: #d7ff00 !important;
              color: #0e0e0e !important;
              border-color: #d7ff00 !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-route-loader,
            :root[data-game-box-theme="dark"] .game-2048-transition-panel {
              background:
                linear-gradient(rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                rgba(14, 14, 14, 0.96);
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
              border-color: rgba(215, 255, 0, 0.3);
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

            :root[data-game-box-theme="dark"] .game-2048-win-field {
              background:
                linear-gradient(rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                #1d1d1d !important;
              background-size: 28px 28px;
            }

            :root[data-game-box-theme="dark"] .game-2048-win-card {
              background: #0e0e0e !important;
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] .game-2048-win-card::before {
              background:
                linear-gradient(90deg, #d7ff00 0 20%, transparent 20% 48%, #ff3b30 48% 54%, transparent 54%),
                linear-gradient(rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244, 241, 234, 0.055) 1px, transparent 1px);
            }

            :root[data-game-box-theme="dark"] .game-2048-win-header,
            :root[data-game-box-theme="dark"] .game-2048-win-stats,
            :root[data-game-box-theme="dark"] .game-2048-win-actions {
              background: rgba(14, 14, 14, 0.94);
            }

            :root[data-game-box-theme="dark"] .game-2048-win-title {
              color: #f4f1ea;
            }

            :root[data-game-box-theme="dark"] .game-2048-win-mark {
              background: #0e0e0e;
              border-color: rgba(244, 241, 234, 0.72);
            }

            :root[data-game-box-theme="dark"] .game-2048-win-mark span {
              border-color: rgba(244, 241, 234, 0.72);
            }

            :root[data-game-box-theme="dark"] .game-2048-mode-button:hover:not(:disabled),
            :root[data-game-box-theme="dark"] .game-2048-mode-button:focus-visible:not(:disabled),
            :root[data-game-box-theme="dark"] .game-2048-mode-button.is-active {
              background: #d7ff00;
              color: #0e0e0e;
              border-color: #d7ff00;
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
              0% {
                transform: translate(var(--merge-x), var(--merge-y)) scaleX(0.92) scaleY(1.04);
                filter: contrast(1) saturate(1);
              }
              46% {
                transform: translate(var(--merge-bite-x), var(--merge-bite-y)) scaleX(1.055) scaleY(0.96);
                filter: contrast(1.16) saturate(1.12);
              }
              100% {
                transform: translate(0, 0) scale(1);
                filter: contrast(1.08) saturate(1.06);
              }
            }

            @keyframes game-2048-confetti-burst {
              0% {
                opacity: 0;
                transform: translate(0, 0) rotate(0deg) scale(0.56);
              }
              12% {
                opacity: 1;
              }
              72% {
                opacity: 1;
                transform: translate(var(--confetti-tx), var(--confetti-ty)) rotate(var(--confetti-rotate)) scale(1);
              }
              100% {
                opacity: 0;
                transform: translate(var(--confetti-tx), var(--confetti-ty)) rotate(var(--confetti-rotate)) scale(0.86);
              }
            }

            @keyframes game-2048-celebration-ray {
              0% {
                opacity: 0;
                transform: scaleX(0) rotate(-16deg);
              }
              18% {
                opacity: 0.95;
              }
              100% {
                opacity: 0;
                transform: scaleX(1) rotate(-16deg);
              }
            }

            @keyframes game-2048-win-mark-in {
              from {
                opacity: 0;
                transform: translateY(12px) scale(0.88);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            @keyframes game-2048-board-cell-in {
              0% { opacity: 0; transform: translateY(14px) scale(0.82); }
              58% { opacity: 1; transform: translateY(-3px) scale(1.035); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes game-2048-rewind-board {
              0% { filter: brightness(1); transform: translateX(0); }
              35% { filter: brightness(0.78); transform: translateX(-6px) scale(0.992); }
              68% { filter: brightness(1.08); transform: translateX(2px) scale(1.006); }
              100% { filter: brightness(1); transform: translateX(0) scale(1); }
            }

            @keyframes game-2048-rewind-tile {
              0% { transform: scale(1); }
              42% { transform: scale(0.92); }
              100% { transform: scale(1); }
            }

            @keyframes game-2048-undo-toast {
              0% { opacity: 0; transform: translateY(-8px); }
              18%, 72% { opacity: 1; transform: translateY(0); }
              100% { opacity: 0; transform: translateY(-6px); }
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

            @keyframes game-2048-route-loader-in {
              from { opacity: 0; transform: translateY(10px) scale(0.992); }
              to { opacity: 1; transform: translateY(0) scale(1); }
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

              :root:has(.game-2048-page),
              body:has(.game-2048-page) {
                height: auto;
                overflow: auto;
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
                grid-template-rows: none;
              }

              .game-2048-stats-panel .game-2048-stat-cell {
                border-right: 1px solid var(--gb-ink);
              }

              .game-2048-stats-panel .game-2048-stat-cell:nth-child(2n) {
                border-right: 0;
              }

              .game-2048-stats-panel .game-2048-storage-cell {
                grid-column: 1 / -1;
              }
            }

            @media (max-width: 680px) {
              .game-2048-shell {
                border-left: 0;
                border-right: 0;
              }

              .game-2048-stage {
                padding: 12px;
              }

              .game-2048-board {
                max-width: min(100%, calc(100vh - 260px), 520px) !important;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-2048-page,
              .game-2048-tile,
              .game-2048-tile.is-new,
              .game-2048-tile.is-merged,
              .game-2048-board,
              .game-2048-board.is-revealing .game-2048-tile,
              .game-2048-board.is-revealing .game-2048-tile-empty,
              .game-2048-start-copy > *,
              .game-2048-ambient-cell,
              .game-2048-ambient-line,
              .game-2048-transition-panel,
              .game-2048-route-loader,
              .game-2048-transition-bar::after,
              .game-2048-result,
              .game-2048-result-card,
              .game-2048-confetti,
              .game-2048-celebration::before,
              .game-2048-celebration::after,
              .game-2048-win-mark {
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
            <h1 className="mt-3 font-[family-name:var(--font-space)] text-5xl font-black uppercase leading-none sm:text-7xl">2048</h1>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="game-2048-current-mode-label font-mono font-bold uppercase">{game2048ModeCopy[selectedMode].label}</p>
              <span className="h-px w-10 bg-[#0e0e0e]/40" />
              <p className="text-sm font-semibold tracking-[0.12em] text-[#77736b]">{game2048ModeCopy[selectedMode].zh}</p>
            </div>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 sm:items-end">
            <Link
              href="/game-box"
              onClick={handleExitToBox}
              className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#ff3b30] transition-colors duration-150 hover:text-[#0e0e0e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
            >
              ESC TO BOX / 返回
            </Link>
            <p className="max-w-[30ch] text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">{accountMessage}</p>
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
            mode={selectedMode}
            canChangeMode={game.status === "idle" && !stageTransition}
            onModeChange={handleModeChange}
          />

          <section className="game-2048-stage relative min-w-0 border-b border-[#0e0e0e] sm:p-6 lg:border-b-0 lg:border-x">
            <div className="game-2048-board-frame">
              {game.status !== "idle" ? (
                <>
                  <button
                    type="button"
                    onClick={handleUndo}
                    disabled={!game.canUndo || Boolean(stageTransition)}
                    title={game.undoRemaining <= 0 ? "使用次数已耗尽" : game.moveSequence.length === 0 ? "暂无可回退步骤" : `剩余 ${game.undoRemaining}/3`}
                    className="game-2048-undo absolute left-0 top-0 z-20 border border-[#0e0e0e] bg-[#f4f1ea] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#77736b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                  >
                    Undo / 回退 {game.undoRemaining}/3
                  </button>
                  <button
                    type="button"
                    onClick={handlePauseGame}
                    disabled={Boolean(stageTransition) || game.status === "paused" || game.status === "game_over"}
                    className="game-2048-pause absolute right-0 top-0 z-20 border border-[#0e0e0e] bg-[#f4f1ea] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#77736b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                  >
                    Pause / 暂停
                  </button>
                </>
              ) : null}

              {undoToastKey > 0 ? <div key={undoToastKey} className="game-2048-undo-toast">UNDO -1</div> : null}

              <Game2048Board
                board={game.board}
                status={game.status}
                score={game.score}
                mergedIndexes={game.mergedIndexes}
                lastAddedIndex={game.lastAddedIndex}
                lastMoveDirection={game.lastMoveDirection}
                revealKey={boardRevealKey}
                isRevealing={isBoardRevealing}
                isRewinding={isRewinding}
                onMove={game.makeMove}
              />

              {game.status === "idle" ? (
                <div className="game-2048-start-field absolute inset-0 z-10 flex items-center justify-center overflow-hidden border border-[#0e0e0e]">
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
                  <div key={`start-copy-${selectedMode}`} className="game-2048-start-copy relative z-10 max-w-md text-center">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">
                      {game.hasSavedGame ? "Saved run found / 发现未完成局" : "Ready start / 准备开始"}
                    </p>
                    <h2 className="mt-4 font-[family-name:var(--font-space)] text-5xl font-black uppercase leading-none">2048</h2>
                    <div className="mx-auto mt-5 max-w-[320px] border-y border-[#0e0e0e]/30 py-4">
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">Mode / 模式</p>
                      <p className="mt-2 font-[family-name:var(--font-space)] text-2xl font-black uppercase leading-none">{game2048ModeCopy[selectedMode].label}</p>
                      <p className="mt-2 text-sm font-bold tracking-[0.08em] text-[#77736b]">{game2048ModeCopy[selectedMode].zh}</p>
                    </div>
                    <p className="mt-4 text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
                      {game.hasSavedGame
                        ? `上次进度：${formatNumber(game.savedGame?.score || 0)} 分，${formatDuration(game.savedGame?.durationMs || 0)}。`
                        : game2048ModeCopy[selectedMode].detail}
                    </p>
                    <div className={`mt-6 grid gap-3 ${game.hasSavedGame ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
                      {game.hasSavedGame ? (
                        <button
                          type="button"
                          onClick={handleResumeGame}
                          disabled={Boolean(stageTransition)}
                          className="game-2048-start-button border border-[#0e0e0e] bg-[#ff3b30] px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0e0e0e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                        >
                          Resume run / 继续本局
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={handleStartGame}
                        disabled={Boolean(stageTransition) || game.isSaveLoading}
                        className="game-2048-start-button border border-[#0e0e0e] bg-[#ff3b30] px-5 py-4 font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#0e0e0e] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                      >
                        {game.hasSavedGame ? "New run / 新局" : stageTransition === "starting" ? "Loading / 加载中" : "Start run / 开始"}
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {game.status === "paused" && !game.winPromptOpen ? (
                <div className="game-2048-pause-field absolute inset-0 z-30 flex items-center justify-center border border-[#0e0e0e] bg-white/94 p-4">
                  <div className="game-2048-pause-card w-full max-w-xl border border-[#0e0e0e] bg-inherit">
                    <div className="border-b border-[#0e0e0e] p-5">
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">Paused run / 已暂停</p>
                      <h2 className="mt-3 font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none">HOLD STATE</h2>
                    </div>
                    <div className="grid grid-cols-2 border-b border-[#0e0e0e] sm:grid-cols-4">
                      <PauseMetric label="Score / 分数" value={formatNumber(game.score)} />
                      <PauseMetric label="Best tile / 最大数字" value={game.maxTile || 0} />
                      <PauseMetric label="Moves / 移动" value={game.movesCount} />
                      <PauseMetric label="Undo / 回退" value={`${game.undoRemaining}/3`} />
                    </div>
                    <div className="grid gap-3 p-5 font-mono text-xs font-bold uppercase tracking-[0.14em] sm:grid-cols-3">
                      <button
                        type="button"
                        onClick={game.resumePausedGame}
                        className="game-2048-modal-button border border-[#0e0e0e] px-4 py-3 text-left text-[#ff3b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                      >
                        Continue run / 继续
                      </button>
                      <button
                        type="button"
                        onClick={handleStartGame}
                        className="game-2048-modal-button border border-[#0e0e0e] px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                      >
                        New run / 新局
                      </button>
                      <button
                        type="button"
                        onClick={handleEndRun}
                        className="game-2048-modal-button border border-[#0e0e0e] px-4 py-3 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                      >
                        End run / 结束
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {game.winPromptOpen ? (
                <div className="game-2048-win-field absolute inset-0 z-30 flex items-center justify-center border border-[#0e0e0e] bg-white/94 p-4">
                  <div className="game-2048-celebration" aria-hidden="true">
                    {celebrationPieces.map((piece, index) => (
                      <span
                        key={`${piece.left}-${index}`}
                        className={`game-2048-confetti ${piece.shape}`}
                        style={
                          {
                            "--confetti-left": piece.left,
                            "--confetti-bottom": piece.bottom,
                            "--confetti-tx": piece.tx,
                            "--confetti-ty": piece.ty,
                            "--confetti-rotate": piece.rotate,
                            "--confetti-color": piece.color,
                            "--confetti-delay": piece.delay,
                          } as CSSProperties
                        }
                      />
                    ))}
                  </div>
                  <div className="game-2048-win-card w-full max-w-2xl border border-[#0e0e0e] bg-inherit">
                    <div className="game-2048-win-header border-b border-[#0e0e0e] p-6">
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#ff3b30]">2048 reached / 已达成</p>
                        <h2 className="game-2048-win-title mt-3 font-[family-name:var(--font-space)] text-5xl font-black uppercase leading-none">
                          Stage <strong>Clear</strong>
                        </h2>
                      </div>
                      <div className="game-2048-win-mark" aria-hidden="true">
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>
                      <p className="col-span-full max-w-[58ch] text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
                        你第一次合成了 2048。可以继续冲分，也可以稍后结束本局。
                      </p>
                    </div>
                    <div className="game-2048-win-stats">
                      <div className="game-2048-win-stat">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">Tile / 数字</p>
                        <p className="mt-2 font-[family-name:var(--font-space)] text-2xl font-black leading-none">2048</p>
                      </div>
                      <div className="game-2048-win-stat">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">Score / 分数</p>
                        <p className="mt-2 font-[family-name:var(--font-space)] text-2xl font-black leading-none">{formatNumber(game.score)}</p>
                      </div>
                      <div className="game-2048-win-stat">
                        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]">State / 状态</p>
                        <p className="mt-2 font-[family-name:var(--font-space)] text-2xl font-black uppercase leading-none">Clear</p>
                      </div>
                    </div>
                    <div className="game-2048-win-actions p-6">
                      <button
                        type="button"
                        onClick={game.continueAfter2048}
                        className="game-2048-modal-button w-full border border-[#0e0e0e] px-4 py-4 text-left font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#ff3b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
                      >
                        Keep going / 继续冲分
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {stageTransition ? (
                <div className="game-2048-transition-panel" role="status" aria-live="polite">
                  <div className="game-2048-transition-card">
                    <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">
                      {stageTransition === "resuming"
                        ? "Resume run / 正在恢复本局"
                        : stageTransition === "ending"
                          ? "End run / 正在返回初始界面"
                          : "Loading board / 正在生成棋盘"}
                    </p>
                    <p className="mt-3 font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none">
                      {stageTransition === "ending" ? "IDLE" : "2048"}
                    </p>
                    <div className="game-2048-transition-bar" />
                  </div>
                </div>
              ) : null}
            </div>

            <Game2048Controls
              onNewGame={handleStartGame}
              onBackToBox={handleExitToBox}
              saveState={game.saveState}
              saveMessage={game.saveMessage}
            />
          </section>

          <GameLeaderboardPanel
            key={leaderboardMode}
            mode={leaderboardMode}
          />
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
        mode={selectedMode}
        onPlayAgain={handleStartGame}
        onViewLeaderboard={viewLeaderboard}
        onClose={game.resetToIdle}
      />

      {routeTransition ? (
        <div className="game-2048-route-loader" role="status" aria-live="polite" aria-label="Returning to Game Box">
          <div className="game-2048-route-card">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">Returning to box / 正在返回</p>
            <p className="mt-3 font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none">GAME BOX</p>
            <div className="game-2048-transition-bar" />
          </div>
        </div>
      ) : null}
    </main>
  )
}

function PauseMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-b border-r border-[#0e0e0e] p-4 last:border-r-0 sm:border-b-0">
      <p className="whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-[#77736b]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-space)] text-2xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}
