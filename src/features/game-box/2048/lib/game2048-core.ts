import type { Board2048, Board2048Size, Direction, Game2048Snapshot, Move2048Result, SpawnedTile } from "../types"

export const DEFAULT_BOARD_2048_SIZE: Board2048Size = 4
export const BOARD_SIZE = DEFAULT_BOARD_2048_SIZE
export const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE
export const GAME_2048_VERSION = "1.2.0"
export const BOARD_2048_SIZES: Board2048Size[] = [4, 5, 6, 7]

export type Rng = () => number

export function createSeededRng(seed: string): Rng {
  let hash = 2166136261
  for (let index = 0; index < seed.length; index += 1) {
    hash ^= seed.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return () => {
    hash += 0x6d2b79f5
    let value = hash
    value = Math.imul(value ^ (value >>> 15), value | 1)
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

export function createGameSeed() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

export function isBoard2048Size(value: unknown): value is Board2048Size {
  return typeof value === "number" && BOARD_2048_SIZES.includes(value as Board2048Size)
}

export function getBoardSizeFromLength(length: number): Board2048Size | null {
  const size = Math.sqrt(length)
  return Number.isInteger(size) && isBoard2048Size(size) ? (size as Board2048Size) : null
}

export function getBoardSize(board: Board2048, fallback: Board2048Size = DEFAULT_BOARD_2048_SIZE): Board2048Size {
  return getBoardSizeFromLength(board.length) || fallback
}

export function createEmptyBoard(size: Board2048Size = DEFAULT_BOARD_2048_SIZE): Board2048 {
  return Array.from({ length: size * size }, () => 0)
}

export function assertBoard(board: Board2048, size?: Board2048Size) {
  const expectedSize = size || getBoardSizeFromLength(Array.isArray(board) ? board.length : 0)
  if (!Array.isArray(board) || !expectedSize || board.length !== expectedSize * expectedSize) {
    throw new Error("Invalid 2048 board shape")
  }
  for (const value of board) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error("Invalid 2048 board value")
    }
  }
}

export function cloneBoard(board: Board2048): Board2048 {
  assertBoard(board)
  return [...board]
}

export function getMaxTile(board: Board2048) {
  assertBoard(board)
  return board.reduce((max, value) => Math.max(max, value), 0)
}

export function serializeBoard(board: Board2048) {
  assertBoard(board)
  return board.join(",")
}

export function deserializeBoard(serialized: string): Board2048 {
  const board = serialized.split(",").map((value) => Number(value))
  assertBoard(board)
  return board
}

export function boardsEqual(left: Board2048, right: Board2048) {
  assertBoard(left)
  assertBoard(right)
  return left.every((value, index) => value === right[index])
}

export function getEmptyIndexes(board: Board2048) {
  assertBoard(board)
  const indexes: number[] = []
  board.forEach((value, index) => {
    if (value === 0) indexes.push(index)
  })
  return indexes
}

export function addRandomTile(board: Board2048, rng: Rng = Math.random): { board: Board2048; tile: SpawnedTile | null } {
  const nextBoard = cloneBoard(board)
  const emptyIndexes = getEmptyIndexes(nextBoard)
  if (emptyIndexes.length === 0) return { board: nextBoard, tile: null }

  const targetIndex = emptyIndexes[Math.floor(rng() * emptyIndexes.length)]
  const value = rng() < 0.9 ? 2 : 4
  nextBoard[targetIndex] = value
  return { board: nextBoard, tile: { index: targetIndex, value } }
}

export function isDailyChallengeSeed(seed: string) {
  return /^2048:daily:\d{4}-\d{2}-\d{2}:([4567])x\1:v\d+$/.test(seed)
}

function mirrorBoard(board: Board2048, size = getBoardSize(board)): Board2048 {
  const next = createEmptyBoard(size)
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      next[row * size + col] = board[row * size + (size - 1 - col)]
    }
  }
  return next
}

function rotateBoardClockwise(board: Board2048, size = getBoardSize(board)): Board2048 {
  const next = createEmptyBoard(size)
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      next[row * size + col] = board[(size - 1 - col) * size + row]
    }
  }
  return next
}

const dailyChallengeTemplates: Board2048[] = [
  [
    0, 4, 0, 2,
    8, 32, 16, 0,
    4, 64, 128, 8,
    0, 16, 0, 4,
  ],
  [
    2, 0, 8, 0,
    4, 16, 64, 8,
    0, 32, 128, 16,
    4, 0, 2, 0,
  ],
  [
    0, 8, 2, 0,
    4, 64, 32, 8,
    2, 128, 16, 0,
    0, 4, 16, 4,
  ],
  [
    4, 0, 16, 2,
    0, 32, 128, 8,
    4, 64, 16, 0,
    0, 2, 8, 0,
  ],
  [
    0, 2, 8, 0,
    16, 64, 32, 4,
    8, 128, 16, 0,
    0, 4, 2, 4,
  ],
  [
    2, 0, 4, 0,
    8, 32, 128, 16,
    0, 64, 32, 8,
    4, 0, 2, 0,
  ],
]

function createExpandedDailyChallengeBoard(seed: string, size: Board2048Size): Board2048 {
  const rng = createSeededRng(`${seed}:expanded:${size}`)
  const board = createEmptyBoard(size)
  const centerOffset = Math.floor((size - 4) / 2)
  const template = dailyChallengeTemplates[Math.floor(rng() * dailyChallengeTemplates.length)]

  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      board[(row + centerOffset) * size + col + centerOffset] = template[row * 4 + col]
    }
  }

  const ringTargets = size === 5 ? 5 : size === 6 ? 8 : 12
  const candidates: number[] = []
  for (let index = 0; index < board.length; index += 1) {
    if (board[index] !== 0) continue
    const row = Math.floor(index / size)
    const col = index % size
    if (row === 0 || col === 0 || row === size - 1 || col === size - 1) candidates.push(index)
  }

  for (let count = 0; count < ringTargets && candidates.length > 0; count += 1) {
    const candidateIndex = Math.floor(rng() * candidates.length)
    const [targetIndex] = candidates.splice(candidateIndex, 1)
    board[targetIndex] = rng() < 0.72 ? 2 : rng() < 0.88 ? 4 : 8
  }

  return board
}

export function createDailyChallengeBoard(seed: string, size: Board2048Size = DEFAULT_BOARD_2048_SIZE): Board2048 {
  const rng = createSeededRng(`${seed}:board`)
  let board = size === 4 ? cloneBoard(dailyChallengeTemplates[Math.floor(rng() * dailyChallengeTemplates.length)]) : createExpandedDailyChallengeBoard(seed, size)
  const rotations = Math.floor(rng() * size)

  for (let index = 0; index < rotations; index += 1) {
    board = rotateBoardClockwise(board, size)
  }

  if (rng() < 0.5) board = mirrorBoard(board, size)
  return board
}

export function createInitialGame(seed = createGameSeed()): Game2048Snapshot & { seed: string } {
  const rng = createSeededRng(seed)
  return createInitialGameWithRng(seed, rng)
}

export function createInitialGameWithRng(seed: string, rng: Rng, size: Board2048Size = DEFAULT_BOARD_2048_SIZE): Game2048Snapshot & { seed: string } {
  if (isDailyChallengeSeed(seed)) {
    const board = createDailyChallengeBoard(seed, size)
    return {
      seed,
      board,
      score: 0,
      maxTile: getMaxTile(board),
      movesCount: 0,
      status: "playing",
    }
  }

  const first = addRandomTile(createEmptyBoard(size), rng).board
  const second = addRandomTile(first, rng).board
  return {
    seed,
    board: second,
    score: 0,
    maxTile: getMaxTile(second),
    movesCount: 0,
    status: "playing",
  }
}

export function mergeLine(line: number[], size = line.length) {
  const compact = line.filter((value) => value !== 0)
  const merged: number[] = []
  const mergedValues: number[] = []
  const mergedOffsets: number[] = []
  let scoreGain = 0

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index]
    const next = compact[index + 1]
    if (current === next) {
      const mergedValue = current * 2
      const targetOffset = merged.length
      merged.push(mergedValue)
      mergedValues.push(mergedValue)
      mergedOffsets.push(targetOffset)
      scoreGain += mergedValue
      index += 1
    } else {
      merged.push(current)
    }
  }

  while (merged.length < size) merged.push(0)
  return { line: merged, scoreGain, mergedValues, mergedOffsets }
}

function getBoardIndex(direction: Direction, lineIndex: number, offset: number, size: Board2048Size) {
  if (direction === "left") return lineIndex * size + offset
  if (direction === "right") return lineIndex * size + (size - 1 - offset)
  if (direction === "up") return offset * size + lineIndex
  return (size - 1 - offset) * size + lineIndex
}

function getLine(board: Board2048, direction: Direction, lineIndex: number, size: Board2048Size) {
  const line: number[] = []
  for (let offset = 0; offset < size; offset += 1) {
    line.push(board[getBoardIndex(direction, lineIndex, offset, size)])
  }
  return line
}

function setLine(board: Board2048, direction: Direction, lineIndex: number, line: number[], size: Board2048Size) {
  for (let offset = 0; offset < size; offset += 1) {
    board[getBoardIndex(direction, lineIndex, offset, size)] = line[offset]
  }
}

export function moveBoard(board: Board2048, direction: Direction, rng?: Rng, size = getBoardSize(board)): Move2048Result {
  assertBoard(board)
  const movedBoard = createEmptyBoard(size)
  let scoreGain = 0
  const mergedValues: number[] = []
  const mergedIndexes: number[] = []

  for (let lineIndex = 0; lineIndex < size; lineIndex += 1) {
    const merged = mergeLine(getLine(board, direction, lineIndex, size), size)
    scoreGain += merged.scoreGain
    mergedValues.push(...merged.mergedValues)
    mergedIndexes.push(...merged.mergedOffsets.map((offset) => getBoardIndex(direction, lineIndex, offset, size)))
    setLine(movedBoard, direction, lineIndex, merged.line, size)
  }

  const moved = !boardsEqual(board, movedBoard)
  if (!moved) {
    return { board: cloneBoard(board), moved: false, scoreGain: 0, mergedValues: [], mergedIndexes: [], addedTile: null }
  }

  if (!rng) {
    return { board: movedBoard, moved: true, scoreGain, mergedValues, mergedIndexes, addedTile: null }
  }

  const withTile = addRandomTile(movedBoard, rng)
  return { board: withTile.board, moved: true, scoreGain, mergedValues, mergedIndexes, addedTile: withTile.tile }
}

export function canMove(board: Board2048) {
  assertBoard(board)
  const size = getBoardSize(board)
  if (getEmptyIndexes(board).length > 0) return true

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const value = board[row * size + col]
      if (col < size - 1 && value === board[row * size + col + 1]) return true
      if (row < size - 1 && value === board[(row + 1) * size + col]) return true
    }
  }
  return false
}

export function isGameOver(board: Board2048) {
  return !canMove(board)
}

export function getStatus(board: Board2048, hasWon: boolean) {
  if (isGameOver(board)) return "game_over"
  if (hasWon) return "won"
  return "playing"
}

export function replayGame(seed: string, moveSequence: Direction[], size: Board2048Size = DEFAULT_BOARD_2048_SIZE) {
  const rng = createSeededRng(seed)
  let board = createInitialGameWithRng(seed, rng, size).board
  let score = 0
  let movesCount = 0
  let hasWon = getMaxTile(board) >= 2048

  for (const direction of moveSequence) {
    const result = moveBoard(board, direction, rng, size)
    if (!result.moved) continue
    board = result.board
    score += result.scoreGain
    movesCount += 1
    if (getMaxTile(board) >= 2048) hasWon = true
  }

  return {
    board,
    score,
    movesCount,
    maxTile: getMaxTile(board),
    status: getStatus(board, hasWon),
  }
}

export function directionFromKey(key: string): Direction | null {
  const normalized = key.toLowerCase()
  if (normalized === "arrowup" || normalized === "w") return "up"
  if (normalized === "arrowdown" || normalized === "s") return "down"
  if (normalized === "arrowleft" || normalized === "a") return "left"
  if (normalized === "arrowright" || normalized === "d") return "right"
  return null
}
