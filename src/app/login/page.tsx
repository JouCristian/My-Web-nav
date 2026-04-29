// src/app/login/page.tsx
import { auth, signIn } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await auth()

  // 🚀 雷达拦截器：如果你已经登录了，却因为绑定冲突被弹到这里
  // 我们立刻把你反弹回 profile，并带上错误信号触发“合并弹窗”
  if (session?.user && searchParams?.error === "OAuthAccountNotLinked") {
    redirect("/profile?error=OAuthAccountNotLinked")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-transparent p-6">
      {/* 返回主站按钮 */}
      <div className="fixed top-10 left-10 z-[100]">
        <Link href="/" className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md">
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/20 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Mission Control</span>
            <span className="text-sm font-bold text-white font-[family-name:var(--font-space)]">返回主站</span>
          </div>
        </Link>
      </div>

      <div className="relative p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-[0.3em] uppercase text-white">身份校验</h1>
          <p className="text-zinc-500 mt-2 text-xs uppercase">Identity Verification</p>
        </div>

        <div className="space-y-4">
          {/* GitHub 按钮 */}
          <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
            <button className="w-full h-14 flex items-center justify-center gap-4 bg-white text-black font-bold rounded-2xl hover:bg-blue-400 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              GitHub 授权接入
            </button>
          </form>

          <div className="flex items-center justify-center gap-3 py-1 opacity-50 text-[10px] font-mono text-zinc-500">
             OR
          </div>

          {/* Gitee 按钮：1:1 纯白复刻 GitHub 样式 */}
          <form action={async () => { "use server"; await signIn("gitee", { redirectTo: "/" }); }}>
            <button className="w-full h-14 flex items-center justify-center gap-4 bg-white text-black font-bold rounded-2xl hover:bg-blue-400 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="text-xl font-bold font-mono">G</span>
              Gitee 国内直连
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}