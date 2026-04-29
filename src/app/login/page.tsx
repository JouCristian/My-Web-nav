// src/app/login/page.tsx
import { auth, signIn } from "@/auth"
import Link from "next/link"
import { redirect } from "next/navigation"
import FloatingLines from "@/components/FloatingLines"

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const session = await auth()

  // 🚀 雷达拦截器
  if (session?.user && searchParams?.error === "OAuthAccountNotLinked") {
    redirect("/profile?error=OAuthAccountNotLinked")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#020205] p-6 relative overflow-hidden">
      
      {/* 🚀 注入进阶版：超高能阻尼弹簧 & 强化呼吸动效体系 */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. 极致阻尼弹簧入场 (更轻盈、弹跳感更足) */
        @keyframes apple-spring-in {
          0% { opacity: 0; transform: translateY(80px) scale(0.85); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        .animate-spring-in {
          animation: apple-spring-in 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* 2. 高频重度呼吸光晕 (紧扣背景的蓝紫渐变) */
        @keyframes intense-breathe-glow {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 50px rgba(59,130,246,0.1), inset 0 0 20px rgba(59,130,246,0.05); 
            border-color: rgba(255,255,255,0.1);
          }
          50% { 
            transform: scale(1.035); /* 放大倍率增强，呼吸感更明显 */
            box-shadow: 0 0 120px rgba(59,130,246,0.4), inset 0 0 40px rgba(168,85,247,0.2); 
            border-color: rgba(168,85,247,0.5); /* 边缘高亮泛紫光 */
          }
        }
        .animate-intense-breathe {
          animation: intense-breathe-glow 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite 1s;
        }

        /* 3. 按钮专属的物理级回弹引擎 */
        .spring-physics {
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .spring-physics:hover {
          transform: scale(1.04) translateY(-4px);
        }
        .spring-physics:active {
          transform: scale(0.96) translateY(2px);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); /* 按下时收紧阻尼 */
        }
      `}} />

      {/* 🚀 3D Floating Lines 全屏背景 */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <FloatingLines
          linesGradient={['#020205', '#1e3a8a', '#3b82f6', '#8b5cf6']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[15, 25, 30]} 
          lineDistance={[6, 5, 4]}
          bendRadius={8.0}         
          bendStrength={-1.5}      
          interactive={true}
          parallax={true}
          animationSpeed={1.2}     
        />
      </div>

      {/* 环境光兜底，让卡片更加脱颖而出 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[150px] pointer-events-none"></div>

      {/* 左上角：返回主站按钮 */}
      <div className="fixed top-10 left-10 z-[100]">
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

      {/* 🚀 身份校验容器：体积放大至 max-w-lg (512px)，气场全开 */}
      <div className="relative w-full max-w-lg animate-spring-in z-10 pointer-events-none">
        
        {/* 动态呼吸内壳：padding 加大至 p-12，完美适配大空间 */}
        <div className="animate-intense-breathe relative w-full bg-[#060813]/70 backdrop-blur-[40px] border border-white/10 rounded-[3.5rem] p-12 flex flex-col items-center shadow-2xl overflow-hidden pointer-events-auto">
          
          {/* 顶部高光反射，加强玻璃质感 */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/50 to-transparent opacity-80"></div>
          
          {/* 背景暗芒 */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none animate-pulse"></div>
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none animate-[pulse_3s_ease-in-out_infinite_reverse]"></div>

          {/* 🚀 顶配重设：3D 星空透视仪 (Quantum Lock) */}
          <div className="relative w-32 h-32 mb-10 flex items-center justify-center" style={{ perspective: '800px' }}>
            {/* 3D 轨道 1：深蓝外环 */}
            <div className="absolute inset-0 rounded-full border-[2px] border-blue-500/30 border-r-transparent animate-[spin_6s_linear_infinite]" style={{ transform: 'rotateX(60deg) rotateY(20deg)' }}></div>
            {/* 3D 轨道 2：幽紫内环 */}
            <div className="absolute inset-2 rounded-full border-[2px] border-purple-500/40 border-l-transparent animate-[spin_4s_linear_infinite_reverse]" style={{ transform: 'rotateX(40deg) rotateY(-30deg)' }}></div>
            {/* 3D 轨道 3：天青核心环 */}
            <div className="absolute inset-5 rounded-full border border-cyan-400/50 border-t-transparent animate-[spin_2s_linear_infinite]"></div>
            
            {/* 锁芯悬浮核心 */}
            <div className="relative z-10 w-14 h-14 bg-[#0a0c14]/80 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-[pulse_2s_ease-in-out_infinite]">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md"></div>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,1)] relative z-20">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-[0.2em] text-white font-[family-name:var(--font-space)] mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              身份校验
            </h1>
            <p className="text-[10px] md:text-xs text-blue-400/80 uppercase tracking-[0.4em] font-mono">
              Secure Identity Protocol
            </p>
          </div>

          <div className="w-full space-y-6 relative z-10">
            
            {/* 🚀 按钮 1：GitHub - 强阻尼弹簧 & 辉光效果 */}
            <form action={async () => { "use server"; await signIn("github", { redirectTo: "/" }); }}>
              <button className="spring-physics group w-full h-16 flex items-center justify-center gap-4 bg-white text-black font-bold rounded-2xl shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:bg-zinc-100 hover:shadow-[0_20px_50px_rgba(255,255,255,0.3),_0_0_30px_rgba(59,130,246,0.4)] overflow-hidden relative">
                {/* 悬浮时的扫光动效 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 relative z-10" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                <span className="text-lg tracking-widest relative z-10">GitHub 授权接入</span>
              </button>
            </form>

            {/* Apple 风格的极简分割线 */}
            <div className="flex items-center justify-center gap-4 py-2 opacity-60">
              <div className="h-px bg-gradient-to-r from-transparent to-white/30 flex-1"></div>
              <span className="text-[10px] font-mono text-zinc-400 tracking-[0.4em] uppercase">Or</span>
              <div className="h-px bg-gradient-to-l from-transparent to-white/30 flex-1"></div>
            </div>

            {/* 🚀 按钮 2：Gitee - 深空磨砂 & 边缘紫光 */}
            <form action={async () => { "use server"; await signIn("gitee", { redirectTo: "/" }); }}>
              <button className="spring-physics group w-full h-16 flex items-center justify-center gap-4 bg-[#0a0c14]/60 backdrop-blur-md border border-white/10 text-white font-bold rounded-2xl shadow-[inset_0_2px_20px_rgba(255,255,255,0.02),_0_10px_30px_rgba(0,0,0,0.5)] hover:bg-[#111424]/80 hover:border-purple-500/50 hover:shadow-[inset_0_2px_20px_rgba(168,85,247,0.2),_0_20px_50px_rgba(168,85,247,0.3)] relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                 
                <span className="text-2xl font-bold font-mono transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-6 drop-shadow-[0_0_5px_rgba(255,255,255,0.5)] group-hover:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-10">G</span>
                <span className="text-lg tracking-widest text-zinc-300 group-hover:text-white transition-colors relative z-10">Gitee 国内直连</span>
              </button>
            </form>

          </div>
        </div>
      </div>
    </main>
  )
}