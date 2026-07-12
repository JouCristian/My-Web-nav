import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { GAME_2048_VERSION } from "@/features/game-box/2048/lib/game2048-core"
import { isCompetitive2048Mode } from "@/features/game-box/2048/lib/modes"
import { get2048UserRank, sanitizeMoveSequence, verify2048Run } from "@/features/game-box/2048/lib/server"
import { prisma } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  const session = await auth().catch(() => null)
  if (!session?.user?.id) {
    return NextResponse.json({ saved: false, verified: false, suspicious: false, message: "登录后可保存成绩和进入排行榜。" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const runId = typeof body?.runId === "string" ? body.runId : ""
  const durationMs = Number.isFinite(body?.durationMs) ? Math.max(0, Math.floor(body.durationMs)) : 0
  const gameVersion = typeof body?.gameVersion === "string" ? body.gameVersion : GAME_2048_VERSION
  const moveSequence = sanitizeMoveSequence(body?.moveSequence)
  const undoCount = Number.isFinite(body?.undoCount) ? Math.max(0, Math.floor(Number(body.undoCount))) : 0

  if (!runId) {
    return NextResponse.json({ saved: false, verified: false, suspicious: true, message: "本局无法进入排行榜：缺少对局编号。" }, { status: 400 })
  }

  try {
    const run = await prisma.gameRun.findUnique({
      where: { id: runId },
      include: { game: true },
    })

    if (!run || run.userId !== session.user.id || run.game.slug !== "2048" || !run.seed) {
      return NextResponse.json({ saved: false, verified: false, suspicious: true, message: "本局无法进入排行榜：对局信息无效。" }, { status: 403 })
    }

    if (!isCompetitive2048Mode(run.mode)) {
      return NextResponse.json({ saved: false, verified: false, suspicious: true, message: "Zen mode does not enter the leaderboard." }, { status: 400 })
    }

    const verification = verify2048Run(run.seed, moveSequence, durationMs, gameVersion, run.mode)
    const finishedAt = new Date()
    const updated = await prisma.gameRun.update({
      where: { id: run.id },
      data: {
        score: verification.replay.score,
        maxTile: verification.replay.maxTile,
        movesCount: verification.replay.movesCount,
        durationMs,
        moveSequence,
        finalBoard: verification.replay.board,
        gameVersion,
        verified: verification.verified,
        suspicious: verification.suspicious,
        finishedAt,
        metadata: {
          clientScore: body?.clientScore ?? null,
          clientFinalBoard: body?.clientFinalBoard ?? null,
          undoCount,
          usedUndo: undoCount > 0,
          status: verification.replay.status,
          verification: verification.verified ? "server-replay" : "failed",
        },
      },
    })

    await prisma.gameSave.deleteMany({ where: { userId: session.user.id, gameId: run.gameId, mode: run.mode } })

    const rankSummary = verification.verified
      ? {
          weekly: await get2048UserRank("weekly", session.user.id, run.mode),
          allTime: await get2048UserRank("all_time", session.user.id, run.mode),
        }
      : { weekly: null, allTime: null }

    return NextResponse.json({
      saved: verification.verified,
      verified: verification.verified,
      suspicious: verification.suspicious,
      message: verification.reason || "成绩已通过服务器重放验证。",
      rankSummary,
      result: {
        score: updated.score,
        maxTile: updated.maxTile || 0,
        movesCount: updated.movesCount,
        durationMs: updated.durationMs,
      },
    })
  } catch (error) {
    console.error("[game-box/2048/finish] failed", error)
    return NextResponse.json({ saved: false, verified: false, suspicious: false, message: "成绩保存失败，但你仍然可以继续游戏。" }, { status: 500 })
  }
}
