import Link from "next/link"

interface Game2048ControlsProps {
  onNewGame: () => void
  saveState: string
  saveMessage: string
}

export function Game2048Controls({ onNewGame, saveState, saveMessage }: Game2048ControlsProps) {
  return (
    <section className="grid gap-3 border-t border-[#0e0e0e] p-4 font-mono text-xs font-bold uppercase tracking-[0.14em] sm:grid-cols-[auto_1fr] lg:p-5">
      <button
        type="button"
        onClick={onNewGame}
        className="game-2048-control-button border border-[#0e0e0e] px-4 py-3 text-left text-[#0e0e0e] transition-colors duration-150 hover:bg-[#0e0e0e] hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
      >
        New game / 新局
      </button>
      <div className="flex items-center text-[#77736b]">
        {saveMessage || (saveState === "saving" ? "Saving score / 正在保存" : <>Arrow keys / WASD / Swipe. <span className="cn-keep">键盘或滑动操作。</span></>)}
      </div>
      <Link
        href="/game-box"
        className="game-2048-control-button border border-[#0e0e0e] px-4 py-3 text-[#ff3b30] transition-colors duration-150 hover:bg-[#0e0e0e] hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] sm:col-span-2"
      >
        Back to Game Box / 返回游戏盒子 &rarr;
      </Link>
    </section>
  )
}
