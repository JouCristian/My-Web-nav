"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"

export interface GameBoxProfile {
  name: string
  handle: string
  image?: string | null
  isLoggedIn: boolean
}

export interface GameBoxStatRow {
  gameId: string
  gameName: string
  bestScore: string
  plays: number
  lastPlayed: string
}

interface GameBoxProfileCardProps {
  profile: GameBoxProfile
  stats: GameBoxStatRow[]
}

const guestStorageKey = "game-box:guest-player-stats:v1"
const exitDuration = 220

export function GameBoxProfileCard({ profile, stats }: GameBoxProfileCardProps) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [guestHasLocalData, setGuestHasLocalData] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (profile.isLoggedIn) return

    try {
      const raw = window.localStorage.getItem(guestStorageKey)
      setGuestHasLocalData(Boolean(raw))
    } catch {
      setGuestHasLocalData(false)
    }
  }, [profile.isLoggedIn])

  useEffect(() => {
    if (!open) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
    // closeDialog only toggles local state; this listener should follow open state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const initials = useMemo(() => {
    const compact = profile.name.trim()
    return compact ? compact.slice(0, 2).toUpperCase() : "GB"
  }, [profile.name])

  const totalPlays = stats.reduce((sum, item) => sum + item.plays, 0)
  const storageLabel = profile.isLoggedIn ? "Account synced / 账号数据" : "Local only / 浏览器缓存"

  function openDialog() {
    setClosing(false)
    setOpen(true)
  }

  function closeDialog() {
    if (closing) return
    setClosing(true)
    window.setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, exitDuration)
  }

  const dialog =
    open ? (
      <div
        className={`game-profile-overlay ${closing ? "is-closing" : ""} fixed inset-0 z-[260] flex items-center justify-center bg-[#0e0e0e]/72 p-4 text-[#0e0e0e]`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-profile-title"
        onClick={closeDialog}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .game-profile-overlay {
                --gb-ease: cubic-bezier(0.16, 1, 0.3, 1);
                animation: game-profile-fade-in 220ms var(--gb-ease) both;
              }

              .game-profile-overlay.is-closing {
                animation: game-profile-fade-out 220ms var(--gb-ease) both;
              }

              .game-profile-dialog {
                animation: game-profile-card-in 280ms var(--gb-ease) both;
              }

              .game-profile-overlay.is-closing .game-profile-dialog {
                animation: game-profile-card-out 220ms var(--gb-ease) both;
              }

              .game-profile-dialog button,
              .game-profile-overlay button {
                cursor: pointer;
              }

              :root[data-game-box-theme="dark"] .game-profile-close:hover,
              :root[data-game-box-theme="dark"] .game-profile-close:focus-visible {
                background: #d7ff00 !important;
                color: #0e0e0e !important;
                border-color: #d7ff00 !important;
              }

              :root[data-game-box-theme="dark"] .game-profile-card:hover,
              :root[data-game-box-theme="dark"] .game-profile-card:focus-visible {
                border-color: #d7ff00 !important;
                box-shadow: inset 0 0 0 2px #d7ff00 !important;
              }

              @keyframes game-profile-fade-in {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes game-profile-fade-out {
                from { opacity: 1; }
                to { opacity: 0; }
              }

              @keyframes game-profile-card-in {
                from { opacity: 0; transform: translateY(22px) scale(0.985); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }

              @keyframes game-profile-card-out {
                from { opacity: 1; transform: translateY(0) scale(1); }
                to { opacity: 0; transform: translateY(12px) scale(0.992); }
              }

              @media (prefers-reduced-motion: reduce) {
                .game-profile-overlay,
                .game-profile-dialog,
                .game-profile-overlay.is-closing,
                .game-profile-overlay.is-closing .game-profile-dialog {
                  animation-duration: 1ms !important;
                  transform: none !important;
                }
              }
            `,
          }}
        />
        <div
          className="game-profile-dialog max-h-[86vh] w-full max-w-5xl overflow-y-auto border border-[#0e0e0e] bg-[#f4f1ea] shadow-none"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="grid border-b border-[#0e0e0e] md:grid-cols-[minmax(0,1fr)_192px]">
            <div className="min-w-0 p-6 sm:p-8">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#77736b]">
                Player profile / 玩家档案
              </p>
              <h2
                id="game-profile-title"
                className="mt-4 truncate font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none sm:text-5xl"
              >
                {profile.name}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
                {profile.isLoggedIn
                  ? "游戏数据会跟随当前账号。之后每接入一款游戏，都需要把分数、次数、最近游玩时间写入这里。"
                  : "未登录状态只缓存到当前浏览器。更换浏览器或清理本地数据后，这里的匿名记录不会保留。"}
              </p>
            </div>
            <button
              type="button"
              onClick={closeDialog}
              className="game-profile-close border-t border-[#0e0e0e] p-6 text-left font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#ff3b30] transition-colors duration-200 hover:bg-[#0e0e0e] hover:text-[#f4f1ea] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] md:border-l md:border-t-0"
            >
              Close / 关闭
            </button>
          </div>

          <div className="grid border-b border-[#0e0e0e] sm:grid-cols-3">
            <Metric label="Games tracked / 已接入游戏" value={String(stats.length)} />
            <Metric label="Total plays / 总局数" value={String(totalPlays)} />
            <Metric label="Storage / 存储" value={profile.isLoggedIn ? "Account" : guestHasLocalData ? "Local" : "Empty"} />
          </div>

          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <section className="border border-[#0e0e0e] p-5">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-[#77736b]">
                Identity / 身份
              </p>
              <div className="mt-5 flex items-center gap-4">
                <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[#0e0e0e] bg-[#0e0e0e] font-mono text-lg font-black text-[#f4f1ea]">
                  {profile.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-xs font-bold uppercase tracking-[0.14em] text-[#77736b]">
                    {profile.handle}
                  </span>
                  <span className="mt-2 block text-sm font-semibold leading-relaxed text-[#77736b]">
                    {storageLabel}
                  </span>
                </span>
              </div>
            </section>

            <section className="min-w-0">
              {stats.length > 0 ? (
                <div className="overflow-hidden border border-[#0e0e0e]">
                  {stats.map((item) => (
                    <div
                      key={item.gameId}
                      className="grid gap-3 border-b border-[#0e0e0e] p-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_120px_80px_140px]"
                    >
                      <span className="truncate font-mono text-sm font-black uppercase">{item.gameName}</span>
                      <span className="font-mono text-xs font-bold uppercase text-[#77736b]">{item.bestScore}</span>
                      <span className="font-mono text-xs font-bold uppercase text-[#77736b]">{item.plays}</span>
                      <span className="font-mono text-xs font-bold uppercase text-[#77736b]">{item.lastPlayed}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-[#0e0e0e]/55 p-6">
                  <p className="font-[family-name:var(--font-space)] text-2xl font-black uppercase">No game data yet</p>
                  <p className="mt-3 max-w-xl text-sm font-semibold leading-relaxed tracking-[0.06em] text-[#77736b]">
                    还没有接入真实小游戏。下一款游戏加入时，需要在这里追加对应的用户统计、最佳成绩和最近游玩记录。
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    ) : null

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className="game-profile-card group w-full cursor-pointer border border-[#0e0e0e] bg-[#f4f1ea] p-0 text-left text-[#0e0e0e] outline-none transition-[background-color,box-shadow] duration-200 ease-out hover:bg-[#fffdf8] hover:shadow-[inset_0_0_0_2px_#0e0e0e] focus-visible:ring-2 focus-visible:ring-[#ff3b30]"
      >
        <span className="block p-4">
          <span className="flex items-center gap-3">
            <span className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden border border-[#0e0e0e] bg-[#0e0e0e] font-mono text-sm font-black text-[#f4f1ea]">
              {profile.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.image} alt="" className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate font-[family-name:var(--font-space)] text-xl font-black uppercase leading-none">
                {profile.name}
              </span>
              <span className="mt-1 block truncate font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#77736b]">
                {profile.handle}
              </span>
            </span>
          </span>

          <span className="mt-5 grid grid-cols-2 border-t border-[#0e0e0e]/45 pt-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em]">
            <span>
              <span className="block text-[#77736b]">Games / 游戏</span>
              <span className="mt-1 block text-lg text-[#0e0e0e]">{stats.length}</span>
            </span>
            <span>
              <span className="block text-[#77736b]">Plays / 局数</span>
              <span className="mt-1 block text-lg text-[#0e0e0e]">{totalPlays}</span>
            </span>
          </span>

          <span className="mt-4 flex items-center justify-between gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#ff3b30]">
            <span>{storageLabel}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1">OPEN &rarr;</span>
          </span>
        </span>
      </button>

      {mounted && dialog ? createPortal(dialog, document.body) : null}
    </>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[#0e0e0e] p-5 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <p className="text-balance font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#77736b]">{label}</p>
      <p className="mt-2 break-words font-[family-name:var(--font-space)] text-3xl font-black uppercase leading-none">{value}</p>
    </div>
  )
}
