"use client"

import { useEffect, useState } from "react"

type GameBoxTheme = "light" | "dark"

const STORAGE_KEY = "game-box-theme:v1"

function applyTheme(theme: GameBoxTheme) {
  document.documentElement.dataset.gameBoxTheme = theme
}

export function GameBoxThemeToggle() {
  const [theme, setTheme] = useState<GameBoxTheme>("light")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    const nextTheme: GameBoxTheme = stored === "dark" ? "dark" : "light"
    setTheme(nextTheme)
    applyTheme(nextTheme)
    setReady(true)
  }, [])

  function toggleTheme() {
    const nextTheme: GameBoxTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    applyTheme(nextTheme)
    window.localStorage.setItem(STORAGE_KEY, nextTheme)
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-box-theme-toggle {
              --gb-theme-ease: cubic-bezier(0.16, 1, 0.3, 1);
              cursor: pointer;
              transition:
                background-color 220ms var(--gb-theme-ease),
                color 220ms var(--gb-theme-ease),
                border-color 220ms var(--gb-theme-ease),
                transform 220ms var(--gb-theme-ease),
                opacity 220ms var(--gb-theme-ease);
            }

            .game-box-theme-toggle:hover,
            .game-box-theme-toggle:focus-visible {
              transform: translateY(-1px);
            }

            .game-box-theme-toggle svg {
              animation: game-box-icon-fade 220ms var(--gb-theme-ease) both;
            }

            .game-box-theme-toggle path,
            .game-box-theme-toggle circle,
            .game-box-theme-toggle line {
              stroke-dasharray: 72;
              stroke-dashoffset: 72;
              animation: game-box-icon-draw 360ms var(--gb-theme-ease) 80ms both;
            }

            @keyframes game-box-icon-fade {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }

            @keyframes game-box-icon-draw {
              to { stroke-dashoffset: 0; }
            }

            :root[data-game-box-theme="dark"] .game-box-page,
            :root[data-game-box-theme="dark"] .game-2048-page {
              --gb-paper: #0e0e0e;
              --gb-ink: #f4f1ea;
              --gb-muted: #b7b2a8;
              --gb-red: #d7ff00;
              background-color: #0e0e0e !important;
              color: #f4f1ea !important;
              background-image:
                linear-gradient(rgba(244,241,234,0.07) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244,241,234,0.07) 1px, transparent 1px) !important;
            }

            :root[data-game-box-theme="dark"] .game-box-page *,
            :root[data-game-box-theme="dark"] .game-2048-page * {
              border-color: rgba(244, 241, 234, 0.72) !important;
            }

            :root[data-game-box-theme="dark"] .game-profile-overlay,
            :root[data-game-box-theme="dark"] .game-2048-result,
            :root[data-game-box-theme="dark"] .leaderboard-detail-overlay {
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] .game-box-page :is(.game-box-shell, .game-sidebar, .game-box-play-card, .game-box-empty-slot, .game-box-fibonacci-note, .game-profile-card, .game-profile-dialog),
            :root[data-game-box-theme="dark"] .game-2048-page :is(.game-2048-shell, .game-2048-panel, .game-2048-start-field, .game-2048-result-card, .game-2048-result-close, .game-2048-leaderboard-detail) {
              background-color: #0e0e0e !important;
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] :is(.game-profile-dialog, .game-2048-result-card, .game-2048-result-close, .game-2048-leaderboard-detail) {
              background-color: #0e0e0e !important;
              color: #f4f1ea !important;
              border-color: rgba(244, 241, 234, 0.72) !important;
            }

            :root[data-game-box-theme="dark"] :is(.game-profile-dialog *, .game-2048-result-card *, .game-2048-leaderboard-detail *) {
              border-color: rgba(244, 241, 234, 0.72) !important;
            }

            :root[data-game-box-theme="dark"] .game-box-page :is(a, button, p, span, h1, h2, h3, strong),
            :root[data-game-box-theme="dark"] .game-2048-page :is(a, button, p, span, h1, h2, h3, strong) {
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] :is(.game-profile-dialog, .game-profile-dialog *, .game-2048-result-card, .game-2048-result-card *, .game-2048-leaderboard-detail, .game-2048-leaderboard-detail *) {
              color: #f4f1ea !important;
            }

            :root[data-game-box-theme="dark"] :is(.game-profile-close, .game-2048-result-close, .leaderboard-detail-close):hover,
            :root[data-game-box-theme="dark"] :is(.game-profile-close, .game-2048-result-close, .leaderboard-detail-close):focus-visible {
              background: #d7ff00 !important;
              color: #0e0e0e !important;
              border-color: #d7ff00 !important;
            }

            :root[data-game-box-theme="dark"] :is(.game-profile-close, .game-2048-result-close, .leaderboard-detail-close):hover *,
            :root[data-game-box-theme="dark"] :is(.game-profile-close, .game-2048-result-close, .leaderboard-detail-close):focus-visible * {
              color: #0e0e0e !important;
            }

            :root[data-game-box-theme="dark"] .game-profile-card:hover,
            :root[data-game-box-theme="dark"] .game-profile-card:focus-visible {
              border-color: #d7ff00 !important;
              box-shadow: inset 0 0 0 2px #d7ff00 !important;
            }

            :root[data-game-box-theme="dark"] .game-box-page :is(.game-profile-card p, .game-box-empty-slot, .game-box-fibonacci-note p),
            :root[data-game-box-theme="dark"] .game-2048-page .game-2048-panel p {
              color: #b7b2a8 !important;
            }

            :root[data-game-box-theme="dark"] .game-box-page .game-library-marker span:nth-child(2),
            :root[data-game-box-theme="dark"] .game-box-page .game-box-play-card-pattern span:nth-child(2) {
              background-color: #d7ff00 !important;
            }

            :root[data-game-box-theme="dark"] .game-box-theme-toggle {
              border-color: #f4f1ea !important;
              background: #0e0e0e !important;
              color: #d7ff00 !important;
            }

            @media (prefers-reduced-motion: reduce) {
              .game-box-theme-toggle,
              .game-box-theme-toggle svg,
              .game-box-theme-toggle path,
              .game-box-theme-toggle circle,
              .game-box-theme-toggle line {
                animation-duration: 1ms !important;
                transition-duration: 1ms !important;
              }
            }
          `,
        }}
      />
      <button
        type="button"
        aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
        aria-pressed={theme === "dark"}
        onClick={toggleTheme}
        className="game-box-theme-toggle fixed right-4 top-4 z-[320] flex h-11 w-11 items-center justify-center border border-[#0e0e0e] bg-[#f4f1ea] text-[#0e0e0e] shadow-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff3b30] sm:right-6 sm:top-6"
        style={{ opacity: ready ? 1 : 0 }}
      >
        {theme === "dark" ? (
          <svg key="moon" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M19 14.2A7.2 7.2 0 0 1 9.8 5 8 8 0 1 0 19 14.2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </svg>
        ) : (
          <svg key="sun" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
        )}
      </button>
    </>
  )
}
