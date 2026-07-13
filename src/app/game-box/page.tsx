import type { Metadata } from "next"
import Link from "next/link"
import { auth } from "@/auth"
import { GameBoxLaunchLink } from "@/components/game-box/game-box-launch-link"
import { GameBoxProfileCard, type GameBoxProfile, type GameBoxStatRow } from "@/components/game-box/game-box-profile-card"
import { GameBoxThemeToggle } from "@/components/game-box/game-box-theme-toggle"
import { safeAvatarUrl, safeDisplayName } from "@/features/game-box/2048/lib/format"
import { get2048UserRank } from "@/features/game-box/2048/lib/server"
import { prisma } from "@/lib/db"

export const metadata: Metadata = {
  title: "Game Box",
  description: "Game Box playground shell for mini games.",
}

interface GameBoxOverview {
  bestScoreLabel: string
  weeklyRankLabel: string
  playsLabel: string
}

const emptyOverview: GameBoxOverview = {
  bestScoreLabel: "暂无",
  weeklyRankLabel: "暂无",
  playsLabel: "0",
}

function formatScore(value: number) {
  return new Intl.NumberFormat("en-US").format(value)
}

async function getGameBoxData(userId?: string): Promise<{ stats: GameBoxStatRow[]; overview: GameBoxOverview }> {
  if (!userId) {
    return {
      stats: [],
      overview: { bestScoreLabel: "登录后统计", weeklyRankLabel: "登录后", playsLabel: "0" },
    }
  }

  try {
    const game = await prisma.game.findUnique({ where: { slug: "2048" } })
    if (!game) return { stats: [], overview: emptyOverview }

    const where = { userId, gameId: game.id, verified: true, suspicious: false }
    const [bestRun, plays, weeklyRank] = await Promise.all([
      prisma.gameRun.findFirst({
        where,
        orderBy: [{ score: "desc" }, { movesCount: "asc" }, { durationMs: "asc" }],
      }),
      prisma.gameRun.count({ where }),
      get2048UserRank("weekly", userId, "classic", 4).catch(() => null),
    ])

    if (!bestRun) return { stats: [], overview: emptyOverview }

    const stat: GameBoxStatRow = {
      gameId: "2048",
      gameName: "2048",
      bestScore: String(bestRun.score),
      plays,
      lastPlayed: bestRun.finishedAt.toISOString(),
    }

    return {
      stats: [stat],
      overview: {
        bestScoreLabel: formatScore(bestRun.score),
        weeklyRankLabel: weeklyRank ? `#${weeklyRank}` : "未上榜",
        playsLabel: formatScore(plays),
      },
    }
  } catch {
    return { stats: [], overview: emptyOverview }
  }
}

export default async function GameBoxPage() {
  const session = await auth().catch(() => null)
  const userId = session?.user?.id
  const dbUser = userId
    ? await prisma.user
        .findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            nickname: true,
            realName: true,
            crewNickname: true,
            customAvatar: true,
          },
        })
        .catch(() => null)
    : null

  const profile: GameBoxProfile = {
    name: dbUser ? safeDisplayName(dbUser) : session?.user?.name || "Guest Player",
    handle: dbUser?.email || session?.user?.email || (userId ? `USER-${userId.slice(0, 6)}` : "LOCAL-BROWSER"),
    image: dbUser ? safeAvatarUrl(dbUser) : session?.user?.image,
    isLoggedIn: Boolean(userId),
  }
  const { stats: gameStats, overview } = await getGameBoxData(userId)

  return (
    <main className="game-box-page min-h-screen overflow-x-hidden bg-[#f4f1ea] text-[#0e0e0e]">
      <GameBoxThemeToggle />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-box-page {
              --gb-paper: #f4f1ea;
              --gb-ink: #0e0e0e;
              --gb-muted: #77736b;
              --gb-red: #ff3b30;
              --gb-ease: cubic-bezier(0.16, 1, 0.3, 1);
              height: 100vh;
              overflow: hidden;
              background-image:
                linear-gradient(rgba(14,14,14,0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14,14,14,0.045) 1px, transparent 1px);
              background-size: 32px 32px;
            }

            :root:has(.game-box-page),
            body:has(.game-box-page) {
              scrollbar-gutter: stable;
            }

            .game-box-page a,
            .game-box-page button,
            .game-box-page [role="button"] {
              cursor: pointer;
            }

            .game-box-shell {
              display: grid;
              grid-template-columns: minmax(224px, 296px) minmax(0, 1fr);
              height: 100vh;
              min-height: 0;
              width: 100%;
              max-width: 100vw;
              overflow: hidden;
              animation: game-box-enter 520ms var(--gb-ease) both;
            }

            .game-sidebar {
              height: 100vh;
              min-height: 0;
              overflow: hidden;
              overscroll-behavior: contain;
            }

            .game-box-content {
              height: 100vh;
              min-height: 0;
              overflow-y: auto;
              overflow-x: hidden;
              overscroll-behavior: contain;
            }

            .game-sidebar,
            .game-box-hero,
            .game-library-board,
            .game-box-footer {
              animation: game-box-panel-enter 520ms var(--gb-ease) both;
            }

            .game-sidebar { animation-delay: 30ms; }
            .game-box-hero { animation-delay: 70ms; }
            .game-library-board { animation-delay: 120ms; }
            .game-box-footer { animation-delay: 160ms; }

            @keyframes game-box-enter {
              0% { opacity: 0; transform: translateY(22px) scale(0.985); }
              100% { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes game-box-panel-enter {
              0% { opacity: 0; transform: translateY(18px); }
              100% { opacity: 1; transform: translateY(0); }
            }

            .game-box-title {
              max-width: 100%;
              overflow-wrap: anywhere;
              text-wrap: balance;
            }

            .game-library-board {
              display: grid;
              grid-template-columns: minmax(360px, 1.45fr) minmax(224px, 0.9fr) minmax(280px, 0.9fr);
              grid-template-rows: 296px 192px 160px;
              grid-template-areas:
                "primary primary note"
                "primary primary slot2"
                "slot3 slot4 slot2";
              gap: 0;
              border-top: 1px solid var(--gb-ink);
              border-bottom: 1px solid var(--gb-ink);
              background: transparent;
            }

            .game-box-play-card,
            .game-box-empty-slot,
            .game-box-fibonacci-note {
              min-width: 0;
              overflow: hidden;
              border-right: 1px solid var(--gb-ink);
              border-bottom: 1px solid var(--gb-ink);
              background: rgba(244, 241, 234, 0.92);
            }

            .game-box-play-card {
              grid-area: primary;
              position: relative;
              display: grid;
              grid-template-rows: minmax(0, 1fr) auto auto;
              border: 1px solid var(--gb-ink);
              z-index: 1;
              transition:
                background-color 220ms var(--gb-ease),
                border-color 220ms var(--gb-ease),
                box-shadow 220ms var(--gb-ease),
                transform 260ms var(--gb-ease),
                filter 220ms var(--gb-ease);
            }

            .game-box-play-card:hover,
            .game-box-play-card:focus-visible {
              background-color: #fffdf8;
              border-color: var(--gb-ink);
              box-shadow: 0 0 0 1px var(--gb-ink);
              transform: translateY(-2px);
              filter: contrast(1.02);
              z-index: 5;
            }

            :root[data-game-box-theme="dark"] .game-box-play-card:hover,
            :root[data-game-box-theme="dark"] .game-box-play-card:focus-visible {
              border-color: #d7ff00 !important;
              box-shadow: 0 0 0 1px #d7ff00;
            }

            .game-box-play-card-pattern span {
              transition:
                transform 260ms var(--gb-ease),
                background-color 220ms var(--gb-ease),
                opacity 220ms var(--gb-ease);
            }

            .game-box-play-card:hover .game-box-play-card-pattern span:nth-child(1),
            .game-box-play-card:focus-visible .game-box-play-card-pattern span:nth-child(1) {
              transform: translate(8px, 0);
            }

            .game-box-play-card:hover .game-box-play-card-pattern span:nth-child(2),
            .game-box-play-card:focus-visible .game-box-play-card-pattern span:nth-child(2) {
              transform: translate(0, 8px);
              background-color: var(--gb-red);
              opacity: 1;
            }

            .game-box-play-card:hover .game-box-play-card-pattern span:nth-child(3),
            .game-box-play-card:focus-visible .game-box-play-card-pattern span:nth-child(3) {
              transform: translate(-8px, -8px);
            }

            .game-box-fibonacci-note {
              grid-area: note;
              position: relative;
              padding: 32px;
            }

            .game-box-empty-slot {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 24px;
              color: var(--gb-muted);
              transition:
                background-color 220ms var(--gb-ease),
                color 220ms var(--gb-ease);
            }

            .game-box-empty-slot:hover {
              background-color: rgba(255, 59, 48, 0.08);
              color: var(--gb-ink);
            }

            .game-box-slot-2 { grid-area: slot2; }
            .game-box-slot-3 { grid-area: slot3; }
            .game-box-slot-4 { grid-area: slot4; }

            .game-library-marker {
              position: absolute;
              right: 24px;
              top: 24px;
              display: grid;
              grid-template-columns: repeat(2, 16px);
              grid-template-rows: repeat(2, 16px);
              border: 1px solid var(--gb-ink);
            }

            .game-library-marker span {
              border-right: 1px solid var(--gb-ink);
              border-bottom: 1px solid var(--gb-ink);
            }

            .game-library-marker span:nth-child(2) {
              border-right: 0;
              background: var(--gb-red);
            }

            .game-library-marker span:nth-child(3) { border-bottom: 0; }
            .game-library-marker span:nth-child(4) { border-right: 0; border-bottom: 0; }

            @media (max-width: 1180px) {
              .game-library-board {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto 220px 180px;
                grid-template-areas:
                  "primary primary"
                  "note slot2"
                  "slot3 slot4";
              }
            }

            @media (max-width: 1080px) {
              .game-box-page {
                height: auto;
                overflow: visible;
              }

              .game-box-shell {
                grid-template-columns: 1fr;
                height: auto;
                overflow: visible;
              }

              .game-sidebar {
                position: relative;
                height: auto;
                min-height: auto;
                border-right: 0;
              }

              .game-box-content {
                height: auto;
                overflow: visible;
              }
            }

            @media (max-width: 760px) {
              .game-box-hero-meta {
                border-left: 0;
                padding-left: 0;
              }

              .game-library-board {
                grid-template-columns: 1fr;
                grid-template-rows: auto;
                grid-template-areas:
                  "primary"
                  "note"
                  "slot2"
                  "slot3"
                  "slot4";
              }

              .game-box-fibonacci-note,
              .game-box-empty-slot {
                min-height: 176px;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-box-shell,
              .game-sidebar,
              .game-box-hero,
              .game-library-board,
              .game-box-footer,
              .game-box-play-card,
              .game-box-empty-slot,
              .game-box-play-card-pattern span {
                animation-duration: 1ms !important;
                transition: none !important;
                transform: none !important;
              }
            }
          `,
        }}
      />

      <div className="game-box-shell">
        <aside className="game-sidebar flex min-h-screen flex-col justify-between border-r border-[#0e0e0e] p-6 lg:p-8">
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em]">MODULE 04 / PLAYGROUND</p>
                <p className="mt-2 text-xs font-semibold tracking-[0.18em] text-[#77736b]">游戏盒子</p>
              </div>
              <Link
                href="/"
                className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b] transition-colors duration-150 hover:text-[#ff3b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
              >
                HOME / 返回
              </Link>
            </div>
            <div className="mt-8 h-[2px] w-12 bg-[#0e0e0e]" />
          </div>

          <nav aria-label="Game library state" className="my-10 flex flex-col gap-3 lg:my-0">
            <a
              href="#game-library"
              className="w-fit font-[family-name:var(--font-space)] text-2xl font-black uppercase leading-none tracking-wide text-[#0e0e0e] transition-colors duration-150 hover:text-[#ff3b30] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] sm:text-3xl"
            >
              2048
              <span className="ml-3 align-middle text-xs font-semibold tracking-[0.18em] text-[#77736b]">已接入</span>
            </a>
            <p className="max-w-[24ch] text-xs font-semibold leading-relaxed tracking-[0.08em] text-[#77736b]">
              第一款游戏已经上线。后续新增游戏时，会复用同一套成绩、榜单与玩家数据结构。
            </p>
          </nav>

          <GameBoxProfileCard profile={profile} stats={gameStats} />
        </aside>

        <section className="game-box-content min-w-0">
          <header className="game-box-hero grid min-w-0 gap-8 border-b border-[#0e0e0e] px-6 pb-6 pt-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,400px)] lg:px-10 lg:pb-8">
            <div className="min-w-0">
              <h1 className="game-box-title font-[family-name:var(--font-space)] text-6xl font-black uppercase leading-[0.86] tracking-tight sm:text-8xl lg:text-[9rem]">
                GAME BOX
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="font-mono text-sm font-bold uppercase tracking-[0.32em]">Daily escape module</p>
                <span className="h-px w-10 bg-[#0e0e0e]/35" />
                <p className="text-sm font-semibold tracking-[0.18em] text-[#77736b]">每日逃离模块</p>
              </div>
            </div>

            <div className="game-box-hero-meta grid min-w-0 gap-6 self-start border-l border-[#0e0e0e]/65 pl-6 sm:grid-cols-[minmax(0,1fr)_auto] lg:pt-2">
              <div className="font-mono text-xs font-bold uppercase leading-relaxed tracking-[0.14em]">
                <p>01 game online.</p>
                <p>2048 ready.</p>
                <p className="mt-3 font-sans font-semibold tracking-[0.12em] text-[#77736b]">第一款真实小游戏已经接入。</p>
              </div>
              <div className="flex items-start gap-4">
                <p className="font-mono text-xs font-bold uppercase tracking-[0.16em]">ESC TO WORK</p>
                <span className="block h-6 w-6 border-r-2 border-t-2 border-[#0e0e0e]" />
              </div>
            </div>
          </header>

          <section id="game-library" className="game-library-board">
            <GameBoxLaunchLink
              href="/game-box/2048"
              ariaLabel="打开 2048"
              className="game-box-play-card group bg-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30]"
            >
              <span className="relative min-h-[260px] overflow-hidden border-b border-[#0e0e0e] p-7 sm:p-9">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">01 / playable</span>
                <span className="mt-6 block font-[family-name:var(--font-space)] text-7xl font-black uppercase leading-none sm:text-8xl">2048</span>
                <span className="mt-4 block font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#ff3b30]">NUMBER COLLISION</span>
                <span className="game-box-play-card-pattern absolute right-8 top-8 grid h-28 w-28 grid-cols-3 grid-rows-3">
                  <span className="col-span-2 border border-[#0e0e0e] bg-[#f4f1ea]" />
                  <span className="border border-[#0e0e0e] bg-[#ff3b30]/70" />
                  <span className="border border-[#0e0e0e] bg-[#0e0e0e]" />
                  <span className="col-span-2 border border-[#0e0e0e] bg-[#f4f1ea]" />
                </span>
              </span>
              <span className="grid grid-cols-2 border-b border-[#0e0e0e] font-mono text-xs font-bold uppercase tracking-[0.12em]">
                <span className="border-r border-[#0e0e0e] p-5">
                  BEST SCORE / 最高分
                  <strong className="mt-3 block font-[family-name:var(--font-space)] text-3xl font-black tracking-normal">{overview.bestScoreLabel}</strong>
                </span>
                <span className="p-5">
                  WEEKLY RANK / 周榜
                  <strong className="mt-3 block font-[family-name:var(--font-space)] text-3xl font-black tracking-normal">{overview.weeklyRankLabel}</strong>
                </span>
              </span>
              <span className="grid grid-cols-[1fr_auto] gap-6 p-6 font-mono text-xs font-bold uppercase tracking-[0.16em]">
                <span className="max-w-[42ch] text-[#77736b]">Classic 4x4. Keyboard, WASD, mobile swipe. Server replay verified. Plays: {overview.playsLabel}</span>
                <span className="text-[#ff3b30] transition-transform duration-200 group-hover:translate-x-1">START &rarr;</span>
              </span>
            </GameBoxLaunchLink>

            <div className="game-box-fibonacci-note">
              <div className="game-library-marker" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">Playable module / 可玩模块</p>
              <h2 className="mt-7 max-w-[12ch] font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-[0.92] sm:text-5xl">
                FIRST GAME
              </h2>
              <p className="mt-4 max-w-[46ch] text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
                2048 已作为第一款真实小游戏接入。登录用户成绩进入服务端重放验证，游客数据只保存在当前浏览器。
              </p>
            </div>

            {[2, 3, 4].map((slot) => (
              <div key={slot} className={`game-box-empty-slot game-box-slot-${slot}`}>
                <span className="font-mono text-xs font-bold uppercase tracking-[0.16em]">0{slot} / empty</span>
                <span>
                  <strong className="block font-mono text-xl font-black uppercase tracking-[0.18em] text-[#0e0e0e]">SLOT 0{slot}</strong>
                  <span className="mt-2 block text-sm font-semibold tracking-[0.18em]">待设计</span>
                </span>
              </div>
            ))}
          </section>

          <div className="grid gap-4 border-b border-[#0e0e0e] px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.12em] sm:grid-cols-3 sm:px-8 lg:px-10">
            <p>Registered games / 已注册 1</p>
            <p>Game records / 游戏记录: verified only</p>
            <p className="text-[#ff3b30]">2048 online</p>
          </div>

          <footer className="game-box-footer grid gap-4 px-6 py-5 font-mono text-xs font-bold uppercase tracking-[0.12em] sm:grid-cols-3 sm:px-8 lg:px-10">
            <p>Storage / 存储: account or local browser</p>
            <p>Schema / 用户数据: per game records</p>
            <p className="text-[#ff3b30]">Next: design slot 02</p>
          </footer>
        </section>
      </div>
    </main>
  )
}
