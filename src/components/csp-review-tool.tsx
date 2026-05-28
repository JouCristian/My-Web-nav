"use client"

import type { ComponentType, CSSProperties } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useSpring, useTransform, type MotionValue } from "framer-motion"
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Clipboard,
  Code2,
  Download,
  Eye,
  FileCode2,
  FileText,
  Gauge,
  LayoutList,
  RefreshCw,
  Trash2,
  Wand2,
} from "lucide-react"
import AnimatedContent from "@/components/animated-content"

const SECTION_ORDER = [
  "标题",
  "副标题",
  "题目背景",
  "完整题目要求",
  "输入格式",
  "输出格式",
  "样例1输入",
  "样例1输出",
  "样例1解释",
  "样例2输入",
  "样例2输出",
  "样例2解释",
  "子任务与限制条件",
  "题目提示与关键区别",
  "我的完整思考流程复盘",
  "原始代码",
  "AC代码",
  "错误分析",
  "优化过程",
  "可进一步优化的小细节",
  "复杂度分析",
  "题解关键词",
  "总结",
]

const REQUIRED_SECTIONS = ["标题", "题目背景", "完整题目要求", "输入格式", "输出格式", "AC代码", "复杂度分析", "总结"]

const TEMPLATE_TEXT = `【标题】
CSP真题：题名——完整题解复盘（C++）

【副标题】
关键词1；关键词2；关键词3；关键词4

【题目背景】
这里写 2～4 个自然段。注意不要故意一行一句，尽量写成正常段落，这样 Word 会更紧凑。

如果需要插图，请把动态图块放在它应该出现的位置。图块内容由 AI 根据题目填写，不是脚本写死的。图块是通用的，不只支持矩阵题。

通用流程图示例：
[[图:flow]]
标题：解题流程示意
说明：展示从读题到 AC 的核心路径。
步骤：读懂题意 -> 建立模型 -> 写出代码 -> 发现错误 -> 优化 AC
[[/图]]

通用对比图示例：
[[图:compare]]
标题：错误思路与正确思路对比
说明：用于展示两种方案之间的差异。
左标题：原始做法
左内容：每次操作都真实模拟，复杂度较高。
右标题：优化做法
右内容：维护核心状态，只在必要时更新数据。
[[/图]]

通用映射图示例：
[[图:map]]
标题：状态映射示意
说明：用于展示下标、状态、数据结构之间的对应关系。
输入：二维位置 (i,j)
输出：一维下标 k
公式：k = i × col + j
[[/图]]

【完整题目要求】
这里用正常段落说明题目要求。可以配合项目符号，但不要每句话都单独换行。

• 要求一：……
• 要求二：……
• 要求三：……

需要表格时使用 Markdown 表格：

| 操作类型 | 输入形式 | 含义 |
|---|---|---|
| 1 | 1 p q | 将当前矩阵重塑为 p×q |
| 2 | 2 0 0 | 将当前矩阵转置 |
| 3 | 3 i j | 查询当前矩阵 i 行 j 列元素 |

【输入格式】
这里写输入格式。尽量写成自然段，必要时再用代码块或单独行展示格式。

【输出格式】
这里写输出格式。说明输出几行、每行输出什么、空格要求等。

【样例1输入】
在这里填写样例 1 输入。

【样例1输出】
在这里填写样例 1 输出。

【样例1解释】
这里写样例 1 解释，尽量写成完整自然段，不要一行一句。

【样例2输入】
没有样例 2 可删除本节。

【样例2输出】
没有样例 2 可删除本节。

【样例2解释】
没有样例 2 可删除本节。

【子任务与限制条件】
这里写数据范围。建议使用项目符号。

• ……
• ……
• ……

【题目提示与关键区别】
这里写题目提示、易混点、关键区别。内容保持精炼。

如果这道题适合画图，请使用通用图块，例如 flow、compare、map。不要把所有题都写成矩阵图，图块内容应由题目本身决定。

【我的完整思考流程复盘】
阶段 1：这里写第一阶段思路。建议每个阶段 1～2 个自然段，不要一行一句。

阶段 2：这里写第二阶段思路。可以写错误原因、发现的问题、为什么需要优化。

阶段 3：这里写最终优化思路。

【原始代码】
这里可以放你和 AI 对话过程中写过的多版代码。建议按“版本 1 / 版本 2 / 版本 3”整理，每一版都用标准 Markdown 代码块包起来，否则代码高亮无法生效。

版本 1：最初思路代码
\`\`\`cpp
#include<iostream>
using namespace std;

int main() {
    return 0;
}
\`\`\`

版本 2：中间修改代码
\`\`\`cpp
#include<iostream>
using namespace std;

int main() {
    return 0;
}
\`\`\`

【AC代码】
这里放最终通过评测的 AC 代码，只放最终版，不再混入中间错误版本。必须使用标准 Markdown 代码块。

\`\`\`cpp
#include<iostream>
using namespace std;

int main() {
    return 0;
}
\`\`\`

【错误分析】
这里写错误原因。脚本会自动做成浅色提示框，不需要写太长。注意：错误代码本体请放在【原始代码】里，AC 代码请放在【AC代码】里。

【优化过程】
这里写从错误版本到 AC 版本的优化过程。脚本会自动做成浅色提示框。

【可进一步优化的小细节】
这里写可以更稳、更优雅的写法。没有就删除本节。

【复杂度分析】
| 操作 | 复杂度 | 原因 |
|---|---|---|
| 读取输入 | O(N) | 需要读取全部元素 |
| 输出结果 | O(N) | 每个元素输出一次 |
| 总空间复杂度 | O(N) | 使用一维数组保存元素 |

【题解关键词】
CSP真题；模拟题；vector；一维数组；二维数组；下标映射；输出格式控制

【总结】
这里写最终总结。建议 1～2 个自然段，重点写这题真正考察什么，以及以后遇到类似题怎么迁移。`

const AI_PROMPT = `请严格按照我提供的 csp_input_template 模板生成可粘贴到网页工作台的复盘内容。

要求：
1. 只输出纯文本，不要整体包 Markdown 代码块。
2. 除【原始代码】和【AC代码】外，不要使用 \`\`\`cpp 或 \`\`\`text 代码块。
3. 【样例1输入】【样例1输出】【样例2输入】【样例2输出】里面只放原始输入输出内容，不要加反引号。
4. 题目解释、思考流程、错误分析、优化过程都写成完整自然段，不要一行一句。
5. 普通公式、变量、关键词直接写在自然段里，不要单独代码块。
6. 每个阶段控制在 1～2 个自然段，不要拆得太碎。
7. 图块最多放 1～2 个，不要过多。
8. 标题格式写成：题名——完整题解复盘（C++）。`

const INPUT_PLACEHOLDER = `这里先不用手动写题解，建议按下面流程来：

1. 点击右上角「使用模板」，先看清楚系统需要的章节格式。
2. 点击「复制 AI 补全指令」，把指令发到你自己的 AI 对话窗口。
3. 同时把下载的 csp_input_template_v13.txt、题目原文、你的思考过程、错误代码和 AC 代码一起发给 AI。
4. 要求 AI 只输出纯文本，不要整体包 Markdown 代码块。
5. 把 AI 生成的完整内容粘贴回这里，右侧会自动预览章节、代码块、图块和复杂度表格。
6. 确认内容没问题后，点击「导出 Word 文档」生成可继续修改的复盘草稿。

提示：如果最终需要 PDF，请先导出 Word，再在 Word 或 WPS 里使用 PDF 工具箱导出。这样版式更稳定，也方便你先调整 Word 草稿。`

interface ParsedSection {
  name: string
  content: string
  headerStart: number
  contentStart: number
}

interface FigureBlock {
  kind: string
  data: Record<string, string>
}

const workflowSteps = [
  {
    title: "准备题目材料",
    text: "在自己的 AI 对话窗口里放入题目、解题过程、错误代码、AC 代码和必要的复盘说明。",
  },
  {
    title: "复制模板与指令",
    text: "下载输入模板，并复制网页里的 AI 补全指令，一起发送给 AI，让它按固定章节生成完整内容。",
  },
  {
    title: "粘贴到工作台",
    text: "把 AI 生成的纯文本粘贴到左侧输入区，右侧会实时识别章节、图块、代码块和复杂度表格。",
  },
  {
    title: "导出复盘文档",
    text: "确认预览正常后导出 Word 草稿；如需 PDF，请在 Word/WPS 中使用 PDF 工具箱导出。",
  },
]

function parseSections(text: string): ParsedSection[] {
  const pattern = /^【(.+?)】\s*$/gm
  const matches = [...text.matchAll(pattern)]

  if (matches.length === 0) return []

  return matches.map((match, index) => {
    const name = match[1].trim()
    const headerStart = match.index ?? 0
    const start = headerStart + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length
    return { name, content: text.slice(start, end).trim(), headerStart, contentStart: start }
  })
}

function getCodeBlocks(text: string) {
  return [...text.matchAll(/```[\w+-]*\n([\s\S]*?)```/g)].map((match) => match[1])
}

function getFigures(text: string): FigureBlock[] {
  return [...text.matchAll(/\[\[图:([^\]]+)\]\]([\s\S]*?)\[\[\/图\]\]/g)].map((match) => {
    const data: Record<string, string> = {}
    match[2]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const [key, ...rest] = line.split(/[：:]/)
        if (key && rest.length) data[key.trim()] = rest.join("：").trim()
      })

    return { kind: match[1].trim(), data }
  })
}

function hasMarkdownTable(text: string) {
  const lines = text.split(/\r?\n/)
  return lines.some((line, index) => line.trim().startsWith("|") && lines[index + 1]?.match(/^\s*\|[\s:-]+\|/))
}

function downloadText(filename: string, content: string, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function filenameFromDisposition(disposition: string | null, fallback: string) {
  if (!disposition) return fallback
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/)?.[1]
  if (encoded) return decodeURIComponent(encoded)
  const plain = disposition.match(/filename="?([^"]+)"?/)?.[1]
  return plain ? decodeURIComponent(plain) : fallback
}

function SectionPreview({
  section,
  active = false,
  onSelect,
}: {
  section: ParsedSection
  active?: boolean
  onSelect?: (section: ParsedSection) => void
}) {
  const figures = getFigures(section.content)
  const codeBlocks = getCodeBlocks(section.content)
  const contentWithoutSpecialBlocks = section.content
    .replace(/\[\[图:[^\]]+\]\][\s\S]*?\[\[\/图\]\]/g, "")
    .replace(/```[\w+-]*\n[\s\S]*?```/g, "")
    .trim()

  return (
    <motion.article
      layout
      onClick={() => onSelect?.(section)}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 340, damping: 26 }}
      className={`group min-w-0 cursor-pointer rounded-2xl border p-4 transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] sm:p-5 ${
        active
          ? "border-cyan-300/45 bg-cyan-400/[0.075] shadow-[0_0_34px_rgba(34,211,238,0.12)]"
          : "border-white/10 bg-black/25 hover:border-cyan-400/25 hover:bg-cyan-400/[0.04]"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <h3 className="min-w-0 break-words text-base font-bold tracking-wide text-white sm:text-lg">{section.name}</h3>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-zinc-500">
          {section.content.length} chars
        </span>
      </div>

      {contentWithoutSpecialBlocks ? (
        <div className="space-y-3 break-words text-sm leading-relaxed text-zinc-300">
          {contentWithoutSpecialBlocks.split(/\n{2,}/).map((paragraph, index) => {
            if (paragraph.trim().startsWith("|")) {
              return (
                <pre key={index} className="tool-scrollbar overflow-x-auto rounded-xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3 text-xs text-cyan-100">
                  {paragraph}
                </pre>
              )
            }

            return <p key={index}>{paragraph}</p>
          })}
        </div>
      ) : null}

      {figures.length > 0 && (
        <div className="mt-4 grid gap-3">
          {figures.map((figure, index) => (
            <div key={`${figure.kind}-${index}`} className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-200">
                <LayoutList className="h-4 w-4" />
                {figure.data["标题"] || `${figure.kind} 图块`}
              </div>
              {figure.data["说明"] && <p className="mb-3 text-xs leading-relaxed text-emerald-100/70">{figure.data["说明"]}</p>}
              {figure.data["步骤"] ? (
                <div className="flex flex-wrap items-center gap-2">
                  {figure.data["步骤"].split(/\s*(?:->|→|，|;|；)\s*/).map((step, stepIndex) => (
                    <span key={`${step}-${stepIndex}`} className="rounded-xl border border-emerald-500/20 bg-black/25 px-3 py-2 text-xs text-emerald-100">
                      {step}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="grid gap-2 text-xs text-emerald-100/75">
                  {Object.entries(figure.data)
                    .filter(([key]) => key !== "标题" && key !== "说明")
                    .map(([key, value]) => (
                      <div key={key} className="grid gap-1 rounded-xl bg-black/20 p-3 sm:grid-cols-[90px_1fr]">
                        <span className="font-bold text-emerald-200">{key}</span>
                        <span>{value}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {codeBlocks.length > 0 && (
        <div className="mt-4 grid gap-3">
          {codeBlocks.map((code, index) => (
            <pre key={index} className="tool-scrollbar overflow-x-auto rounded-2xl border border-white/10 bg-[#05070d] p-4 text-xs leading-relaxed text-zinc-200">
              <code>{code}</code>
            </pre>
          ))}
        </div>
      )}
    </motion.article>
  )
}

export function CSPReviewTool() {
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState<"prompt" | null>(null)
  const [exporting, setExporting] = useState<"docx" | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const [exportSuccess, setExportSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<"template" | "clear" | null>(null)
  const [copyToastVisible, setCopyToastVisible] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const scanTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const copyToastTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  const sections = useMemo(() => parseSections(input), [input])
  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.name, section.content])), [sections])
  const missingSections = REQUIRED_SECTIONS.filter((name) => !sectionMap.get(name)?.trim())
  const unknownSections = sections.filter((section) => !SECTION_ORDER.includes(section.name))
  const orderedSections = [
    ...SECTION_ORDER.map((name) => sections.find((section) => section.name === name)).filter(Boolean),
    ...unknownSections,
  ] as ParsedSection[]

  const stats = {
    sections: sections.length,
    codeBlocks: getCodeBlocks(input).length,
    figures: getFigures(input).length,
    tables: hasMarkdownTable(input) ? 1 : 0,
  }

  const title = sectionMap.get("标题") || "等待粘贴 AI 内容"
  const subtitle = sectionMap.get("副标题") || "先使用模板和 AI 补全指令生成规范内容，再粘贴到左侧工作台。"
  const canExport = input.trim().length > 0 && missingSections.length === 0 && !isScanning

  const updateInputContent = (nextInput: string) => {
    setInput(nextInput)
    setExportSuccess(false)

    if (scanTimerRef.current) {
      window.clearTimeout(scanTimerRef.current)
    }

    if (!nextInput.trim()) {
      setIsScanning(false)
      return
    }

    setIsScanning(true)
    scanTimerRef.current = window.setTimeout(() => setIsScanning(false), 720)
  }

  const copyText = async (kind: "prompt", text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    setCopyToastVisible(true)
    if (copyToastTimerRef.current) {
      window.clearTimeout(copyToastTimerRef.current)
    }
    copyToastTimerRef.current = window.setTimeout(() => setCopyToastVisible(false), 1200)
    window.setTimeout(() => setCopied(null), 1800)
  }

  const showActionFeedback = (kind: "template" | "clear") => {
    setActionFeedback(kind)
    window.setTimeout(() => {
      setActionFeedback((current) => (current === kind ? null : current))
    }, 1200)
  }

  const keepPageScrollStable = (action: () => void) => {
    const pageX = window.scrollX
    const pageY = window.scrollY

    action()

    window.requestAnimationFrame(() => {
      window.scrollTo(pageX, pageY)
    })
  }

  const selectInputSection = (section: ParsedSection) => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.focus({ preventScroll: true })
    keepPageScrollStable(() => {
      textarea.setSelectionRange(section.headerStart, Math.min(input.length, section.contentStart + section.content.length))
    })

    const beforeSection = input.slice(0, section.headerStart)
    const lineHeight = 22
    const approximateScrollTop = Math.max(0, beforeSection.split(/\r?\n/).length * lineHeight - textarea.clientHeight * 0.22)
    textarea.scrollTo({ top: approximateScrollTop, behavior: "smooth" })
  }

  const selectPreviewSection = (section: ParsedSection) => {
    setActiveSection(section.name)
    selectInputSection(section)

    const target = sectionRefs.current[section.name]
    const container = previewScrollRef.current
    if (target && container) {
      const targetTop = target.offsetTop - container.offsetTop - 14
      container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" })
    }
  }

  const exportGeneratedDocument = async () => {
    setExporting("docx")
    setExportError(null)
    setExportSuccess(false)

    try {
      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, format: "docx" }),
      }
      const endpoints = [
        "/api/joujou-csp-export",
        "/api/joujou-tools/csp-review-doc-generator/export",
      ]
      let response: Response | null = null
      let lastError: Error | null = null

      for (const endpoint of endpoints) {
        const current = await fetch(endpoint, request)

        if (current.status === 404 && endpoint !== endpoints[endpoints.length - 1]) {
          continue
        }

        if (current.ok) {
          response = current
          break
        }

        const data = (await current.json().catch(() => null)) as { error?: string; details?: string } | null
        lastError = new Error(data?.error || "文档生成失败")
        if (current.status !== 404) {
          break
        }
      }

      if (!response) {
        throw lastError || new Error("文档生成失败")
      }

      const blob = await response.blob()
      const filename = filenameFromDisposition(
        response.headers.get("Content-Disposition"),
        `${title.replace(/[\\/:*?"<>|]/g, "_")}.docx`,
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
      setExportSuccess(true)
    } catch (error) {
      setExportError(error instanceof Error ? error.message : "文档生成失败")
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <style>{`
        .tool-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(34, 211, 238, 0.35) rgba(255, 255, 255, 0.04);
        }
        .tool-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .tool-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.04);
          border-radius: 999px;
        }
        .tool-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(34, 211, 238, 0.55), rgba(16, 185, 129, 0.35));
          border-radius: 999px;
          border: 2px solid rgba(5, 7, 13, 0.9);
        }
        .tool-action-button {
          transition:
            transform 0.42s cubic-bezier(0.32, 0.72, 0, 1),
            border-color 0.42s cubic-bezier(0.32, 0.72, 0, 1),
            background-color 0.42s cubic-bezier(0.32, 0.72, 0, 1),
            box-shadow 0.42s cubic-bezier(0.32, 0.72, 0, 1),
            color 0.42s cubic-bezier(0.32, 0.72, 0, 1);
        }
        .tool-action-button:hover {
          transform: translateY(-2px);
        }
        .tool-action-button:active {
          transform: translateY(0) scale(0.98);
        }
        .tool-action-button:disabled {
          transform: none;
        }
      `}</style>

      <AnimatedContent distance={70} duration={0.9} ease="power3.out" threshold={0.2}>
      <section className="rounded-[2rem] border border-white/10 bg-[#05070d]/85 p-4 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <BookOpenCheck className="h-5 w-5 text-cyan-300" />
          <h2 className="text-2xl font-black text-white">使用流程</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-white/10 bg-black/25 p-4">
              <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">Step {index + 1}</div>
              <div className="text-sm font-bold text-white">{step.title}</div>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">{step.text}</p>
            </div>
          ))}
        </div>
      </section>
      </AnimatedContent>

      <div className="grid min-w-0 items-stretch gap-6 xl:h-[1280px] xl:grid-cols-[0.95fr_1.05fr] xl:overflow-hidden">
        <AnimatedContent className="h-full min-h-0 min-w-0" distance={90} direction="horizontal" reverse duration={0.9} ease="power3.out" threshold={0.2} delay={0.05}>
        <section className="flex h-full min-h-[720px] flex-col rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-4 shadow-[0_20px_90px_rgba(0,0,0,0.35)] sm:min-h-[900px] sm:p-6 xl:min-h-0 xl:overflow-hidden">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                <FileText className="h-4 w-4" />
                AI Content
              </div>
              <h2 className="text-2xl font-black tracking-wide text-white">输入工作台</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                把 AI 根据模板补全后的纯文本粘贴到这里，右侧会实时预览和检查。
              </p>
            </div>
            <div className="grid w-full grid-cols-2 gap-2 sm:w-[420px]">
              <ActionButton
                icon={RefreshCw}
                active={actionFeedback === "template"}
                iconEffect="template"
                label="使用模板"
                onClick={() => {
                  updateInputContent(TEMPLATE_TEXT)
                  setActiveSection(null)
                  showActionFeedback("template")
                }}
                size="sm"
                tone="neutral"
              />
              <ActionButton
                icon={Trash2}
                active={actionFeedback === "clear"}
                iconEffect="clear"
                label="清空内容"
                onClick={() => {
                  updateInputContent("")
                  setActiveSection(null)
                  showActionFeedback("clear")
                }}
                disabled={input.length === 0}
                size="sm"
                tone="danger"
              />
              <div className="relative col-span-2">
                <ActionButton
                  icon={Clipboard}
                  active={copied === "prompt"}
                  iconEffect="copy"
                  label={copied === "prompt" ? "已复制" : "复制 AI 补全指令"}
                  onClick={() => copyText("prompt", AI_PROMPT)}
                  size="sm"
                  tone="cyan"
                  enableLayoutAnimation
                  className="w-full"
                />
                <AnimatePresence>
                  {copyToastVisible ? <CopyPromptToast /> : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {
              updateInputContent(event.target.value)
              setActiveSection(null)
            }}
            spellCheck={false}
            className="tool-scrollbar min-h-[520px] w-full flex-1 resize-none rounded-2xl border border-white/10 bg-black/45 p-4 font-mono text-sm leading-relaxed text-zinc-200 outline-none transition placeholder:whitespace-pre-line placeholder:text-zinc-500 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 sm:min-h-[680px] xl:min-h-0"
            placeholder={INPUT_PLACEHOLDER}
          />
        </section>
        </AnimatedContent>

        <AnimatedContent className="h-full min-h-0 min-w-0" distance={90} direction="horizontal" duration={0.9} ease="power3.out" threshold={0.2} delay={0.12}>
        <section className="flex h-full min-h-[860px] min-w-0 max-w-full flex-col gap-5 overflow-hidden sm:min-h-[1040px] xl:min-h-0">
          <div className="min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] sm:p-6">
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                    <Eye className="h-3.5 w-3.5" />
                    Live Preview
                  </div>
                  <h1 className="break-words text-2xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
                  <p className="mt-3 break-words text-sm leading-relaxed text-zinc-500">{subtitle}</p>
                </div>
              </div>

              <div className="mt-6 grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-[repeat(4,minmax(0,1fr))]">
                <StatCard label="章节" value={stats.sections} icon={LayoutList} tone="text-cyan-300" />
                <StatCard label="代码块" value={stats.codeBlocks} icon={Code2} tone="text-emerald-300" />
                <StatCard label="图块" value={stats.figures} icon={Wand2} tone="text-amber-300" />
                <StatCard label="表格" value={stats.tables} icon={Gauge} tone="text-violet-300" />
              </div>
            </motion.div>

            <ValidationStatusCard
              visible={input.trim().length > 0}
              isScanning={isScanning}
              isComplete={missingSections.length === 0}
              missingSections={missingSections}
            />

            <AnimatePresence initial={false}>
              {orderedSections.length > 0 ? (
                <motion.div
                  key="chapter-nav"
                  initial={{ maxHeight: 0, marginTop: 0, opacity: 0, filter: "blur(8px)" }}
                  animate={{ maxHeight: 112, marginTop: 20, opacity: 1, filter: "blur(0px)" }}
                  exit={{
                    maxHeight: 0,
                    marginTop: 0,
                    opacity: 0,
                    filter: "blur(8px)",
                    transition: {
                      maxHeight: { type: "spring", stiffness: 155, damping: 24, mass: 1, delay: 0.16 },
                      marginTop: { type: "spring", stiffness: 155, damping: 24, mass: 1, delay: 0.16 },
                      opacity: { duration: 0.34, ease: [0.32, 0.72, 0, 1] },
                      filter: { duration: 0.34, ease: [0.32, 0.72, 0, 1] },
                    },
                  }}
                  transition={{
                    maxHeight: { type: "spring", stiffness: 135, damping: 23, mass: 1.05 },
                    marginTop: { type: "spring", stiffness: 145, damping: 23, mass: 1 },
                    opacity: { duration: 0.38, delay: 0.16, ease: [0.32, 0.72, 0, 1] },
                    filter: { duration: 0.4, delay: 0.14, ease: [0.32, 0.72, 0, 1] },
                  }}
                  className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                >
                  <div className="p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">章节导航</span>
                      <span className="text-[11px] text-zinc-600">点击章节可联动定位</span>
                    </div>
                    <div className="tool-scrollbar flex min-w-0 max-w-full gap-2 overflow-x-auto overscroll-x-contain px-0.5 pb-1.5 pt-1.5">
                      {orderedSections.map((section) => {
                        const active = activeSection === section.name

                        return (
                          <button
                            key={section.name}
                            type="button"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectPreviewSection(section)}
                            className={`group/nav relative shrink-0 overflow-hidden rounded-full border px-3 py-2 text-xs font-bold transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 ${
                              active
                                ? "border-cyan-300/45 bg-cyan-400/15 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.12)]"
                                : "border-white/10 bg-white/[0.035] text-zinc-400 hover:border-cyan-400/25 hover:bg-cyan-400/[0.08] hover:text-cyan-100"
                            }`}
                          >
                            <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[140%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-cyan-100/12 to-transparent transition-transform duration-700 ease-out group-hover/nav:translate-x-[260%]" />
                            <span className="relative">{section.name}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <div className="min-w-0 max-w-full overflow-hidden rounded-[2rem] border border-emerald-500/25 bg-[#06150f]/85 p-5 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
            <div className="mb-5 flex items-center gap-3">
              <Download className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-black text-white">导出状态</h2>
            </div>

            <div className="grid min-w-0 items-stretch gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <AnimatePresence mode="wait" initial={false}>
                  <ExportState
                    isScanning={isScanning}
                    isExporting={exporting === "docx"}
                    isReady={canExport}
                    isSuccess={exportSuccess}
                    error={exportError}
                    missingCount={missingSections.length}
                    hasInput={input.trim().length > 0}
                  />
                </AnimatePresence>
              </div>

              <div className="grid min-w-0 grid-rows-2 gap-3">
                <ActionButton
                  icon={FileCode2}
                  label="下载模板"
                  onClick={() => downloadText("csp_input_template_v13.txt", TEMPLATE_TEXT)}
                  tone="emerald"
                  className="h-full w-full"
                />
                <ActionButton
                  icon={FileText}
                  active={exporting === "docx"}
                  iconEffect={exporting === "docx" ? "loading" : undefined}
                  label="导出 Word 文档"
                  onClick={exportGeneratedDocument}
                  disabled={exporting !== null || !canExport}
                  tone="emerald"
                  hideLabel={exporting === "docx"}
                  enableLayoutAnimation
                  className="h-full w-full"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-emerald-500/20 bg-black/35 px-4 py-3 text-xs leading-relaxed text-emerald-50/75">
                网页端会调用原始 Python 生成器，根据左侧内容输出可继续编辑的 Word 草稿。
              </div>
              <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.16] px-4 py-3 text-xs leading-relaxed text-cyan-50/80">
                如需生成 PDF，请先导出 Word 文档，再在 Word 或 WPS 中使用 PDF 工具箱导出，版式更稳定。
              </div>
            </div>
          </div>

          <div ref={previewScrollRef} className="tool-scrollbar min-h-[520px] min-w-0 max-w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-contain rounded-[2rem] border border-white/10 bg-[#05070d]/80 p-4 sm:min-h-[640px] sm:p-5 xl:min-h-0">
            <div className="grid gap-4">
              {orderedSections.length > 0 ? (
                orderedSections.map((section) => (
                  <div
                    key={section.name}
                    ref={(node) => {
                      sectionRefs.current[section.name] = node
                    }}
                  >
                    <SectionPreview
                      section={section}
                      active={activeSection === section.name}
                      onSelect={selectPreviewSection}
                    />
                  </div>
                ))
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
                  <DocumentTraceIllustration />
                  <p className="mt-4 max-w-xs px-4 text-sm leading-relaxed text-zinc-500">
                    还没有识别到【章节】格式。请先点击左侧「使用模板」查看格式，或把 AI 生成的纯文本粘贴进输入工作台。
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
        </AnimatedContent>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  active = false,
  iconEffect,
  label,
  hideLabel = false,
  enableLayoutAnimation = false,
  onClick,
  disabled = false,
  tone = "emerald",
  size = "md",
  className = "",
}: {
  icon: ComponentType<{ className?: string }>
  active?: boolean
  iconEffect?: "copy" | "template" | "clear" | "loading"
  label: string
  hideLabel?: boolean
  enableLayoutAnimation?: boolean
  onClick: () => void | Promise<void>
  disabled?: boolean
  tone?: "neutral" | "cyan" | "emerald" | "danger"
  size?: "sm" | "md"
  className?: string
}) {
  const toneClass = {
    neutral:
      "border-white/10 bg-white/[0.045] text-zinc-300 shadow-[0_0_0_rgba(255,255,255,0)] hover:border-white/25 hover:bg-white/[0.075] hover:text-white hover:shadow-[0_14px_34px_rgba(255,255,255,0.045)]",
    cyan:
      "border-cyan-400/25 bg-cyan-400/10 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.08)] hover:border-cyan-300/45 hover:bg-cyan-400/[0.16] hover:text-cyan-50 hover:shadow-[0_16px_38px_rgba(34,211,238,0.14)]",
    emerald:
      "border-emerald-400/20 bg-white/[0.04] text-zinc-200 shadow-[0_0_0_rgba(16,185,129,0)] hover:border-emerald-400/35 hover:bg-emerald-400/10 hover:text-emerald-50 hover:shadow-[0_16px_38px_rgba(16,185,129,0.12)]",
    danger:
      "border-rose-400/25 bg-[radial-gradient(circle_at_20%_0%,rgba(251,113,133,0.18),transparent_38%),rgba(127,29,29,0.16)] text-rose-100 shadow-[0_0_28px_rgba(244,63,94,0.10)] hover:border-rose-300/50 hover:bg-[radial-gradient(circle_at_20%_0%,rgba(251,113,133,0.26),transparent_40%),rgba(127,29,29,0.22)] hover:text-white hover:shadow-[0_18px_42px_rgba(244,63,94,0.18)]",
  }[tone]
  const shineClass = tone === "danger" ? "via-rose-100/18" : "via-cyan-100/14"
  const sizeClass = size === "sm" ? "min-h-10 px-3 py-2" : "min-h-11 px-4 py-3"

  return (
    <motion.button
      layout={enableLayoutAnimation}
      type="button"
      onClick={onClick}
      disabled={disabled}
      transition={{ layout: { type: "spring", stiffness: 420, damping: 30, mass: 0.75 } }}
      className={`tool-action-button group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45 ${sizeClass} ${toneClass} ${className}`}
    >
      <span className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[140%] skew-x-[-18deg] bg-gradient-to-r from-transparent ${shineClass} to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[260%] group-disabled:translate-x-[-140%]`} />
      <motion.span
        layout={enableLayoutAnimation}
        className="relative flex h-4 w-4 items-center justify-center transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-hover:scale-110 group-disabled:translate-y-0 group-disabled:scale-100"
        transition={{ layout: { type: "spring", stiffness: 520, damping: 32, mass: 0.7 } }}
      >
        {active ? (
          <motion.span
            aria-hidden="true"
            className="absolute inset-[-8px] rounded-full border border-cyan-200/20 bg-cyan-200/10"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1.45, opacity: 0 }}
            transition={{ duration: 0.82, ease: [0.32, 0.72, 0, 1] }}
          />
        ) : null}
        {iconEffect === "copy" ? <CopyMorphIcon active={active} /> : null}
        {iconEffect === "template" ? <TemplateMorphIcon active={active} /> : null}
        {iconEffect === "clear" ? <ClearMorphIcon active={active} /> : null}
        {iconEffect === "loading" ? <LoadingLoopIcon active={active} /> : null}
        {!iconEffect ? <Icon className="h-4 w-4" /> : null}
      </motion.span>
      <AnimatePresence mode="popLayout" initial={false}>
        {!hideLabel ? (
          <motion.span
            key={label}
            layout={enableLayoutAnimation}
            className="relative whitespace-nowrap"
            initial={{ opacity: 0, x: active ? 7 : -7, filter: "blur(6px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: active ? -7 : 7, filter: "blur(6px)" }}
            transition={{
              opacity: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
              filter: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
              x: { type: "spring", stiffness: 430, damping: 30, mass: 0.75 },
              layout: { type: "spring", stiffness: 430, damping: 30, mass: 0.75 },
            }}
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.button>
  )
}

function CopyPromptToast() {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-full z-20 mt-3 h-[72px] w-[360px] max-w-[calc(100vw-3rem)] -translate-x-1/2"
      initial={{ opacity: 0, y: 12, scale: 0.7, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, scale: 0.82, filter: "blur(9px)" }}
      transition={{
        opacity: { type: "spring", stiffness: 420, damping: 22, mass: 0.6 },
        y: { type: "spring", stiffness: 430, damping: 20, mass: 0.6 },
        scale: { type: "spring", stiffness: 460, damping: 19, mass: 0.6 },
        filter: { type: "spring", stiffness: 380, damping: 24, mass: 0.6 },
      }}
    >
      <div className="absolute inset-x-8 bottom-1 h-8 rounded-full bg-black/35 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 360 72" fill="none" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="copy-toast-glass" x1="52" y1="8" x2="309" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.16)" />
            <stop offset="0.42" stopColor="rgba(20,38,44,0.82)" />
            <stop offset="1" stopColor="rgba(7,14,18,0.9)" />
          </linearGradient>
          <linearGradient id="copy-toast-edge" x1="54" y1="7" x2="315" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.38)" />
            <stop offset="0.4" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.24)" />
          </linearGradient>
          <radialGradient id="copy-toast-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(151 17) rotate(32) scale(156 64)">
            <stop stopColor="rgba(255,255,255,0.18)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          fill="url(#copy-toast-glass)"
        />
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          stroke="url(#copy-toast-edge)"
          strokeWidth="1.15"
        />
        <path
          d="M45 22.8C82.5 11.2 101.8 22.5 123 18.4C149.5 13.2 166 15.1 184 25.3"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          fill="url(#copy-toast-glow)"
        />
      </svg>
      <div className="relative flex h-full items-center justify-center px-7 text-center text-[11px] font-bold tracking-wide text-zinc-100/95 drop-shadow-[0_1px_8px_rgba(255,255,255,0.08)]">
        已复制，去 AI 窗口粘贴模板和指令即可
      </div>
    </motion.div>
  )
}

function LoadingLoopIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      className="h-4 w-4 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={active ? { rotate: 360 } : { rotate: 0 }}
      transition={{ duration: 1.05, repeat: active ? Infinity : 0, ease: [0.65, 0, 0.35, 1] }}
    >
      <motion.path
        d="M20 12A8 8 0 0 0 7.2 5.6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? [0.28, 0.78, 0.28] : 1, opacity: active ? 1 : 0 }}
        transition={{ duration: 1.05, repeat: active ? Infinity : 0, ease: [0.32, 0.72, 0, 1] }}
      />
      <motion.path
        d="M4 12A8 8 0 0 0 16.8 18.4"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? [0.58, 0.24, 0.58] : 0, opacity: active ? 0.52 : 0 }}
        transition={{ duration: 1.05, repeat: active ? Infinity : 0, ease: [0.32, 0.72, 0, 1] }}
      />
    </motion.svg>
  )
}

function CopyMorphIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-4 w-4 overflow-visible" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        d="M9 5.5H8.2C7.1 5.5 6.2 6.4 6.2 7.5V19C6.2 20.1 7.1 21 8.2 21H17C18.1 21 19 20.1 19 19V7.5C19 6.4 18.1 5.5 17 5.5H16.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1, y: active ? -1.5 : 0 }}
        transition={{
          pathLength: { duration: 0.32, ease: [0.7, 0, 0.84, 0] },
          opacity: { duration: 0.2, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 420, damping: 26 },
        }}
      />
      <motion.path
        d="M9.2 4H15.8C16.25 4 16.6 4.35 16.6 4.8V6.2C16.6 6.65 16.25 7 15.8 7H9.2C8.75 7 8.4 6.65 8.4 6.2V4.8C8.4 4.35 8.75 4 9.2 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1, y: active ? -2 : 0 }}
        transition={{
          pathLength: { duration: 0.24, ease: [0.7, 0, 0.84, 0] },
          opacity: { duration: 0.18, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 420, damping: 26 },
        }}
      />
      <motion.path
        d="M5.8 12.4L10.2 16.8L18.8 8.2"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0, scale: active ? 1 : 0.86 }}
        transition={{
          pathLength: { duration: 0.46, delay: active ? 0.16 : 0, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.18, delay: active ? 0.12 : 0, ease: [0.32, 0.72, 0, 1] },
          scale: { type: "spring", stiffness: 520, damping: 24, mass: 0.65 },
        }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.path
        d="M20.5 6.8C21.6 9.1 21.25 11.9 19.45 13.95C17.45 16.25 14.15 16.9 11.45 15.75"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.36 : 0 }}
        transition={{
          pathLength: { duration: 0.58, delay: active ? 0.08 : 0, ease: [0.32, 0.72, 0, 1] },
          opacity: { duration: 0.22, delay: active ? 0.1 : 0, ease: [0.32, 0.72, 0, 1] },
        }}
      />
    </svg>
  )
}

function TemplateMorphIcon({ active }: { active: boolean }) {
  return (
    <motion.svg
      className="h-4 w-4 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      animate={{ rotate: active ? 360 : 0 }}
      transition={{ rotate: { duration: 0.74, ease: [0.32, 0.72, 0, 1] } }}
    >
      <motion.path
        d="M20 11.2A7.8 7.8 0 0 0 6.7 5.7L5 7.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0.38 : 1, opacity: active ? 0.45 : 1 }}
        transition={{ duration: 0.34, ease: [0.7, 0, 0.84, 0] }}
      />
      <motion.path
        d="M5 3.8V7.4H8.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1 }}
        transition={{ duration: 0.22, ease: [0.7, 0, 0.84, 0] }}
      />
      <motion.path
        d="M4 12.8A7.8 7.8 0 0 0 17.3 18.3L19 16.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0.38 : 1, opacity: active ? 0.45 : 1 }}
        transition={{ duration: 0.34, ease: [0.7, 0, 0.84, 0] }}
      />
      <motion.path
        d="M19 20.2V16.6H15.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1 }}
        transition={{ duration: 0.22, ease: [0.7, 0, 0.84, 0] }}
      />
      <motion.path
        d="M7.4 12.2L10.5 15.3L17.1 8.7"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0, scale: active ? 1 : 0.86 }}
        transition={{
          pathLength: { duration: 0.42, delay: active ? 0.18 : 0, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.18, delay: active ? 0.13 : 0, ease: [0.32, 0.72, 0, 1] },
          scale: { type: "spring", stiffness: 540, damping: 24, mass: 0.65 },
        }}
        style={{ originX: "50%", originY: "50%" }}
      />
    </motion.svg>
  )
}

function ClearMorphIcon({ active }: { active: boolean }) {
  return (
    <svg className="h-4 w-4 overflow-visible" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ rotate: active ? -18 : 0, x: active ? 1.5 : 0, y: active ? -2.4 : 0, opacity: active ? 0.42 : 1 }}
        transition={{ type: "spring", stiffness: 480, damping: 24, mass: 0.7 }}
        style={{ originX: "50%", originY: "50%" }}
      />
      <motion.path
        d="M9.5 7V5.5C9.5 4.7 10.2 4 11 4H13C13.8 4 14.5 4.7 14.5 5.5V7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1, y: active ? -2 : 0 }}
        transition={{
          pathLength: { duration: 0.24, ease: [0.7, 0, 0.84, 0] },
          opacity: { duration: 0.18, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 420, damping: 26 },
        }}
      />
      <motion.path
        d="M6.4 7.5L7.3 19C7.4 20.1 8.3 21 9.4 21H14.6C15.7 21 16.6 20.1 16.7 19L17.6 7.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 0.18 : 1, opacity: active ? 0.28 : 1, y: active ? 2 : 0 }}
        transition={{
          pathLength: { duration: 0.36, ease: [0.7, 0, 0.84, 0] },
          opacity: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 420, damping: 28 },
        }}
      />
      <motion.path
        d="M10 11V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1 }}
        transition={{ duration: 0.2, ease: [0.7, 0, 0.84, 0] }}
      />
      <motion.path
        d="M14 11V17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 0 : 1, opacity: active ? 0 : 1 }}
        transition={{ duration: 0.2, ease: [0.7, 0, 0.84, 0] }}
      />
      <motion.path
        d="M5.3 17.2C8.6 19.2 15.2 19.2 18.7 16.9"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0, y: active ? 0 : 3 }}
        transition={{
          pathLength: { duration: 0.42, delay: active ? 0.08 : 0, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.18, delay: active ? 0.08 : 0, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 500, damping: 26 },
        }}
      />
      <motion.path
        d="M7.8 12.3L11 15.5L17.2 9.3"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 0.9 : 0, scale: active ? 1 : 0.9 }}
        transition={{
          pathLength: { duration: 0.36, delay: active ? 0.2 : 0, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.18, delay: active ? 0.16 : 0, ease: [0.32, 0.72, 0, 1] },
          scale: { type: "spring", stiffness: 520, damping: 24, mass: 0.65 },
        }}
        style={{ originX: "50%", originY: "50%" }}
      />
    </svg>
  )
}

function ValidationStatusCard({
  visible,
  isScanning,
  isComplete,
  missingSections,
}: {
  visible: boolean
  isScanning: boolean
  isComplete: boolean
  missingSections: string[]
}) {
  const state = isScanning
    ? {
        key: "scanning",
        className: "items-center text-cyan-200",
        icon: <ScanningGlyph />,
        body: "正在扫描章节结构与关键内容...",
      }
    : isComplete
      ? {
          key: "complete",
          className: "items-center text-emerald-300",
          icon: <CheckCircle2 className="h-5 w-5" />,
          body: "核心章节已齐全，可以导出 Word 草稿。",
        }
      : {
          key: "missing",
          className: "items-start text-amber-200",
          icon: <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />,
          body: (
            <div>
              缺少核心章节：
              <span className="ml-2 text-amber-100">{missingSections.join("、")}</span>
            </div>
          ),
        }

  return (
    <motion.div
      initial={false}
      animate={{
        maxHeight: visible ? 86 : 0,
        marginTop: visible ? 20 : 0,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        maxHeight: visible
          ? { type: "spring", stiffness: 135, damping: 23, mass: 1.05 }
          : { type: "spring", stiffness: 160, damping: 24, mass: 0.98, delay: 0.18 },
        marginTop: {
          type: "spring",
          stiffness: 160,
          damping: 24,
          mass: 0.98,
          delay: visible ? 0 : 0.18,
        },
        opacity: { duration: visible ? 0.22 : 0.42, delay: visible ? 0.04 : 0, ease: [0.32, 0.72, 0, 1] },
      }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-black/30"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="p-4">
        <AnimatePresence mode="wait" initial={false}>
          {visible ? (
            <motion.div
              key={state.key}
              initial={{ opacity: 0, filter: "blur(8px)", clipPath: "inset(0 100% 0 0)" }}
              animate={{ opacity: 1, filter: "blur(0px)", clipPath: "inset(0 0% 0 0)" }}
              exit={{
                opacity: 0,
                filter: "blur(6px)",
                clipPath: "inset(0 100% 0 0)",
                transition: {
                  opacity: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
                  filter: { duration: 0.32, ease: [0.32, 0.72, 0, 1] },
                  clipPath: { duration: 0.38, ease: [0.65, 0, 0.35, 1] },
                },
              }}
              transition={{
                opacity: { duration: 0.38, delay: 0.26, ease: [0.32, 0.72, 0, 1] },
                filter: { duration: 0.4, delay: 0.24, ease: [0.32, 0.72, 0, 1] },
                clipPath: { duration: 0.48, delay: 0.24, ease: [0.22, 1, 0.36, 1] },
              }}
              className={`flex gap-3 text-sm ${state.className}`}
            >
              {state.icon}
              {state.body}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

function ScanningGlyph() {
  return (
    <span className="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <motion.span
        className="absolute h-5 w-5 rounded-full border border-cyan-300/25"
        animate={{ scale: [0.82, 1.18, 0.82], opacity: [0.35, 0.85, 0.35] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
      />
      <motion.span
        className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.75)]"
        animate={{ scale: [0.75, 1, 0.75] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
      />
    </span>
  )
}

function DocumentTraceIllustration() {
  return (
    <motion.svg
      className="h-24 w-24 overflow-visible text-zinc-500"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
    >
      <motion.g
        animate={{ opacity: [0.34, 0.5, 0.34] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: [0.32, 0.72, 0, 1] }}
      >
        <motion.path
          d="M30 14H57L69 26V74H30V14Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.62, 0.62, 0] }}
          transition={{
            duration: 4.6,
            times: [0, 0.34, 0.76, 1],
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
        <motion.path
          d="M57 14V27H69"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 7"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 1, 0], opacity: [0, 0.48, 0.48, 0] }}
          transition={{
            duration: 4.6,
            times: [0, 0.34, 0.76, 1],
            delay: 0.14,
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </motion.g>

      {[36, 45, 54].map((y, index) => (
        <motion.path
          key={y}
          d={`M38 ${y}H${index === 1 ? 61 : 55}`}
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1, 0],
            opacity: [0, 0.66, 0.66, 0],
          }}
          transition={{
            duration: 4.6,
            times: [0, 0.28, 0.7, 1],
            delay: 0.56 + index * 0.18,
            repeat: Infinity,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      ))}

      <motion.g
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{
          opacity: [0, 0, 0.52, 0.52, 0],
          scale: [0.96, 0.96, 1, 1, 0.98],
        }}
        transition={{
          duration: 4.6,
          times: [0, 0.42, 0.58, 0.78, 1],
          repeat: Infinity,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{ originX: "50%", originY: "50%" }}
      >
        <rect x="38" y="63" width="20" height="14" rx="4" fill="currentColor" opacity="0.12" />
        <path
          d="M42 67.5L43.7 73L46 68.6L48.3 73L50 67.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.g>
    </motion.svg>
  )
}

function ExportState({
  isScanning,
  isExporting,
  isReady,
  isSuccess,
  error,
  missingCount,
  hasInput,
}: {
  isScanning: boolean
  isExporting: boolean
  isReady: boolean
  isSuccess: boolean
  error: string | null
  missingCount: number
  hasInput: boolean
}) {
  const state = error
    ? {
        kind: "error" as const,
        label: "生成失败",
        text: error,
        theme: EXPORT_STATE_THEMES.error,
      }
    : isExporting
      ? {
          kind: "exporting" as const,
          label: "正在生成 Word 草稿",
          text: "正在调用网页端生成器，请保持页面打开。",
          theme: EXPORT_STATE_THEMES.exporting,
        }
      : isSuccess
        ? {
            kind: "success" as const,
            label: "Word 草稿已下载",
            text: "可以继续在 Word 或 WPS 中修改内容，需要 PDF 时再从文档工具箱导出。",
            theme: EXPORT_STATE_THEMES.success,
          }
        : isScanning
          ? {
              kind: "scanning" as const,
              label: "正在扫描内容结构",
              text: "正在识别章节、代码块、图块和表格。",
              theme: EXPORT_STATE_THEMES.scanning,
            }
          : isReady
            ? {
                kind: "ready" as const,
                label: "Word 草稿已就绪",
                text: "核心章节齐全，可以进入导出阶段。",
                theme: EXPORT_STATE_THEMES.ready,
              }
            : hasInput
              ? {
                  kind: "missing" as const,
                  label: "等待补齐核心章节",
                  text: `还缺少 ${missingCount} 个核心章节，补齐后即可导出。`,
                  theme: EXPORT_STATE_THEMES.missing,
                }
              : {
                  kind: "idle" as const,
                  label: "等待粘贴内容",
                  text: "先复制 AI 补全指令并粘贴生成内容，系统会自动检查结构。",
                  theme: EXPORT_STATE_THEMES.idle,
                }

  return (
    <motion.div
      initial={false}
      animate={{
        backgroundColor: state.theme.background,
        borderColor: state.theme.border,
        boxShadow: state.theme.shadow,
      }}
      transition={{
        backgroundColor: { duration: 0.56, ease: [0.32, 0.72, 0, 1] },
        borderColor: { duration: 0.56, ease: [0.32, 0.72, 0, 1] },
        boxShadow: { duration: 0.56, ease: [0.32, 0.72, 0, 1] },
      }}
      className="relative flex min-h-[112px] overflow-hidden rounded-2xl border px-5 py-4"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: state.theme.glowOpacity }}
        transition={{ duration: 0.56, ease: [0.32, 0.72, 0, 1] }}
        style={{ background: `radial-gradient(circle at 18% 0%, ${state.theme.glow}, transparent 38%)` }}
      />
      <div className="relative flex items-center gap-4">
        <motion.div
          animate={{ backgroundColor: state.theme.iconBackground, color: state.theme.iconColor }}
          transition={{ duration: 0.46, ease: [0.32, 0.72, 0, 1] }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
        >
          <ExportStatusIcon kind={state.kind} color={state.theme.iconColor} />
        </motion.div>
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={state.kind}
              initial={{ opacity: 0, y: 5, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -4, filter: "blur(6px)" }}
              transition={{
                opacity: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
                y: { type: "spring", stiffness: 260, damping: 26, mass: 0.8 },
                filter: { duration: 0.26, ease: [0.32, 0.72, 0, 1] },
              }}
            >
              <div className="text-sm font-black text-white">{state.label}</div>
              <p className="mt-1 text-xs leading-relaxed text-white/70">{state.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

type ExportStateKind = "idle" | "scanning" | "ready" | "missing" | "exporting" | "success" | "error"

const EXPORT_STATE_THEMES = {
  idle: {
    background: "rgba(255,255,255,0.08)",
    border: "rgba(255,255,255,0.15)",
    glow: "rgba(255,255,255,0.12)",
    glowOpacity: 0.7,
    iconBackground: "rgba(0,0,0,0.24)",
    iconColor: "rgb(161,161,170)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 rgba(255,255,255,0)",
  },
  scanning: {
    background: "rgba(8,145,178,0.18)",
    border: "rgba(34,211,238,0.30)",
    glow: "rgba(34,211,238,0.18)",
    glowOpacity: 1,
    iconBackground: "rgba(8,47,73,0.48)",
    iconColor: "rgb(165,243,252)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 44px rgba(34,211,238,0.08)",
  },
  ready: {
    background: "rgba(16,185,129,0.18)",
    border: "rgba(52,211,153,0.30)",
    glow: "rgba(52,211,153,0.18)",
    glowOpacity: 1,
    iconBackground: "rgba(6,78,59,0.42)",
    iconColor: "rgb(167,243,208)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 48px rgba(16,185,129,0.10)",
  },
  success: {
    background: "rgba(16,185,129,0.20)",
    border: "rgba(52,211,153,0.34)",
    glow: "rgba(110,231,183,0.20)",
    glowOpacity: 1,
    iconBackground: "rgba(6,78,59,0.44)",
    iconColor: "rgb(187,247,208)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 18px 50px rgba(16,185,129,0.12)",
  },
  missing: {
    background: "rgba(245,158,11,0.18)",
    border: "rgba(251,191,36,0.30)",
    glow: "rgba(251,191,36,0.18)",
    glowOpacity: 1,
    iconBackground: "rgba(120,53,15,0.40)",
    iconColor: "rgb(253,230,138)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 44px rgba(245,158,11,0.08)",
  },
  exporting: {
    background: "rgba(8,145,178,0.18)",
    border: "rgba(34,211,238,0.32)",
    glow: "rgba(103,232,249,0.20)",
    glowOpacity: 1,
    iconBackground: "rgba(8,47,73,0.50)",
    iconColor: "rgb(207,250,254)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 48px rgba(34,211,238,0.10)",
  },
  error: {
    background: "rgba(244,63,94,0.18)",
    border: "rgba(251,113,133,0.30)",
    glow: "rgba(251,113,133,0.18)",
    glowOpacity: 1,
    iconBackground: "rgba(127,29,29,0.42)",
    iconColor: "rgb(254,205,211)",
    shadow: "inset 0 1px 0 rgba(255,255,255,0.07), 0 18px 44px rgba(244,63,94,0.08)",
  },
} satisfies Record<
  ExportStateKind,
  {
    background: string
    border: string
    glow: string
    glowOpacity: number
    iconBackground: string
    iconColor: string
    shadow: string
  }
>

function ExportStatusIcon({ kind, color }: { kind: ExportStateKind; color: string }) {
  const paths = getExportIconPaths(kind)
  const spinning = kind === "scanning" || kind === "exporting"

  return (
    <motion.svg
      className="h-5 w-5 overflow-visible"
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ rotate: spinning ? 360 : 0 }}
      transition={{
        rotate: spinning
          ? { duration: 1.15, repeat: Infinity, ease: [0.65, 0, 0.35, 1] }
          : { type: "spring", stiffness: 280, damping: 24, mass: 0.8 },
      }}
    >
      <AnimatePresence initial={false}>
        <motion.g
          key={kind}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ opacity: { duration: 0.24, ease: [0.32, 0.72, 0, 1] } }}
        >
        {paths.map((path, index) => (
          <motion.path
            key={`${kind}-${index}`}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ pathLength: 0, opacity: 0 }}
            transition={{
              pathLength: { duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] },
              opacity: { duration: 0.2, delay: index * 0.04, ease: [0.32, 0.72, 0, 1] },
            }}
          />
        ))}
        </motion.g>
      </AnimatePresence>
    </motion.svg>
  )
}

function getExportIconPaths(kind: ExportStateKind) {
  switch (kind) {
    case "ready":
    case "success":
      return ["M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9Z", "M7.8 12.3l2.8 2.8 5.8-6.2"]
    case "missing":
    case "error":
      return ["M12 3.3 21 19H3L12 3.3Z", "M12 8.4v5.1", "M12 17.1h.01"]
    case "scanning":
      return ["M20.2 12A8.2 8.2 0 0 1 12 20.2", "M3.8 12A8.2 8.2 0 0 1 12 3.8", "M12 8v4l2.6 1.8"]
    case "exporting":
      return ["M12 3v10", "M8.4 9.6 12 13.2l3.6-3.6", "M5 17.5h14"]
    case "idle":
    default:
      return ["M7 3.5h7l3 3v14H7V3.5Z", "M14 3.5v4h4", "M9.5 12h5", "M9.5 16h3.5"]
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: number
  icon: ComponentType<{ className?: string }>
  tone: string
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/25 ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-black text-white">
        <Counter value={value} fontSize={28} padding={2} gap={1} textColor="white" fontWeight={900} />
      </div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</div>
    </div>
  )
}

type CounterPlace = number | "."

function CounterNumber({ mv, number, height }: { mv: MotionValue<number>; number: number; height: number }) {
  const y = useTransform(mv, (latest) => {
    const placeValue = latest % 10
    const offset = (10 + number - placeValue) % 10
    let memo = offset * height
    if (offset > 5) memo -= 10 * height
    return memo
  })

  return (
    <motion.span className="absolute inset-0 flex items-center justify-center" style={{ y }}>
      {number}
    </motion.span>
  )
}

function normalizeNearInteger(num: number) {
  const nearest = Math.round(num)
  const tolerance = 1e-9 * Math.max(1, Math.abs(num))
  return Math.abs(num - nearest) < tolerance ? nearest : num
}

function getValueRoundedToPlace(value: number, place: number) {
  const scaled = value / place
  return Math.floor(normalizeNearInteger(scaled))
}

function CounterDigit({
  place,
  value,
  height,
  digitStyle,
}: {
  place: CounterPlace
  value: number
  height: number
  digitStyle?: CSSProperties
}) {
  if (place === ".") return <CounterDot height={height} digitStyle={digitStyle} />

  return <CounterNumericDigit place={place} value={value} height={height} digitStyle={digitStyle} />
}

function CounterDot({ height, digitStyle }: { height: number; digitStyle?: CSSProperties }) {
  return (
    <span className="relative w-fit" style={{ height, fontVariantNumeric: "tabular-nums", ...digitStyle }}>
      .
    </span>
  )
}

function CounterNumericDigit({
  place,
  value,
  height,
  digitStyle,
}: {
  place: number
  value: number
  height: number
  digitStyle?: CSSProperties
}) {
  const valueRoundedToPlace = getValueRoundedToPlace(value, place)
  const animatedValue = useSpring(0, {
    stiffness: 170,
    damping: 24,
    mass: 0.9,
  })

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace)
  }, [animatedValue, valueRoundedToPlace])

  return (
    <span className="relative w-[1ch] overflow-hidden" style={{ height, fontVariantNumeric: "tabular-nums", ...digitStyle }}>
      {Array.from({ length: 10 }, (_, index) => (
        <CounterNumber key={index} mv={animatedValue} number={index} height={height} />
      ))}
    </span>
  )
}

function getCounterPlaces(value: number): CounterPlace[] {
  const normalizedValue = Math.max(0, Math.floor(Math.abs(value)))
  return String(normalizedValue)
    .split("")
    .map((_, index, array) => 10 ** (array.length - index - 1))
}

function Counter({
  value,
  fontSize = 100,
  padding = 0,
  places,
  gap = 8,
  textColor = "inherit",
  fontWeight = "inherit",
}: {
  value: number
  fontSize?: number
  padding?: number
  places?: CounterPlace[]
  gap?: number
  textColor?: string
  fontWeight?: CSSProperties["fontWeight"]
}) {
  const height = fontSize + padding
  const counterPlaces = places ?? getCounterPlaces(value)

  return (
    <span className="relative inline-block">
      <span
        className="flex overflow-hidden leading-none"
        style={{
          fontSize,
          gap,
          color: textColor,
          fontWeight,
          direction: "ltr",
        }}
      >
        {counterPlaces.map((place) => (
          <CounterDigit key={place} place={place} value={value} height={height} />
        ))}
      </span>
      <span className="pointer-events-none absolute inset-0">
        <span className="absolute top-0 h-2 w-full bg-gradient-to-b from-[#141821] to-transparent" />
        <span className="absolute bottom-0 h-2 w-full bg-gradient-to-t from-[#141821] to-transparent" />
      </span>
    </span>
  )
}
