import { SendHorizontal, Sparkles, Tags } from "lucide-react"
import { auth } from "@/auth"
import AnimatedContent from "@/components/animated-content"
import { HideSpacetime } from "@/components/hide-spacetime"
import { PromptGallery } from "@/components/prompt-gallery/PromptGallery"
import { HeroSignals } from "@/components/prompt-gallery/HeroSignals"
import { getPromptWorkshopData } from "@/app/joujou-tools/ai-image-prompt-workshop/actions"
import { BackButton } from "@/components/back-button"

const heroPills = [
  { icon: Sparkles, label: "视觉灵感库" },
  { icon: Tags, label: "场景化模板" },
  { icon: SendHorizontal, label: "AI 通用" },
]

export default async function AIImagePromptWorkshopPage() {
  const [session, workshopData] = await Promise.all([auth(), getPromptWorkshopData()])
  const sessionUser = session?.user as { isCaptain?: boolean; role?: string } | undefined
  const canManage = Boolean(sessionUser?.isCaptain || sessionUser?.role === "OWNER" || sessionUser?.role === "ADMIN")

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-transparent px-4 py-8 pt-24 text-white sm:px-6 lg:px-10">
      <HideSpacetime />

      <div className="pointer-events-none absolute left-1/2 top-10 h-[420px] w-[min(980px,90vw)] -translate-x-1/2 rounded-full bg-cyan-400/[0.055] blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-1/3 h-[360px] w-[360px] rounded-full bg-slate-200/[0.045] blur-[120px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-[1500px] flex-col gap-8">
        <AnimatedContent distance={80} direction="horizontal" reverse duration={0.9} ease="power3.out">
          <div className="flex flex-wrap items-center gap-3">
            <BackButton />

            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-200/15 bg-cyan-200/[0.07] px-3 py-1.5 backdrop-blur-xl">
              <Sparkles className="h-3.5 w-3.5 text-cyan-100" />
              <span className="font-mono text-[10px] text-cyan-100/80">Image Prompt Gallery</span>
            </div>
          </div>
        </AnimatedContent>

        <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(480px,42vw)] lg:items-start">
          <AnimatedContent distance={80} direction="horizontal" reverse duration={0.9} ease="power3.out" delay={0.04}>
            <div className="min-w-0">
              <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl xl:text-6xl">
                AI生图提示词灵感工坊
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-relaxed text-zinc-400 sm:text-base">
                收录精选视觉提示词，用更少的文字启动更高质量的图像创作。
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {heroPills.map((item) => {
                  const Icon = item.icon

                  return (
                    <span
                      key={item.label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-bold text-zinc-300 backdrop-blur-xl"
                    >
                      <Icon className="h-3.5 w-3.5 text-cyan-100" />
                      {item.label}
                    </span>
                  )
                })}
              </div>
            </div>
          </AnimatedContent>

          <AnimatedContent distance={70} direction="horizontal" duration={0.9} ease="power3.out" delay={0.08}>
            <HeroSignals />
          </AnimatedContent>
        </div>

        <div>
          <PromptGallery
            canManage={canManage}
            initialCategories={workshopData.categories}
            initialItems={workshopData.items}
            isAuthenticated={workshopData.isAuthenticated}
          />
        </div>
      </div>
    </main>
  )
}
