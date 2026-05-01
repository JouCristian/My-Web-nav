"use client"

/**
 * 全局加载占位符 —— Apple 风格：
 * - 玻璃形态药丸卡片，背后透出真实的 GlobalBackground（DotField + Aurora）
 * - 中心：双层 conic 旋转环（外慢内快）+ 中央呼吸光点
 * - 下方：单行说明文案 + 三连点呼吸动画
 *
 * 不再绑定任何"切换时空"逻辑，纯视觉。
 */
export default function PageLoading({ label = "正在跃迁" }: { label?: string }) {
  return (
    <div className="relative z-10 min-h-[100vh] w-full flex items-center justify-center px-6">
      <div
        className="
          group relative flex flex-col items-center gap-7
          rounded-[2.5rem] px-10 sm:px-14 py-12 sm:py-14
          border border-white/10
          bg-white/[0.04] backdrop-blur-2xl
          shadow-[0_30px_120px_-20px_rgba(34,211,238,0.18),0_0_0_1px_rgba(255,255,255,0.04)_inset]
          will-change-transform
        "
        role="status"
        aria-live="polite"
      >
        {/* 顶部高光 */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-60"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 22%, rgba(0,0,0,0) 60%)",
            mask: "linear-gradient(180deg, #000 0%, transparent 50%)",
            WebkitMask: "linear-gradient(180deg, #000 0%, transparent 50%)",
          }}
          aria-hidden="true"
        />

        {/* 旋转双环 */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24" aria-hidden="true">
          {/* 外环：渐隐 conic + 慢转 */}
          <div
            className="absolute inset-0 rounded-full animate-[spin_2.6s_linear_infinite]"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(255,255,255,0) 0%, rgba(34,211,238,0.55) 35%, rgba(255,255,255,0.95) 60%, rgba(34,211,238,0.55) 80%, rgba(255,255,255,0) 100%)",
              mask: "radial-gradient(circle at center, transparent 60%, #000 62%)",
              WebkitMask: "radial-gradient(circle at center, transparent 60%, #000 62%)",
            }}
          />

          {/* 内环：反向更快 + 紫色调，制造层次 */}
          <div
            className="absolute inset-3 rounded-full animate-[spin_1.4s_linear_infinite_reverse]"
            style={{
              background:
                "conic-gradient(from 180deg, rgba(255,255,255,0) 0%, rgba(124,255,103,0.6) 50%, rgba(255,255,255,0) 100%)",
              mask: "radial-gradient(circle at center, transparent 55%, #000 57%)",
              WebkitMask: "radial-gradient(circle at center, transparent 55%, #000 57%)",
            }}
          />

          {/* 中央呼吸光点 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="block w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_24px_rgba(34,211,238,0.9)] animate-[pulse_1.6s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* 标签 + 三连点 */}
        <div className="flex items-center gap-1.5 select-none">
          <span className="text-[13px] sm:text-sm font-mono uppercase tracking-[0.3em] text-zinc-200">
            {label}
          </span>
          <span className="flex gap-1 ml-1" aria-hidden="true">
            <span className="w-1 h-1 rounded-full bg-zinc-300 animate-[loadingDot_1.2s_ease-in-out_infinite]" />
            <span
              className="w-1 h-1 rounded-full bg-zinc-300 animate-[loadingDot_1.2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.15s" }}
            />
            <span
              className="w-1 h-1 rounded-full bg-zinc-300 animate-[loadingDot_1.2s_ease-in-out_infinite]"
              style={{ animationDelay: "0.3s" }}
            />
          </span>
        </div>

        <span className="sr-only">{label}</span>
      </div>

      <style jsx>{`
        @keyframes loadingDot {
          0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
      `}</style>
    </div>
  )
}
