import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { createGameSeed, GAME_2048_VERSION } from "@/features/game-box/2048/lib/game2048-core"
import { ensure2048Game } from "@/features/game-box/2048/lib/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function POST() {
  const seed = createGameSeed()
  const startedAt = new Date()
  const session = await auth().catch(() => null)

  if (!session?.user?.id) {
    return NextResponse.json({
      runId: null,
      seed,
      gameVersion: GAME_2048_VERSION,
      startedAt: startedAt.toISOString(),
      canSave: false,
    })
  }

  try {
    const game = await ensure2048Game()
    const run = await prisma.gameRun.create({
      data: {
        userId: session.user.id,
        gameId: game.id,
        mode: "classic",
        seed,
        gameVersion: GAME_2048_VERSION,
        startedAt,
        finishedAt: startedAt,
        metadata: { status: "started" },
      },
      select: { id: true },
    })

    return NextResponse.json({
      runId: run.id,
      seed,
      gameVersion: GAME_2048_VERSION,
      startedAt: startedAt.toISOString(),
      canSave: true,
    })
  } catch (error) {
    console.error("[game-box/2048/start] failed", error)
    return NextResponse.json({
      runId: null,
      seed,
      gameVersion: GAME_2048_VERSION,
      startedAt: startedAt.toISOString(),
      canSave: false,
      warning: "服务端对局创建失败，本局将以本地模式继续。",
    })
  }
}
