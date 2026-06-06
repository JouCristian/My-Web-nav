"use client"

// 搜索框聚焦流光边框（ReactBits BorderGlow 风格）：
// - 底层：完整 360° 静态发光底色，填满边框不显空
// - 上层：青色锥形亮光绕边框旋转扫动
export function SearchFlowBorder() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="search-glow-ring search-glow-base" />
      <div className="search-glow-ring search-glow-sweep" />
    </div>
  )
}
