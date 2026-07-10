import Link from "next/link"

interface GameBoxEntryCardProps {
  className?: string
}

const previewSlots = [
  { name: "2048", zh: "数字碰撞", meta: "Playable" },
  { name: "Slot 02", zh: "待设计", meta: "Empty" },
  { name: "Slot 03", zh: "待设计", meta: "Empty" },
  { name: "Slot 04", zh: "待设计", meta: "Empty" },
]

export function GameBoxEntryCard({ className = "" }: GameBoxEntryCardProps) {
  return (
    <section className={`relative w-full ${className}`}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-box-entry-card {
              --entry-ease: cubic-bezier(0.16, 1, 0.3, 1);
              display: grid;
              grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
              align-items: stretch;
              isolation: isolate;
              contain: paint;
              box-sizing: border-box;
              border: 1px solid #0e0e0e;
              background-color: #f4f1ea;
              background-image:
                linear-gradient(rgba(14, 14, 14, 0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 14, 14, 0.055) 1px, transparent 1px);
              background-size: 24px 24px;
              box-shadow: none;
              cursor: pointer;
              transition:
                background-color 240ms var(--entry-ease),
                background-position 460ms var(--entry-ease),
                filter 240ms var(--entry-ease);
            }

            .game-box-entry-card:hover,
            .game-box-entry-card:focus-visible {
              background-color: #fffdf8;
              background-position: 12px 12px;
              filter: contrast(1.02);
            }

            .game-box-entry-copy,
            .game-box-entry-mark,
            .game-box-entry-slot,
            .game-box-entry-slot::before,
            .game-box-entry-slot-title,
            .game-box-entry-cta,
            .game-box-entry-preview::before,
            .game-box-entry-preview::after {
              transition-timing-function: var(--entry-ease);
            }

            .game-box-entry-copy {
              transition: transform 280ms var(--entry-ease);
            }

            .game-box-entry-card:hover .game-box-entry-copy,
            .game-box-entry-card:focus-visible .game-box-entry-copy {
              transform: translateX(3px);
            }

            .game-box-entry-mark {
              transition: transform 280ms var(--entry-ease), opacity 220ms var(--entry-ease);
            }

            .game-box-entry-card:hover .game-box-entry-mark,
            .game-box-entry-card:focus-visible .game-box-entry-mark {
              transform: translate(-3px, 3px);
              opacity: 1;
            }

            .game-box-entry-preview-wrap {
              min-width: 0;
              min-height: 0;
              height: 100%;
              overflow: hidden;
              border-left: 1px solid #0e0e0e;
            }

            .game-box-entry-preview {
              position: relative;
              display: grid;
              grid-template-columns: repeat(2, minmax(0, 1fr));
              grid-template-rows: repeat(2, minmax(0, 1fr));
              min-width: 0;
              min-height: 0;
              height: 100%;
              overflow: hidden;
              contain: paint;
            }

            .game-box-entry-preview::before,
            .game-box-entry-preview::after {
              content: "";
              position: absolute;
              z-index: 4;
              background: #0e0e0e;
              pointer-events: none;
              transition-property: transform;
              transition-duration: 520ms;
            }

            .game-box-entry-preview::before {
              top: 0;
              bottom: 0;
              left: 50%;
              width: 1px;
              transform: scaleY(0);
              transform-origin: top;
            }

            .game-box-entry-preview::after {
              left: 0;
              right: 0;
              top: 50%;
              height: 1px;
              transform: scaleX(0);
              transform-origin: left;
            }

            .game-box-entry-card:hover .game-box-entry-preview::before,
            .game-box-entry-card:focus-visible .game-box-entry-preview::before {
              transform: scaleY(1);
            }

            .game-box-entry-card:hover .game-box-entry-preview::after,
            .game-box-entry-card:focus-visible .game-box-entry-preview::after {
              transform: scaleX(1);
            }

            .game-box-entry-slot {
              position: relative;
              min-width: 0;
              min-height: 0;
              opacity: 0.72;
              overflow: hidden;
              transition-property: opacity, background-color;
              transition-duration: 260ms;
            }

            .game-box-entry-slot::before {
              content: "";
              position: absolute;
              inset: 0;
              background: rgba(14, 14, 14, 0.045);
              transform: scaleX(0);
              transform-origin: left;
              transition-property: transform;
              transition-duration: 460ms;
              pointer-events: none;
            }

            .game-box-entry-slot:nth-child(1)::before {
              background: rgba(255, 59, 48, 0.11);
            }

            .game-box-entry-card:hover .game-box-entry-slot,
            .game-box-entry-card:focus-visible .game-box-entry-slot {
              opacity: 1;
            }

            .game-box-entry-card:hover .game-box-entry-slot::before,
            .game-box-entry-card:focus-visible .game-box-entry-slot::before {
              transform: scaleX(1);
            }

            .game-box-entry-slot-title {
              transition-property: transform, letter-spacing;
              transition-duration: 280ms;
            }

            .game-box-entry-card:hover .game-box-entry-slot-title,
            .game-box-entry-card:focus-visible .game-box-entry-slot-title {
              transform: translateX(2px);
              letter-spacing: 0.24em;
            }

            .game-box-entry-cta {
              transition: transform 260ms var(--entry-ease), color 220ms var(--entry-ease);
            }

            .game-box-entry-card:hover .game-box-entry-cta,
            .game-box-entry-card:focus-visible .game-box-entry-cta {
              transform: translateX(6px);
              color: #0e0e0e;
            }

            @media (max-width: 960px) {
              .game-box-entry-card {
                grid-template-columns: 1fr;
              }

              .game-box-entry-preview-wrap {
                height: 320px;
                border-left: 0;
                border-top: 1px solid #0e0e0e;
              }
            }

            @media (max-width: 640px) {
              .game-box-entry-preview-wrap {
                height: 280px;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-box-entry-card,
              .game-box-entry-copy,
              .game-box-entry-mark,
              .game-box-entry-slot,
              .game-box-entry-slot::before,
              .game-box-entry-slot-title,
              .game-box-entry-preview::before,
              .game-box-entry-preview::after,
              .game-box-entry-cta {
                transition: none !important;
                transform: none !important;
              }
            }
          `,
        }}
      />

      <Link
        href="/game-box"
        aria-label="打开游戏盒子 Game Box"
        className="game-box-entry-card group relative h-[336px] w-full max-w-full overflow-hidden rounded-none text-[#0e0e0e] outline-none focus-visible:ring-2 focus-visible:ring-[#ff3b30] focus-visible:ring-offset-4 focus-visible:ring-offset-[#020205] sm:h-[392px] lg:h-[420px]"
      >
        <div className="game-box-entry-copy relative z-10 flex min-h-0 flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#111111] sm:text-xs">
                MODULE 04 / PLAYGROUND
              </p>
              <p className="mt-2 text-xs font-semibold tracking-[0.2em] text-[#77736b]">
                游戏盒子 / 工位短暂逃离
              </p>
              <div className="mt-6 h-[2px] w-12 bg-[#0e0e0e]" />
            </div>
            <div className="game-box-entry-mark grid h-11 w-11 shrink-0 grid-cols-2 grid-rows-2 border border-[#0e0e0e] opacity-80">
              <span className="border-b border-r border-[#0e0e0e]" />
              <span className="border-b border-[#0e0e0e] bg-[#ff3b30]" />
              <span className="border-r border-[#0e0e0e]" />
              <span />
            </div>
          </div>

          <div className="py-4 sm:py-6">
            <h2 className="max-w-[10ch] font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-[0.88] tracking-tight text-[#0e0e0e] sm:text-6xl lg:text-7xl">
              GAME BOX
            </h2>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.32em] text-[#111111] sm:text-sm">
                DAILY ESCAPE MODULE
              </p>
              <span className="h-px w-10 bg-[#0e0e0e]/35" />
              <p className="text-sm font-semibold tracking-[0.14em] text-[#77736b]">
                每日短暂离席
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-6">
            <p className="max-w-[30ch] text-xs font-semibold leading-relaxed tracking-[0.08em] text-[#77736b] sm:text-sm">
              2048 已接入，后续游戏从这里继续扩展。
            </p>
            <span className="game-box-entry-cta whitespace-nowrap font-mono text-sm font-bold uppercase tracking-[0.18em] text-[#ff3b30] sm:text-base">
              ENTER &rarr;
            </span>
          </div>
        </div>

        <div className="game-box-entry-preview-wrap relative z-10">
          <div className="game-box-entry-preview">
            {previewSlots.map((slot, index) => (
              <div
                key={slot.name}
                className="game-box-entry-slot flex flex-col justify-between p-5 sm:p-6 lg:p-8"
                style={{
                  backgroundColor: index === 0 ? "rgba(255, 59, 48, 0.1)" : "rgba(244, 241, 234, 0.64)",
                }}
              >
                <span className="relative z-10 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b] sm:text-xs">
                  0{index + 1} / {slot.meta}
                </span>
                <span className="relative z-10">
                  <span className="game-box-entry-slot-title block font-mono text-sm font-black uppercase tracking-[0.2em] text-[#0e0e0e] sm:text-base">
                    {slot.name}
                  </span>
                  <span className="mt-2 block text-xs font-semibold tracking-[0.18em] text-[#77736b]">
                    {slot.zh}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Link>
    </section>
  )
}
