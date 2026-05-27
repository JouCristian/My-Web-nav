import { ArrowRight, BookOpenCheck, Compass, Hammer, Sparkles } from "lucide-react"
import Link from "next/link"
import AnimatedContent from "@/components/animated-content"

interface JouJouToolsSectionProps {
  className?: string
}

const libraryValues = [
  {
    label: "小组共用",
    description: "把重复操作沉淀成可直接使用的工具",
    icon: Compass,
    tone: "text-cyan-300 border-cyan-500/25 bg-cyan-500/10",
  },
  {
    label: "学习提效",
    description: "让复盘、整理、归档更顺手",
    icon: BookOpenCheck,
    tone: "text-emerald-300 border-emerald-500/25 bg-emerald-500/10",
  },
  {
    label: "持续开源",
    description: "工具会随着小组需求慢慢扩展",
    icon: Hammer,
    tone: "text-amber-300 border-amber-500/25 bg-amber-500/10",
  },
]

export function JouJouToolsSection({ className = "" }: JouJouToolsSectionProps) {
  return (
    <section className={`relative w-full ${className}`}>
      <AnimatedContent distance={100} duration={0.9} ease="power3.out" threshold={0.2} scale={0.98}>
      <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-[#05070d]/90 shadow-[0_0_90px_rgba(34,211,238,0.08)] backdrop-blur-3xl sm:rounded-[2.75rem]">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(120deg,rgba(34,211,238,0.08),transparent_40%,rgba(16,185,129,0.07)_75%,transparent)]" />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative z-10 grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.05fr_0.95fr] lg:p-12">
          <div className="flex flex-col justify-between gap-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                JouJou Open Tools
              </div>

              <h2 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                JouJou开源工具库
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                这里会收纳我为小组成员做的开源小工具：把复杂流程变成清晰入口，把常用脚本变成可视化界面，让大家在这个网站里更轻松地学习、协作和复盘。
              </p>
            </div>

            <Link
              href="/joujou-tools"
              className="group inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-bold tracking-[0.16em] text-black transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(34,211,238,0.22)] active:scale-95 sm:w-fit"
            >
              进入工具库
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {libraryValues.map((item, index) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="group relative min-h-[128px] overflow-hidden rounded-2xl border border-white/10 bg-black/35 p-5 transition-all duration-500 hover:-translate-y-1 hover:border-white/25"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${item.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
                      0{index + 1}
                    </span>
                  </div>
                  <div className="mt-5 text-base font-bold tracking-wide text-white">{item.label}</div>
                  <p className="mt-2 text-xs leading-relaxed text-zinc-500">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      </AnimatedContent>
    </section>
  )
}
