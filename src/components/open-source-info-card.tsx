"use client"

import { ExternalLink, Sparkles, UserRound } from "lucide-react"
import { motion } from "framer-motion"

const repoUrl = "https://github.com/JouCristian/Generating-reviewFile"

const cardSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 24,
  mass: 0.85,
}

const iconSpring = {
  type: "spring" as const,
  stiffness: 420,
  damping: 22,
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.4 7.86 10.92.58.1.79-.25.79-.56v-2.02c-3.2.7-3.88-1.38-3.88-1.38-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.24 3.35.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18A10.9 10.9 0 0 1 12 6.17c.98 0 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.05c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  )
}

export function OpenSourceInfoCard() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 28, scale: 0.985, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.28 }}
      whileHover={{
        y: -5,
        borderColor: "rgba(34, 211, 238, 0.36)",
        boxShadow: "0 24px 70px rgba(8, 145, 178, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      }}
      transition={{
        opacity: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
        filter: { duration: 0.5, ease: [0.32, 0.72, 0, 1] },
        y: cardSpring,
        scale: cardSpring,
        borderColor: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
        boxShadow: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
      }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-black/35 p-6 text-white shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-7 lg:p-8"
    >
      <div className="pointer-events-none absolute -left-24 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-90" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl transition-opacity duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_0%,rgba(34,211,238,0.10),transparent_36%),radial-gradient(circle_at_88%_100%,rgba(124,58,237,0.10),transparent_34%)]" />

      <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 max-w-3xl">
          <div className="mb-4 flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={iconSpring}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 text-cyan-200 shadow-[0_0_28px_rgba(34,211,238,0.12)]"
            >
              <GitHubMark className="h-5 w-5" />
            </motion.div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.36em] text-cyan-300">Open Source</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">开源项目</h2>
            </div>
          </div>

          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-xs text-zinc-200 sm:text-sm">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-300" />
            <span className="truncate">JouCristian/Generating-reviewFile</span>
          </div>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            这个工具开源在 GitHub 仓库中，核心目标是把刷题复盘流程整理成可复用的文档生成工作台，帮助小组成员更快完成学习记录、资料整理和复盘归档。
          </p>
        </div>

        <div className="flex w-full flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl lg:w-[420px]">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 text-violet-200">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-violet-200/80">Author</p>
              <h3 className="mt-1 text-lg font-black text-white">JouCristian</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                关注算法学习、自动化文档生成与小组协作工具建设，希望把重复操作沉淀成更顺手的开源小工具。
              </p>
            </div>
          </div>

          <motion.a
            href={repoUrl}
            target="_blank"
            rel="noreferrer"
            whileHover="hover"
            whileTap={{ scale: 0.985 }}
            transition={cardSpring}
            className="group/button relative mt-1 inline-flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,0.10)] transition-colors duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-cyan-400/[0.14]"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-200/10 to-transparent transition-transform duration-700 ease-out group-hover/button:translate-x-full" />
            <motion.span variants={{ hover: { scale: 1.08 } }} transition={iconSpring} className="relative">
              <GitHubMark className="h-4 w-4" />
            </motion.span>
            <span className="relative">查看 GitHub 仓库</span>
            <motion.span variants={{ hover: { x: 3, y: -3 } }} transition={iconSpring} className="relative">
              <ExternalLink className="h-4 w-4" />
            </motion.span>
          </motion.a>
        </div>
      </div>
    </motion.section>
  )
}
