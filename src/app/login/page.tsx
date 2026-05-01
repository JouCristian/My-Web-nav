// src/app/login/page.tsx
import { auth, signIn } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import Prism from "@/components/Prism" // 🚀 引入新的 Prism 背景
import { HideSpacetime } from "@/components/hide-spacetime" 

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await auth()

  if (session?.user && searchParams?.error === "OAuthAccountNotLinked") {
    redirect("/profile?error=OAuthAccountNotLinked")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020205] p-6 relative overflow-hidden perspective-[1000px]">
      
      {/* 🚀 光学迷彩：隐匿全局按钮 */}
      <HideSpacetime />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bg-warp {
          0% { opacity: 0; transform: scale(2.5) translateZ(300px); filter: blur(30px); }
          100% { opacity: 1; transform: scale(1) translateZ(0); filter: blur(0px); }
        }
        .animate-bg-warp {
          animation: bg-warp 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes apple-spring-in {
          0% { opacity: 0; transform: translateY(100px) scale(0.85); filter: blur(20px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        .animate-spring-in {
          opacity: 0; 
          animation: apple-spring-in 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          animation-delay: 0.3s; 
        }

        /* 🚀 彻底去除所有 box-shadow 阴影，仅保留纯粹的边框呼吸和放缩，实现最极简的玻璃质感 */
        @keyframes intense-breathe-glow {
          0%, 100% { 
            transform: scale(1); 
            border-color: rgba(255,255,255,0.1); 
          }
          50% { 
            transform: scale(1.03); 
            border-color: rgba(168,85,247,0.6); 
          }
        }
        .animate-intense-breathe {
          animation: intense-breathe-glow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite 1.5s both;
        }

        .spring-physics {
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .spring-physics:hover { transform: scale(1.05) translateY(-5px); }
        .spring-physics:active { transform: scale(0.95) translateY(2px); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
      `}} />

      {/* 🚀 核心替换：Prism 全屏 WebGL 色散发光矩阵 */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-80 mix-blend-screen animate-bg-warp">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.5}
          glow={1}
        />
      </div>

      {/* 🚀 暗色压罩：让中心的 Prism 光晕和卡片更聚焦，边缘平滑融入深空 */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020205_80%)] pointer-events-none opacity-90"></div>

      {/* 环境光兜底 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* 左上角：返回主站按钮 (原汁原味保留) */}
      <div className="fixed top-10 left-10 z-[100] animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
        <Link href="/" className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-500 hover:bg-white/10 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/30">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-3 h-3 rounded-full bg-white/80 shadow-[0_0_15px_rgba(255,255,255,0.9)] group-hover:bg-blue-400 group-hover:shadow-[0_0_15px_rgba(96,165,250,0.9)] transition-colors" />
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] font-mono group-hover:text-blue-400 transition-colors">Mission Control</span>
            <span className="text-sm font-bold text-white font-[family-name:var(--font-space)] tracking-widest">返回主站</span>
          </div>
        </Link>
      </div>

      {/* 🚀 身份校验容器：修改尺寸从 max-w-lg 缩小到精致的 max-w-[380px] */}
      <div className="relative w-full max-w-[380px] animate-spring-in z-10 pointer-events-none">
        
        {/* 内边距从 p-12 稍微调成 p-10 以适应更窄的卡片 */}
        <div className="animate-intense-breathe relative w-full bg-[#060813]/40 backdrop-blur-[50px] border border-white/10 rounded-[3rem] p-10 flex flex-col items-center overflow-hidden pointer-events-auto">
          
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent opacity-80"></div>
          
          <div className="absolute -top-32 -right-32 w-72 h-72 bg-purple-500/25 blur-[90px] rounded-full pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-blue-500/25 blur-[90px] rounded-full pointer-events-none animate-[pulse_3s_ease-in-out_infinite_reverse]"></div>

          {/* 巅峰 3D 量子星轨仪 (原汁原味保留) */}
          <div className="relative w-32 h-32 mb-10 flex items-center justify-center perspective-[500px]">
            <div className="absolute inset-0" style={{ transform: 'rotateX(65deg) rotateY(25deg)', transformStyle: 'preserve-3d' }}>
              <div className="w-full h-full rounded-full border-[2px] border-blue-500/20 border-t-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.8)] animate-[spin_4s_linear_infinite]"></div>
            </div>
            <div className="absolute inset-3" style={{ transform: 'rotateX(45deg) rotateY(-35deg)', transformStyle: 'preserve-3d' }}>
              <div className="w-full h-full rounded-full border-[2px] border-purple-500/20 border-b-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-[spin_5s_linear_infinite_reverse]"></div>
            </div>
            <div className="absolute inset-6" style={{ transform: 'rotateX(20deg) rotateY(15deg)', transformStyle: 'preserve-3d' }}>
              <div className="w-full h-full rounded-full border-[2px] border-cyan-400/20 border-r-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.8)] animate-[spin_3s_linear_infinite]"></div>
            </div>
            <div className="relative z-10 w-14 h-14 bg-[#0a0c14]/90 rounded-full flex items-center justify-center backdrop-blur-2xl border border-white/20 shadow-[0_0_40px_rgba(59,130,246,0.8)] animate-[pulse_2s_ease-in-out_infinite]">
              <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-lg"></div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-white drop-shadow-[0_0_12px_rgba(255,255,255,1)] relative z-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-12">
            {/* 字号从 4xl/5xl 稍微缩减到 3xl 确保不断行 */}
            <h1 className="text-3xl font-bold tracking-[0.25em] text-white font-[family-name:var(--font-space)] mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
              身份校验
            </h1>
            <p className="text-[10px] text-blue-400/90 uppercase tracking-[0.4em] font-mono">
              Secure Identity Protocol
            </p>
          </div>

          <div className="w-full space-y-5 relative z-10">
            {/* GitHub 授权接入 (原汁原味保留) */}
            <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
              <button className="spring-physics group w-full h-14 flex items-center justify-center gap-3 bg-white text-black font-bold rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:bg-zinc-100 hover:shadow-[0_20px_50px_rgba(255,255,255,0.3),_0_0_30px_rgba(59,130,246,0.4)] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 relative z-10" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-[15px] tracking-widest relative z-10">GitHub 授权接入</span>
              </button>
            </form>

            <div className="flex items-center justify-center gap-4 py-2 opacity-60">
              <div className="h-px bg-gradient-to-r from-transparent to-white/30 flex-1"></div>
              <span className="text-[10px] font-mono text-zinc-400 tracking-[0.5em] uppercase">Or</span>
              <div className="h-px bg-gradient-to-l from-transparent to-white/30 flex-1"></div>
            </div>

            {/* Gitee 国内直连 (原汁原味保留) */}
            <form action={async () => { "use server"; await signIn("gitee", { redirectTo: "/" }); }}>
              <button className="spring-physics group w-full h-14 flex items-center justify-center gap-3 bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 text-white font-bold rounded-2xl shadow-[inset_0_2px_20px_rgba(255,255,255,0.02),_0_10px_30px_rgba(0,0,0,0.5)] hover:bg-[#111424]/80 hover:border-purple-500/50 hover:shadow-[inset_0_2px_20px_rgba(168,85,247,0.2),_0_20px_50px_rgba(168,85,247,0.3)] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <span className="text-2xl font-bold font-mono transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-10">G</span>
                <span className="text-[15px] tracking-widest text-zinc-300 group-hover:text-white transition-colors relative z-10">Gitee 国内直连</span>
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  )
}