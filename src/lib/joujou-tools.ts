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
