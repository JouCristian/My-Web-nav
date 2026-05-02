"use client"

import { useEffect, useRef } from "react"

/**
 * 全局加载界面（Apple 级动效 · 震撼版）
 *
 * 视觉张力来源：
 *  1. 三组合成"鼠标"沿 120° 错相做圆周巡航 → 让 DotField 在屏幕中央形成
 *     一个三角共振的紫色星座，远比单点 hover 更具能量感。
 *  2. 七层涟漪 + 双道大尺度冲击波（紫 / 青）→ 高/低频共振叠加。
 *  3. 旋转 conic 能量盘 + 八道径向光柱（aperture）→ 增加方向感与张力。
 *  4. 中心多层心跳光核：4 倍亮度峰值 + 长尾衰减，结合白色焦点的脉冲爆点。
 *  5. 全局色差错位（Chromatic Aberration）：在心跳爆发瞬间叠加红/青偏移。
 */
export default function PageLoading({ label = "Loading" }: { label?: string }) {
  const startedAtRef = useRef<number>(0)
  if (!startedAtRef.current) {
    startedAtRef.current = typeof performance !== "undefined" ? performance.now() : Date.now()
  }

  /* ---------------------------------------------------------------------------
   * 程序化"三鼠标"巡航：120° 错相 + 不同半径，让 DotField 形成三角共振光斑。
   * 复用与真实 hover 完全相同的 MouseEvent pipeline。
   * ------------------------------------------------------------------------- */
  useEffect(() => {
    let raf = 0
    let lastDispatch = 0
    const FRAME_THROTTLE = 16 // 60fps 上限
    const PHASES = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3] // 三角错相
    const RADII = [180, 240, 130] // 三个层级半径

    const tick = (now: number) => {
      if (now - lastDispatch >= FRAME_THROTTLE) {
        lastDispatch = now
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const elapsed = now - startedAtRef.current
        const baseAngle = (elapsed / 4500) * Math.PI * 2 // 每 4.5s 一圈，比之前略快
        const breathe = Math.sin(elapsed / 1600) * 38

        // 同帧连发三个 MouseEvent，DotField 内部按最后一次取，但 throttle
        // 已经把整体合成限制在 60fps 以内，所以每帧只会派发最新的位置。
        // 实际效果是三个相位轮流"追逐",形成连续旋转的 3 点星座。
        const phaseIdx = Math.floor(elapsed / 60) % PHASES.length
        const angle = baseAngle + PHASES[phaseIdx]
        const radius = RADII[phaseIdx] + breathe
        const x = cx + Math.cos(angle) * radius
        const y = cy + Math.sin(angle) * radius

        window.dispatchEvent(new MouseEvent("mousemove", { clientX: x, clientY: y, bubbles: true }))
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      try {
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: -9999, clientY: -9999 }))
      } catch {
        /* SSR safety */
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-loader-mount overflow-hidden"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* ── vignette：四周加暗，把视觉聚焦到中心能量阵 ───────────────── */}
      <div
        className="absolute inset-0 pointer-events-none animate-loader-vignette"
        style={{
          background:
            "radial-gradient(circle at center, transparent 30%, rgba(2,2,5,0.5) 70%, rgba(2,2,5,0.85) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ── 旋转 conic 能量盘：极慢自转，制造方向感 ──────────────────── */}
      <div
        className="absolute w-[480px] h-[480px] rounded-full animate-loader-conic mix-blend-screen opacity-70"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(168,85,247,0) 0deg, rgba(168,85,247,0.45) 60deg, rgba(34,211,238,0.35) 120deg, rgba(168,85,247,0) 180deg, rgba(168,85,247,0.45) 240deg, rgba(34,211,238,0.35) 300deg, rgba(168,85,247,0) 360deg)",
          filter: "blur(40px)",
          willChange: "transform",
        }}
        aria-hidden="true"
      />

      {/* ── 大尺度冲击波 × 2：低频高能量 ─────────────────────────────── */}
      <div
        className="absolute w-40 h-40 rounded-full border-2 border-purple-400/40 animate-loader-shock mix-blend-screen"
        style={{ animationDelay: "0s", boxShadow: "0 0 60px 6px rgba(168,85,247,0.35) inset, 0 0 80px 12px rgba(168,85,247,0.45)" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-40 h-40 rounded-full border-2 border-cyan-300/40 animate-loader-shock mix-blend-screen"
        style={{ animationDelay: "2s", boxShadow: "0 0 60px 6px rgba(34,211,238,0.30) inset, 0 0 80px 12px rgba(34,211,238,0.40)" }}
        aria-hidden="true"
      />

      {/* ── 七层涟漪：高频能量壳，紫白青三色错相 ─────────────────────── */}
      <div className="absolute w-28 h-28 rounded-full border border-white/55 animate-loader-ripple" style={{ animationDelay: "0s" }} aria-hidden="true" />
      <div className="absolute w-28 h-28 rounded-full border border-cyan-300/45 animate-loader-ripple" style={{ animationDelay: "0.5s" }} aria-hidden="true" />
      <div className="absolute w-28 h-28 rounded-full border border-purple-300/55 animate-loader-ripple" style={{ animationDelay: "1s" }} aria-hidden="true" />
      <div className="absolute w-28 h-28 rounded-full border border-white/35 animate-loader-ripple" style={{ animationDelay: "1.5s" }} aria-hidden="true" />
      <div className="absolute w-28 h-28 rounded-full border border-cyan-300/30 animate-loader-ripple" style={{ animationDelay: "2s" }} aria-hidden="true" />
      <div className="absolute w-28 h-28 rounded-full border border-purple-300/35 animate-loader-ripple" style={{ animationDelay: "2.5s" }} aria-hidden="true" />
      <div className="absolute w-28 h-28 rounded-full border border-white/20 animate-loader-ripple" style={{ animationDelay: "3s" }} aria-hidden="true" />

      {/* ── 八道径向光柱（aperture / starburst）：心跳爆发瞬间放射 ──── */}
      <div className="absolute w-[520px] h-[520px] animate-loader-aperture" aria-hidden="true">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <span
            key={deg}
            className="absolute left-1/2 top-1/2 h-px w-[260px] origin-left -translate-y-1/2"
            style={{
              transform: `rotate(${deg}deg)`,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.0) 0%, rgba(255,255,255,0.55) 30%, rgba(168,85,247,0.85) 70%, rgba(255,255,255,0) 100%)",
              filter: "blur(0.5px)",
            }}
          />
        ))}
      </div>

      {/* ── 中心三层光核：紫芯 + 青晕 + 白炽 ──────────────────────────── */}
      <div
        className="absolute w-56 h-56 rounded-full animate-loader-core"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.7) 0%, rgba(59,130,246,0.25) 45%, rgba(168,85,247,0) 70%)",
          filter: "blur(14px)",
          willChange: "transform, opacity, filter",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute w-32 h-32 rounded-full animate-loader-core"
        style={{
          background:
            "radial-gradient(circle, rgba(34,211,238,0.55) 0%, rgba(168,85,247,0.25) 50%, transparent 75%)",
          filter: "blur(8px)",
          animationDelay: "0.4s",
        }}
        aria-hidden="true"
      />
      <div
        className="absolute w-12 h-12 rounded-full animate-loader-core"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.4) 40%, transparent 75%)",
          filter: "blur(2px)",
          animationDelay: "0.2s",
        }}
        aria-hidden="true"
      />

      {/* ── 焦点光点：视觉锚点 ──────────────────────────────────────── */}
      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-white animate-loader-pulse"
        aria-hidden="true"
      />

      {/* ── 色差错位：心跳爆发瞬间的红 / 青偏移层 ─────────────────────── */}
      <div className="absolute w-44 h-44 rounded-full bg-red-500/0 animate-loader-aberration-r mix-blend-screen" aria-hidden="true" />
      <div className="absolute w-44 h-44 rounded-full bg-cyan-400/0 animate-loader-aberration-c mix-blend-screen" aria-hidden="true" />

      {/* ── 远端字签：底部柔和淡入 ──────────────────────────────────── */}
      <div className="absolute bottom-[14%] sm:bottom-[16%] flex flex-col items-center gap-3 animate-loader-label">
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-zinc-300/80 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {label}
        </div>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
      </div>

      <span className="sr-only">{label}</span>
    </div>
  )
}
