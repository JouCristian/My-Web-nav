import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { ensure2048Game } from "@/features/game-box/2048/lib/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ bestRun: null, recentRuns: [] })
  }

  try {
    const game = await ensure2048Game()
    const [bestRun, recentRuns] = await Promise.all([
      prisma.gameRun.findFirst({
        where: { userId: session.user.id, gameId: game.id, verified: true, suspicious: false },
        orderBy: [{ score: "desc" }, { movesCount: "asc" }, { durationMs: "asc" }],
      }),
      prisma.gameRun.findMany({
        where: { userId: session.user.id, gameId: game.id, verified: true, suspicious: false },
        orderBy: { finishedAt: "desc" },
        take: 5,
      }),
    ])
    return NextResponse.json({ bestRun, recentRuns })
  } catch (error) {
    console.error("[game-box/2048/me] failed", error)
    return NextResponse.json({ error: "个人记录暂时不可用。", bestRun: null, recentRuns: [] }, { status: 500 })
  }
}
