import type { Competitive2048Mode, Game2048Mode } from "../types"

export const game2048Modes = ["classic", "sprint", "zen", "daily"] as const
export const competitive2048Modes = ["classic", "sprint", "daily"] as const

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

export function getDailyChallengeSeed(date = new Date()) {
  return `2048:daily:${getDailyChallengeDate(date)}:v2`
}
