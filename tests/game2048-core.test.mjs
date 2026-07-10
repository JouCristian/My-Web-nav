import assert from "node:assert/strict"
import {
  canMove,
  createSeededRng,
  isGameOver,
  moveBoard,
  replayGame,
} from "../src/features/game-box/2048/lib/game2048-core.ts"

const withoutSpawn = (board, direction) => moveBoard(board, direction).board

assert.deepEqual(withoutSpawn([2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "left").slice(0, 4), [4, 0, 0, 0])
assert.deepEqual(withoutSpawn([2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "left").slice(0, 4), [4, 2, 0, 0])
assert.deepEqual(withoutSpawn([2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "left").slice(0, 4), [4, 4, 0, 0])

const invalid = moveBoard([2, 4, 8, 16, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "left", createSeededRng("invalid"))
assert.equal(invalid.moved, false)
assert.equal(invalid.addedTile, null)

assert.equal(canMove([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]), false)
assert.equal(isGameOver([2, 4, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 4, 2]), true)

assert.deepEqual(withoutSpawn([2, 2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "left").slice(0, 4), [4, 4, 0, 0])

assert.deepEqual(withoutSpawn([2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "up").slice(0, 4), [4, 0, 0, 0])
assert.equal(withoutSpawn([0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], "down")[15], 4)
assert.equal(withoutSpawn([0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "right")[3], 4)

const replayA = replayGame("same-seed", ["left", "up", "right", "down", "left"])
const replayB = replayGame("same-seed", ["left", "up", "right", "down", "left"])
assert.deepEqual(replayA, replayB)

console.log("2048 core tests passed")
