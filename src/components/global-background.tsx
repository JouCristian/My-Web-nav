"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// Lazy 引入：与首页保持完全一致的视觉
const DotField = dynamic(() => import("./DotField"), { ssr: false })
const Aurora = dynamic(() => import("./Aurora"), { ssr: false })

/**
 * 全局背景：DotField + Aurora。
 * 在 layout.tsx 中挂载一次。在 /login 路径下不渲染（由 Prism 接管）。
 */
export default function GlobalBackground() {
  const pathname = usePathname()

  // 登录页有自己的 Prism 背景，跳过
  if (pathname === "/login") return null

  return (
    <>
      {/* 基础底色，避免组件加载前的闪白 */}
      <div className="fixed inset-0 -z-10 bg-[#020205]" aria-hidden="true" />

      {/* 与原首页完全一致的 DotField + Aurora 包装 */}
      <div className="fixed inset-0 z-0 animate-bg-fade pointer-events-none">
        <div className="absolute inset-0 pointer-events-none opacity-60 mix-blend-screen">
          <Aurora
            colorStops={["#A855F7", "#3b82f6", "#22d3ee"]}
            blend={0.6}
            amplitude={1.2}
            speed={0.5}
          />
        </div>
        <div className="absolute inset-0 pointer-events-auto mix-blend-screen opacity-100">
          <DotField
            dotRadius={2.0}
            dotSpacing={22}
            cursorRadius={300}
            cursorForce={0.15}
            bulgeOnly={true}
            bulgeStrength={80}
            glowRadius={220}
            sparkle={false}
            waveAmplitude={0}
            gradientFrom="rgba(168, 85, 247, 1)"
            gradientTo="rgba(168, 85, 247, 0.3)"
            glowColor="rgba(168, 85, 247, 0.2)"
          />
        </div>
      </div>

      {/* 1s 渐显动画样式 */}
      <style>{`
        @keyframes fade-in-bg {
          0% { opacity: 0; filter: blur(20px); transform: scale(1.05); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        .animate-bg-fade {
          opacity: 0;
          animation: fade-in-bg 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>
    </>
  )
}
