import Link from "next/link"
import { ArrowLeft, Code2, FileDown, ShieldCheck } from "lucide-react"
import AnimatedContent from "@/components/animated-content"
import { HideSpacetime } from "@/components/hide-spacetime"
import { CSPReviewTool } from "@/components/csp-review-tool"
import { OpenSourceInfoCard } from "@/components/open-source-info-card"
import ShinyText from "@/components/ShinyText"

export default function CSPReviewDocGeneratorPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-transparent px-4 py-8 pt-24 text-white sm:px-6 lg:px-10">
      <HideSpacetime />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-8">
        <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <AnimatedContent distance={80} direction="horizontal" reverse duration={0.9} ease="power3.out">
          <div className="min-w-0">
            <Link
              href="/joujou-tools"
              className="group mb-8 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-bold tracking-widest text-zinc-300 backdrop-blur-xl transition-all hover:border-cyan-500/30 hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              返回工具库
            </Link>

            <div className="mb-4 flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                Algorithm Review Generator
              </span>
            </div>

            <h1 className="max-w-5xl break-words text-3xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
              <ShinyText
                text="算法题解文档生成器"
                speed={1.35}
                delay={0.2}
                color="#f8fafc"
                shineColor="#67e8f9"
                spread={105}
                direction="left"
                className="drop-shadow-[0_0_22px_rgba(34,211,238,0.24)]"
              />
            </h1>
            <p className="mt-5 max-w-4xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              面向算法题解复盘的文档工作台。先在自己的 AI 窗口生成规范内容，再粘贴到这里完成结构检查和 Word 草稿导出。
            </p>
          </div>
          </AnimatedContent>

          <AnimatedContent distance={80} direction="horizontal" duration={0.9} ease="power3.out" delay={0.1}>
          <div className="grid min-w-0 gap-3 sm:grid-cols-3 lg:w-[620px]">
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.07] p-4 backdrop-blur-xl">
              <FileDown className="mb-3 h-5 w-5 text-cyan-300" />
              <div className="text-sm font-bold text-white">结构化检查</div>
              <div className="mt-1 text-xs leading-relaxed text-cyan-100/60">粘贴内容后自动识别章节、图块、代码块。</div>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.07] p-4 backdrop-blur-xl">
              <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
              <div className="text-sm font-bold text-white">网页端生成</div>
              <div className="mt-1 text-xs leading-relaxed text-emerald-100/60">直接导出可继续修改的 Word 草稿。</div>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.07] p-4 backdrop-blur-xl">
              <Code2 className="mb-3 h-5 w-5 text-amber-300" />
              <div className="text-sm font-bold text-white">AI 辅助整理</div>
              <div className="mt-1 text-xs leading-relaxed text-amber-100/60">模板和提示词帮助 AI 输出稳定结构。</div>
            </div>
          </div>
          </AnimatedContent>
        </div>

        <CSPReviewTool />
        <OpenSourceInfoCard />
      </div>
    </main>
  )
}
