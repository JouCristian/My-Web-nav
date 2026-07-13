import type { Board2048Size, Competitive2048Mode, Game2048Mode } from "../types"

export const game2048Modes = ["classic", "sprint", "zen", "daily"] as const
export const competitive2048Modes = ["classic", "sprint", "daily"] as const
export const board2048Sizes = [4, 5, 6, 7] as const

export const game2048ModeCopy: Record<Game2048Mode, { label: string; zh: string; detail: string }> = {
  classic: { label: "Classic", zh: "经典", detail: "标准规则，按分数排行。" },
  sprint: { label: "Sprint", zh: "竞速", detail: "目标 2048，用时越短越靠前。" },
  zen: { label: "Zen", zh: "放松", detail: "仅当前浏览器，不进入排行榜。" },
  daily: { label: "Daily challenge", zh: "每日挑战", detail: "全站同一开局，按今日榜单排行。" },
}

export function isGame2048Mode(value: unknown): value is Game2048Mode {
  return typeof value === "string" && game2048Modes.includes(value as Game2048Mode)
}

export function isCompetitive2048Mode(value: unknown): value is Competitive2048Mode {
  return typeof value === "string" && competitive2048Modes.includes(value as Competitive2048Mode)
}

export function isBoard2048Size(value: unknown): value is Board2048Size {
  return typeof value === "number" && board2048Sizes.includes(value as Board2048Size)
}

export function normalizeBoard2048Size(value: unknown): Board2048Size {
  const numberValue = Number(value)
  return isBoard2048Size(numberValue) ? numberValue : 4
}

export function getBoard2048SizeLabel(size: Board2048Size) {
  return `${size}x${size}`
}

export function encode2048RunMode(mode: Game2048Mode, boardSize: Board2048Size) {
  if (boardSize === 4) return mode
  return `${mode}-${boardSize}x${boardSize}`
}

export function parse2048RunMode(value: unknown): { mode: Game2048Mode; boardSize: Board2048Size } | null {
  if (isGame2048Mode(value)) return { mode: value, boardSize: 4 }
  if (typeof value !== "string") return null

  const match = value.match(/^(classic|sprint|zen|daily)-([4567])x\2$/)
  if (!match) return null
  return {
    mode: match[1] as Game2048Mode,
    boardSize: normalizeBoard2048Size(Number(match[2])),
  }
}

export function parseCompetitive2048RunMode(value: unknown): { mode: Competitive2048Mode; boardSize: Board2048Size; dbMode: string } | null {
  const parsed = parse2048RunMode(value)
  if (!parsed || !isCompetitive2048Mode(parsed.mode)) return null
  return {
    mode: parsed.mode,
    boardSize: parsed.boardSize,
    dbMode: encode2048RunMode(parsed.mode, parsed.boardSize),
  }
}

export function getDailyChallengeDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return `${values.year}-${values.month}-${values.day}`
}

export function getDailyChallengeSeed(date = new Date(), boardSize: Board2048Size = 4) {
  return `2048:daily:${getDailyChallengeDate(date)}:${boardSize}x${boardSize}:v2`
}
