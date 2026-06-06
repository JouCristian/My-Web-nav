export type JouJouToolStatus = "available" | "beta" | "planned"

export interface JouJouTool {
  slug: string
  title: string
  subtitle: string
  description: string
  status: JouJouToolStatus
  tags: string[]
  href: string
  repoUrl?: string
  accent: "cyan" | "emerald" | "amber" | "violet"
}

export const joujouTools: JouJouTool[] = [
  {
    slug: "ai-image-prompt-workshop",
    title: "AI生图提示词灵感工坊",
    subtitle: "精选视觉提示词的高级浏览与复制工作台",
    description:
      "以 Apple-like 深色画廊呈现高质量通用生图提示词，支持分类浏览、展开预览和一键复制，适合快速启动视觉创作。",
    status: "available",
    tags: ["AI 绘图", "Prompt Gallery", "通用生图", "视觉灵感"],
    href: "/joujou-tools/ai-image-prompt-workshop",
    accent: "emerald",
  },
  {
    slug: "csp-review-doc-generator",
    title: "算法题解文档可视化生成器",
    subtitle: "从算法题对话到题解复盘文档的可视化工作台",
    description:
      "用输入模板和 AI 补全指令整理题目、思路、错误分析和 AC 代码，再在网页工作台里预览并导出 Word 题解复盘文档。",
    status: "beta",
    tags: ["算法题", "题解复盘", "文档生成", "多语言"],
    href: "/joujou-tools/csp-review-doc-generator",
    accent: "cyan",
  },
]

export function getJouJouTool(slug: string) {
  return joujouTools.find((tool) => tool.slug === slug)
}
