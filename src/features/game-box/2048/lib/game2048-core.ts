import type { Board2048, Direction, Game2048Snapshot, Move2048Result, SpawnedTile } from "../types"

export const BOARD_SIZE = 4
export const BOARD_CELLS = BOARD_SIZE * BOARD_SIZE
export const GAME_2048_VERSION = "1.0.0"

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

export function createEmptyBoard(): Board2048 {
  return Array.from({ length: BOARD_CELLS }, () => 0)
}

export function assertBoard(board: Board2048) {
  if (!Array.isArray(board) || board.length !== BOARD_CELLS) {
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

export function createInitialGame(seed = createGameSeed()): Game2048Snapshot & { seed: string } {
  const rng = createSeededRng(seed)
  return createInitialGameWithRng(seed, rng)
}

export function createInitialGameWithRng(seed: string, rng: Rng): Game2048Snapshot & { seed: string } {
  const first = addRandomTile(createEmptyBoard(), rng).board
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

export function mergeLine(line: number[]) {
  const compact = line.filter((value) => value !== 0)
  const merged: number[] = []
  const mergedValues: number[] = []
  let scoreGain = 0

  for (let index = 0; index < compact.length; index += 1) {
    const current = compact[index]
    const next = compact[index + 1]
    if (current === next) {
      const mergedValue = current * 2
      merged.push(mergedValue)
      mergedValues.push(mergedValue)
      scoreGain += mergedValue
      index += 1
    } else {
      merged.push(current)
    }
  }

  while (merged.length < BOARD_SIZE) merged.push(0)
  return { line: merged, scoreGain, mergedValues }
}

function getLine(board: Board2048, direction: Direction, lineIndex: number) {
  const line: number[] = []
  for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
    if (direction === "left") line.push(board[lineIndex * BOARD_SIZE + offset])
    if (direction === "right") line.push(board[lineIndex * BOARD_SIZE + (BOARD_SIZE - 1 - offset)])
    if (direction === "up") line.push(board[offset * BOARD_SIZE + lineIndex])
    if (direction === "down") line.push(board[(BOARD_SIZE - 1 - offset) * BOARD_SIZE + lineIndex])
  }
  return line
}

function setLine(board: Board2048, direction: Direction, lineIndex: number, line: number[]) {
  for (let offset = 0; offset < BOARD_SIZE; offset += 1) {
    if (direction === "left") board[lineIndex * BOARD_SIZE + offset] = line[offset]
    if (direction === "right") board[lineIndex * BOARD_SIZE + (BOARD_SIZE - 1 - offset)] = line[offset]
    if (direction === "up") board[offset * BOARD_SIZE + lineIndex] = line[offset]
    if (direction === "down") board[(BOARD_SIZE - 1 - offset) * BOARD_SIZE + lineIndex] = line[offset]
  }
}

export function moveBoard(board: Board2048, direction: Direction, rng?: Rng): Move2048Result {
  assertBoard(board)
  const movedBoard = createEmptyBoard()
  let scoreGain = 0
  const mergedValues: number[] = []

  for (let lineIndex = 0; lineIndex < BOARD_SIZE; lineIndex += 1) {
    const merged = mergeLine(getLine(board, direction, lineIndex))
    scoreGain += merged.scoreGain
    mergedValues.push(...merged.mergedValues)
    setLine(movedBoard, direction, lineIndex, merged.line)
  }

  const moved = !boardsEqual(board, movedBoard)
  if (!moved) {
    return { board: cloneBoard(board), moved: false, scoreGain: 0, mergedValues: [], addedTile: null }
  }

  if (!rng) {
    return { board: movedBoard, moved: true, scoreGain, mergedValues, addedTile: null }
  }

  const withTile = addRandomTile(movedBoard, rng)
  return { board: withTile.board, moved: true, scoreGain, mergedValues, addedTile: withTile.tile }
}

export function canMove(board: Board2048) {
  assertBoard(board)
  if (getEmptyIndexes(board).length > 0) return true

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const value = board[row * BOARD_SIZE + col]
      if (col < BOARD_SIZE - 1 && value === board[row * BOARD_SIZE + col + 1]) return true
      if (row < BOARD_SIZE - 1 && value === board[(row + 1) * BOARD_SIZE + col]) return true
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

export function replayGame(seed: string, moveSequence: Direction[]) {
  const rng = createSeededRng(seed)
  let board = createInitialGameWithRng(seed, rng).board
  let score = 0
  let movesCount = 0
  let hasWon = getMaxTile(board) >= 2048

  for (const direction of moveSequence) {
    const result = moveBoard(board, direction, rng)
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
