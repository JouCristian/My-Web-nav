// src/app/loading.tsx
export default function Loading() {
  return (
    <main className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-[#020205]">
      {/* 星际跃迁背景 - 多层星星流动 */}
      <div className="absolute inset-0">
        {/* 远景星星 - 慢速 */}
        <div className="absolute inset-0 animate-[starfield_8s_linear_infinite]">
          {[...Array(50)].map((_, i) => (
            <div
              key={`star-far-${i}`}
              className="absolute h-0.5 w-0.5 rounded-full bg-white/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        {/* 中景星星 - 中速拖尾 */}
        <div className="absolute inset-0 animate-[starfield_4s_linear_infinite]">
          {[...Array(30)].map((_, i) => (
            <div
              key={`star-mid-${i}`}
              className="absolute h-0.5 w-8 rounded-full bg-gradient-to-r from-transparent via-white/60 to-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${-45 + Math.random() * 10}deg)`,
              }}
            />
          ))}
        </div>
        {/* 近景星星 - 快速长拖尾 */}
        <div className="absolute inset-0 animate-[starfield_2s_linear_infinite]">
          {[...Array(15)].map((_, i) => (
            <div
              key={`star-near-${i}`}
              className="absolute h-1 w-20 rounded-full bg-gradient-to-r from-transparent via-cyan-400/40 to-white"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                transform: `rotate(${-45 + Math.random() * 10}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* 中央加载指示器 */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 太空舱门环形指示器 */}
        <div className="relative h-32 w-32">
          {/* 外环 - 缓慢旋转 */}
          <div className="absolute inset-0 animate-[spin_8s_linear_infinite] rounded-full border-2 border-white/10" />
          {/* 中环 - 反向旋转 + 断点 */}
          <div className="absolute inset-2 animate-[spin_4s_linear_infinite_reverse] rounded-full border-2 border-dashed border-cyan-500/30" />
          {/* 内环 - 快速旋转 + 渐变描边 */}
          <div className="absolute inset-4 animate-[spin_2s_linear_infinite] rounded-full">
            <svg className="h-full w-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#loading-gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="70 200"
              />
              <defs>
                <linearGradient id="loading-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgb(34, 211, 238)" />
                  <stop offset="50%" stopColor="rgb(255, 255, 255)" />
                  <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {/* 核心光点 - 呼吸效果 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 animate-[pulse_1.5s_ease-in-out_infinite] rounded-full bg-cyan-400 shadow-[0_0_20px_8px_rgba(34,211,238,0.4)]" />
          </div>
        </div>

        {/* 加载文字 */}
        <div className="flex flex-col items-center gap-3">
          <p className="font-mono text-sm tracking-[0.3em] text-cyan-400/80">
            WARP DRIVE ENGAGING
          </p>
          <div className="flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 w-1.5 animate-[bounce_1s_ease-in-out_infinite] rounded-full bg-white/60"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-zinc-500">正在进入星际导航站...</p>
        </div>
      </div>

      {/* 底部装饰线 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
    </main>
  )
}
