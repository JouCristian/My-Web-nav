"use client"

import { useEffect, useRef } from "react"

/**
 * 全局加载界面（Apple 级动效）
 *
 * 设计原则：
 * - 不再渲染任何卡片/玻璃容器；让 layout 中常驻的 GlobalBackground (DotField + Aurora) 自然透出，
 *   保证视觉的"减法美学"——只剩星海与一束安静的能量。
 * - 通过 requestAnimationFrame 程序化派发 MouseEvent，让 DotField 的光斑沿
 *   屏幕中心做圆周巡航，与之前用户 hover 触发的 bulge pipeline 完全一致。
 * - 五层同心涟漪 + 中心心跳光核 + 焦点光点 + 远端字签，全部用 cubic-bezier(0.22, 1, 0.36, 1)
 *   等 Apple 风非线性曲线进入。
 * - 心跳节拍：核心每 ~3.6s 完成一次"舒张-收缩-亮闪"循环，作为加载持续进行的隐性进度提示。
 */
export default function PageLoading({ label = "Loading" }: { label?: string }) {
  const startedAtRef = useRef<number>(0)
  if (!startedAtRef.current) {
    startedAtRef.current = typeof performance !== "undefined" ? performance.now() : Date.now()
  }

  /* ---------------------------------------------------------------------------
   * 程序化"鼠标"巡航：让 DotField 的光斑沿圆周自动旋转，
   * 复用与真实 hover 完全相同的事件 pipeline，避免引入新的渲染分支。
   * ------------------------------------------------------------------------- */
  useEffect(() => {
    let raf = 0
    let lastDispatch = 0
    const FRAME_THROTTLE = 16 // ~60fps 上限，移动端也不过载

    const tick = (now: number) => {
      if (now - lastDispatch >= FRAME_THROTTLE) {
        lastDispatch = now
        const cx = window.innerWidth / 2
        const cy = window.innerHeight / 2
        const elapsed = now - startedAtRef.current

        // 主旋转：每 5s 一圈，慢节奏体现 Apple 级克制
        const baseAngle = (elapsed / 5000) * Math.PI * 2
        // 半径呼吸：在 140 ~ 220 之间用低频正弦缓动，让轨迹更"有机"
        const radius = 180 + Math.sin(elapsed / 1800) * 40
        const x = cx + Math.cos(baseAngle) * radius
        const y = cy + Math.sin(baseAngle) * radius

        // 与 DotField 的 onMouseMove 监听器使用同一接口
        window.dispatchEvent(
          new MouseEvent("mousemove", {
            clientX: x,
            clientY: y,
            bubbles: true,
          }),
        )
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      // 卸载时把"鼠标"推到远处，让 DotField 的 bulge 平滑回归静态
      try {
        window.dispatchEvent(new MouseEvent("mousemove", { clientX: -9999, clientY: -9999 }))
      } catch {
        /* SSR safety */
      }
    }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none animate-loader-mount"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {/* ── 中心光核：持续柔和呼吸 + 周期性"心跳"亮闪 ─────────────────── */}
      <div
        className="absolute w-44 h-44 rounded-full animate-loader-core"
        style={{
          background:
            "radial-gradient(circle, rgba(168,85,247,0.55) 0%, rgba(59,130,246,0.18) 45%, rgba(168,85,247,0) 70%)",
          filter: "blur(10px)",
          willChange: "transform, opacity, filter",
        }}
        aria-hidden="true"
      />

      {/* ── 五层同心涟漪：错相位向外扩散，cubic-bezier(0.16, 1, 0.3, 1) easeOutExpo ── */}
      <div
        className="absolute w-28 h-28 rounded-full border border-white/40 animate-loader-ripple"
        style={{ animationDelay: "0s" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-28 h-28 rounded-full border border-cyan-300/35 animate-loader-ripple"
        style={{ animationDelay: "0.6s" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-28 h-28 rounded-full border border-purple-300/35 animate-loader-ripple"
        style={{ animationDelay: "1.2s" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-28 h-28 rounded-full border border-white/25 animate-loader-ripple"
        style={{ animationDelay: "1.8s" }}
        aria-hidden="true"
      />
      <div
        className="absolute w-28 h-28 rounded-full border border-white/15 animate-loader-ripple"
        style={{ animationDelay: "2.4s" }}
        aria-hidden="true"
      />

      {/* ── 焦点光点：视觉锚点，呼吸式高光 ──────────────────────────── */}
      <div
        className="absolute w-2 h-2 rounded-full bg-white shadow-[0_0_24px_8px_rgba(255,255,255,0.45)] animate-loader-pulse"
        aria-hidden="true"
      />

      {/* ── 远端字签：底部柔和淡入，字距 + 位移协同进入 ─────────────── */}
      <div className="absolute bottom-[16%] sm:bottom-[18%] flex flex-col items-center gap-3 animate-loader-label">
        <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-zinc-300/75 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
          {label}
        </div>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </div>

      <span className="sr-only">{label}</span>
    </div>
  )
}
