import assert from "node:assert/strict"
import {
  canMove,
  createInitialGameWithRng,
  createSeededRng,
  isGameOver,
  moveBoard,
  replayGame,
} from "../src/features/game-box/2048/lib/game2048-core.ts"
import { getDailyChallengeDate, getDailyChallengeSeed, isCompetitive2048Mode } from "../src/features/game-box/2048/lib/modes.ts"

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

const challengeDate = new Date("2026-07-12T03:20:00.000Z")
assert.equal(getDailyChallengeDate(challengeDate), "2026-07-12")
assert.equal(getDailyChallengeSeed(challengeDate), getDailyChallengeSeed(challengeDate))
assert.equal(isCompetitive2048Mode("daily"), true)
assert.equal(isCompetitive2048Mode("zen"), false)

const dailySeed = getDailyChallengeSeed(challengeDate)
const dailyInitialA = createInitialGameWithRng(dailySeed, createSeededRng(dailySeed))
const dailyInitialB = createInitialGameWithRng(dailySeed, createSeededRng(dailySeed))
const nextDailySeed = getDailyChallengeSeed(new Date("2026-07-13T03:20:00.000Z"))
const nextDailyInitial = createInitialGameWithRng(nextDailySeed, createSeededRng(nextDailySeed))
assert.deepEqual(dailyInitialA.board, dailyInitialB.board)
assert.notDeepEqual(dailyInitialA.board, nextDailyInitial.board)
assert.equal(dailyInitialA.board.filter(Boolean).length >= 10, true)
assert.equal(dailyInitialA.board.filter(Boolean).length <= 12, true)
assert.equal(dailyInitialA.maxTile <= 128, true)
assert.equal(canMove(dailyInitialA.board), true)
assert.deepEqual(replayGame(dailySeed, []).board, dailyInitialA.board)

console.log("2048 core tests passed")
