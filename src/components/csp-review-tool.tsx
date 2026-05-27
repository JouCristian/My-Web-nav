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
  Printer,
  RefreshCw,
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

如果需要插图，请把动态图块放在它应该出现的位置。图块内容由 AI 根据题目填写，不是脚本写死的。

【完整题目要求】
这里用正常段落说明题目要求。可以配合项目符号，但不要每句话都单独换行。

【输入格式】
这里写输入格式。

【输出格式】
这里写输出格式。

【样例1输入】
在这里填写样例 1 输入。

【样例1输出】
在这里填写样例 1 输出。

【样例1解释】
这里写样例 1 解释，尽量写成完整自然段。

【子任务与限制条件】
这里写数据范围。建议使用项目符号。

【题目提示与关键区别】
这里写题目提示、易混点、关键区别。内容保持精炼。

【我的完整思考流程复盘】
阶段 1：这里写第一阶段思路。

阶段 2：这里写第二阶段思路。

阶段 3：这里写最终优化思路。

【原始代码】
版本 1：最初思路代码
\`\`\`cpp
#include<iostream>
using namespace std;

int main() {
    return 0;
}
\`\`\`

【AC代码】
\`\`\`cpp
#include<iostream>
using namespace std;

int main() {
    return 0;
}
\`\`\`

【错误分析】
这里写错误原因。

【优化过程】
这里写从错误版本到 AC 版本的优化过程。

【复杂度分析】
| 操作 | 复杂度 | 原因 |
|---|---|---|
| 读取输入 | O(N) | 需要读取全部元素 |
| 输出结果 | O(N) | 每个元素输出一次 |

【题解关键词】
CSP真题；模拟题；vector；一维数组；二维数组

【总结】
这里写最终总结。`

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

const DEFAULT_INPUT = `【标题】
CSP真题：化学方程式配平——完整题解复盘（C++）

【副标题】
高斯消元；矩阵秩；线性代数；C++

【题目背景】
这道题表面上是化学方程式配平，真正核心是判断齐次线性方程组是否存在非零解。只要理解 rank < m 代表存在自由变量，整道题就会从化学背景转化为矩阵秩问题。

[[图:flow]]
标题：整体求解流程
说明：展示从化学式解析到矩阵秩判断的路径。
步骤：解析化学式 -> 建立元素矩阵 -> 高斯消元 -> 求矩阵秩 -> 判断 rank < m
[[/图]]

【完整题目要求】
题目给出若干个化学方程式，每个方程式包含若干个物质。需要判断是否存在一组不全为 0 的系数，使每种元素的原子数量守恒。

【输入格式】
第一行输入整数 n，表示需要判断的方程式数量。接下来 n 行，每行先输入 m，再输入 m 个化学式字符串。

【输出格式】
对于每个方程式输出一行。如果可以配平输出 Y，否则输出 N。

【样例1输入】
2
2 o2 o3
3 c1o1 c1o2 o2

【样例1输出】
Y
Y

【样例1解释】
两个方程式对应的齐次线性方程组都存在非零解，因此都可以配平。

【子任务与限制条件】
• 化学式数量不超过 40。
• 元素种类不超过 40。

【题目提示与关键区别】
关键点不是求出最终配平系数，而是判断 AX = 0 是否存在非零解。

【我的完整思考流程复盘】
阶段 1：最开始容易被化学背景干扰，但拆开后发现核心是建立元素矩阵。

阶段 2：真正容易出错的是高斯消元求秩，不能假设主元一定在主对角线上。

【原始代码】
版本 1：错误主对角线写法
\`\`\`cpp
for (int i = 0; i < m; i++) {
    if (s[i][i] == 0) continue;
}
\`\`\`

【AC代码】
\`\`\`cpp
int rank = 0;
for (int col = 0; col < m; col++) {
    int pivot = -1;
    for (int row = rank; row < s.size(); row++) {
        if (fabs(s[row][col]) > 1e-9) {
            pivot = row;
            break;
        }
    }
    if (pivot == -1) continue;
    swap(s[pivot], s[rank]);
    rank++;
}
cout << (rank < m ? "Y" : "N") << endl;
\`\`\`

【错误分析】
错误来源是把当前列 col 和当前主元行 rank 混为一谈，导致某些矩阵结构下秩计算错误。

【优化过程】
改成 rank + col 双变量维护后，只有真正找到主元时才增加 rank，逻辑更稳定。

【复杂度分析】
| 操作 | 复杂度 | 原因 |
|---|---|---|
| 解析化学式 | O(总字符长度) | 每个字符最多扫描一次 |
| 高斯消元 | O(m³) | 标准矩阵消元 |

【题解关键词】
CSP真题；高斯消元；矩阵秩；齐次线性方程组

【总结】
这道题真正考察的是把实际背景抽象成线性代数模型的能力。以后遇到“是否存在非零解”一类问题，可以优先考虑矩阵秩和自由变量。`

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
    text: "确认预览正常后，直接导出 Word 草稿，或使用浏览器打印功能保存为 PDF。",
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
    <article className="rounded-2xl border border-white/10 bg-black/25 p-5">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <h3 className="text-lg font-bold tracking-wide text-white">{section.name}</h3>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] text-zinc-500">
          {section.content.length} chars
        </span>
      </div>

      {contentWithoutSpecialBlocks ? (
        <div className="space-y-3 text-sm leading-relaxed text-zinc-300">
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
  const [input, setInput] = useState(DEFAULT_INPUT)
  const [copied, setCopied] = useState<"prompt" | null>(null)
  const [exporting, setExporting] = useState<"docx" | "pdf" | null>(null)
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

  const title = sectionMap.get("标题") || "未命名题解"
  const subtitle = sectionMap.get("副标题") || "等待输入关键词"

  const copyText = async (kind: "prompt", text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(kind)
    window.setTimeout(() => setCopied(null), 1800)
  }

  const exportGeneratedDocument = async (format: "docx" | "pdf") => {
    setExporting(format)
    setExportError(null)

    try {
      const response = await fetch("/api/joujou-tools/csp-review-doc-generator/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, format }),
      })

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string; details?: string } | null
        throw new Error(data?.error || "文档生成失败")
      }

      const blob = await response.blob()
      const filename = filenameFromDisposition(
        response.headers.get("Content-Disposition"),
        `${title.replace(/[\\/:*?"<>|]/g, "_")}.${format}`,
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
      `}</style>

      <AnimatedContent distance={70} duration={0.9} ease="power3.out" threshold={0.2}>
      <section className="rounded-[2rem] border border-white/10 bg-[#05070d]/85 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-6">
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

      <div className="grid items-stretch gap-6 xl:h-[1280px] xl:grid-cols-[0.95fr_1.05fr] xl:overflow-hidden">
        <AnimatedContent className="h-full min-h-0" distance={90} direction="horizontal" reverse duration={0.9} ease="power3.out" threshold={0.2} delay={0.05}>
        <section className="flex h-full min-h-[1040px] flex-col rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-4 shadow-[0_20px_90px_rgba(0,0,0,0.35)] sm:p-6 xl:min-h-0 xl:overflow-hidden">
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
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setInput(TEMPLATE_TEXT)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-white/25 hover:text-white active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                使用模板
              </button>
              <button
                type="button"
                onClick={() => copyText("prompt", AI_PROMPT)}
                className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200 transition hover:bg-cyan-500/15 active:scale-95"
              >
                <Clipboard className="h-3.5 w-3.5" />
                {copied === "prompt" ? "已复制" : "复制 AI 补全指令"}
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            className="tool-scrollbar min-h-[780px] flex-1 w-full resize-none rounded-2xl border border-white/10 bg-black/45 p-4 font-mono text-sm leading-relaxed text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-cyan-500/40 focus:ring-2 focus:ring-cyan-500/10 xl:min-h-0"
            placeholder="把 AI 生成的输入内容粘贴到这里"
          />
        </section>
        </AnimatedContent>

        <AnimatedContent className="h-full min-h-0" distance={90} direction="horizontal" duration={0.9} ease="power3.out" threshold={0.2} delay={0.12}>
        <section className="flex h-full min-h-[1040px] flex-col gap-5 xl:min-h-0 xl:overflow-hidden">
          <div className="rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-5 shadow-[0_20px_90px_rgba(0,0,0,0.35)] sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                  <Eye className="h-3.5 w-3.5" />
                  Live Preview
                </div>
                <h1 className="text-2xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
                <p className="mt-3 text-sm leading-relaxed text-zinc-500">{subtitle}</p>
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
                  核心章节已齐全，可以进入生成 Word/PDF 的下一步。
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
              <ActionButton icon={FileCode2} label="下载模板" onClick={() => downloadText("csp_input_template.txt", TEMPLATE_TEXT)} />
              <ActionButton
                icon={exporting === "docx" ? Loader2 : FileText}
                label={exporting === "docx" ? "生成 Word 中..." : "导出 Word 文档"}
                onClick={() => exportGeneratedDocument("docx")}
                disabled={exporting !== null}
                className={exporting === "docx" ? "[&_svg]:animate-spin" : ""}
              />
              <ActionButton
                icon={exporting === "pdf" ? Loader2 : Printer}
                label={exporting === "pdf" ? "生成 PDF 中..." : "导出 PDF 文档"}
                onClick={() => exportGeneratedDocument("pdf")}
                disabled={exporting !== null}
                className={exporting === "pdf" ? "[&_svg]:animate-spin" : ""}
              />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-emerald-100/65">
              网页端会调用原始 Python 生成器，根据左侧内容输出 Word/PDF 复盘文档。下载模板用于发给 AI，让它按固定章节生成可粘贴到工作台的内容。
            </p>
            {exportError ? (
              <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-relaxed text-red-100">
                {exportError}
              </div>
            ) : null}
          </div>

          <div className="tool-scrollbar min-h-[640px] flex-1 overflow-y-auto rounded-[2rem] border border-white/10 bg-[#05070d]/80 p-4 sm:p-5 xl:min-h-0">
            <div className="grid gap-4">
              {orderedSections.length > 0 ? (
                orderedSections.map((section) => <SectionPreview key={section.name} section={section} />)
              ) : (
                <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 text-center">
                  <FileText className="h-10 w-10 text-zinc-600" />
                  <p className="mt-4 text-sm text-zinc-500">还没有识别到【章节】格式。</p>
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
  className = "",
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void | Promise<void>
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-bold text-zinc-200 transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Icon className="h-4 w-4" />
      {label}
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
      <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/25 ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">{label}</div>
    </div>
  )
}
