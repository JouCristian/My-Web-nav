import type { CSSProperties } from "react"
import type { Board2048Size, Direction } from "../types"

interface Game2048TileProps {
  index: number
  value: number
  boardSize: Board2048Size
  isNew?: boolean
  isMerged?: boolean
  mergeDirection?: Direction | null
}

const tileClassByValue: Record<number, string> = {
  2: "bg-[#fffdf8] text-[#1f1f1d]",
  4: "bg-[#f4f1ea] text-[#1f1f1d]",
  8: "bg-[#e9e5dc] text-[#1f1f1d]",
  16: "bg-[#d8d3c8] text-[#1f1f1d]",
  32: "bg-[#ffb2a4] text-[#160f0d]",
  64: "bg-[#ff7d6e] text-[#160f0d]",
  128: "bg-[#d9312b] text-[#fff7f0]",
  256: "bg-[#9f1f1b] text-[#fff7f0]",
  512: "bg-[#171717] text-[#f4f1ea]",
  1024: "bg-[#050505] text-[#f4f1ea]",
  2048: "bg-[#d7ff00] text-[#0e0e0e]",
  4096: "bg-[#0e0e0e] text-[#d7ff00]",
  8192: "bg-[#ff3b30] text-[#0e0e0e]",
}

const mergeVectorByDirection: Record<Direction, { x: string; y: string; biteX: string; biteY: string }> = {
  left: { x: "9px", y: "0px", biteX: "-2px", biteY: "0px" },
  right: { x: "-9px", y: "0px", biteX: "2px", biteY: "0px" },
  up: { x: "0px", y: "9px", biteX: "0px", biteY: "-2px" },
  down: { x: "0px", y: "-9px", biteX: "0px", biteY: "2px" },
}

function mergeStyle(index: number, direction?: Direction | null) {
  const vector = direction ? mergeVectorByDirection[direction] : { x: "0px", y: "0px", biteX: "0px", biteY: "0px" }
  return {
    "--tile-index": index,
    "--merge-x": vector.x,
    "--merge-y": vector.y,
    "--merge-bite-x": vector.biteX,
    "--merge-bite-y": vector.biteY,
  } as CSSProperties
}

export function Game2048Tile({ index, value, boardSize, isNew = false, isMerged = false, mergeDirection = null }: Game2048TileProps) {
  const style = mergeStyle(index, mergeDirection)

  if (value === 0) {
    return <div className="game-2048-tile-empty border border-[#0e0e0e]/20 bg-[#f4f1ea]/70" style={style} aria-hidden="true" />
  }

  const valueClass = tileClassByValue[value] || (value > 2048 ? "bg-[#0e0e0e] text-[#d7ff00]" : "bg-[#f4f1ea] text-[#0e0e0e]")
  const sizeClass =
    boardSize >= 7
      ? value >= 1024
        ? "text-[clamp(0.58rem,2.3vw,1.45rem)]"
        : "text-[clamp(0.72rem,2.8vw,1.7rem)]"
      : boardSize === 6
        ? value >= 1024
          ? "text-[clamp(0.7rem,2.8vw,1.7rem)]"
          : "text-[clamp(0.9rem,3.4vw,2rem)]"
        : boardSize === 5
          ? value >= 1024
            ? "text-[clamp(0.95rem,3.8vw,2.3rem)]"
            : "text-[clamp(1.15rem,4.6vw,2.65rem)]"
          : value >= 1024
            ? "text-[clamp(1.25rem,5.5vw,3.25rem)]"
            : "text-[clamp(1.65rem,7vw,4rem)]"

  return (
    <div
      className={`game-2048-tile flex items-center justify-center border border-[#0e0e0e] font-[family-name:var(--font-space)] font-black leading-none ${sizeClass} ${valueClass} ${
        isNew ? "is-new" : ""
      } ${isMerged ? "is-merged" : ""}`}
      style={style}
    >
      {value}
    </div>
  )
}
