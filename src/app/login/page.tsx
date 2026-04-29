// src/app/login/page.tsx
import { auth, signIn } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

// 🚀 注意：接收 URL 里的 searchParams 错误信号
export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await auth()

  // 🚀 核心拦截器：如果舰长处于登录状态，且遭遇了“账号被占用”的冲突
  // 直接将其强制打回档案室，并携带冲突信号，瞬间触发【数据缝合弹窗】！
  if (session?.user && searchParams?.error === "OAuthAccountNotLinked") {
    redirect("/profile?error=OAuthAccountNotLinked")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-transparent p-6">
      
      {/* 窗口左上角固定悬浮按钮 */}
      <div className="fixed top-10 left-10 z-[100]">
        <Link 
          href="/" 
          className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-blue-500/10 transition-colors">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse shadow-[0_0_12px_rgba(96,165,250,0.9)]" />
            <div className="absolute inset-0 rounded-full border border-blue-500/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          </div>
          
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-blue-400 transition-colors">
              Mission Control
            </span>
            <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
              返回主站
            </span>
          </div>
        </Link>
      </div>

      {/* 居中的登录卡片 */}
      <div className="relative p-10 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[3rem] max-w-md w-full text-center animate-flame-active">
        
        <div className="mb-8">
          <div className="inline-block p-4 rounded-full bg-white/5 border border-white/10 mb-4">
             <span className="text-3xl">🛡️</span>
          </div>
          <h1 className="text-3xl font-bold tracking-[0.3em] font-[family-name:var(--font-space)] uppercase text-white">
            身份校验
          </h1>
          <p className="text-zinc-500 mt-2 text-xs tracking-widest uppercase">Identity Verification</p>
        </div>

        {/* 🚀 未登录的普通船员如果遇到冲突，给出优雅的错误提示 */}
        {searchParams?.error === "OAuthAccountNotLinked" && !session?.user && (
          <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs tracking-widest font-mono">
            ⚠️ 接入失败：该第三方凭证已被占用，请先登录主账号进行合并。
          </div>
        )}

        <div className="space-y-4">
          {/* 1. GitHub 授权接入 */}
          <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
            <button className="group w-full flex items-center justify-center gap-4 bg-white text-black font-bold py-4 rounded-2xl hover:bg-blue-400 hover:text-white transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub 授权接入
            </button>
          </form>

          {/* —— OR —— 分割线 */}
          <div className="flex items-center justify-center gap-3 py-1 opacity-50">
            <div className="h-px w-full bg-gradient-to-r from-transparent to-zinc-500"></div>
            <span className="text-[10px] font-mono text-zinc-400 tracking-widest">OR</span>
            <div className="h-px w-full bg-gradient-to-l from-transparent to-zinc-500"></div>
          </div>

          {/* 2. Gitee 国内直连 */}
          <form action={async () => { "use server"; await signIn("gitee", { redirectTo: "/" }); }}>
            <button className="group w-full flex items-center justify-center gap-4 bg-transparent border border-red-500/50 text-red-500 font-bold py-4 rounded-2xl hover:bg-red-500/10 hover:border-red-500 transition-all duration-300 active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <span className="text-xl font-bold font-mono">G</span>
              Gitee 国内直连
            </button>
          </form>
        </div>

        <p className="mt-8 text-[10px] text-zinc-600 tracking-widest uppercase">
          Authorization Required for Captain Privileges
        </p>
      </div>
    </main>
  )
}