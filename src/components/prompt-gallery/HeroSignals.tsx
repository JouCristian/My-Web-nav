"use client"

import { motion } from "framer-motion"
import { CopyCheck, MousePointerClick, Search, type LucideIcon } from "lucide-react"
import { gridContainerVariants, gridItemVariants } from "@/components/prompt-gallery/motion"
import { SearchFlowBorder } from "@/components/prompt-gallery/SearchFlowBorder"

type Signal = {
  icon: LucideIcon
  step: string
  title: string
  caption: string
  cardClassName: string
  iconClassName: string
  hue: number
}

const heroSignals: Signal[] = [
  {
    icon: Search,
    step: "01",
    title: "筛选标签",
    caption: "按场景、风格和关键词锁定灵感方向",
    cardClassName: "border-cyan-200/18 bg-cyan-200/[0.075] text-cyan-50",
    iconClassName: "bg-cyan-100/10 text-cyan-100",
    hue: 190,
  },
  {
    icon: MousePointerClick,
    step: "02",
    title: "查看详情",
    caption: "在右侧工作区预览完整 prompt 和建议",
    cardClassName: "border-violet-200/18 bg-violet-300/[0.07] text-violet-50",
    iconClassName: "bg-violet-100/10 text-violet-100",
    hue: 265,
  },
  {
    icon: CopyCheck,
    step: "03",
    title: "复制生成",
    caption: "一键交给任意 AI 图像工具继续创作",
    cardClassName: "border-emerald-200/18 bg-emerald-300/[0.07] text-emerald-50",
    iconClassName: "bg-emerald-100/10 text-emerald-100",
    hue: 155,
  },
]

export function HeroSignals() {
  return (
    <motion.div
      className="hidden w-full min-w-0 grid-cols-3 gap-3 lg:grid"
      variants={gridContainerVariants}
      initial="hidden"
      animate="show"
    >
      {heroSignals.map((item, index) => {
        const Icon = item.icon

        return (
          <motion.div
            key={item.step}
            variants={gridItemVariants}
            className={`group relative min-h-[172px] min-w-0 overflow-hidden rounded-[1.35rem] border p-4 shadow-[0_18px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl ${item.cardClassName}`}
          >
            {/* ReactBits 锥形流光描边：纯 CSS 圆角，永远贴合卡片轮廓；三张卡用不同色相并错开相位 */}
            <SearchFlowBorder radius="1.35rem" hue={item.hue} duration="5s" delay={`${index * -1.4}s`} />

            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-70" />
            <div className="relative flex items-start justify-between gap-3">
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${item.iconClassName}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="rounded-full border border-white/10 bg-black/15 px-2 py-1 font-mono text-[10px] text-white/60 transition-colors group-hover:text-white/85">
                {item.step}
              </span>
            </div>
            <div className="relative mt-6 min-w-0">
              <div className="text-sm font-black leading-tight text-white/90">{item.title}</div>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{item.caption}</p>
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
