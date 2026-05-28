"use client"

import type { ComponentType } from "react"
import { useMemo, useState } from "react"
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
  Loader2,
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
    const start = (match.index ?? 0) + match[0].length
    const end = index + 1 < matches.length ? matches[index + 1].index ?? text.length : text.length
    return { name, content: text.slice(start, end).trim() }
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

function SectionPreview({ section }: { section: ParsedSection }) {
  const figures = getFigures(section.content)
  const codeBlocks = getCodeBlocks(section.content)
  const contentWithoutSpecialBlocks = section.content
    .replace(/\[\[图:[^\]]+\]\][\s\S]*?\[\[\/图\]\]/g, "")
    .replace(/```[\w+-]*\n[\s\S]*?```/g, "")
    .trim()

  return (
    <article className="min-w-0 rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-5">
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
    </article>
  )
}

export function CSPReviewTool() {
  const [input, setInput] = useState("")
  const [copied, setCopied] = useState<"prompt" | null>(null)
  const [exporting, setExporting] = useState<"docx" | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
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

  const copyText = async (kind: "prompt", text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1800)
  }

  const exportGeneratedDocument = async () => {
    setExporting("docx")
    setExportError(null)

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
        <AnimatedContent className="h-full min-h-0" distance={90} direction="horizontal" reverse duration={0.9} ease="power3.out" threshold={0.2} delay={0.05}>
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
                label="使用模板"
                onClick={() => setInput(TEMPLATE_TEXT)}
                size="sm"
                tone="neutral"
              />
              <ActionButton
                icon={Trash2}
                label="清空内容"
                onClick={() => setInput("")}
                disabled={input.length === 0}
                size="sm"
                tone="danger"
              />
              <ActionButton
                icon={Clipboard}
                label={copied === "prompt" ? "已复制" : "复制 AI 补全指令"}
                onClick={() => copyText("prompt", AI_PROMPT)}
                size="sm"
                tone="cyan"
                className="col-span-2"
              />
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="tool-scrollbar min-h-[520px] w-full flex-1 resize-none rounded-2xl border border-white/10 bg-black/45 p-4 font-mono text-sm leading-relaxed text-zinc-200 outline-none transition placeholder:whitespace-pre-line placeholder:text-zinc-500 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 sm:min-h-[680px] xl:min-h-0"
            placeholder={INPUT_PLACEHOLDER}
          />
        </section>
        </AnimatedContent>

        <AnimatedContent className="h-full min-h-0" distance={90} direction="horizontal" duration={0.9} ease="power3.out" threshold={0.2} delay={0.12}>
        <section className="flex h-full min-h-[860px] min-w-0 flex-col gap-5 sm:min-h-[1040px] xl:min-h-0 xl:overflow-hidden">
          <div className="rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] sm:p-6">
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

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="章节" value={stats.sections} icon={LayoutList} tone="text-cyan-300" />
              <StatCard label="代码块" value={stats.codeBlocks} icon={Code2} tone="text-emerald-300" />
              <StatCard label="图块" value={stats.figures} icon={Wand2} tone="text-amber-300" />
              <StatCard label="表格" value={stats.tables} icon={Gauge} tone="text-violet-300" />
            </div>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/25 p-4">
              {missingSections.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                  核心章节已齐全，可以导出 Word 草稿。
                </div>
              ) : (
                <div className="flex items-start gap-3 text-sm text-amber-200">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    缺少核心章节：
                    <span className="ml-2 text-amber-100">{missingSections.join("、")}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/[0.06] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Download className="h-5 w-5 text-emerald-300" />
              <h2 className="text-xl font-black text-white">导出与生成</h2>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ActionButton icon={FileCode2} label="下载模板" onClick={() => downloadText("csp_input_template_v13.txt", TEMPLATE_TEXT)} tone="emerald" />
              <ActionButton
                icon={exporting === "docx" ? Loader2 : FileText}
                label={exporting === "docx" ? "生成 Word 中..." : "导出 Word 文档"}
                onClick={exportGeneratedDocument}
                disabled={exporting !== null}
                tone="emerald"
                className={exporting === "docx" ? "[&_svg]:animate-spin" : ""}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-emerald-100/65">
              网页端会调用原始 Python 生成器，根据左侧内容输出可继续编辑的 Word 草稿。下载模板用于发给 AI，让它按固定章节生成可粘贴到工作台的内容。
            </p>
            <div className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs leading-relaxed text-cyan-100/75">
              如需生成 PDF，请先导出 Word 文档，再在 Word 或 WPS 中使用 PDF 工具箱导出。这样版式更稳定，也方便你先修改 Word 草稿内容。
            </div>
            {exportError ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-100">
                {exportError}
              </div>
            ) : null}
          </div>

          <div className="tool-scrollbar min-h-[520px] flex-1 overflow-y-auto rounded-[2rem] border border-white/10 bg-[#05070d]/80 p-4 sm:min-h-[640px] sm:p-5 xl:min-h-0">
            <div className="grid gap-4">
              {orderedSections.length > 0 ? (
                orderedSections.map((section) => <SectionPreview key={section.name} section={section} />)
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
                  <FileText className="h-10 w-10 text-zinc-600" />
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
  label,
  onClick,
  disabled = false,
  tone = "emerald",
  size = "md",
  className = "",
}: {
  icon: ComponentType<{ className?: string }>
  label: string
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`tool-action-button group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl border text-xs font-bold disabled:cursor-not-allowed disabled:opacity-45 ${sizeClass} ${toneClass} ${className}`}
    >
      <span className={`pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[140%] skew-x-[-18deg] bg-gradient-to-r from-transparent ${shineClass} to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[260%] group-disabled:translate-x-[-140%]`} />
      <Icon className="relative h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-hover:scale-110 group-disabled:translate-y-0 group-disabled:scale-100" />
      <span className="relative">{label}</span>
    </button>
  )
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
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</div>
    </div>
  )
}
