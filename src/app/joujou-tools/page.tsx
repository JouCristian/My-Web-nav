import Link from "next/link"
import { ArrowLeft, ArrowRight, Boxes, Hammer, HeartHandshake, Lightbulb } from "lucide-react"
import AnimatedContent from "@/components/animated-content"
import { HideSpacetime } from "@/components/hide-spacetime"
import { joujouTools, type JouJouTool } from "@/lib/joujou-tools"

const accentMap: Record<JouJouTool["accent"], string> = {
  cyan: "border-cyan-500/25 bg-cyan-500/10 text-cyan-300 shadow-[0_0_45px_rgba(34,211,238,0.08)]",
  emerald: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300 shadow-[0_0_45px_rgba(16,185,129,0.08)]",
  amber: "border-amber-500/25 bg-amber-500/10 text-amber-300 shadow-[0_0_45px_rgba(245,158,11,0.08)]",
  violet: "border-violet-500/25 bg-violet-500/10 text-violet-300 shadow-[0_0_45px_rgba(139,92,246,0.08)]",
}

const statusLabel: Record<JouJouTool["status"], string> = {
  available: "可用",
  beta: "试运行",
  planned: "计划中",
}

const principles = [
  { icon: HeartHandshake, label: "服务小组", text: "优先解决成员真实遇到的重复流程。" },
  { icon: Lightbulb, label: "降低门槛", text: "把复杂流程包装成更直观的网页操作。" },
  { icon: Boxes, label: "长期沉淀", text: "好用的流程会持续整理、开源和复用。" },
]

export default function JouJouToolsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-4 py-8 pt-24 text-white sm:px-6 lg:px-10">
      <HideSpacetime />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <AnimatedContent distance={80} direction="horizontal" reverse duration={0.9} ease="power3.out">
          <div>
            <Link
              href="/"
              className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold tracking-widest text-zinc-300 backdrop-blur-xl transition-all hover:border-cyan-500/30 hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回首页
            </Link>

            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                JouJou Tool Library
              </span>
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
              JouJou开源工具库
            </h1>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              这里不是普通导航书签，而是面向小组成员的实用工具集合。每个工具都会尽量把复杂步骤讲清楚、把重复操作自动化，让大家能更快完成学习记录、资料整理和协作任务。
            </p>
          </div>
          </AnimatedContent>

          <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
            {principles.map((item) => {
              const Icon = item.icon
              return (
                <AnimatedContent key={item.label} distance={60} duration={0.8} ease="power3.out" delay={0.08}>
                <div key={item.label} className="rounded-3xl border border-white/10 bg-black/25 p-4 backdrop-blur-xl">
                  <Icon className="mb-4 h-5 w-5 text-cyan-300" />
                  <div className="text-sm font-bold text-white">{item.label}</div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{item.text}</p>
                </div>
                </AnimatedContent>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3">
          {joujouTools.map((tool, index) => (
            <AnimatedContent
              key={tool.slug}
              className="min-w-0 h-full"
              distance={90}
              duration={0.9}
              ease="power3.out"
              delay={index * 0.08}
            >
            <Link
              href={tool.href}
              className="group relative flex h-full min-h-[360px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#05070d]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-2 hover:border-white/25 active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] to-transparent opacity-40 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-[90px] transition-all duration-700 group-hover:bg-emerald-500/15" />

              <div className="relative z-10 flex h-full flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${accentMap[tool.accent]}`}>
                      <Hammer className="h-6 w-6" />
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                      {statusLabel[tool.status]}
                    </span>
                  </div>

                  <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-600">
                    Tool {String(index + 1).padStart(2, "0")}
                  </div>
                  <h2 className="mt-3 text-2xl font-black leading-tight tracking-wide text-white">{tool.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-500">{tool.description}</p>
                </div>

                <div>
                  <div className="mt-8 flex flex-wrap gap-2">
                    {tool.tags.map((tag) => (
                      <span key={tag} className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">开始使用</span>
                    <ArrowRight className="h-5 w-5 text-cyan-300 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </div>
            </Link>
            </AnimatedContent>
          ))}

          <AnimatedContent
            className="h-full min-w-0"
            distance={90}
            duration={0.9}
            ease="power3.out"
            animateOpacity={false}
            delay={0.12}
          >
          <div className="relative flex h-full min-h-[360px] overflow-hidden rounded-[2rem] border border-dashed border-white/10 bg-black/25 p-6 backdrop-blur-xl">
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-500">
                <Boxes className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-xl font-bold text-zinc-300">正在开发</h2>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
                后续可以继续加入算法可视化、资料整理、训练记录、学习路线等面向小组使用的工具。
              </p>
            </div>
          </div>
          </AnimatedContent>
        </div>
      </div>
    </main>
  )
}
