// src/lib/bookmark-utils.ts
// 🔖 书签分类自动推断 —— 基于域名做轻量分桶
// 设计原则：仅使用主色青蓝 + 状态色（红/绿/琥珀），不引入新色相

export type BookmarkCategory = {
  key: string
  label: string
  // 与全站统一的色彩 token：青蓝主色 / 翡翠绿（成功）/ 琥珀（警示）/ 玫瑰（社区）/ 深空灰（默认）
  chipClass: string // 标签整体 (bg + border + text)
  dotClass: string // 状态点
}

const CATEGORIES: Record<string, BookmarkCategory> = {
  code: {
    key: "code",
    label: "代码",
    chipClass: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
    dotClass: "bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]",
  },
  docs: {
    key: "docs",
    label: "文档",
    chipClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    dotClass: "bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]",
  },
  learn: {
    key: "learn",
    label: "学习",
    chipClass: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    dotClass: "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.8)]",
  },
  community: {
    key: "community",
    label: "社区",
    chipClass: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    dotClass: "bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]",
  },
  tools: {
    key: "tools",
    label: "工具",
    chipClass: "bg-zinc-500/10 border-zinc-400/30 text-zinc-300",
    dotClass: "bg-zinc-300 shadow-[0_0_6px_rgba(228,228,231,0.6)]",
  },
}

const CODE_HOSTS = ["github.com", "gitee.com", "gitlab.com", "codepen.io", "stackblitz.com", "codesandbox.io"]
const DOC_HOSTS = ["docs.", "documentation.", "mdn.", "developer.mozilla", "readthedocs", "wiki", "notion.so"]
const LEARN_HOSTS = ["coursera", "edx", "udemy", "khanacademy", "ysyx", ".edu", "bilibili.com", "youtube.com", "youtu.be"]
const COMMUNITY_HOSTS = ["zhihu", "v2ex", "reddit", "discord", "twitter", "x.com", "weibo", "stackoverflow"]

export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

export function getCategory(url: string): BookmarkCategory {
  const host = getDomain(url).toLowerCase()
  if (CODE_HOSTS.some((h) => host.includes(h))) return CATEGORIES.code
  if (DOC_HOSTS.some((h) => host.includes(h))) return CATEGORIES.docs
  if (LEARN_HOSTS.some((h) => host.includes(h))) return CATEGORIES.learn
  if (COMMUNITY_HOSTS.some((h) => host.includes(h))) return CATEGORIES.community
  return CATEGORIES.tools
}

// 中文相对时间（如「3 天前」「刚刚」）
export function formatRelative(date: Date | string | number): string {
  const d = typeof date === "object" ? date : new Date(date)
  const diff = Date.now() - d.getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return "刚刚"
  const min = Math.floor(sec / 60)
  if (min < 60) return `${min} 分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour} 小时前`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day} 天前`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month} 个月前`
  return `${Math.floor(month / 12)} 年前`
}
