"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  canMove,
  createEmptyBoard,
  createInitialGameWithRng,
  createGameSeed,
  createSeededRng,
  directionFromKey,
  GAME_2048_VERSION,
  getBoardSize,
  getMaxTile,
  moveBoard,
  replayGame,
  type Rng,
} from "../lib/game2048-core"
import { getDailyChallengeSeed, isGame2048Mode, normalizeBoard2048Size } from "../lib/modes"
import type { Board2048, Board2048Size, Direction, Game2048Mode, Game2048RankSummary, Game2048Status } from "../types"

type SaveState = "idle" | "saving" | "saved" | "error"

export interface Game2048SavedState {
  mode: Game2048Mode
  boardSize: Board2048Size
  seed: string
  runId: string | null
  canSave: boolean
  board: Board2048
  score: number
  movesCount: number
  durationMs: number
  status: Extract<Game2048Status, "playing" | "paused" | "won">
  moveSequence: Direction[]
  undoRemaining: number
  undoCount: number
  hasReached2048: boolean
  hasAcknowledged2048: boolean
  gameVersion: string
  savedAt?: string
}

const localBestKey = (mode: Game2048Mode, boardSize: Board2048Size) => `game-box:2048:${mode}:${boardSize}x${boardSize}:local-best:v1`
const localSaveKey = (mode: Game2048Mode, boardSize: Board2048Size) => `game-box:2048:${mode}:${boardSize}x${boardSize}:active-save:v1`
const legacyLocalBestKey = "game-box:2048:local-best:v1"
const legacyLocalSaveKey = "game-box:2048:active-save:v1"
const inputLockMs = 150
const maxUndoCount = 3
const saveDebounceMs = 420

function isBrowser() {
  return typeof window !== "undefined"
}

function isDirection(value: unknown): value is Direction {
  return value === "up" || value === "down" || value === "left" || value === "right"
}

function sanitizeBoard(value: unknown, boardSize: Board2048Size): Board2048 | null {
  if (!Array.isArray(value) || value.length !== boardSize * boardSize) return null
  const board = value.map((item) => Number(item))
  if (board.some((item) => !Number.isInteger(item) || item < 0)) return null
  return board
}

function sanitizeSavedState(value: unknown, fallbackMode: Game2048Mode): Game2048SavedState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const source = value as Record<string, unknown>
  const boardSize = normalizeBoard2048Size(source.boardSize)
  const board = sanitizeBoard(source.board, boardSize)
  const seed = typeof source.seed === "string" ? source.seed : ""
  if (!seed || !board) return null

  const sourceStatus = source.status
  const status = sourceStatus === "paused" || sourceStatus === "won" ? sourceStatus : "playing"

  return {
    mode: isGame2048Mode(source.mode) ? source.mode : fallbackMode,
    boardSize,
    seed,
    runId: typeof source.runId === "string" ? source.runId : null,
    canSave: Boolean(source.canSave),
    board,
    score: Number.isFinite(source.score) ? Math.max(0, Math.floor(Number(source.score))) : 0,
    movesCount: Number.isFinite(source.movesCount) ? Math.max(0, Math.floor(Number(source.movesCount))) : 0,
    durationMs: Number.isFinite(source.durationMs) ? Math.max(0, Math.floor(Number(source.durationMs))) : 0,
    status,
    moveSequence: Array.isArray(source.moveSequence) ? source.moveSequence.filter(isDirection) : [],
    undoRemaining: Number.isFinite(source.undoRemaining) ? Math.max(0, Math.min(maxUndoCount, Math.floor(Number(source.undoRemaining)))) : maxUndoCount,
    undoCount: Number.isFinite(source.undoCount) ? Math.max(0, Math.floor(Number(source.undoCount))) : 0,
    hasReached2048: Boolean(source.hasReached2048),
    hasAcknowledged2048: Boolean(source.hasAcknowledged2048),
    gameVersion: typeof source.gameVersion === "string" ? source.gameVersion : GAME_2048_VERSION,
    savedAt: typeof source.savedAt === "string" ? source.savedAt : undefined,
  }
}

function readLocalBest(mode: Game2048Mode, boardSize: Board2048Size) {
  if (!isBrowser()) return 0
  const stored = window.localStorage.getItem(localBestKey(mode, boardSize)) || (mode === "classic" && boardSize === 4 ? window.localStorage.getItem(legacyLocalBestKey) : null)
  const value = Number(stored || 0)
  return Number.isFinite(value) ? value : 0
}

function writeLocalBest(mode: Game2048Mode, boardSize: Board2048Size, value: number) {
  if (!isBrowser()) return
  window.localStorage.setItem(localBestKey(mode, boardSize), String(Math.max(0, value)))
}

function readLocalSave(mode: Game2048Mode, boardSize: Board2048Size) {
  if (!isBrowser()) return null
  try {
    const stored = window.localStorage.getItem(localSaveKey(mode, boardSize)) || (mode === "classic" && boardSize === 4 ? window.localStorage.getItem(legacyLocalSaveKey) : null)
    return sanitizeSavedState(JSON.parse(stored || "null"), mode)
  } catch {
    return null
  }
}

function writeLocalSave(state: Game2048SavedState) {
  if (!isBrowser()) return
  window.localStorage.setItem(localSaveKey(state.mode, state.boardSize), JSON.stringify({ ...state, savedAt: new Date().toISOString() }))
}

function clearLocalSave(mode: Game2048Mode, boardSize: Board2048Size) {
  if (!isBrowser()) return
  window.localStorage.removeItem(localSaveKey(mode, boardSize))
  if (mode === "classic" && boardSize === 4) window.localStorage.removeItem(legacyLocalSaveKey)
}

function rebuildRngAfterSequence(seed: string, moveSequence: Direction[], boardSize: Board2048Size) {
  const rng = createSeededRng(seed)
  let board = createInitialGameWithRng(seed, rng, boardSize).board

  for (const direction of moveSequence) {
    const result = moveBoard(board, direction, rng, boardSize)
    if (result.moved) board = result.board
  }

  return rng
}

function statusForBoard(board: Board2048, hasReached2048: boolean): Game2048Status {
  if (!canMove(board)) return "game_over"
  return hasReached2048 ? "won" : "playing"
}

export function use2048Game(isLoggedIn: boolean, mode: Game2048Mode, boardSize: Board2048Size) {
  const [seed, setSeed] = useState("")
  const [runId, setRunId] = useState<string | null>(null)
  const [canSave, setCanSave] = useState(false)
  const [board, setBoard] = useState<Board2048>(() => createEmptyBoard(boardSize))
  const [score, setScore] = useState(0)
  const [localBest, setLocalBest] = useState(0)
  const [movesCount, setMovesCount] = useState(0)
  const [status, setStatus] = useState<Game2048Status>("idle")
  const [durationMs, setDurationMs] = useState(0)
  const [moveSequence, setMoveSequence] = useState<Direction[]>([])
  const [saveState, setSaveState] = useState<SaveState>("idle")
  const [saveMessage, setSaveMessage] = useState("")
  const [rankSummary, setRankSummary] = useState<Game2048RankSummary>({ weekly: null, allTime: null })
  const [mergedValues, setMergedValues] = useState<number[]>([])
  const [mergedIndexes, setMergedIndexes] = useState<number[]>([])
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null)
  const [isInputLocked, setIsInputLocked] = useState(false)
  const [undoRemaining, setUndoRemaining] = useState(maxUndoCount)
  const [undoCount, setUndoCount] = useState(0)
  const [undoFlashKey, setUndoFlashKey] = useState(0)
  const [hasReached2048, setHasReached2048] = useState(false)
  const [hasAcknowledged2048, setHasAcknowledged2048] = useState(false)
  const [winPromptOpen, setWinPromptOpen] = useState(false)
  const [savedGame, setSavedGame] = useState<Game2048SavedState | null>(null)
  const [isSaveLoading, setIsSaveLoading] = useState(true)

  const rngRef = useRef<Rng>(Math.random)
  const startedAtRef = useRef<number | null>(null)
  const lockTimeoutRef = useRef<number | null>(null)
  const saveTimeoutRef = useRef<number | null>(null)
  const finishSubmittedRef = useRef(false)

  const maxTile = useMemo(() => getMaxTile(board), [board])
  const bestScore = Math.max(localBest, score)
  const canUndo = (status === "playing" || status === "won") && undoRemaining > 0 && moveSequence.length > 0

  const getLiveDuration = useCallback(() => {
    if (startedAtRef.current && (status === "playing" || status === "won")) {
      return Date.now() - startedAtRef.current
    }
    return durationMs
  }, [durationMs, status])

  const buildSaveState = useCallback(
    (nextStatus: Extract<Game2048Status, "playing" | "paused" | "won"> = status === "won" ? "won" : status === "paused" ? "paused" : "playing") => ({
      mode,
      boardSize,
      seed,
      runId,
      canSave,
      board,
      score,
      movesCount,
      durationMs: getLiveDuration(),
      status: nextStatus,
      moveSequence,
      undoRemaining,
      undoCount,
      hasReached2048,
      hasAcknowledged2048,
      gameVersion: GAME_2048_VERSION,
      savedAt: new Date().toISOString(),
    }),
    [board, boardSize, canSave, getLiveDuration, hasAcknowledged2048, hasReached2048, mode, moveSequence, movesCount, runId, score, seed, status, undoCount, undoRemaining]
  )

  const clearServerSave = useCallback(async () => {
    if (!isLoggedIn || mode === "zen") return
    await fetch(`/api/game-box/2048/save?mode=${mode}&boardSize=${boardSize}`, { method: "DELETE" }).catch(() => null)
  }, [boardSize, isLoggedIn, mode])

  const clearSavedGame = useCallback(async () => {
    setSavedGame(null)
    clearLocalSave(mode, boardSize)
    await clearServerSave()
  }, [boardSize, clearServerSave, mode])

  const persistSave = useCallback(
    async (state: Game2048SavedState) => {
      if (state.status === "paused") setSaveMessage("Paused run saved / 暂停局已保存")
      setSaveState("saving")

      if (!isLoggedIn || !state.canSave) {
        writeLocalSave(state)
        setSavedGame(state)
        setSaveState("saved")
        if (state.status !== "paused") setSaveMessage("Run saved locally / 本局已保存到浏览器")
        return
      }

      try {
        const response = await fetch("/api/game-box/2048/save", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ state }),
        })
        if (!response.ok) throw new Error("Save failed")
        setSavedGame(state)
        setSaveState("saved")
        if (state.status !== "paused") setSaveMessage("Run saved to account / 本局已保存到账号")
      } catch {
        writeLocalSave(state)
        setSavedGame(state)
        setSaveState("error")
        setSaveMessage("Account save failed, cached locally / 账号保存失败，已临时缓存")
      }
    },
    [isLoggedIn]
  )

  const schedulePersistSave = useCallback(
    (state = buildSaveState()) => {
      if (!state.seed || status === "idle" || status === "game_over") return
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = window.setTimeout(() => {
        void persistSave(state)
      }, saveDebounceMs)
    },
    [buildSaveState, persistSave, status]
  )

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setLocalBest(readLocalBest(mode, boardSize)))
    return () => window.cancelAnimationFrame(frame)
  }, [boardSize, mode])

  useEffect(() => {
    let cancelled = false

    async function loadSavedGame() {
      setIsSaveLoading(true)
      if (isLoggedIn && mode !== "zen") {
        try {
          const response = await fetch(`/api/game-box/2048/save?mode=${mode}&boardSize=${boardSize}`)
          const payload = (await response.json()) as { save?: { state?: unknown } | null }
          const serverSave = sanitizeSavedState(payload.save?.state, mode)
          if (!cancelled) setSavedGame(serverSave)
        } catch {
          if (!cancelled) setSavedGame(readLocalSave(mode, boardSize))
        } finally {
          if (!cancelled) setIsSaveLoading(false)
        }
        return
      }

      setSavedGame(readLocalSave(mode, boardSize))
      setIsSaveLoading(false)
    }

    void loadSavedGame()
    return () => {
      cancelled = true
    }
  }, [boardSize, isLoggedIn, mode])

  useEffect(() => {
    if (status !== "playing" && status !== "won") return
    const interval = window.setInterval(() => {
      setDurationMs(getLiveDuration())
    }, 1000)
    return () => window.clearInterval(interval)
  }, [getLiveDuration, status])

  useEffect(() => {
    if (status !== "playing" && status !== "won") return
    const interval = window.setInterval(() => {
      schedulePersistSave()
    }, 3000)
    return () => window.clearInterval(interval)
  }, [schedulePersistSave, status])

  useEffect(() => {
    if (status === "playing" || status === "won" || status === "paused") {
      schedulePersistSave()
    }
  }, [board, durationMs, hasAcknowledged2048, hasReached2048, moveSequence, movesCount, schedulePersistSave, score, status, undoCount, undoRemaining])

  useEffect(() => {
    if (status !== "game_over" || finishSubmittedRef.current) return
    finishSubmittedRef.current = true
    const finalDuration = getLiveDuration()
    setDurationMs(finalDuration)
    startedAtRef.current = null

    const nextBest = Math.max(localBest, score)
    setLocalBest(nextBest)
    writeLocalBest(mode, boardSize, nextBest)
    clearLocalSave(mode, boardSize)
    setSavedGame(null)

    if (!isLoggedIn || !canSave || !runId) {
      setSaveState("idle")
      setSaveMessage(mode === "zen" ? "Zen mode stays in this browser only / 放松模式仅保存在当前浏览器。" : "登录后可保存成绩和进入排行榜。")
      return
    }

    async function submitRun() {
      setSaveState("saving")
      setSaveMessage("正在服务器重放验证本局。")
      try {
        const response = await fetch("/api/game-box/2048/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            moveSequence,
            durationMs: finalDuration,
            gameVersion: GAME_2048_VERSION,
            clientScore: score,
            clientFinalBoard: board,
            undoCount,
          }),
        })
        const payload = (await response.json()) as {
          saved?: boolean
          message?: string
          rankSummary?: Game2048RankSummary
        }
        setSaveState(payload.saved ? "saved" : "error")
        setSaveMessage(payload.message || (payload.saved ? "成绩已保存并通过验证。" : "本局未进入排行榜。"))
        setRankSummary(payload.rankSummary || { weekly: null, allTime: null })
        await clearServerSave()
      } catch {
        setSaveState("error")
        setSaveMessage("成绩保存失败，但本局结果仍保留在当前页面。")
      }
    }

    void submitRun()
  }, [board, boardSize, canSave, clearServerSave, getLiveDuration, isLoggedIn, localBest, mode, moveSequence, runId, score, status, undoCount])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "p" && (status === "playing" || status === "won" || status === "paused")) {
        event.preventDefault()
        if (status === "paused") {
          resumePausedGame()
        } else {
          pauseGame()
        }
        return
      }

      if (status === "game_over" && event.key.toLowerCase() === "r") {
        event.preventDefault()
        void startNewGame()
        return
      }

      const direction = directionFromKey(event.key)
      if (!direction) return
      if (status !== "playing" && status !== "won") return
      event.preventDefault()
      makeMove(direction)
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  })

  const hydrateRun = useCallback((state: Game2048SavedState, asPaused = true) => {
    rngRef.current = rebuildRngAfterSequence(state.seed, state.moveSequence, state.boardSize)
    startedAtRef.current = null
    finishSubmittedRef.current = false
    setSeed(state.seed)
    setRunId(state.runId)
    setCanSave(state.canSave)
    setBoard(state.board)
    setScore(state.score)
    setMovesCount(state.movesCount)
    setDurationMs(state.durationMs)
    setMoveSequence(state.moveSequence)
    setMergedValues([])
    setMergedIndexes([])
    setLastAddedIndex(null)
    setUndoRemaining(state.undoRemaining)
    setUndoCount(state.undoCount)
    setHasReached2048(state.hasReached2048)
    setHasAcknowledged2048(state.hasAcknowledged2048)
    setWinPromptOpen(false)
    setSaveMessage("Run restored / 已恢复本局")
    setSaveState("saved")
    setStatus(asPaused ? "paused" : state.status)
    if (!asPaused && (state.status === "playing" || state.status === "won")) {
      startedAtRef.current = Date.now() - state.durationMs
    }
  }, [])

  const resumeSavedGame = useCallback(() => {
    if (!savedGame) return
    hydrateRun(savedGame, true)
  }, [hydrateRun, savedGame])

  const startNewGame = useCallback(async () => {
    if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current)
    setIsInputLocked(true)
    finishSubmittedRef.current = false
    setSaveState("idle")
    setSaveMessage("")
    setRankSummary({ weekly: null, allTime: null })
    setMergedValues([])
    setMergedIndexes([])
    setLastAddedIndex(null)
    setUndoRemaining(maxUndoCount)
    setUndoCount(0)
    setUndoFlashKey(0)
    setHasReached2048(false)
    setHasAcknowledged2048(false)
    setWinPromptOpen(false)
    clearLocalSave(mode, boardSize)
    setSavedGame(null)

    let nextSeed = ""
    let nextRunId: string | null = null
    let nextCanSave = false

    if (mode === "zen") {
      nextSeed = createGameSeed()
      setSaveMessage("Zen mode / 放松模式，仅保存到当前浏览器。")
    } else {
      try {
        const response = await fetch("/api/game-box/2048/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, boardSize }),
        })
        const payload = (await response.json()) as { seed?: string; runId?: string | null; canSave?: boolean; warning?: string }
        nextSeed = payload.seed || (mode === "daily" ? getDailyChallengeSeed(new Date(), boardSize) : createGameSeed())
        nextRunId = payload.runId || null
        nextCanSave = Boolean(payload.canSave)
        if (payload.warning) setSaveMessage(payload.warning)
      } catch {
        nextSeed = mode === "daily" ? getDailyChallengeSeed(new Date(), boardSize) : createGameSeed()
        setSaveMessage("服务器暂不可用，本局以本地模式开始。")
      }
    }

    await clearServerSave()
    const rng = createSeededRng(nextSeed)
    const initial = createInitialGameWithRng(nextSeed, rng, boardSize)
    rngRef.current = rng
    startedAtRef.current = Date.now()
    setSeed(nextSeed)
    setRunId(nextRunId)
    setCanSave(nextCanSave)
    setBoard(initial.board)
    setScore(0)
    setMovesCount(0)
    setDurationMs(0)
    setMoveSequence([])
    setStatus("playing")
    lockTimeoutRef.current = window.setTimeout(() => setIsInputLocked(false), 240)
  }, [boardSize, clearServerSave, mode])

  const pauseGame = useCallback(() => {
    if (status !== "playing" && status !== "won") return
    const liveDuration = getLiveDuration()
    setDurationMs(liveDuration)
    startedAtRef.current = null
    setStatus("paused")
    schedulePersistSave(buildSaveState("paused"))
  }, [buildSaveState, getLiveDuration, schedulePersistSave, status])

  const resumePausedGame = useCallback(() => {
    if (status !== "paused") return
    startedAtRef.current = Date.now() - durationMs
    setStatus(hasReached2048 ? "won" : "playing")
    setSaveMessage("")
  }, [durationMs, hasReached2048, status])

  const continueAfter2048 = useCallback(() => {
    setWinPromptOpen(false)
    setHasAcknowledged2048(true)
    startedAtRef.current = Date.now() - durationMs
    setStatus("won")
  }, [durationMs])

  const resetToIdle = useCallback(async () => {
    if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current)
    startedAtRef.current = null
    finishSubmittedRef.current = false
    setBoard(createEmptyBoard(boardSize))
    setScore(0)
    setMovesCount(0)
    setStatus("idle")
    setDurationMs(0)
    setMoveSequence([])
    setMergedValues([])
    setMergedIndexes([])
    setLastAddedIndex(null)
    setIsInputLocked(false)
    setUndoRemaining(maxUndoCount)
    setUndoCount(0)
    setHasReached2048(false)
    setHasAcknowledged2048(false)
    setWinPromptOpen(false)
    setSaveMessage("")
    setSaveState("idle")
  }, [boardSize])

  const makeMove = useCallback(
    (direction: Direction) => {
      if (isInputLocked || (status !== "playing" && status !== "won")) return
      const result = moveBoard(board, direction, rngRef.current, boardSize)
      if (!result.moved) return

      setIsInputLocked(true)
      if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current)
      lockTimeoutRef.current = window.setTimeout(() => setIsInputLocked(false), inputLockMs)

      const nextScore = score + result.scoreGain
      const nextMovesCount = movesCount + 1
      const nextMoveSequence = [...moveSequence, direction]
      const nextMaxTile = getMaxTile(result.board)
      const reachedNow = !hasReached2048 && nextMaxTile >= 2048
      const nextHasReached = hasReached2048 || reachedNow
      const nextStatus = statusForBoard(result.board, nextHasReached)
      const liveDuration = getLiveDuration()

      setBoard(result.board)
      setScore(nextScore)
      setMovesCount(nextMovesCount)
      setDurationMs(liveDuration)
      setMoveSequence(nextMoveSequence)
      setMergedValues(result.mergedValues)
      setMergedIndexes(result.mergedIndexes)
      setLastAddedIndex(result.addedTile?.index ?? null)
      setHasReached2048(nextHasReached)

      if (mode === "sprint" && reachedNow) {
        startedAtRef.current = null
        setStatus("game_over")
        return
      }

      if (reachedNow && nextStatus !== "game_over") {
        startedAtRef.current = null
        setStatus("paused")
        setWinPromptOpen(true)
        return
      }

      setStatus(nextStatus)
    },
    [board, boardSize, getLiveDuration, hasReached2048, isInputLocked, mode, moveSequence, movesCount, score, status]
  )

  const undoLastMove = useCallback(() => {
    if (!canUndo || isInputLocked) return false
    const nextSequence = moveSequence.slice(0, -1)
    const replay = replayGame(seed, nextSequence, boardSize)
    rngRef.current = rebuildRngAfterSequence(seed, nextSequence, boardSize)
    const liveDuration = getLiveDuration()
    const nextHasReached = hasReached2048 || replay.maxTile >= 2048

    setBoard(replay.board)
    setScore(replay.score)
    setMovesCount(replay.movesCount)
    setDurationMs(liveDuration)
    setMoveSequence(nextSequence)
    setMergedValues([])
    setMergedIndexes([])
    setLastAddedIndex(null)
    setUndoRemaining((value) => Math.max(0, value - 1))
    setUndoCount((value) => value + 1)
    setUndoFlashKey((value) => value + 1)
    setHasReached2048(nextHasReached)
    setStatus(statusForBoard(replay.board, nextHasReached))
    setSaveMessage("Undo applied / 已回退一步")
    return true
  }, [boardSize, canUndo, getLiveDuration, hasReached2048, isInputLocked, moveSequence, seed])

  useEffect(() => {
    return () => {
      if (lockTimeoutRef.current) window.clearTimeout(lockTimeoutRef.current)
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current)
    }
  }, [])

  return {
    seed,
    runId,
    canSave,
    board,
    boardSize: getBoardSize(board, boardSize),
    score,
    bestScore,
    localBest,
    maxTile,
    movesCount,
    status,
    durationMs,
    moveSequence,
    saveState,
    saveMessage,
    rankSummary,
    mergedValues,
    mergedIndexes,
    lastAddedIndex,
    lastMoveDirection: moveSequence.length > 0 ? moveSequence[moveSequence.length - 1] : null,
    isInputLocked,
    undoRemaining,
    undoCount,
    canUndo,
    undoFlashKey,
    hasReached2048,
    hasAcknowledged2048,
    winPromptOpen,
    savedGame,
    hasSavedGame: Boolean(savedGame),
    isSaveLoading,
    startNewGame,
    resetToIdle,
    makeMove,
    undoLastMove,
    pauseGame,
    resumePausedGame,
    resumeSavedGame,
    clearSavedGame,
    continueAfter2048,
  }
}
