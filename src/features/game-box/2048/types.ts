export type Direction = "up" | "down" | "left" | "right"
export type Game2048Mode = "classic" | "sprint" | "zen" | "daily"
export type Competitive2048Mode = Exclude<Game2048Mode, "zen">
export type Board2048Size = 4 | 5 | 6 | 7

export type Game2048Status = "idle" | "playing" | "paused" | "won" | "game_over"

export type Board2048 = number[]

export interface SpawnedTile {
  index: number
  value: 2 | 4
}

export interface Move2048Result {
  board: Board2048
  moved: boolean
  scoreGain: number
  mergedValues: number[]
  mergedIndexes: number[]
  addedTile: SpawnedTile | null
}

export interface Game2048Snapshot {
  board: Board2048
  score: number
  maxTile: number
  movesCount: number
  status: Game2048Status
}

export interface GameRunResult {
  score: number
  maxTile: number
  movesCount: number
  durationMs: number
  finalBoard: Board2048
  moveSequence: Direction[]
  gameVersion: string
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  imageUrl?: string | null
  score: number
  maxTile: number
  movesCount: number
  durationMs: number
  finishedAt: string
  finalBoard?: Board2048 | null
  verified?: boolean
  suspicious?: boolean
  undoCount?: number
  usedUndo?: boolean
  mode?: Game2048Mode
  boardSize?: Board2048Size
}

export interface Game2048RankSummary {
  weekly: number | null
  allTime: number | null
}

export type LeaderboardPeriod = "weekly" | "all_time"
