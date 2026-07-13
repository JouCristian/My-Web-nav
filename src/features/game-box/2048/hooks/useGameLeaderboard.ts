"use client"

import { useCallback, useEffect, useState } from "react"
import type { Board2048Size, Competitive2048Mode, LeaderboardEntry, LeaderboardPeriod } from "../types"

interface LeaderboardResponse {
  entries: LeaderboardEntry[]
  myRank: LeaderboardEntry | null
}

export function useGameLeaderboard(period: LeaderboardPeriod, mode: Competitive2048Mode, boardSize: Board2048Size) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/game-box/2048/leaderboard?period=${period}&mode=${mode}&boardSize=${boardSize}`)
      const payload = (await response.json()) as Partial<LeaderboardResponse> & { error?: string }
      if (!response.ok) {
        setError(payload.error || "排行榜暂时不可用，请稍后再试。")
        setEntries([])
        setMyRank(null)
        return
      }
      setEntries(payload.entries || [])
      setMyRank(payload.myRank || null)
    } catch {
      setError("排行榜暂时不可用，请稍后再试。")
      setEntries([])
      setMyRank(null)
    } finally {
      setIsLoading(false)
    }
  }, [boardSize, mode, period])

  useEffect(() => {
    void reload()
  }, [reload])

  return { entries, myRank, isLoading, error, reload }
}
