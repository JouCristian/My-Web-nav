"use client"

import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// Lazy 引入：与首页保持完全一致的视觉
const DotField = dynamic(() => import("./dot-field"), { ssr: false })
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
      <div className="fixed inset-0 z-0 bg-[#020205]" aria-hidden="true" />

      {/* 静态点阵层（DotField 内部已优化为 will-change/低开销 canvas） */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <DotField />
      </div>

      {/* 顶部光带 */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-90" aria-hidden="true">
        <Aurora colorStops={["#5227FF", "#7cff67", "#5227FF"]} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>
    </>
  )
}
