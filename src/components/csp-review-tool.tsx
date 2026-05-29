"use client"

import type { ComponentType, CSSProperties, Dispatch, MouseEvent, ReactNode, SetStateAction } from "react"
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion"
import {
  AlertCircle,
  BookOpenCheck,
  CheckCircle2,
  Clipboard,
  Code2,
  Download,
  Eye,
  FileCog,
  FileCode2,
  FileText,
  Gauge,
  Info,
  LayoutList,
  RefreshCw,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
  X,
  Wand2,
} from "lucide-react"
import AnimatedContent from "@/components/animated-content"

const DRAFT_STORAGE_KEY = "joujou-csp-review-draft-v1"
const DOCUMENT_SETTINGS_STORAGE_KEY = "algorithm-review-document-settings"
const FALLBACK_EDITOR_LINE_HEIGHT = 22.75
const FALLBACK_EDITOR_PADDING_TOP = 16

const DEFAULT_DOCUMENT_SETTINGS = {
  documentType: "CSP",
  customDocumentType: "",
  outputFilename: "",
  language: "C++",
  customLanguage: "",
  includeTypePrefix: true,
  titleStyle: "simple",
  customTitleTemplate: "{title}——完整题解复盘（{language}）",
  headerEnabled: true,
  headerStyle: "type-language",
  customHeaderText: "{type} 题解复盘 · {language}",
  footerEnabled: true,
  footerStyle: "algorithm-review",
  showPageNumber: true,
  customFooterText: "Algorithm Review Generator · 第 {page} 页",
}

type DocumentSettings = typeof DEFAULT_DOCUMENT_SETTINGS

const DOCUMENT_TYPE_OPTIONS = ["CSP", "蓝桥杯", "洛谷", "LeetCode", "ACM", "算法题", "自定义"]
const LANGUAGE_OPTIONS = ["C++", "Python", "Java", "JavaScript", "Go", "Rust", "自定义"]

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
算法题：题名——完整题解复盘（C++）

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
算法题；模拟题；vector；一维数组；二维数组；下标映射；输出格式控制

【总结】
这里写最终总结。建议 1～2 个自然段，重点写这题真正考察什么，以及以后遇到类似题怎么迁移。`

const AI_PROMPT = `请严格按照我提供的 algorithm_review_input_template 模板生成可粘贴到网页工作台的算法题解复盘内容。

要求：
1. 只输出纯文本，不要整体包 Markdown 代码块。
2. 所有章节标题必须严格使用中文全角方括号【】包起来，例如【标题】【题目背景】【AC代码】。不要写成「标题」、[标题]、## 标题 或普通文本标题，否则网页和脚本都识别不到章节。
3. 模板里已有的章节名不要随意改名；如果某个章节没有内容，可以保留章节并写“暂无”，不要删除核心章节。
4. 除【原始代码】和【AC代码】外，不要使用 \`\`\`cpp 或 \`\`\`text 代码块。
5. 【原始代码】和【AC代码】里的代码必须使用三反引号代码块包裹，例如 \`\`\`cpp 开始、\`\`\` 结束；不要使用单引号、中文引号、缩进代码块或普通文本，否则脚本无法正确识别代码块。
6. 【样例1输入】【样例1输出】【样例2输入】【样例2输出】里面只放原始输入输出内容，不要加反引号。
7. 题目解释、思考流程、错误分析、优化过程都写成完整自然段，不要一行一句。
8. 普通公式、变量、关键词直接写在自然段里，不要单独代码块。
9. 每个阶段控制在 1～2 个自然段，不要拆得太碎。
10. 图块最多放 1～2 个，不要过多。
11. 标题格式建议写成：算法题：题名——完整题解复盘（语言），也可以根据导出设置里的文档类型与语言调整。`

const INPUT_PLACEHOLDER = `这里先不用手动写题解，建议按下面流程来：

1. 点击右上角「使用模板」，先看清楚系统需要的章节格式。
2. 点击「复制 AI 补全指令」，把指令发到你自己的 AI 对话窗口。
3. 同时把下载的 algorithm_review_input_template_v13.txt、题目原文、你的思考过程、错误代码和 AC 代码一起发给 AI。
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

interface EditorLayout {
  lineHeight: number
  paddingTop: number
  scrollHeight: number
  caretTop: number
  visualLineCount: number
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

function getLineFromIndex(text: string, index: number) {
  return text.slice(0, Math.max(0, index)).split(/\r?\n/).length
}

function measureTextareaLayout(textarea: HTMLTextAreaElement): EditorLayout {
  const styles = window.getComputedStyle(textarea)
  const parsedLineHeight = Number.parseFloat(styles.lineHeight)
  const parsedPaddingTop = Number.parseFloat(styles.paddingTop)
  const parsedPaddingBottom = Number.parseFloat(styles.paddingBottom)
  const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : FALLBACK_EDITOR_LINE_HEIGHT
  const paddingTop = Number.isFinite(parsedPaddingTop) ? parsedPaddingTop : FALLBACK_EDITOR_PADDING_TOP
  const paddingBottom = Number.isFinite(parsedPaddingBottom) ? parsedPaddingBottom : 0
  const value = textarea.value
  const caretIndex = Math.max(0, Math.min(value.length, textarea.selectionStart ?? 0))
  const mirror = document.createElement("div")
  let caretMarker: HTMLSpanElement | null = null

  mirror.setAttribute("aria-hidden", "true")
  Object.assign(mirror.style, {
    position: "absolute",
    top: "0",
    left: "-10000px",
    visibility: "hidden",
    pointerEvents: "none",
    overflow: "hidden",
    whiteSpace: "pre-wrap",
    overflowWrap: "break-word",
    wordBreak: styles.wordBreak as CSSProperties["wordBreak"],
    boxSizing: "border-box",
    width: `${textarea.clientWidth}px`,
    minHeight: "0",
    paddingTop: styles.paddingTop,
    paddingRight: styles.paddingRight,
    paddingBottom: styles.paddingBottom,
    paddingLeft: styles.paddingLeft,
    borderTopWidth: "0",
    borderRightWidth: "0",
    borderBottomWidth: "0",
    borderLeftWidth: "0",
    fontFamily: styles.fontFamily,
    fontSize: styles.fontSize,
    fontWeight: styles.fontWeight,
    fontStyle: styles.fontStyle,
    letterSpacing: styles.letterSpacing,
    lineHeight: styles.lineHeight,
    textTransform: styles.textTransform,
    tabSize: styles.tabSize,
  } satisfies CSSProperties)

  const createMarker = () => {
    const marker = document.createElement("span")
    Object.assign(marker.style, {
      display: "inline-block",
      width: "0",
      height: `${lineHeight}px`,
      verticalAlign: "top",
      overflow: "hidden",
    } satisfies CSSProperties)
    return marker
  }

  mirror.appendChild(document.createTextNode(value.slice(0, caretIndex)))
  caretMarker = createMarker()
  mirror.appendChild(caretMarker)
  mirror.appendChild(document.createTextNode(value.slice(caretIndex)))

  document.body.appendChild(mirror)
  const mirrorRect = mirror.getBoundingClientRect()
  const measuredCaretMarker = caretMarker as HTMLSpanElement | null
  const rawCaretTop = measuredCaretMarker
    ? measuredCaretMarker.getBoundingClientRect().top - mirrorRect.top
    : paddingTop
  mirror.remove()
  const visualLineCount = Math.max(1, Math.round((textarea.scrollHeight - paddingTop - paddingBottom) / lineHeight))
  const caretRow = Math.max(0, Math.round((rawCaretTop - paddingTop) / lineHeight))
  const caretTop = paddingTop + Math.min(caretRow, visualLineCount - 1) * lineHeight

  return {
    lineHeight,
    paddingTop,
    scrollHeight: textarea.scrollHeight,
    caretTop,
    visualLineCount,
  }
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

function sanitizeDocumentFilename(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "_").replace(/\s+/g, " ").trim()
}

function isDocumentTitleStyle(value: unknown): value is DocumentSettings["titleStyle"] {
  return value === "simple" || value === "typed" || value === "custom"
}

function isHeaderStyle(value: unknown): value is DocumentSettings["headerStyle"] {
  return value === "type-language" || value === "type-only" || value === "custom"
}

function isFooterStyle(value: unknown): value is DocumentSettings["footerStyle"] {
  return value === "algorithm-review" || value === "chinese-generator" || value === "custom"
}

function normalizeDocumentSettings(value: unknown): DocumentSettings {
  const source = typeof value === "object" && value !== null ? (value as Partial<DocumentSettings>) : {}
  const documentType = DOCUMENT_TYPE_OPTIONS.includes(String(source.documentType)) ? String(source.documentType) : DEFAULT_DOCUMENT_SETTINGS.documentType
  const language = LANGUAGE_OPTIONS.includes(String(source.language)) ? String(source.language) : DEFAULT_DOCUMENT_SETTINGS.language
  const legacyTitleTemplate = typeof (source as { titleTemplate?: unknown }).titleTemplate === "string" ? (source as { titleTemplate: string }).titleTemplate : ""
  const legacyHeaderText = typeof (source as { headerText?: unknown }).headerText === "string" ? (source as { headerText: string }).headerText : ""
  const legacyFooterText = typeof (source as { footerText?: unknown }).footerText === "string" ? (source as { footerText: string }).footerText : ""

  return {
    documentType,
    customDocumentType: typeof source.customDocumentType === "string" ? source.customDocumentType.trim() : "",
    outputFilename: typeof source.outputFilename === "string" ? sanitizeDocumentFilename(source.outputFilename) : "",
    language,
    customLanguage: typeof source.customLanguage === "string" ? source.customLanguage.trim() : "",
    includeTypePrefix: typeof source.includeTypePrefix === "boolean" ? source.includeTypePrefix : DEFAULT_DOCUMENT_SETTINGS.includeTypePrefix,
    titleStyle: isDocumentTitleStyle(source.titleStyle) ? source.titleStyle : legacyTitleTemplate.includes("{type}") ? "typed" : DEFAULT_DOCUMENT_SETTINGS.titleStyle,
    customTitleTemplate: typeof source.customTitleTemplate === "string" && source.customTitleTemplate.trim() ? source.customTitleTemplate : legacyTitleTemplate || DEFAULT_DOCUMENT_SETTINGS.customTitleTemplate,
    headerEnabled: typeof source.headerEnabled === "boolean" ? source.headerEnabled : true,
    headerStyle: isHeaderStyle(source.headerStyle) ? source.headerStyle : legacyHeaderText && !legacyHeaderText.includes("{language}") ? "type-only" : DEFAULT_DOCUMENT_SETTINGS.headerStyle,
    customHeaderText: typeof source.customHeaderText === "string" ? source.customHeaderText : legacyHeaderText || DEFAULT_DOCUMENT_SETTINGS.customHeaderText,
    footerEnabled: typeof source.footerEnabled === "boolean" ? source.footerEnabled : true,
    footerStyle: isFooterStyle(source.footerStyle) ? source.footerStyle : legacyFooterText.includes("算法题解文档生成器") ? "chinese-generator" : DEFAULT_DOCUMENT_SETTINGS.footerStyle,
    showPageNumber: typeof source.showPageNumber === "boolean" ? source.showPageNumber : true,
    customFooterText: typeof source.customFooterText === "string" ? source.customFooterText : legacyFooterText || DEFAULT_DOCUMENT_SETTINGS.customFooterText,
  }
}

function getEffectiveDocumentType(settings: DocumentSettings) {
  return settings.documentType === "自定义" ? settings.customDocumentType.trim() || "算法题" : settings.documentType
}

function getEffectiveLanguage(settings: DocumentSettings) {
  return settings.language === "自定义" ? settings.customLanguage.trim() || "C++" : settings.language
}

function getExportDocumentSettings(settings: DocumentSettings) {
  const documentType = getEffectiveDocumentType(settings)
  const language = getEffectiveLanguage(settings)
  const titleTemplate =
    settings.titleStyle === "typed"
      ? "{type}：{title}——完整题解复盘（{language}）"
      : settings.titleStyle === "custom" && settings.customTitleTemplate.trim()
        ? settings.customTitleTemplate
        : "{title}——完整题解复盘（{language}）"
  const headerText = !settings.headerEnabled
    ? ""
    : settings.headerStyle === "type-only"
      ? "{type} 题解复盘"
      : settings.headerStyle === "custom"
        ? settings.customHeaderText
        : "{type} 题解复盘 · {language}"
  const footerBase =
    settings.footerStyle === "chinese-generator"
      ? "算法题解文档生成器"
      : settings.footerStyle === "custom"
        ? settings.customFooterText.replace(/\s*·?\s*第\s*\{page\}\s*页/g, "").trim() || settings.customFooterText
        : "Algorithm Review Generator"
  const footerText = !settings.footerEnabled ? "" : settings.showPageNumber ? `${footerBase} · 第 {page} 页` : footerBase

  return {
    documentType,
    outputFilename: sanitizeDocumentFilename(settings.outputFilename),
    titleTemplate,
    headerText,
    footerText,
    language,
    includeTypePrefix: settings.includeTypePrefix,
  }
}

function getFallbackDownloadFilename(settings: DocumentSettings, currentTitle: string) {
  const cleanTitle = sanitizeDocumentFilename(currentTitle || "未命名题目") || "未命名题目"
  const custom = sanitizeDocumentFilename(settings.outputFilename)
  if (custom) return custom.toLowerCase().endsWith(".docx") ? custom : `${custom}.docx`
  const prefix = settings.includeTypePrefix ? `${getEffectiveDocumentType(settings)}-` : ""
  return `${prefix}${cleanTitle}-完整题解复盘.docx`
}

function getPreviewProblemTitle(currentTitle: string) {
  const cleaned = currentTitle
    .replace(/^(CSP真题|CSP|蓝桥杯|洛谷|LeetCode|ACM|算法题)\s*[：:]\s*/i, "")
    .replace(/——完整题解复盘（[^）]+）/g, "")
    .trim()
  return cleaned && cleaned !== "等待粘贴 AI 内容" ? cleaned : "矩阵重塑"
}

function renderDocumentTemplatePreview(template: string, settings: DocumentSettings, problemTitle: string, page = "1") {
  return template
    .replaceAll("{title}", problemTitle)
    .replaceAll("{type}", getEffectiveDocumentType(settings))
    .replaceAll("{language}", getEffectiveLanguage(settings))
    .replaceAll("{page}", page)
}

function getTitlePreview(settings: DocumentSettings, problemTitle: string) {
  return renderDocumentTemplatePreview(getExportDocumentSettings(settings).titleTemplate, settings, problemTitle)
}

function getHeaderPreview(settings: DocumentSettings) {
  if (!settings.headerEnabled) return "不显示页眉"
  return renderDocumentTemplatePreview(getExportDocumentSettings(settings).headerText, settings, "矩阵重塑")
}

function getFooterPreview(settings: DocumentSettings) {
  if (!settings.footerEnabled) return "不显示页脚"
  return renderDocumentTemplatePreview(getExportDocumentSettings(settings).footerText, settings, "矩阵重塑")
}

function loadInitialDocumentSettings() {
  if (typeof window === "undefined") return DEFAULT_DOCUMENT_SETTINGS
  try {
    const savedSettings = window.localStorage.getItem(DOCUMENT_SETTINGS_STORAGE_KEY)
    return savedSettings ? normalizeDocumentSettings(JSON.parse(savedSettings)) : DEFAULT_DOCUMENT_SETTINGS
  } catch {
    return DEFAULT_DOCUMENT_SETTINGS
  }
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
  const [exportConfirmOpen, setExportConfirmOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [actionFeedback, setActionFeedback] = useState<"template" | "clear" | null>(null)
  const [copyToastVisible, setCopyToastVisible] = useState(false)
  const [settingsToastVisible, setSettingsToastVisible] = useState(false)
  const [promptPreviewOpen, setPromptPreviewOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [isClosingSettingsModal, setIsClosingSettingsModal] = useState(false)
  const [settingsSaveState, setSettingsSaveState] = useState<"idle" | "saved">("idle")
  const [settingsOrigin, setSettingsOrigin] = useState<{ x: number; y: number } | null>(null)
  const [previewTitleFontSize, setPreviewTitleFontSize] = useState(48)
  const [documentSettings, setDocumentSettings] = useState<DocumentSettings>(() => loadInitialDocumentSettings())
  const [settingsDraft, setSettingsDraft] = useState<DocumentSettings>(() => loadInitialDocumentSettings())
  const [restorableDraft, setRestorableDraft] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const editorScrollY = useMotionValue(0)
  const [editorLayout, setEditorLayout] = useState<EditorLayout>({
    lineHeight: FALLBACK_EDITOR_LINE_HEIGHT,
    paddingTop: FALLBACK_EDITOR_PADDING_TOP,
    scrollHeight: FALLBACK_EDITOR_PADDING_TOP + FALLBACK_EDITOR_LINE_HEIGHT,
    caretTop: FALLBACK_EDITOR_PADDING_TOP,
    visualLineCount: 1,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewScrollRef = useRef<HTMLDivElement>(null)
  const previewTitleMeasureRef = useRef<HTMLDivElement>(null)
  const exportConfirmRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})
  const scanTimerRef = useRef<number | null>(null)
  const copyToastTimerRef = useRef<number | null>(null)
  const settingsToastTimerRef = useRef<number | null>(null)
  const settingsSaveTimerRef = useRef<number | null>(null)
  const settingsCloseTimerRef = useRef<number | null>(null)
  const draftSaveTimerRef = useRef<number | null>(null)
  const sections = useMemo(() => parseSections(input), [input])
  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.name, section.content])), [sections])
  const missingSections = REQUIRED_SECTIONS.filter((name) => !sectionMap.get(name)?.trim())
  const structureIssues = useMemo(() => getStructureIssues(input, sectionMap, missingSections), [input, sectionMap, missingSections])
  const blockingIssues = structureIssues.filter((issue) => issue.severity === "error")
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
  const health = useMemo(() => getInputHealth(input, sectionMap, missingSections, structureIssues), [input, sectionMap, missingSections, structureIssues])
  const exportNeedsConfirmation = useMemo(
    () => getExportNeedsConfirmation(input, sectionMap, health, missingSections, blockingIssues),
    [input, sectionMap, health, missingSections, blockingIssues],
  )

  const rawTitle = sectionMap.get("标题") || ""
  const problemTitle = getPreviewProblemTitle(rawTitle)
  const title = rawTitle ? getTitlePreview(documentSettings, problemTitle) : "等待粘贴 AI 内容"
  const subtitle = sectionMap.get("副标题") || "先使用模板和 AI 补全指令生成规范内容，再粘贴到左侧工作台。"
  const canExport = input.trim().length > 0 && !isScanning
  const hasUnsavedSettings = settingsOpen && JSON.stringify(normalizeDocumentSettings(settingsDraft)) !== JSON.stringify(normalizeDocumentSettings(documentSettings))

  useLayoutEffect(() => {
    const element = previewTitleMeasureRef.current
    if (!element) return

    const calculateTitleSize = () => {
      const availableWidth = element.clientWidth
      if (!availableWidth) return

      const titleUnits = Array.from(title).reduce((sum, character) => {
        if (/[\w\s+()[\]{}.,:;'"-]/.test(character)) return sum + 0.56
        return sum + 1
      }, 0)
      const maxSize = window.innerWidth < 640 ? 34 : 48
      const minSize = window.innerWidth < 640 ? 22 : 28
      const nextSize = Math.max(minSize, Math.min(maxSize, availableWidth / Math.max(titleUnits, 1) * 0.92))

      setPreviewTitleFontSize((current) => (Math.abs(current - nextSize) < 0.5 ? current : nextSize))
    }

    calculateTitleSize()
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(calculateTitleSize) : null
    resizeObserver?.observe(element)
    window.addEventListener("resize", calculateTitleSize)

    return () => {
      resizeObserver?.disconnect()
      window.removeEventListener("resize", calculateTitleSize)
    }
  }, [title])

  const measureEditorLayout = useCallback((textarea = textareaRef.current) => {
    if (!textarea) return
    editorScrollY.set(textarea.scrollTop)
    setEditorLayout(measureTextareaLayout(textarea))
  }, [editorScrollY])

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const savedDraft = window.localStorage.getItem(DRAFT_STORAGE_KEY)
        if (savedDraft?.trim()) {
          setRestorableDraft(savedDraft)
        }
      } catch {
        setRestorableDraft(null)
      }
    }, 0)

    return () => window.clearTimeout(restoreTimer)
  }, [])

  useEffect(() => {
    if (draftSaveTimerRef.current) {
      window.clearTimeout(draftSaveTimerRef.current)
    }

    draftSaveTimerRef.current = window.setTimeout(() => {
      try {
        if (input.trim()) {
          window.localStorage.setItem(DRAFT_STORAGE_KEY, input)
        } else {
          window.localStorage.removeItem(DRAFT_STORAGE_KEY)
        }
      } catch {
        // localStorage may be unavailable in private browsing; the tool still works without drafts.
      }
    }, 420)

    return () => {
      if (draftSaveTimerRef.current) {
        window.clearTimeout(draftSaveTimerRef.current)
      }
    }
  }, [input])

  useLayoutEffect(() => {
    measureEditorLayout()
  }, [input, measureEditorLayout])

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(() => measureEditorLayout(textarea))
    observer.observe(textarea)

    return () => observer.disconnect()
  }, [measureEditorLayout])

  const updateInputContent = (nextInput: string) => {
    setInput(nextInput)
    setExportSuccess(false)
    setExportConfirmOpen(false)
    if (nextInput.trim()) {
      setRestorableDraft(null)
    }

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

  const openDocumentSettings = (event?: MouseEvent<HTMLButtonElement>) => {
    if (settingsCloseTimerRef.current) {
      window.clearTimeout(settingsCloseTimerRef.current)
      settingsCloseTimerRef.current = null
    }
    if (event?.currentTarget) {
      const rect = event.currentTarget.getBoundingClientRect()
      setSettingsOrigin({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      })
    } else {
      setSettingsOrigin(null)
    }
    setSettingsDraft(documentSettings)
    setSettingsSaveState("idle")
    setIsClosingSettingsModal(false)
    setSettingsOpen(true)
  }

  const showSavedSettingsToast = useCallback(() => {
    setSettingsToastVisible(true)
    if (settingsToastTimerRef.current) window.clearTimeout(settingsToastTimerRef.current)
    settingsToastTimerRef.current = window.setTimeout(() => setSettingsToastVisible(false), 1400)
  }, [])

  const closeSettingsModal = useCallback((options?: { keepDraft?: boolean; showSavedToast?: boolean }) => {
    if (isClosingSettingsModal) return

    setIsClosingSettingsModal(true)
    if (settingsCloseTimerRef.current) {
      window.clearTimeout(settingsCloseTimerRef.current)
    }

    settingsCloseTimerRef.current = window.setTimeout(() => {
      setSettingsOpen(false)
      setIsClosingSettingsModal(false)
      setSettingsSaveState("idle")
      if (!options?.keepDraft) {
        setSettingsDraft(documentSettings)
      }
      if (options?.showSavedToast) {
        showSavedSettingsToast()
      }
      settingsCloseTimerRef.current = null
    }, 680)
  }, [documentSettings, isClosingSettingsModal, showSavedSettingsToast])

  const resetDocumentSettings = () => {
    setSettingsDraft(DEFAULT_DOCUMENT_SETTINGS)
    setSettingsSaveState("idle")
  }

  const saveDocumentSettings = () => {
    const normalized = normalizeDocumentSettings(settingsDraft)
    setSettingsDraft(normalized)
    setDocumentSettings(normalized)
    try {
      window.localStorage.setItem(DOCUMENT_SETTINGS_STORAGE_KEY, JSON.stringify(normalized))
    } catch {
      // The export still uses in-memory settings if localStorage is unavailable.
    }

    setSettingsSaveState("saved")
    if (settingsSaveTimerRef.current) window.clearTimeout(settingsSaveTimerRef.current)
    settingsSaveTimerRef.current = window.setTimeout(() => {
      closeSettingsModal({ keepDraft: true, showSavedToast: true })
    }, 160)
  }

  useEffect(() => {
    if (!settingsOpen) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSettingsModal()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [settingsOpen, closeSettingsModal])

  useEffect(() => {
    if (!exportConfirmOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && exportConfirmRef.current?.contains(target)) return
      setExportConfirmOpen(false)
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExportConfirmOpen(false)
    }

    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [exportConfirmOpen])

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
    window.requestAnimationFrame(() => measureEditorLayout(textarea))
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
    if (exporting !== null || !input.trim() || isScanning) return

    setExportConfirmOpen(false)
    setExporting("docx")
    setExportError(null)
    setExportSuccess(false)

    try {
      const request = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          format: "docx",
          documentSettings: getExportDocumentSettings(documentSettings),
        }),
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
        getFallbackDownloadFilename(documentSettings, problemTitle),
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

  const handleExportClick = () => {
    if (exporting !== null || !canExport) return

    if (exportNeedsConfirmation) {
      setExportError(null)
      setExportConfirmOpen(true)
      return
    }

    void exportGeneratedDocument()
  }

  const confirmDraftExport = () => {
    if (exporting !== null || !canExport) return

    setExportConfirmOpen(false)
    void exportGeneratedDocument()
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
              <div className="relative col-span-2 grid grid-cols-[minmax(0,1fr)_44px] gap-2">
                <div className="relative min-w-0">
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
                <PromptPreviewButton active={promptPreviewOpen} onClick={() => setPromptPreviewOpen((open) => !open)} />
                <AnimatePresence>
                  {promptPreviewOpen ? <PromptPreviewPanel onClose={() => setPromptPreviewOpen(false)} /> : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <AnimatePresence initial={false}>
            {restorableDraft && !input.trim() ? (
              <DraftRestoreNotice
                onRestore={() => {
                  updateInputContent(restorableDraft)
                  setRestorableDraft(null)
                }}
                onDismiss={() => {
                  setRestorableDraft(null)
                  try {
                    window.localStorage.removeItem(DRAFT_STORAGE_KEY)
                  } catch {
                    // Ignore storage failures; dismissing the notice should never block the UI.
                  }
                }}
              />
            ) : null}
          </AnimatePresence>

          <InputHealthPanel health={health} />

          <div className="min-h-[520px] w-full flex-1 overflow-hidden rounded-2xl border border-white/10 bg-black/45 transition focus-within:border-cyan-500/40 focus-within:ring-2 focus-within:ring-cyan-500/10 sm:min-h-[680px] xl:min-h-0">
            <div className="grid h-full min-h-[520px] grid-cols-[48px_minmax(0,1fr)] sm:min-h-[680px] xl:min-h-0">
              <div className="pointer-events-none relative overflow-hidden border-r border-white/10 bg-white/[0.025]">
                <EditorVisualLineNumbers layout={editorLayout} scrollY={editorScrollY} />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-cyan-300/20 to-transparent" />
              </div>
              <div className="relative min-w-0 overflow-hidden">
                <EditorLineHighlight layout={editorLayout} scrollY={editorScrollY} />
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) => {
                    const textarea = event.currentTarget
                    updateInputContent(event.target.value)
                    setActiveSection(null)
                    window.requestAnimationFrame(() => measureEditorLayout(textarea))
                  }}
                  onScroll={(event) => {
                    const nextScrollTop = event.currentTarget.scrollTop
                    editorScrollY.set(nextScrollTop)
                  }}
                  onSelect={(event) => measureEditorLayout(event.currentTarget)}
                  onKeyUp={(event) => measureEditorLayout(event.currentTarget)}
                  onClick={(event) => measureEditorLayout(event.currentTarget)}
                  onFocus={(event) => measureEditorLayout(event.currentTarget)}
                  spellCheck={false}
                  className="tool-scrollbar relative z-10 h-full min-h-0 w-full resize-none border-0 bg-transparent p-4 font-mono text-sm leading-relaxed text-zinc-200 outline-none placeholder:whitespace-pre-line placeholder:text-zinc-500"
                  placeholder={INPUT_PLACEHOLDER}
                />
              </div>
            </div>
          </div>
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
                <div ref={previewTitleMeasureRef} className="min-w-0 flex-1">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-300">
                    <Eye className="h-3.5 w-3.5" />
                    Live Preview
                  </div>
                  <div className="flex h-[3.1rem] max-w-full items-center overflow-hidden sm:h-[3.75rem]">
                    <h1
                      className="max-w-full whitespace-nowrap font-black leading-none text-white"
                      style={{ fontSize: `${previewTitleFontSize}px`, letterSpacing: 0 }}
                    >
                      {title}
                    </h1>
                  </div>
                  <p className="mt-3 break-words text-sm leading-relaxed text-zinc-500">{subtitle}</p>
                </div>
                <div className="relative shrink-0 self-start">
                  <DocumentSettingsButton
                    active={settingsOpen}
                    hasUnsavedChanges={hasUnsavedSettings}
                    onClick={openDocumentSettings}
                  />
                  <AnimatePresence>
                    {settingsToastVisible ? <LiquidMiniToast text="文档设置已保存" /> : null}
                  </AnimatePresence>
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
              isComplete={blockingIssues.length === 0}
              issues={structureIssues}
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
                    isReady={canExport && health.status === "ready" && health.score >= 100}
                    isSuccess={exportSuccess}
                    error={exportError}
                    issueCount={blockingIssues.length}
                    hasInput={input.trim().length > 0}
                  />
                </AnimatePresence>
              </div>

              <div className="grid min-w-0 grid-rows-2 gap-3">
                <ActionButton
                  icon={FileCode2}
                  label="下载模板"
                  onClick={() => downloadText("algorithm_review_input_template_v13.txt", TEMPLATE_TEXT)}
                  tone="emerald"
                  className="h-full w-full"
                />
                <div ref={exportConfirmRef} className="relative h-full min-w-0">
                  <ActionButton
                    icon={FileText}
                    active={exporting === "docx"}
                    iconEffect={exporting === "docx" ? "loading" : undefined}
                    label="导出 Word 文档"
                    onClick={handleExportClick}
                    disabled={exporting !== null || !canExport}
                    tone="emerald"
                    hideLabel={exporting === "docx"}
                    enableLayoutAnimation
                    className="h-full w-full"
                  />
                  <AnimatePresence>
                    {exportConfirmOpen ? (
                      <motion.div
                        key="export-confirm"
                        initial={{ opacity: 0, scale: 0.92, y: 8, filter: "blur(8px)" }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.94, y: 6, filter: "blur(8px)" }}
                        transition={{ type: "spring", stiffness: 440, damping: 26, mass: 0.65 }}
                        style={{ transformOrigin: "85% 100%" }}
                        className="absolute bottom-[calc(100%+10px)] right-0 z-30 w-[min(300px,calc(100vw-2rem))] rounded-[20px] border border-cyan-200/25 bg-[#061019]/90 p-3.5 text-left shadow-[0_20px_70px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-2xl sm:bottom-0 sm:right-[calc(100%+12px)]"
                      >
                        <span className="pointer-events-none absolute -bottom-1.5 right-8 h-3 w-3 rotate-45 border-b border-r border-cyan-200/25 bg-[#061019]/90 sm:-right-1.5 sm:bottom-5 sm:border-b-0 sm:border-l-0 sm:border-r sm:border-t" />
                        <div className="relative flex gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-300/10 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.10)]">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-black text-white">内容可能不完整</div>
                            <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                              当前内容还没完全补全，仍要导出 Word 草稿吗？
                            </p>
                          </div>
                        </div>
                        <div className="relative mt-3 flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setExportConfirmOpen(false)}
                            className="rounded-xl border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-white/20 hover:bg-white/[0.09] hover:text-white"
                          >
                            返回修改
                          </button>
                          <button
                            type="button"
                            onClick={confirmDraftExport}
                            className="rounded-xl border border-cyan-300/35 bg-cyan-300/15 px-3 py-2 text-xs font-black text-cyan-50 shadow-[0_12px_28px_rgba(34,211,238,0.12)] transition hover:border-cyan-200/55 hover:bg-cyan-300/22"
                          >
                            仍然导出
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
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

          <div ref={previewScrollRef} className="tool-scrollbar h-[72vh] min-h-[420px] max-h-[680px] min-w-0 max-w-full overflow-y-auto overflow-x-hidden overscroll-y-auto rounded-[2rem] border border-white/10 bg-[#05070d]/80 p-4 sm:h-[68vh] sm:min-h-[520px] sm:max-h-[760px] sm:p-5 xl:h-auto xl:min-h-0 xl:max-h-none xl:flex-1">
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

      <AnimatePresence>
        {settingsOpen ? (
          <DocumentSettingsModal
            draft={settingsDraft}
            hasUnsavedChanges={hasUnsavedSettings}
            saveState={settingsSaveState}
            isClosing={isClosingSettingsModal}
            onChange={setSettingsDraft}
            onReset={resetDocumentSettings}
            onCancel={() => closeSettingsModal()}
            onSave={saveDocumentSettings}
            origin={settingsOrigin}
            problemTitle={problemTitle}
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}

function DocumentSettingsButton({
  active,
  hasUnsavedChanges,
  onClick,
}: {
  active: boolean
  hasUnsavedChanges: boolean
  onClick: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.025 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
      className={`group/settings relative inline-flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-xl border px-3 py-2 text-xs font-black tracking-wide backdrop-blur-xl ${
        active ? "border-cyan-300/45 bg-cyan-400/[0.16] text-cyan-50" : "border-cyan-400/25 bg-cyan-400/10 text-cyan-100"
      }`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[140%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-cyan-100/16 to-transparent transition-transform duration-700 ease-out group-hover/settings:translate-x-[260%]" />
      <motion.span
        className="relative flex h-5 w-5 items-center justify-center"
        animate={active ? { rotate: 8 } : { rotate: 0 }}
        whileHover={{ rotate: 12 }}
        transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
      >
        <FileCog className="h-4 w-4" />
      </motion.span>
      <span className="relative whitespace-nowrap">导出设置</span>
      {hasUnsavedChanges ? (
        <motion.span
          className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-200 shadow-[0_0_14px_rgba(103,232,249,0.9)]"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 22, mass: 0.55 }}
        />
      ) : null}
    </motion.button>
  )
}

function DocumentSettingsModal({
  draft,
  hasUnsavedChanges,
  saveState,
  isClosing,
  onChange,
  onReset,
  onCancel,
  onSave,
  origin,
  problemTitle,
}: {
  draft: DocumentSettings
  hasUnsavedChanges: boolean
  saveState: "idle" | "saved"
  isClosing: boolean
  onChange: Dispatch<SetStateAction<DocumentSettings>>
  onReset: () => void
  onCancel: () => void
  onSave: () => void
  origin: { x: number; y: number } | null
  problemTitle: string
}) {
  const update = <K extends keyof DocumentSettings>(key: K, value: DocumentSettings[K]) => {
    onChange((current) => normalizeDocumentSettings({ ...current, [key]: value }))
  }
  const filenamePreview = getFallbackDownloadFilename(draft, problemTitle)
  const titlePreview = getTitlePreview(draft, problemTitle)
  const headerPreview = getHeaderPreview(draft)
  const footerPreview = getFooterPreview(draft)
  const viewportWidth = typeof window === "undefined" ? 1440 : window.innerWidth
  const viewportHeight = typeof window === "undefined" ? 900 : window.innerHeight
  const modalWidth = Math.min(640, Math.max(288, viewportWidth - 32))
  const modalHeight = Math.min(760, Math.max(360, viewportHeight - 32))
  const modalLeft = (viewportWidth - modalWidth) / 2
  const modalTop = (viewportHeight - modalHeight) / 2
  const modalRight = modalLeft + modalWidth
  const modalBottom = modalTop + modalHeight
  const modalRadius = Math.min(30, modalWidth / 8, modalHeight / 8)
  const meteorEntry = { x: modalLeft + modalWidth * 0.5, y: modalTop }
  const beamStart = meteorEntry
  const panelNudge = {
    x: origin ? (origin.x - viewportWidth / 2) * 0.1 : 0,
    y: origin ? (origin.y - viewportHeight / 2) * 0.1 : -10,
  }
  const meteorPath = [
    `M ${beamStart.x} ${beamStart.y}`,
    `H ${modalRight - modalRadius}`,
    `Q ${modalRight} ${modalTop} ${modalRight} ${modalTop + modalRadius}`,
    `V ${modalBottom - modalRadius}`,
    `Q ${modalRight} ${modalBottom} ${modalRight - modalRadius} ${modalBottom}`,
    `H ${modalLeft + modalRadius}`,
    `Q ${modalLeft} ${modalBottom} ${modalLeft} ${modalBottom - modalRadius}`,
    `V ${modalTop + modalRadius}`,
    `Q ${modalLeft} ${modalTop} ${modalLeft + modalRadius} ${modalTop}`,
    `H ${meteorEntry.x}`,
  ].join(" ")

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
    >
      <motion.button
        type="button"
        aria-label="关闭文档设置"
        className="absolute inset-0 cursor-default bg-black/42"
        disabled={isClosing}
        onClick={onCancel}
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={isClosing ? { opacity: 0, backdropFilter: "blur(0px)" } : { opacity: 1, backdropFilter: "blur(22px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{
          opacity: { duration: isClosing ? 0.42 : 1.08, ease: [0.32, 0.72, 0, 1] },
          backdropFilter: { duration: isClosing ? 0.52 : 1.08, ease: [0.32, 0.72, 0, 1] },
        }}
      />

      <svg className="pointer-events-none absolute inset-0 z-40 h-full w-full" viewBox={`0 0 ${viewportWidth} ${viewportHeight}`} aria-hidden="true">
        <defs>
          <filter id="document-settings-beam-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <motion.path
          d={meteorPath}
          fill="none"
          stroke="rgba(103,232,249,0.075)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#document-settings-beam-glow)"
          initial={{ pathLength: 0, opacity: 0.32 }}
          animate={{ pathLength: 1, opacity: 0 }}
          exit={{ pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: 1.08, ease: [0.32, 0.72, 0, 1] },
            opacity: { delay: 1.08, duration: 0.84, ease: [0.16, 1, 0.3, 1] },
          }}
        />
        <motion.path
          d={meteorPath}
          fill="none"
          stroke="rgba(125,249,255,0.68)"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#document-settings-beam-glow)"
          initial={{ pathLength: 0, opacity: 0.76 }}
          animate={{ pathLength: 1, opacity: 0 }}
          exit={{ pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: 1.08, ease: [0.32, 0.72, 0, 1] },
            opacity: { delay: 1.08, duration: 0.84, ease: [0.16, 1, 0.3, 1] },
          }}
        />
        <motion.path
          d={meteorPath}
          fill="none"
          stroke="rgba(240,253,250,0.34)"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#document-settings-beam-glow)"
          initial={{ pathLength: 0, opacity: 0.46 }}
          animate={{ pathLength: 1, opacity: 0 }}
          exit={{ pathLength: 0, opacity: 0 }}
          transition={{
            pathLength: { duration: 1.08, ease: [0.32, 0.72, 0, 1] },
            opacity: { delay: 1.08, duration: 0.84, ease: [0.16, 1, 0.3, 1] },
          }}
        />
      </svg>

      {isClosing ? (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[60] h-[min(760px,calc(100dvh-32px))] w-[min(640px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2">
          <ParticleDissolve />
        </div>
      ) : null}

      <motion.div
        className="relative flex h-[min(760px,calc(100dvh-32px))] w-[min(640px,calc(100vw-32px))] origin-center flex-col overflow-visible rounded-[30px] border border-cyan-200/14 bg-[rgba(5,7,13,0.86)] p-5 shadow-[0_28px_120px_rgba(0,0,0,0.56),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:p-6"
        style={{ pointerEvents: isClosing ? "none" : "auto" }}
        initial={{ opacity: 0, x: panelNudge.x, y: panelNudge.y, scale: 0.82, filter: "blur(16px)" }}
        animate={isClosing ? { opacity: 0, x: 0, y: -10, scale: 0.94, filter: "blur(18px)" } : { opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{
          opacity: 0,
          x: panelNudge.x * 0.7,
          y: panelNudge.y * 0.7,
          scale: 0.88,
          filter: "blur(14px)",
          transition: {
            opacity: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
            x: { type: "spring", stiffness: 420, damping: 26, mass: 0.7 },
            y: { type: "spring", stiffness: 420, damping: 26, mass: 0.7 },
            scale: { type: "spring", stiffness: 420, damping: 26, mass: 0.7 },
            filter: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
          },
        }}
        transition={{
          x: { type: "spring", stiffness: 420, damping: 24, mass: 0.7 },
          y: { type: "spring", stiffness: isClosing ? 420 : 420, damping: isClosing ? 30 : 24, mass: 0.72 },
          scale: { type: "spring", stiffness: isClosing ? 430 : 420, damping: isClosing ? 28 : 24, mass: 0.72 },
          opacity: { duration: isClosing ? 0.34 : 0.34, delay: isClosing ? 0 : 0.24, ease: [0.32, 0.72, 0, 1] },
          filter: { duration: isClosing ? 0.42 : 0.3, ease: [0.32, 0.72, 0, 1] },
        }}
      >
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[30px] border border-cyan-200/40"
          initial={false}
          animate={isClosing ? { opacity: [0.7, 1, 0], boxShadow: ["0 0 0 rgba(34,211,238,0)", "0 0 34px rgba(34,211,238,0.22)", "0 0 70px rgba(34,211,238,0)"] } : { opacity: 0, boxShadow: "0 0 0 rgba(34,211,238,0)" }}
          transition={{ duration: 0.58, ease: [0.32, 0.72, 0, 1] }}
        />
        <motion.div
          className="relative flex min-h-0 flex-1 flex-col"
          initial={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{
            opacity: 0,
            y: -8,
            scale: 0.98,
            filter: "blur(8px)",
            transition: {
              opacity: { duration: 0.16, ease: [0.32, 0.72, 0, 1] },
              y: { type: "spring", stiffness: 420, damping: 28, mass: 0.7 },
              scale: { type: "spring", stiffness: 420, damping: 28, mass: 0.7 },
              filter: { duration: 0.18, ease: [0.32, 0.72, 0, 1] },
            },
          }}
          transition={{
            opacity: { duration: 0.36, delay: 1.16, ease: [0.32, 0.72, 0, 1] },
            y: { type: "spring", stiffness: 330, damping: 25, mass: 0.72, delay: 1.1 },
            scale: { type: "spring", stiffness: 330, damping: 25, mass: 0.72, delay: 1.1 },
            filter: { duration: 0.4, delay: 1.12, ease: [0.32, 0.72, 0, 1] },
          }}
        >
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                <SlidersHorizontal className="h-4 w-4" />
                Algorithm Review
              </div>
              <h2 className="text-2xl font-black text-white">文档个性化设置</h2>
              <p className="mt-2 text-xs leading-relaxed text-zinc-400">自定义导出 Word 的文件名、标题、页眉页脚和代码语言。</p>
            </div>
            <div className="flex items-center gap-2">
              {hasUnsavedChanges ? (
                <motion.span
                  className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.9)]"
                  animate={isClosing ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                />
              ) : null}
              <motion.button
                type="button"
                onClick={onCancel}
                whileTap={{ scale: 0.92 }}
                animate={isClosing ? { scale: 0.92 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.6 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-white/20 hover:text-white"
                aria-label="关闭设置"
              >
                <motion.span animate={isClosing ? { rotate: 90 } : { rotate: 0 }} transition={{ type: "spring", stiffness: 520, damping: 26, mass: 0.6 }}>
                  <X className="h-4 w-4" />
                </motion.span>
              </motion.button>
            </div>
          </div>

          <div className="tool-scrollbar -mx-2 min-h-0 flex-1 overflow-y-auto px-2 py-2">
            <div className="flex flex-col">
              <SettingsGroup eyebrow="基础信息">
                <div className="grid gap-4 sm:grid-cols-2">
                  <PillField
                    label="题解类型"
                    description="用于标题、页眉和文件名前缀。"
                    options={DOCUMENT_TYPE_OPTIONS}
                    value={draft.documentType}
                    onChange={(value) => update("documentType", value)}
                  />
                  <PillField
                    label="代码语言"
                    description="用于代码块标签和标题语言。"
                    options={LANGUAGE_OPTIONS}
                    value={draft.language}
                    onChange={(value) => update("language", value)}
                  />
                </div>

                <SettingsCollapsibleField visible={draft.documentType === "自定义"}>
                  <SettingsTextField label="自定义题解类型" value={draft.customDocumentType} onChange={(value) => update("customDocumentType", value)} placeholder="例如：校赛 / 训练营" />
                </SettingsCollapsibleField>
                <SettingsCollapsibleField visible={draft.language === "自定义"}>
                  <SettingsTextField label="自定义代码语言" value={draft.customLanguage} onChange={(value) => update("customLanguage", value)} placeholder="例如：Kotlin / TypeScript" />
                </SettingsCollapsibleField>
              </SettingsGroup>

              <SettingsGroup eyebrow="Word 文件名">
                <SettingsTextField
                  label="自定义文件名"
                  description="不填写时自动生成；填写时会过滤 Windows 非法字符，并自动补 .docx。"
                  value={draft.outputFilename}
                  onChange={(value) => update("outputFilename", value)}
                  placeholder="自动生成"
                />
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.06] px-4 py-3">
                  <div className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-300/80">最终文件名预览</div>
                  <div className="mt-2 break-all font-mono text-sm font-bold text-cyan-50">{filenamePreview}</div>
                </div>
                <SettingsToggle
                  label="保留题型前缀"
                  description={`开启后文件名形如：${getEffectiveDocumentType(draft)}-${problemTitle}-完整题解复盘.docx`}
                  checked={draft.includeTypePrefix}
                  onChange={() => update("includeTypePrefix", !draft.includeTypePrefix)}
                />
              </SettingsGroup>

              <SettingsGroup eyebrow="文档标题样式">
                <SettingsRadioField
                  value={draft.titleStyle}
                  onChange={(value) => update("titleStyle", value)}
                  options={[
                    { value: "simple", label: "简洁标题", preview: `${problemTitle}——完整题解复盘（${getEffectiveLanguage(draft)}）` },
                    { value: "typed", label: "带题解类型", preview: `${getEffectiveDocumentType(draft)}：${problemTitle}——完整题解复盘（${getEffectiveLanguage(draft)}）` },
                    { value: "custom", label: "自定义标题", preview: titlePreview },
                  ]}
                />
                <SettingsCollapsibleField visible={draft.titleStyle === "custom"}>
                  <SettingsTemplateField
                    label="自定义标题"
                    value={draft.customTitleTemplate}
                    onChange={(value) => update("customTitleTemplate", value)}
                    preview={titlePreview}
                    chips={[
                      { label: "题名", value: "{title}" },
                      { label: "题解类型", value: "{type}" },
                      { label: "代码语言", value: "{language}" },
                    ]}
                  />
                </SettingsCollapsibleField>
              </SettingsGroup>

              <SettingsGroup eyebrow="页眉设置">
                <SettingsToggle
                  label="页眉"
                  description={headerPreview}
                  checked={draft.headerEnabled}
                  onChange={() => update("headerEnabled", !draft.headerEnabled)}
                />
                <SettingsCollapsibleField visible={draft.headerEnabled} allowOverflow>
                  <SettingsRadioField
                    value={draft.headerStyle}
                    onChange={(value) => update("headerStyle", value)}
                    options={[
                      { value: "type-language", label: "题解类型 + 代码语言", preview: `${getEffectiveDocumentType(draft)} 题解复盘 · ${getEffectiveLanguage(draft)}` },
                      { value: "type-only", label: "仅题解类型", preview: `${getEffectiveDocumentType(draft)} 题解复盘` },
                      { value: "custom", label: "自定义页眉", preview: headerPreview },
                    ]}
                  />
                  <SettingsCollapsibleField visible={draft.headerStyle === "custom"}>
                    <SettingsTemplateField
                      label="自定义页眉"
                      value={draft.customHeaderText}
                      onChange={(value) => update("customHeaderText", value)}
                      preview={headerPreview}
                      chips={[
                        { label: "题解类型", value: "{type}" },
                        { label: "代码语言", value: "{language}" },
                      ]}
                    />
                  </SettingsCollapsibleField>
                </SettingsCollapsibleField>
              </SettingsGroup>

              <SettingsGroup eyebrow="页脚设置">
                <SettingsToggle
                  label="页脚"
                  description={footerPreview}
                  checked={draft.footerEnabled}
                  onChange={() => update("footerEnabled", !draft.footerEnabled)}
                />
                <SettingsCollapsibleField visible={draft.footerEnabled} allowOverflow>
                  <SettingsToggle
                    label="显示页码"
                    description="开启后会在页脚对应位置插入 Word 页码字段。"
                    checked={draft.showPageNumber}
                    onChange={() => update("showPageNumber", !draft.showPageNumber)}
                  />
                  <SettingsRadioField
                    value={draft.footerStyle}
                    onChange={(value) => update("footerStyle", value)}
                    options={[
                      { value: "algorithm-review", label: "Algorithm Review", preview: draft.showPageNumber ? "Algorithm Review Generator · 第 1 页" : "Algorithm Review Generator" },
                      { value: "chinese-generator", label: "中文工具名", preview: draft.showPageNumber ? "算法题解文档生成器 · 第 1 页" : "算法题解文档生成器" },
                      { value: "custom", label: "自定义页脚", preview: footerPreview },
                    ]}
                  />
                  <SettingsCollapsibleField visible={draft.footerStyle === "custom"}>
                    <SettingsTemplateField
                      label="自定义页脚"
                      value={draft.customFooterText}
                      onChange={(value) => update("customFooterText", value)}
                      preview={footerPreview}
                      chips={[{ label: "页码", value: "{page}" }]}
                    />
                  </SettingsCollapsibleField>
                </SettingsCollapsibleField>
              </SettingsGroup>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <SettingsFooterButton icon={RotateCcw} label="恢复默认" onClick={onReset} tone="neutral" />
            <SettingsFooterButton icon={X} label="取消" onClick={onCancel} tone="neutral" />
            <SettingsFooterButton icon={Save} label={saveState === "saved" ? "已保存" : "保存设置"} onClick={onSave} tone="cyan" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function PillField({
  label,
  description,
  options,
  value,
  onChange,
}: {
  label: string
  description: string
  options: string[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-1 text-sm font-black text-white">{label}</div>
      <p className="mb-3 text-xs leading-relaxed text-zinc-500">{description}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option
          return (
            <button
              type="button"
              key={option}
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-bold transition ${
                active ? "border-cyan-300/45 bg-cyan-400/15 text-cyan-50" : "border-white/10 bg-black/20 text-zinc-400 hover:border-cyan-400/25 hover:text-cyan-100"
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SettingsGroup({ eyebrow, children }: { eyebrow: string; children: ReactNode }) {
  return (
    <section className="mb-4 rounded-[1.4rem] border border-white/10 bg-white/[0.025] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</div>
      <div className="grid gap-3">{children}</div>
    </section>
  )
}

function SettingsRadioField<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string; preview?: string }>
}) {
  return (
    <div className="-mx-2 grid gap-4 overflow-visible px-2 py-3">
      {options.map((option) => {
        const active = value === option.value
        return (
          <motion.button
            type="button"
            key={option.value}
            onClick={() => onChange(option.value)}
            whileHover={{ y: -1.5, scale: 1.006 }}
            whileTap={{ scale: 0.985 }}
            transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.68 }}
            className={`group/radio relative z-0 flex min-h-[4.65rem] min-w-0 items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:z-10 ${
              active ? "border-cyan-300/45 bg-cyan-400/[0.10] text-cyan-50" : "border-white/10 bg-black/20 text-zinc-300 hover:border-cyan-300/24 hover:bg-white/[0.04]"
            }`}
          >
            <span className={`relative mt-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${active ? "border-cyan-200 bg-cyan-300/18" : "border-white/18 bg-black/20"}`}>
              <motion.span
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-100"
                initial={false}
                animate={{ scale: active ? 1 : 0, opacity: active ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 520, damping: 24, mass: 0.55 }}
              />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black">{option.label}</span>
              {option.preview ? <span className="mt-1 block truncate text-xs leading-relaxed text-zinc-500 group-hover/radio:text-zinc-400">{option.preview}</span> : null}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function SettingsToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <span className="min-w-0">
        <span className="block text-sm font-black text-white">{label}</span>
        <span className="mt-1 block break-words text-xs leading-relaxed text-zinc-500">{description}</span>
      </span>
      <motion.button
        type="button"
        aria-pressed={checked}
        onClick={onChange}
        whileHover={{ scale: 1.035 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 470, damping: 22, mass: 0.62 }}
        className={`group/toggle relative h-9 w-[4.25rem] shrink-0 overflow-hidden rounded-full border p-1 backdrop-blur-2xl transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          checked
            ? "border-cyan-200/45 bg-cyan-300/18 shadow-[0_0_26px_rgba(34,211,238,0.14),inset_0_1px_0_rgba(255,255,255,0.12)]"
            : "border-white/12 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        }`}
      >
        <motion.span
          className="absolute inset-0 rounded-full"
          animate={{
            background: checked
              ? "radial-gradient(circle at 28% 35%, rgba(236,254,255,0.24), transparent 28%), linear-gradient(135deg, rgba(34,211,238,0.30), rgba(45,212,191,0.16))"
              : "radial-gradient(circle at 70% 40%, rgba(255,255,255,0.10), transparent 30%), linear-gradient(135deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))",
          }}
          transition={{ type: "spring", stiffness: 360, damping: 30, mass: 0.7 }}
        />
        <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[150%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/16 to-transparent transition-transform duration-700 ease-out group-hover/toggle:translate-x-[260%]" />
        <motion.span
          className="absolute left-1 top-1 h-7 w-7 rounded-full bg-[rgba(245,250,255,0.94)] shadow-[0_8px_22px_rgba(0,0,0,0.32),0_0_18px_rgba(236,254,255,0.20),inset_0_1px_0_rgba(255,255,255,0.95)]"
          animate={{ x: checked ? 32 : 0 }}
          transition={{ type: "spring", stiffness: 520, damping: 25, mass: 0.58 }}
        />
        <motion.span
          className="absolute left-[0.92rem] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-cyan-100"
          animate={{ opacity: checked ? 0.9 : 0.22, scale: checked ? 1 : 0.72 }}
          transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.6 }}
        />
        <motion.span
          className="absolute right-[0.92rem] top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-white/55"
          animate={{ opacity: checked ? 0.22 : 0.52, scale: checked ? 0.72 : 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.6 }}
        />
      </motion.button>
    </div>
  )
}

function ParticleDissolve() {
  const particles = useMemo(() => {
    const colors = [
      "rgba(34, 211, 238, 0.85)",
      "rgba(255, 255, 255, 0.72)",
      "rgba(125, 249, 255, 0.5)",
    ]
    const edgeCounts = [
      { edge: "top", count: 13 },
      { edge: "right", count: 13 },
      { edge: "bottom", count: 8 },
      { edge: "left", count: 6 },
      { edge: "corner", count: 6 },
    ]
    let index = 0
    const pseudoRandom = (seed: number) => {
      const value = Math.sin(seed * 12.9898) * 43758.5453
      return value - Math.floor(value)
    }

    return edgeCounts.flatMap(({ edge, count }) =>
      Array.from({ length: count }, () => {
        index += 1
        const a = pseudoRandom(index)
        const b = pseudoRandom(index + 21)
        const c = pseudoRandom(index + 43)
        const size = 1.5 + pseudoRandom(index + 7) * 2.5
        const isLine = pseudoRandom(index + 15) > 0.84
        const top =
          edge === "top"
            ? -1 + b * 3
            : edge === "bottom"
              ? 98 + b * 3
              : edge === "corner"
                ? -1 + b * 11
                : 8 + a * 84
        const left =
          edge === "left"
            ? -1 + b * 3
            : edge === "right"
              ? 98 + b * 3
              : edge === "corner"
                ? 86 + a * 13
                : 8 + a * 84
        const edgeDirectionX = edge === "left" ? -1 : edge === "right" || edge === "corner" ? 1 : a > 0.5 ? 1 : -1
        const edgeDirectionY = edge === "top" || edge === "corner" ? -1 : edge === "bottom" ? 1 : b > 0.5 ? 1 : -1

        return {
          id: index,
          top,
          left,
          dx: edgeDirectionX * (8 + c * 22),
          dy: edgeDirectionY * (8 + pseudoRandom(index + 5) * 18) - 8,
          size,
          width: isLine ? size * (2.2 + pseudoRandom(index + 2)) : size,
          height: isLine ? Math.max(1, size * 0.45) : size,
          radius: isLine ? 999 : "50%",
          rotate: -30 + pseudoRandom(index + 9) * 70,
          color: colors[index % colors.length],
          delay: pseudoRandom(index + 11) * 0.08,
          duration: 0.48 + pseudoRandom(index + 13) * 0.2,
        }
      }),
    )
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-visible rounded-[30px]" aria-hidden="true">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute shadow-[0_0_14px_rgba(34,211,238,0.35)]"
          style={{
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            width: particle.width,
            height: particle.height,
            borderRadius: particle.radius,
            background: particle.color,
            rotate: `${particle.rotate}deg`,
          }}
          initial={{ opacity: 0, scale: 0.6, x: 0, y: 0, filter: "blur(0px)" }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.6, 1, 0.25],
            x: particle.dx,
            y: particle.dy,
            filter: ["blur(0px)", "blur(0.5px)", "blur(3px)"],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: [0.32, 0.72, 0, 1],
          }}
        />
      ))}
    </div>
  )
}

function SettingsTemplateField({
  label,
  value,
  onChange,
  preview,
  chips,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  preview: string
  chips: Array<{ label: string; value: string }>
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <div className="mb-2 text-sm font-black text-white">{label}</div>
      <div className="mb-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <button
            type="button"
            key={chip.value}
            onClick={() => onChange(`${value}${chip.value}`)}
            className="rounded-full border border-cyan-300/20 bg-cyan-400/[0.08] px-3 py-1 text-[11px] font-bold text-cyan-100 transition hover:border-cyan-200/40 hover:bg-cyan-400/[0.14]"
          >
            插入{chip.label}
          </button>
        ))}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/10"
      />
      <div className="mt-3 rounded-2xl border border-cyan-300/16 bg-cyan-400/[0.05] px-3 py-2">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300/70">预览</span>
        <span className="mt-1 block break-words text-xs font-bold leading-relaxed text-cyan-50">{preview}</span>
      </div>
    </div>
  )
}

function SettingsCollapsibleField({
  children,
  visible,
  allowOverflow = false,
}: {
  children: ReactNode
  visible: boolean
  allowOverflow?: boolean
}) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  const updateHeight = useCallback(() => {
    const nextHeight = contentRef.current?.scrollHeight ?? 0
    setHeight((current) => (Math.abs(current - nextHeight) < 0.5 ? current : nextHeight))
  }, [])

  useLayoutEffect(() => {
    updateHeight()
  }, [children, updateHeight, visible])

  useEffect(() => {
    const element = contentRef.current
    if (!element || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [updateHeight])

  return (
    <motion.div
      className={visible && allowOverflow ? "overflow-visible" : "overflow-hidden"}
      style={{ pointerEvents: visible ? "auto" : "none" }}
      initial={false}
      animate={{ height: visible ? height : 0, marginBottom: visible ? 12 : 0 }}
      transition={{
        height: { type: "spring", stiffness: 280, damping: 32, mass: 0.86 },
        marginBottom: { type: "spring", stiffness: 280, damping: 32, mass: 0.86 },
      }}
    >
      <motion.div
        ref={contentRef}
        aria-hidden={!visible}
        className={visible ? "py-2" : "pointer-events-none py-2"}
        initial={false}
        animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -8, filter: visible ? "blur(0px)" : "blur(8px)" }}
        transition={{
          opacity: { duration: visible ? 0.28 : 0.18, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 360, damping: 30, mass: 0.72 },
          filter: { duration: 0.22, ease: [0.32, 0.72, 0, 1] },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

function SettingsTextField({
  label,
  description,
  value,
  onChange,
  placeholder,
}: {
  label: string
  description?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-white/[0.035] p-3">
      <span className="text-sm font-black text-white">{label}</span>
      {description ? <span className="mt-1 block text-xs leading-relaxed text-zinc-500">{description}</span> : null}
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/10"
      />
    </label>
  )
}

function SettingsFooterButton({
  icon: Icon,
  label,
  onClick,
  tone,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  tone: "neutral" | "cyan"
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover="hover"
      initial="rest"
      animate="rest"
      variants={{
        rest: { y: 0, scale: 1 },
        hover: { y: -2, scale: 1.025 },
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 24, mass: 0.7 }}
      className={`group/settings-footer relative inline-flex min-h-10 items-center justify-center gap-2 overflow-hidden rounded-xl border px-4 py-2 text-xs font-black backdrop-blur-xl ${
        tone === "cyan"
          ? "border-cyan-300/35 bg-cyan-400/15 text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.10)]"
          : "border-white/10 bg-white/[0.04] text-zinc-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/20 hover:text-white"
      }`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[150%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/14 to-transparent transition-transform duration-700 ease-out group-hover/settings-footer:translate-x-[260%]" />
      <motion.span
        className="relative flex h-4 w-4 items-center justify-center"
        variants={{
          rest: { y: 0, scale: 1, rotate: 0 },
          hover: { y: -1, scale: 1.08, rotate: tone === "cyan" ? 3 : -3 },
        }}
        transition={{ type: "spring", stiffness: 460, damping: 23, mass: 0.62 }}
      >
        <Icon className="h-4 w-4" />
      </motion.span>
      <motion.span
        className="relative"
        variants={{
          rest: { y: 0 },
          hover: { y: -0.5 },
        }}
        transition={{ type: "spring", stiffness: 460, damping: 24, mass: 0.62 }}
      >
        {label}
      </motion.span>
    </motion.button>
  )
}

function LiquidMiniToast({ text }: { text: string }) {
  return (
    <motion.div
      className="pointer-events-none absolute right-0 top-full z-30 mt-3 whitespace-nowrap rounded-[1.4rem] border border-white/10 bg-[#071015]/72 px-4 py-2 text-xs font-black text-cyan-50 shadow-[0_18px_54px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: -4, scale: 0.72, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -8, scale: 0.82, filter: "blur(9px)" }}
      transition={{
        opacity: { type: "spring", stiffness: 420, damping: 22, mass: 0.6 },
        y: { type: "spring", stiffness: 430, damping: 20, mass: 0.6 },
        scale: { type: "spring", stiffness: 460, damping: 19, mass: 0.6 },
        filter: { type: "spring", stiffness: 380, damping: 24, mass: 0.6 },
      }}
    >
      {text}
    </motion.div>
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

type InputHealth = {
  score: number
  status: "empty" | "warning" | "ready"
  message: string
  checks: Array<{ label: string; ok: boolean }>
  issues: StructureIssue[]
}

type StructureIssue = {
  id: string
  severity: "error" | "warning"
  title: string
  detail: string
  line?: number
}

function getStructureIssues(input: string, sectionMap: Map<string, string>, missingSections: string[]): StructureIssue[] {
  if (!input.trim()) return []

  const issues: StructureIssue[] = missingSections.map((section) => ({
    id: `missing-${section}`,
    severity: "error",
    title: `缺少「${section}」`,
    detail: "核心章节为空或没有按【章节名】格式填写。",
  }))

  if (!sectionMap.get("标题")?.trim()) {
    issues.push({
      id: "empty-title",
      severity: "error",
      title: "标题为空",
      detail: "请补全【标题】章节，导出的 Word 会使用它作为文档主标题。",
      line: 1,
    })
  }

  const codeFenceCount = input.match(/```/g)?.length ?? 0
  if (codeFenceCount % 2 !== 0) {
    const lastFenceIndex = input.lastIndexOf("```")
    issues.push({
      id: "code-fence-open",
      severity: "error",
      title: "代码块没有闭合",
      detail: "检测到 ``` 数量为奇数，请补上缺失的结束代码围栏。",
      line: getLineFromIndex(input, lastFenceIndex),
    })
  }

  const figureOpenCount = input.match(/\[\[图[:：\s]/g)?.length ?? 0
  const figureCloseCount = input.match(/\[\[\/图\]\]/g)?.length ?? 0
  if (figureOpenCount !== figureCloseCount) {
    const firstFigureIndex = input.search(/\[\[图[:：\s]/)
    issues.push({
      id: "figure-block-open",
      severity: "error",
      title: "图块标签没有闭合",
      detail: `检测到 ${figureOpenCount} 个图块开始标签、${figureCloseCount} 个结束标签，请检查 [[图:...]] 与 [[/图]]。`,
      line: firstFigureIndex >= 0 ? getLineFromIndex(input, firstFigureIndex) : 1,
    })
  }

  const lines = input.split(/\r?\n/)
  const brokenTableIndex = lines.findIndex((line, index) => {
    const current = line.trim()
    const next = lines[index + 1]?.trim()
    return current.startsWith("|") && current.endsWith("|") && Boolean(next) && next.startsWith("|") && !next.match(/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/)
  })
  if (brokenTableIndex >= 0) {
    issues.push({
      id: "table-separator",
      severity: "warning",
      title: "表格分隔行可能异常",
      detail: `第 ${brokenTableIndex + 2} 行附近像是 Markdown 表格，但分隔行格式不完整。`,
      line: brokenTableIndex + 2,
    })
  }

  const sampleInput = sectionMap.get("样例1输入")?.trim()
  const sampleOutput = sectionMap.get("样例1输出")?.trim()
  if (input.trim() && (!sampleInput || !sampleOutput)) {
    issues.push({
      id: "sample-one-empty",
      severity: "warning",
      title: "样例 1 输入/输出不完整",
      detail: "建议补全样例 1，导出后的复盘文档会更完整。",
    })
  }

  return issues
}

function getInputHealth(input: string, sectionMap: Map<string, string>, missingSections: string[], issues: StructureIssue[]): InputHealth {
  if (!input.trim()) {
    return {
      score: 0,
      status: "empty",
      message: "等待粘贴 AI 生成内容",
      checks: [
        { label: "章节", ok: false },
        { label: "代码块", ok: false },
        { label: "图块", ok: false },
      ],
      issues: [],
    }
  }

  const blockingIssues = issues.filter((issue) => issue.severity === "error")
  const requiredComplete = REQUIRED_SECTIONS.length - missingSections.length
  const requiredScore = Math.round((requiredComplete / REQUIRED_SECTIONS.length) * 70)
  const codeFenceOk = (input.match(/```/g)?.length ?? 0) % 2 === 0
  const figureOpenCount = input.match(/\[\[图[:：\s]/g)?.length ?? 0
  const figureCloseCount = input.match(/\[\[\/图\]\]/g)?.length ?? 0
  const figureOk = figureOpenCount === figureCloseCount
  const titleOk = Boolean(sectionMap.get("标题")?.trim())
  const score = Math.min(100, requiredScore + (codeFenceOk ? 10 : 0) + (figureOk ? 10 : 0) + (titleOk ? 10 : 0))

  return {
    score,
    status: blockingIssues.length === 0 ? "ready" : "warning",
    message: blockingIssues.length === 0 ? "结构基本完整，可以继续预览与导出" : `发现 ${blockingIssues.length} 个需要处理的问题`,
    checks: [
      { label: "核心章节", ok: missingSections.length === 0 },
      { label: "代码闭合", ok: codeFenceOk },
      { label: "图块闭合", ok: figureOk },
      { label: "标题", ok: titleOk },
    ],
    issues,
  }
}

const TEMPLATE_PLACEHOLDER_PATTERNS = [
  /这里(?:先不用|写|填|放|补|替换|说明|粘贴|整理|生成)/,
  /(?:待补充|待填写|TODO|TBD)/i,
  /关键词[1-4]|题名|要求[一二三]/,
  /版本\s*\d+\s*[：:]\s*最初思路代码/,
  /阶段\s*\d+\s*[：:]\s*这里/,
]

function isTemplatePlaceholderText(text: string) {
  return TEMPLATE_PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(text))
}

function hasMeaningfulAcCode(sectionMap: Map<string, string>) {
  const acContent = sectionMap.get("AC代码")?.trim() ?? ""
  if (!acContent || isTemplatePlaceholderText(acContent)) return false

  const acCodeBlocks = getCodeBlocks(acContent).filter((block) => block.trim())
  return acCodeBlocks.some((block) => !isTemplatePlaceholderText(block))
}

function getExportNeedsConfirmation(
  input: string,
  sectionMap: Map<string, string>,
  health: InputHealth,
  missingSections: string[],
  blockingIssues: StructureIssue[],
) {
  if (!input.trim()) return false

  return (
    health.score < 100 ||
    health.status !== "ready" ||
    missingSections.length > 0 ||
    blockingIssues.length > 0 ||
    isTemplatePlaceholderText(input) ||
    !hasMeaningfulAcCode(sectionMap)
  )
}

function InputHealthPanel({ health }: { health: InputHealth }) {
  const isPerfect = health.status === "ready" && health.score >= 100
  const tone =
    health.status === "ready"
      ? "border-emerald-400/20 bg-emerald-500/[0.08] text-emerald-100"
      : health.status === "warning"
        ? "border-amber-400/20 bg-amber-500/[0.08] text-amber-100"
        : "border-white/10 bg-white/[0.035] text-zinc-300"
  const bar =
    health.status === "ready"
      ? "from-emerald-300 via-cyan-200 to-emerald-300"
      : health.status === "warning"
        ? "from-amber-300 via-cyan-200 to-amber-300"
        : "from-zinc-500 via-zinc-400 to-zinc-500"

  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 rounded-2xl border p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] ${tone}`}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5" />
          <span className="text-xs font-black text-white">输入健康度</span>
        </div>
        <Counter value={health.score} fontSize={14} padding={2} gap={0} textColor="white" fontWeight={900} places={health.score >= 100 ? [100, 10, 1] : [10, 1]} />
      </div>
      <div className="relative h-1.5 overflow-hidden rounded-full bg-black/30">
        <motion.div
          className={`relative h-full overflow-hidden rounded-full bg-gradient-to-r ${bar}`}
          initial={false}
          animate={{ width: `${health.score}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 24, mass: 0.7 }}
        >
          {isPerfect ? (
            <motion.span
              className="absolute inset-y-[-2px] w-1/3 -translate-x-full skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/65 to-transparent blur-[1px]"
              animate={{ x: ["-120%", "340%"] }}
              transition={{ duration: 1.75, repeat: Infinity, ease: [0.22, 1, 0.36, 1], repeatDelay: 0.35 }}
            />
          ) : null}
        </motion.div>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-[11px] font-semibold text-zinc-400">{health.message}</span>
        {health.checks.map((check) => (
          <span
            key={check.label}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold ${
              check.ok ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-black/20 text-zinc-500"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${check.ok ? "bg-emerald-300" : "bg-zinc-600"}`} />
            {check.label}
          </span>
        ))}
      </div>
      <AnimatePresence initial={false}>
        {health.issues.length > 0 ? (
          <motion.div
            initial={{ maxHeight: 190, marginTop: 12, opacity: 0 }}
            animate={{ maxHeight: 190, marginTop: 12, opacity: 1 }}
            exit={{
              maxHeight: 0,
              marginTop: 0,
              opacity: 0,
              transition: {
                maxHeight: { type: "spring", stiffness: 155, damping: 24, mass: 0.88, delay: 0.12 },
                marginTop: { type: "spring", stiffness: 155, damping: 24, mass: 0.88, delay: 0.12 },
                opacity: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
              },
            }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <div className="tool-scrollbar max-h-[172px] overflow-y-auto pr-1">
              <div className="grid gap-2 pb-1">
                {health.issues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.28, delay: index * 0.025, ease: [0.32, 0.72, 0, 1] },
                    }}
                    className={`rounded-xl border px-3 py-2 ${
                      issue.severity === "error" ? "border-amber-300/20 bg-amber-400/[0.08]" : "border-cyan-300/20 bg-cyan-400/[0.07]"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[11px] font-black text-white">
                      <span className={`h-1.5 w-1.5 rounded-full ${issue.severity === "error" ? "bg-amber-300" : "bg-cyan-300"}`} />
                      {issue.title}
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-zinc-400">{issue.detail}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

function EditorVisualLineNumbers({ layout, scrollY }: { layout: EditorLayout; scrollY: MotionValue<number> }) {
  const top = useTransform(scrollY, (latest) => -Math.round(latest))

  return (
    <motion.div className="absolute left-0 right-0 px-2 text-right font-mono text-sm text-zinc-600" style={{ top }}>
      <div className="relative" style={{ height: layout.scrollHeight }}>
        {Array.from({ length: layout.visualLineCount }, (_, index) => (
          <div
            key={index + 1}
            className="absolute left-0 right-0 select-none tabular-nums"
            style={{
              top: layout.paddingTop + index * layout.lineHeight,
              height: layout.lineHeight,
              lineHeight: `${layout.lineHeight}px`,
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function EditorLineHighlight({
  layout,
  scrollY,
}: {
  layout: EditorLayout
  scrollY: MotionValue<number>
}) {
  const caretY = useSpring(layout.caretTop, {
    stiffness: 440,
    damping: 36,
    mass: 0.68,
    restDelta: 0.01,
  })
  const top = useTransform([caretY, scrollY], ([caret, scroll]) => Math.round(Number(caret) - Number(scroll)))
  const opacity = useTransform(top, (latest) => (latest >= -layout.lineHeight && latest <= 1200 ? 1 : 0))

  useEffect(() => {
    caretY.set(layout.caretTop)
  }, [caretY, layout.caretTop])

  return (
    <motion.div
      className="pointer-events-none absolute left-2 right-3 z-0 rounded-lg border border-cyan-200/[0.16] bg-cyan-300/[0.105] shadow-[0_0_26px_rgba(34,211,238,0.09),inset_0_1px_0_rgba(255,255,255,0.045)]"
      style={{
        top,
        height: layout.lineHeight,
        opacity,
      }}
    />
  )
}

function PromptPreviewButton({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label="预览 AI 补全指令"
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 430, damping: 25, mass: 0.7 }}
      className={`group relative flex min-h-10 items-center justify-center overflow-hidden rounded-xl border text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.08)] ${
        active ? "border-cyan-300/45 bg-cyan-400/[0.16]" : "border-cyan-400/25 bg-cyan-400/10 hover:border-cyan-300/45 hover:bg-cyan-400/[0.16]"
      }`}
    >
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1/2 -translate-x-[140%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-cyan-100/14 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-[260%]" />
      <Eye className="relative h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-0.5 group-hover:scale-110" />
    </motion.button>
  )
}

function PromptPreviewPanel({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      className="absolute right-0 top-full z-30 mt-3 w-[min(520px,calc(100vw-2rem))] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#071015]/90 shadow-[0_24px_80px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: -8, scale: 0.96, filter: "blur(10px)" }}
      animate={{ opacity: 0.99, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -6, scale: 0.97, filter: "blur(8px)" }}
      transition={{
        opacity: { duration: 0.24, ease: [0.32, 0.72, 0, 1] },
        y: { type: "spring", stiffness: 360, damping: 24, mass: 0.7 },
        scale: { type: "spring", stiffness: 380, damping: 25, mass: 0.7 },
        filter: { duration: 0.26, ease: [0.32, 0.72, 0, 1] },
      }}
    >
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-300">Prompt Preview</div>
          <div className="mt-1 text-sm font-black text-white">AI 补全指令预览</div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="关闭预览"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:border-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="tool-scrollbar max-h-[280px] overflow-y-auto p-4">
        <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-zinc-400">{AI_PROMPT}</pre>
      </div>
    </motion.div>
  )
}

function DraftRestoreNotice({ onRestore, onDismiss }: { onRestore: () => void; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ maxHeight: 0, marginBottom: 0, opacity: 0, y: -8, scale: 0.98, filter: "blur(8px)" }}
      animate={{ maxHeight: 120, marginBottom: 16, opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{
        maxHeight: 0,
        marginBottom: 0,
        opacity: 0,
        y: -6,
        scale: 0.985,
        filter: "blur(8px)",
        transition: {
          maxHeight: { type: "spring", stiffness: 165, damping: 24, mass: 0.9, delay: 0.16 },
          marginBottom: { type: "spring", stiffness: 165, damping: 24, mass: 0.9, delay: 0.16 },
          opacity: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
          y: { type: "spring", stiffness: 330, damping: 25, mass: 0.72 },
          scale: { type: "spring", stiffness: 360, damping: 26, mass: 0.7 },
          filter: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
        },
      }}
      transition={{
        maxHeight: { type: "spring", stiffness: 150, damping: 23, mass: 0.95 },
        marginBottom: { type: "spring", stiffness: 150, damping: 23, mass: 0.95 },
        opacity: { duration: 0.32, delay: 0.08, ease: [0.32, 0.72, 0, 1] },
        y: { type: "spring", stiffness: 320, damping: 24, mass: 0.75 },
        scale: { type: "spring", stiffness: 360, damping: 26, mass: 0.75 },
        filter: { duration: 0.32, delay: 0.06, ease: [0.32, 0.72, 0, 1] },
      }}
      className="overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-400/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
    >
      <div className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="text-xs font-black text-white">检测到上次未导出的内容</div>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-400">可以恢复到输入工作台继续编辑，或者忽略这次草稿。</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] font-bold text-zinc-400 transition hover:border-white/20 hover:text-white"
          >
            忽略
          </button>
          <button
            type="button"
            onClick={onRestore}
            className="rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-2 text-[11px] font-bold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-400/15 hover:text-white"
          >
            恢复草稿
          </button>
        </div>
      </div>
    </motion.div>
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
      <div className="absolute inset-x-8 bottom-1 h-8 rounded-full bg-black/45 blur-2xl" />
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 360 72" fill="none" aria-hidden="true" preserveAspectRatio="none">
        <defs>
          <linearGradient id="copy-toast-glass" x1="52" y1="8" x2="309" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(42,62,64,0.86)" />
            <stop offset="0.42" stopColor="rgba(18,31,34,0.92)" />
            <stop offset="1" stopColor="rgba(7,13,16,0.96)" />
          </linearGradient>
          <linearGradient id="copy-toast-edge" x1="54" y1="7" x2="315" y2="66" gradientUnits="userSpaceOnUse">
            <stop stopColor="rgba(255,255,255,0.28)" />
            <stop offset="0.4" stopColor="rgba(125,211,252,0.13)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.18)" />
          </linearGradient>
          <radialGradient id="copy-toast-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(151 17) rotate(32) scale(156 64)">
            <stop stopColor="rgba(255,255,255,0.14)" />
            <stop offset="1" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          fill="url(#copy-toast-glass)"
          opacity="1"
        />
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          stroke="url(#copy-toast-edge)"
          strokeWidth="1.15"
          opacity="0.95"
        />
        <path
          d="M45 22.8C82.5 11.2 101.8 22.5 123 18.4C149.5 13.2 166 15.1 184 25.3"
          stroke="rgba(255,255,255,0.18)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M30.5 26.4C35.3 14.2 50.4 10.2 66.5 13.5C77.9 4.9 101.1 5.2 114.8 15.2C132.1 6.9 158.8 8.2 174.6 19.1C193.4 7.2 221.1 9.4 234.4 20.9C249.3 11.1 275.3 13 286.7 25.5C308.1 21.2 330.2 29.1 332.6 43.8C335.4 60.4 315.7 67.8 295.7 62.8C280.8 72.4 257.4 70.3 243.2 62.7C223.5 69.3 198.6 68.6 181.4 60.3C163.2 70.1 134.6 68.6 118.4 59.1C99.9 66.9 76.9 65.5 62.4 57.1C44.9 62.1 26.8 57.4 24.2 44.2C22.8 37.2 24.8 30.9 30.5 26.4Z"
          fill="url(#copy-toast-glow)"
          opacity="0.8"
        />
      </svg>
      <div className="relative flex h-full items-center justify-center px-7 text-center text-[11px] font-bold tracking-wide text-zinc-100/90 drop-shadow-[0_1px_8px_rgba(255,255,255,0.05)]">
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
  issues,
}: {
  visible: boolean
  isScanning: boolean
  isComplete: boolean
  issues: StructureIssue[]
}) {
  const blockingIssues = issues.filter((issue) => issue.severity === "error")
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
              发现需要处理的问题：
              <span className="ml-2 text-amber-100">{blockingIssues.slice(0, 2).map((issue) => issue.title).join("、")}</span>
              {blockingIssues.length > 2 ? <span className="ml-1 text-amber-100/70">等 {blockingIssues.length} 项</span> : null}
            </div>
          ),
        }

  return (
    <motion.div
      initial={false}
      animate={{
        height: visible ? 86 : 0,
        marginTop: visible ? 20 : 0,
        opacity: visible ? 1 : 0,
      }}
      transition={{
        height: visible
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
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30"
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <div className="flex h-full items-center p-4">
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
              className={`flex min-w-0 gap-3 text-sm ${state.className}`}
            >
              {state.icon}
              <div className="min-w-0">{state.body}</div>
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
  issueCount,
  hasInput,
}: {
  isScanning: boolean
  isExporting: boolean
  isReady: boolean
  isSuccess: boolean
  error: string | null
  issueCount: number
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
                  label: "可导出 Word 草稿",
                  text: issueCount > 0 ? `有 ${issueCount} 个内容提醒，点击导出时会先确认。` : "有轻量提醒，但不影响先导出 Word 草稿。",
                  theme: EXPORT_STATE_THEMES.missing,
                }
              : {
                  kind: "idle" as const,
                  label: "等待粘贴内容",
                  text: "先复制 AI 补全指令并粘贴生成内容，系统会自动检查结构。",
                theme: EXPORT_STATE_THEMES.idle,
                }
  const hasReadyCurrent = state.kind === "ready" || state.kind === "success"

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
      {hasReadyCurrent ? (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_48%,rgba(52,211,153,0.18),transparent_34%),linear-gradient(105deg,transparent_0%,rgba(20,184,166,0.05)_28%,rgba(110,231,183,0.16)_48%,rgba(34,211,238,0.06)_64%,transparent_100%)]"
          animate={{ backgroundPosition: ["-90% 50%", "190% 50%"], opacity: [0.28, 0.68, 0.28] }}
          transition={{ duration: 2.9, repeat: Infinity, ease: [0.22, 1, 0.36, 1], repeatDelay: 0.18 }}
          style={{ backgroundSize: "230% 100%" }}
        />
      ) : null}
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
