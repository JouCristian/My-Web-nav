import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { isCompetitive2048Mode } from "@/features/game-box/2048/lib/modes"
import { get2048Leaderboard } from "@/features/game-box/2048/lib/server"
import type { LeaderboardPeriod } from "@/features/game-box/2048/types"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const periodParam = request.nextUrl.searchParams.get("period")
  const period: LeaderboardPeriod = periodParam === "all_time" ? "all_time" : "weekly"
  const modeParam = request.nextUrl.searchParams.get("mode")
  const mode = isCompetitive2048Mode(modeParam) ? modeParam : "classic"
  const session = await auth().catch(() => null)

  try {
    return NextResponse.json(await get2048Leaderboard(period, mode, session?.user?.id))
  } catch (error) {
    console.error("[game-box/2048/leaderboard] failed", error)
    return NextResponse.json({ error: "排行榜暂时不可用，请稍后再试。", entries: [], myRank: null }, { status: 500 })
  }
}
