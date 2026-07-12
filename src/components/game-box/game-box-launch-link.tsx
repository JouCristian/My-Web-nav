"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type MouseEvent, type ReactNode } from "react"

interface GameBoxLaunchLinkProps {
  href: string
  className?: string
  ariaLabel?: string
  children: ReactNode
}

function isPlainNavigation(event: MouseEvent<HTMLAnchorElement>) {
  return !event.defaultPrevented && event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
}

export function GameBoxLaunchLink({ href, className, ariaLabel, children }: GameBoxLaunchLinkProps) {
  const [pending, setPending] = useState(false)
  const router = useRouter()

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .game-box-route-loader {
              --gb-route-ease: cubic-bezier(0.16, 1, 0.3, 1);
              position: fixed;
              inset: 0;
              z-index: 310;
              display: grid;
              place-items: center;
              background:
                linear-gradient(rgba(14, 14, 14, 0.045) 1px, transparent 1px),
                linear-gradient(90deg, rgba(14, 14, 14, 0.045) 1px, transparent 1px),
                rgba(244, 241, 234, 0.96);
              background-size: 32px 32px;
              color: #0e0e0e;
              animation: game-box-route-loader-in 180ms var(--gb-route-ease) both;
            }

            .game-box-route-loader-card {
              width: min(360px, calc(100vw - 48px));
              border: 1px solid currentColor;
              background: #f4f1ea;
              padding: 24px;
              box-shadow: 0 0 0 1px rgba(14, 14, 14, 0.08);
            }

            .game-box-route-loader-bar {
              position: relative;
              height: 8px;
              margin-top: 18px;
              overflow: hidden;
              border: 1px solid currentColor;
            }

            .game-box-route-loader-bar::after {
              content: "";
              position: absolute;
              inset: 0;
              width: 42%;
              background: #ff3b30;
              animation: game-box-route-loader-bar 720ms var(--gb-route-ease) infinite;
            }

            :root[data-game-box-theme="dark"] .game-box-route-loader {
              background:
                linear-gradient(rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                linear-gradient(90deg, rgba(244, 241, 234, 0.055) 1px, transparent 1px),
                rgba(14, 14, 14, 0.96);
              color: #f4f1ea;
            }

            :root[data-game-box-theme="dark"] .game-box-route-loader-card {
              background: #0e0e0e;
            }

            :root[data-game-box-theme="dark"] .game-box-route-loader-bar::after {
              background: #d7ff00;
            }

            @keyframes game-box-route-loader-in {
              from { opacity: 0; transform: translateY(10px) scale(0.992); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes game-box-route-loader-bar {
              from { transform: translateX(-110%); }
              to { transform: translateX(250%); }
            }

            @media (prefers-reduced-motion: reduce) {
              .game-box-route-loader,
              .game-box-route-loader-bar::after {
                animation-duration: 1ms !important;
              }
            }
          `,
        }}
      />
      <Link
        href={href}
        aria-label={ariaLabel}
        className={className}
        onClick={(event) => {
          if (!isPlainNavigation(event) || pending) return
          event.preventDefault()
          setPending(true)
          window.requestAnimationFrame(() => router.push(href))
        }}
      >
        {children}
      </Link>
      {pending ? (
        <div className="game-box-route-loader" role="status" aria-live="polite" aria-label="Loading 2048">
          <div className="game-box-route-loader-card">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#77736b]">Loading module / 正在加载</p>
            <p className="mt-3 font-[family-name:var(--font-space)] text-4xl font-black uppercase leading-none">2048</p>
            <div className="game-box-route-loader-bar" />
          </div>
        </div>
      ) : null}
    </>
  )
}
