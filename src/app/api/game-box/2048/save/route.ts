import { NextRequest, NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { auth } from "@/auth"
import { assertBoard, GAME_2048_VERSION } from "@/features/game-box/2048/lib/game2048-core"
import { isCompetitive2048Mode } from "@/features/game-box/2048/lib/modes"
import { ensure2048Game, sanitizeMoveSequence } from "@/features/game-box/2048/lib/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

function sanitizeState(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const state = value as Record<string, unknown>

  try {
    assertBoard(state.board as number[])
  } catch {
    return null
  }

  const board = state.board as number[]

  const status = state.status === "paused" || state.status === "won" ? state.status : "playing"
  const score = Number.isFinite(state.score) ? Math.max(0, Math.floor(Number(state.score))) : 0
  const movesCount = Number.isFinite(state.movesCount) ? Math.max(0, Math.floor(Number(state.movesCount))) : 0
  const durationMs = Number.isFinite(state.durationMs) ? Math.max(0, Math.floor(Number(state.durationMs))) : 0
  const undoRemaining = Number.isFinite(state.undoRemaining) ? Math.max(0, Math.min(3, Math.floor(Number(state.undoRemaining)))) : 3
  const undoCount = Number.isFinite(state.undoCount) ? Math.max(0, Math.floor(Number(state.undoCount))) : 0
  const seed = typeof state.seed === "string" ? state.seed : ""
  const runId = typeof state.runId === "string" ? state.runId : null
  const mode = isCompetitive2048Mode(state.mode) ? state.mode : "classic"

  if (!seed) return null

  return {
    seed,
    mode,
    runId,
    canSave: true,
    board,
    score,
    movesCount,
    durationMs,
    status,
    moveSequence: sanitizeMoveSequence(state.moveSequence),
    undoRemaining,
    undoCount,
    hasReached2048: Boolean(state.hasReached2048),
    hasAcknowledged2048: Boolean(state.hasAcknowledged2048),
    gameVersion: typeof state.gameVersion === "string" ? state.gameVersion : GAME_2048_VERSION,
    savedAt: new Date().toISOString(),
  }
}

export async function GET(request: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ save: null })
  const requestedMode = request.nextUrl.searchParams.get("mode")
  const mode = isCompetitive2048Mode(requestedMode) ? requestedMode : "classic"

  try {
    const game = await ensure2048Game()
    const save = await prisma.gameSave.findUnique({
      where: { userId_gameId_mode: { userId: session.user.id, gameId: game.id, mode } },
      select: { state: true, updatedAt: true, runId: true },
    })

    return NextResponse.json(save ? { save: { state: save.state, updatedAt: save.updatedAt.toISOString(), runId: save.runId } } : { save: null })
  } catch (error) {
    console.error("[game-box/2048/save] get failed", error)
    return NextResponse.json({ save: null, error: "SAVE_UNAVAILABLE" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ saved: false }, { status: 401 })

  const body = await request.json().catch(() => null)
  const state = sanitizeState(body?.state)
  if (!state) return NextResponse.json({ saved: false, message: "Invalid save state." }, { status: 400 })

  try {
    const game = await ensure2048Game()
    const jsonState = state as Prisma.InputJsonValue
    await prisma.gameSave.upsert({
      where: { userId_gameId_mode: { userId: session.user.id, gameId: game.id, mode: state.mode } },
      create: {
        userId: session.user.id,
        gameId: game.id,
        mode: state.mode,
        runId: state.runId,
        state: jsonState,
      },
      update: {
        runId: state.runId,
        state: jsonState,
      },
    })

    return NextResponse.json({ saved: true })
  } catch (error) {
    console.error("[game-box/2048/save] put failed", error)
    return NextResponse.json({ saved: false, message: "Save failed." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) return NextResponse.json({ deleted: false }, { status: 401 })
  const requestedMode = request.nextUrl.searchParams.get("mode")
  const mode = isCompetitive2048Mode(requestedMode) ? requestedMode : "classic"

  try {
    const game = await ensure2048Game()
    await prisma.gameSave.deleteMany({ where: { userId: session.user.id, gameId: game.id, mode } })
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error("[game-box/2048/save] delete failed", error)
    return NextResponse.json({ deleted: false }, { status: 500 })
  }
}
