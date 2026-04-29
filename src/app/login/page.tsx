// src/app/login/page.tsx
import { auth, signIn } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await auth()

  // 🚀 雷达拦截器：如果你已经登录了，却因为绑定冲突被弹到这里
  if (session?.user && searchParams?.error === "OAuthAccountNotLinked") {
    redirect("/profile?error=OAuthAccountNotLinked")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-transparent p-6 relative overflow-hidden">
      
      {/* 注入顶级 Apple 风格动效体系 */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. 非线性阻尼弹簧入场 */
        @keyframes apple-spring-in {
          0% { opacity: 0; transform: translateY(60px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-spring-in {
          animation: apple-spring-in 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* 2. 纯白高级呼吸光晕 (融合 Scale 与内外 Shadow) */
        @keyframes apple-breathe-glow {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 40px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.02); 
            border-color: rgba(255,255,255,0.1);
          }
          50% { 
            transform: scale(1.02); 
            box-shadow: 0 0 80px rgba(255,255,255,0.15), inset 0 0 30px rgba(255,255,255,0.05); 
            border-color: rgba(255,255,255,0.25);
          }
        }
        .animate-breathe-glow {
          /* 延迟 1 秒执行，等待入场动画完美落地 */
          animation: apple-breathe-glow 4s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s;
        }
      `}} />

      {/* 环境光兜底 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 左上角：返回主站按钮 */}
      <div className="fixed top-10 left-10 z-[100]">
        <Link href="/" className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white/10 active:scale-95">
          <div className="w-7 h-7 rounded-full bg-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-2.5 h-2.5 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-mono group-hover:text-zinc-300 transition-colors">Mission Control</span>
            <span className="text-sm font-bold text-white font-[family-name:var(--font-space)] tracking-widest">返回主站</span>
          </div>
        </Link>
      </div>

      {/* 🚀 入场弹簧外壳 */}
      <div className="relative w-full max-w-sm animate-spring-in z-10">
        
        {/* 🚀 重呼吸光晕内壳 (顶级 Apple Glassmorphism) */}
        <div className="animate-breathe-glow relative w-full bg-[#0a0a0c]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center shadow-2xl overflow-hidden">
          
          {/* Apple 标志性的顶部高光反射 */}
          <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

          {/* 顶配视觉：安全锁星轨仪 */}
          <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
            {/* 顺时针外轨 */}
            <div className="absolute inset-0 rounded-full border border-white/20 border-r-transparent animate-[spin_6s_linear_infinite]"></div>
            {/* 逆时针内轨 */}
            <div className="absolute inset-2 rounded-full border border-white/10 border-l-transparent animate-[spin_4s_linear_infinite_reverse]"></div>
            {/* 核心锁 */}
            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-white/90 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] mb-2">
              身份校验
            </h1>
            <p className="text-[9px] text-zinc-500 uppercase tracking-[0.3em] font-mono">
              Secure Identity Protocol
            </p>
          </div>

          <div className="w-full space-y-4 relative z-10">
            
            {/* 按钮 1：纯白高对比 (Primary) */}
            <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
              <button className="group w-full h-14 flex items-center justify-center gap-3 bg-white text-black font-bold rounded-2xl hover:bg-zinc-200 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] active:scale-95">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current transition-transform group-hover:scale-110" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="tracking-widest">GitHub 授权接入</span>
              </button>
            </form>

            {/* Apple 风格的极简分割线 */}
            <div className="flex items-center justify-center gap-4 py-2 opacity-60">
              <div className="h-px bg-gradient-to-r from-transparent to-white/30 flex-1"></div>
              <span className="text-[9px] font-mono text-zinc-400 tracking-[0.3em] uppercase">Or</span>
              <div className="h-px bg-gradient-to-l from-transparent to-white/30 flex-1"></div>
            </div>

            {/* 按钮 2：深色磨砂质感 (Secondary) */}
            <form action={async () => { "use server"; await signIn("gitee", { redirectTo: "/" }); }}>
              <button className="group w-full h-14 flex items-center justify-center gap-3 bg-zinc-900/50 border border-white/10 text-white font-bold rounded-2xl hover:bg-zinc-800 hover:border-white/30 transition-all duration-300 active:scale-95 shadow-[inset_0_2px_15px_rgba(255,255,255,0.02)]">
                <span className="text-xl font-bold font-mono transition-transform group-hover:scale-110 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">G</span>
                <span className="tracking-widest text-zinc-300 group-hover:text-white transition-colors">Gitee 国内直连</span>
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  )
}