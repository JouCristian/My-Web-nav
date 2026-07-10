"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  createGameSeed,
  createEmptyBoard,
  createInitialGameWithRng,
  createSeededRng,
  directionFromKey,
  GAME_2048_VERSION,
  getMaxTile,
  getStatus,
  moveBoard,
} from "../lib/game2048-core"
import type { Board2048, Direction, Game2048RankSummary, Game2048Status } from "../types"

const localBestKey = "game-box:2048:local-best:v1"
const inputLockMs = 150

interface StartGameResponse {
  runId: string | null
  seed: string
  gameVersion: string
  startedAt: string
  canSave: boolean
}

interface FinishGameResponse {
  saved: boolean
  verified: boolean
  suspicious: boolean
  message?: string
  result?: {
    score: number
    maxTile: number
    movesCount: number
    durationMs: number
  }
  rankSummary?: Game2048RankSummary
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tagName = target.tagName.toLowerCase()
  return tagName === "input" || tagName === "textarea" || tagName === "select" || target.isContentEditable
}

export function use2048Game(isLoggedIn: boolean) {
  const [seed, setSeed] = useState(createGameSeed())
  const [runId, setRunId] = useState<string | null>(null)
  const [canSave, setCanSave] = useState(false)
  const [board, setBoard] = useState<Board2048>(() => createEmptyBoard())
  const [score, setScore] = useState(0)
  const [movesCount, setMovesCount] = useState(0)
  const [status, setStatus] = useState<Game2048Status>("idle")
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [durationMs, setDurationMs] = useState(0)
  const [moveSequence, setMoveSequence] = useState<Direction[]>([])
  const [localBest, setLocalBest] = useState(0)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed" | "skipped">("idle")
  const [saveMessage, setSaveMessage] = useState("")
  const [rankSummary, setRankSummary] = useState<Game2048RankSummary>({ weekly: null, allTime: null })
  const [mergedValues, setMergedValues] = useState<number[]>([])
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null)
  const [isInputLocked, setIsInputLocked] = useState(false)
  const rngRef = useRef(createSeededRng(seed))
  const boardRef = useRef(board)
  const statusRef = useRef(status)
  const startedAtRef = useRef(startedAt)
  const finishSubmittedRef = useRef(false)

  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    startedAtRef.current = startedAt
  }, [startedAt])

  useEffect(() => {
    try {
      setLocalBest(Number(window.localStorage.getItem(localBestKey) || 0))
    } catch {
      setLocalBest(0)
    }
  }, [])

  useEffect(() => {
    if (!startedAt || status === "idle") return
    const timer = window.setInterval(() => {
      if (statusRef.current === "playing" || statusRef.current === "won") {
        setDurationMs(Date.now() - startedAt)
      }
    }, 500)
    return () => window.clearInterval(timer)
  }, [startedAt, status])

  const bestScore = Math.max(localBest, score)
  const maxTile = useMemo(() => getMaxTile(board), [board])

  const startNewGame = useCallback(async () => {
    setSaveState("idle")
    setSaveMessage("")
    setRankSummary({ weekly: null, allTime: null })
    finishSubmittedRef.current = false

    let startData: StartGameResponse | null = null
    try {
      const response = await fetch("/api/game-box/2048/start", { method: "POST" })
      if (response.ok) startData = await response.json()
    } catch {
      startData = null
    }

    const nextSeed = startData?.seed || createGameSeed()
    const rng = createSeededRng(nextSeed)
    const game = createInitialGameWithRng(nextSeed, rng)
    rngRef.current = rng

    setSeed(nextSeed)
    setRunId(startData?.runId || null)
    setCanSave(Boolean(startData?.canSave))
    setBoard(game.board)
    setScore(0)
    setMovesCount(0)
    setStatus("playing")
    const now = Date.now()
    setStartedAt(now)
    setDurationMs(0)
    setMoveSequence([])
    setMergedValues([])
    setLastAddedIndex(null)
    setIsInputLocked(false)
    boardRef.current = game.board
  }, [])

  const resetToIdle = useCallback(() => {
    finishSubmittedRef.current = false
    const emptyBoard = createEmptyBoard()
    setRunId(null)
    setCanSave(false)
    setBoard(emptyBoard)
    setScore(0)
    setMovesCount(0)
    setStatus("idle")
    setStartedAt(null)
    setDurationMs(0)
    setMoveSequence([])
    setSaveState("idle")
    setSaveMessage("")
    setRankSummary({ weekly: null, allTime: null })
    setMergedValues([])
    setLastAddedIndex(null)
    setIsInputLocked(false)
    boardRef.current = emptyBoard
    statusRef.current = "idle"
    startedAtRef.current = null
  }, [])

  const submitFinish = useCallback(
    async (finalStatus: Game2048Status, finalBoard: Board2048, finalScore: number, finalMoves: number, finalDuration: number, sequence: Direction[]) => {
      if (finishSubmittedRef.current || finalStatus !== "game_over") return
      finishSubmittedRef.current = true

      const nextBest = Math.max(localBest, finalScore)
      try {
        window.localStorage.setItem(localBestKey, String(nextBest))
        setLocalBest(nextBest)
      } catch {
        setLocalBest(nextBest)
      }

      if (!isLoggedIn || !runId || !canSave) {
        setSaveState("skipped")
        setSaveMessage("登录后可保存成绩并进入正式排行榜。")
        setRankSummary({ weekly: null, allTime: null })
        return
      }

      setSaveState("saving")
      try {
        const response = await fetch("/api/game-box/2048/finish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            runId,
            moveSequence: sequence,
            durationMs: finalDuration,
            gameVersion: GAME_2048_VERSION,
            clientFinalBoard: finalBoard,
            clientScore: finalScore,
          }),
        })
        const payload = (await response.json()) as FinishGameResponse
        if (!response.ok || !payload.saved) {
          setSaveState("failed")
          setSaveMessage(payload.message || "成绩保存失败，但你仍然可以继续游戏。")
          setRankSummary({ weekly: null, allTime: null })
          return
        }
        setSaveState(payload.verified ? "saved" : "failed")
        setSaveMessage(payload.verified ? "成绩已通过服务端重放验证。" : "本局无法进入排行榜：验证未通过。")
        setRankSummary(payload.rankSummary || { weekly: null, allTime: null })
      } catch {
        setSaveState("failed")
        setSaveMessage("成绩保存失败，但你仍然可以继续游戏。")
        setRankSummary({ weekly: null, allTime: null })
      }
    },
    [canSave, isLoggedIn, localBest, runId],
  )

  const makeMove = useCallback(
    (direction: Direction) => {
      if (isInputLocked || (statusRef.current !== "playing" && statusRef.current !== "won")) return
      setIsInputLocked(true)
      window.setTimeout(() => setIsInputLocked(false), inputLockMs)

      const result = moveBoard(boardRef.current, direction, rngRef.current)
      if (!result.moved) return

      const nextScore = score + result.scoreGain
      const nextMoves = movesCount + 1
      const nextSequence = [...moveSequence, direction]
      const won = statusRef.current === "won" || getMaxTile(result.board) >= 2048
      const nextStatus = getStatus(result.board, won)
      const nextDuration = startedAtRef.current ? Date.now() - startedAtRef.current : durationMs

      setBoard(result.board)
      setScore(nextScore)
      setMovesCount(nextMoves)
      setMoveSequence(nextSequence)
      setStatus(nextStatus)
      setDurationMs(nextDuration)
      setMergedValues(result.mergedValues)
      setLastAddedIndex(result.addedTile?.index ?? null)

      void submitFinish(nextStatus, result.board, nextScore, nextMoves, nextDuration, nextSequence)
    },
    [durationMs, isInputLocked, moveSequence, movesCount, score, submitFinish],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return
      const direction = directionFromKey(event.key)
      if (direction) {
        event.preventDefault()
        makeMove(direction)
        return
      }
      if (event.key.toLowerCase() === "r" && statusRef.current === "game_over") {
        event.preventDefault()
        void startNewGame()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [makeMove, startNewGame])

  return {
    seed,
    runId,
    canSave,
    board,
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
    lastAddedIndex,
    isInputLocked,
    startNewGame,
    resetToIdle,
    makeMove,
  }
}
