import "server-only"

import { prisma } from "@/lib/db"
import { GAME_2048_VERSION, replayGame } from "./game2048-core"
import { safeAvatarUrl, safeDisplayName } from "./format"
import type { Direction, LeaderboardEntry, LeaderboardPeriod } from "../types"

export async function ensure2048Game() {
  return prisma.game.upsert({
    where: { slug: "2048" },
    update: {
      name: "2048",
      displayName: "2048 / NUMBER COLLISION",
      currentVersion: GAME_2048_VERSION,
      isActive: true,
    },
    create: {
      slug: "2048",
      name: "2048",
      displayName: "2048 / NUMBER COLLISION",
      currentVersion: GAME_2048_VERSION,
      isActive: true,
    },
  })
}

export function sanitizeMoveSequence(value: unknown): Direction[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is Direction => item === "up" || item === "down" || item === "left" || item === "right")
}

export function verify2048Run(seed: string, moveSequence: Direction[], durationMs: number, gameVersion: string) {
  const replay = replayGame(seed, moveSequence)
  const suspicious =
    gameVersion !== GAME_2048_VERSION ||
    durationMs < 500 ||
    durationMs > 1000 * 60 * 60 * 6 ||
    moveSequence.length > 10000

  return {
    replay,
    suspicious,
    verified: !suspicious,
    reason: suspicious ? "本局无法进入排行榜：对局版本或时长异常。" : "",
  }
}

export function getLeaderboardStart(period: LeaderboardPeriod) {
  if (period === "all_time") return undefined
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
}

async function get2048RankedEntries(period: LeaderboardPeriod) {
  const game = await ensure2048Game()
  const start = getLeaderboardStart(period)
  const runs = await prisma.gameRun.findMany({
    where: {
      gameId: game.id,
      mode: "classic",
      verified: true,
      suspicious: false,
      userId: { not: null },
      ...(start ? { finishedAt: { gte: start } } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          nickname: true,
          realName: true,
          crewNickname: true,
          image: true,
          customAvatar: true,
        },
      },
    },
    orderBy: [{ score: "desc" }, { movesCount: "asc" }, { durationMs: "asc" }, { finishedAt: "asc" }],
    take: 500,
  })

  const bestByUser = new Map<string, (typeof runs)[number]>()
  for (const run of runs) {
    if (!run.userId || bestByUser.has(run.userId)) continue
    bestByUser.set(run.userId, run)
  }

  const ranked = Array.from(bestByUser.values()).map<LeaderboardEntry>((run, index) => ({
    rank: index + 1,
    userId: run.userId || "",
    displayName: run.user ? safeDisplayName(run.user) : "Unknown",
    imageUrl: run.user ? safeAvatarUrl(run.user) : null,
    score: run.score,
    maxTile: run.maxTile || 0,
    movesCount: run.movesCount,
    durationMs: run.durationMs,
    finishedAt: run.finishedAt.toISOString(),
  }))

  return ranked
}

export async function get2048Leaderboard(period: LeaderboardPeriod, currentUserId?: string | null) {
  const ranked = await get2048RankedEntries(period)
  const top = ranked.slice(0, 10)
  const myRank = currentUserId ? ranked.find((entry) => entry.userId === currentUserId && entry.rank > 10) || null : null

  return { entries: top, myRank }
}

export async function get2048UserRank(period: LeaderboardPeriod, userId: string) {
  const ranked = await get2048RankedEntries(period)
  return ranked.find((entry) => entry.userId === userId)?.rank ?? null
}
