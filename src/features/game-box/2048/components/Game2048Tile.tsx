import type { CSSProperties } from "react"

interface Game2048TileProps {
  index: number
  value: number
  isNew?: boolean
  isMerged?: boolean
}

const tileClassByValue: Record<number, string> = {
  2: "bg-[#ffffff] text-[#202020]",
  4: "bg-[#f4f1ea] text-[#202020]",
  8: "bg-[#e8e4dc] text-[#202020]",
  16: "bg-[#f8d8cf] text-[#202020]",
  32: "bg-[#ffb7aa] text-[#202020]",
  64: "bg-[#ff8d7d] text-[#202020]",
  128: "bg-[#ff6254] text-[#0e0e0e]",
  256: "bg-[#ff3b30] text-[#0e0e0e]",
  512: "bg-[#c92d27] text-[#f4f1ea]",
  1024: "bg-[#731a17] text-[#f4f1ea]",
  2048: "bg-[#0e0e0e] text-[#ff3b30]",
}

export function Game2048Tile({ index, value, isNew = false, isMerged = false }: Game2048TileProps) {
  const style = { "--tile-index": index } as CSSProperties

  if (value === 0) {
    return <div className="game-2048-tile-empty border border-[#0e0e0e]/20 bg-[#f4f1ea]/70" style={style} aria-hidden="true" />
  }

  const valueClass = tileClassByValue[value] || (value > 2048 ? "bg-[#0e0e0e] text-[#ff3b30]" : "bg-[#f4f1ea] text-[#0e0e0e]")
  const sizeClass = value >= 1024 ? "text-[clamp(1.25rem,5.5vw,3.25rem)]" : "text-[clamp(1.65rem,7vw,4rem)]"

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
