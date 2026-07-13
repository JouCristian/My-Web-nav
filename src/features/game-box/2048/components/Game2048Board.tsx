"use client"

import { useRef, type CSSProperties } from "react"
import type { Board2048, Board2048Size, Direction } from "../types"
import { Game2048Tile } from "./Game2048Tile"

interface Game2048BoardProps {
  board: Board2048
  boardSize: Board2048Size
  status: string
  score: number
  mergedIndexes: number[]
  lastAddedIndex: number | null
  lastMoveDirection?: Direction | null
  revealKey: number
  isRevealing: boolean
  isRewinding?: boolean
  onMove: (direction: Direction) => void
}

const swipeThreshold = 34

function boardLabel(board: Board2048, boardSize: Board2048Size, score: number, status: string) {
  const rows = Array.from({ length: boardSize }, (_, row) => board.slice(row * boardSize, row * boardSize + boardSize).join(" "))
  return `2048 board, status ${status}, score ${score}. Rows: ${rows.join("; ")}`
}

export function Game2048Board({
  board,
  boardSize,
  status,
  score,
  mergedIndexes,
  lastAddedIndex,
  lastMoveDirection = null,
  revealKey,
  isRevealing,
  isRewinding = false,
  onMove,
}: Game2048BoardProps) {
  const startPointRef = useRef<{ x: number; y: number } | null>(null)

  return (
    <section className="game-2048-board-zone min-w-0">
      <div
        key={revealKey}
        tabIndex={0}
        role="application"
        aria-label={boardLabel(board, boardSize, score, status)}
        className={`game-2048-board mx-auto grid aspect-square w-full max-w-[min(72vh,560px)] gap-1.5 border border-[#0e0e0e] bg-[#f4f1ea] p-1.5 outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b30] sm:gap-2 sm:p-2 ${
          isRevealing ? "is-revealing" : ""
        } ${isRewinding ? "is-rewinding" : ""}`}
        style={{
          gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${boardSize}, minmax(0, 1fr))`,
          "--board-size": boardSize,
        } as CSSProperties}
        onTouchStart={(event) => {
          const touch = event.touches[0]
          startPointRef.current = { x: touch.clientX, y: touch.clientY }
        }}
        onTouchMove={(event) => {
          event.preventDefault()
        }}
        onTouchEnd={(event) => {
          const start = startPointRef.current
          const touch = event.changedTouches[0]
          startPointRef.current = null
          if (!start || !touch) return

          const dx = touch.clientX - start.x
          const dy = touch.clientY - start.y
          if (Math.max(Math.abs(dx), Math.abs(dy)) < swipeThreshold) return

          if (Math.abs(dx) > Math.abs(dy)) {
            onMove(dx > 0 ? "right" : "left")
          } else {
            onMove(dy > 0 ? "down" : "up")
          }
        }}
      >
        {board.map((value, index) => (
          <Game2048Tile
            key={`${index}-${value}`}
            index={index}
            value={value}
            boardSize={boardSize}
            isNew={lastAddedIndex === index}
            isMerged={value > 0 && mergedIndexes.includes(index)}
            mergeDirection={lastMoveDirection}
          />
        ))}
      </div>
    </section>
  )
}
