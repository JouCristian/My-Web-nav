"use client"

import dynamic from "next/dynamic"
import { useIsMobile } from "@/hooks/use-is-mobile"

// 动态导入两个重特效组件，仅在桌面端按需加载，避免移动端浪费带宽与解析开销
const Aurora = dynamic(() => import("@/components/Aurora"), {
  ssr: false,
  loading: () => null,
})
const DotField = dynamic(() => import("@/components/DotField"), {
  ssr: false,
  loading: () => null,
})

/**
 * 首页 Hero 区背景层：
 *  - 桌面端：保留 Aurora（WebGL 极光） + DotField（Canvas 点阵）原始效果
 *  - 移动端：纯 CSS 径向渐变 + 微星点，零 GPU/CPU 开销
 */
export function HeroBackground() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div
        className="fixed inset-0 z-0 animate-bg-fade pointer-events-none"
        aria-hidden="true"
      >
        {/* 主色调：紫 → 蓝 → 黑 的多层径向渐变，匹配桌面端 Aurora 配色 */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 20%, rgba(168, 85, 247, 0.22) 0%, transparent 55%),
              radial-gradient(ellipse 70% 55% at 80% 30%, rgba(59, 130, 246, 0.18) 0%, transparent 60%),
              radial-gradient(ellipse 90% 70% at 50% 100%, rgba(34, 211, 238, 0.12) 0%, transparent 65%),
              #020205
            `,
          }}
        />
        {/* 极轻量的伪星点：纯 CSS 多层 box-shadow，不耗 GPU */}
        <div className="absolute inset-0 mobile-stars opacity-60" />
        <style jsx>{`
          .mobile-stars {
            background-image:
              radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.7) 50%, transparent 100%),
              radial-gradient(1px 1px at 70% 80%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
              radial-gradient(1px 1px at 40% 60%, rgba(168, 200, 255, 0.6) 50%, transparent 100%),
              radial-gradient(1px 1px at 90% 20%, rgba(255, 255, 255, 0.4) 50%, transparent 100%),
              radial-gradient(1.5px 1.5px at 10% 80%, rgba(255, 255, 255, 0.5) 50%, transparent 100%),
              radial-gradient(1px 1px at 55% 15%, rgba(200, 220, 255, 0.5) 50%, transparent 100%),
              radial-gradient(1px 1px at 85% 65%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
            background-size: 100% 100%;
          }
        `}</style>
      </div>
    )
  }

  // 桌面端：原有 Aurora + DotField 双层效果
  return (
    <div className="fixed inset-0 z-0 animate-bg-fade">
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
  )
}
