// src/app/page.tsx
import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { TransitionLink } from "@/components/transition-link"
import { prisma } from "@/lib/db"
import { auth, signOut } from "@/auth" 
import Link from "next/link"
import { SignOutButton } from "@/components/sign-out-button"

interface Bookmark {
  id: number;
  name: string;
  url: string;
  description: string | null;
  createdAt: Date;
}

export default async function Home() {
  const session = await auth()
  const links = await prisma.bookmark.findMany({ orderBy: { createdAt: 'desc' } })

  // @ts-ignore
  const isCaptain = session?.user?.isCaptain

  let dbUser = null
  // 安全的 ID 查库，完美适配所有的账号体系
  if (session?.user?.id) {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
  }

  const isCommander = isCaptain || (dbUser && (dbUser.role === "ADMIN" || dbUser.role === "OWNER"));
  const isAuthorizedCrew = dbUser && dbUser.role === "MEMBER";

  let cardTitle = "「一生一芯」· 西科星际舰队";
  let cardSubtitle = "加入我们，在星海中探索 CPU 的精妙设计！仅限授权船员和管理组访问。";
  let btnText = "开启星际之旅";

  if (isAuthorizedCrew) {
    cardSubtitle = "全星系广播、船员档案管理、跃迁集结签到与考勤大盘。嘿伙计！今天干得怎么样？";
    btnText = "进入舰队中枢";
  } else if (isCommander) {
    cardTitle = "「一生一芯」· 星际指挥中枢";
    cardSubtitle = "全星系广播、船员档案管理、跃迁集结签到与考勤大盘。好好干，伙计们！";
    btnText = "登入最高指挥大屏";
  }

  const handleSignOutAction = async () => {
    "use server"
    await signOut()
  }

  return (
    <main className="min-h-screen bg-[#020205] text-white selection:bg-blue-500/30 overflow-x-hidden relative">
      
      {/* 🚀 注入 Apple 级物理与光效引擎 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes central-breathe {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
          50% { transform: translate(-50%, -50%) scale(1.15); opacity: 0.9; }
        }
        .animate-central-breathe {
          animation: central-breathe 8s ease-in-out infinite;
        }

        @keyframes float-up {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        .animate-float-up {
          opacity: 0;
          animation: float-up 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* 极致的非线性弹簧物理按钮 */
        .spring-btn-hero {
          transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .spring-btn-hero:hover {
          transform: scale(1.05) translateY(-5px);
          box-shadow: 0 20px 40px rgba(59,130,246,0.3), inset 0 0 20px rgba(255,255,255,0.1);
        }
        .spring-btn-hero:active {
          transform: scale(0.95) translateY(2px);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .fade-in-nav { animation: float-up 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}} />

      {/* 🌌 深空巨幕背景光晕 */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1200px] max-h-[1200px] bg-blue-600/10 rounded-full blur-[150px] animate-central-breathe pointer-events-none z-0"></div>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* 🛸 悬浮中控玻璃导航栏 (Global Header) */}
      <header className="fixed top-0 left-0 w-full z-50 bg-[#02040a]/70 backdrop-blur-2xl border-b border-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)] animate-pulse"></div>
            </div>
            <span className="font-mono font-bold tracking-[0.3em] text-white hidden md:block">X-STARFLEET</span>
          </div>

          <div className="flex items-center gap-6">
            {!isCaptain && (
              <TransitionLink href="/contact" className="group hidden md:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-white/5 transition-all text-xs font-mono uppercase tracking-widest text-zinc-400 hover:text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                联系舰长
              </TransitionLink>
            )}

            {session ? (
              <div className="flex items-center gap-4 border-l border-white/10 pl-6">
                <Link href="/profile" className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={dbUser?.customAvatar || session.user?.image || ""} alt="avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold text-white tracking-widest">{dbUser?.nickname || session.user?.name || "宇航员"}</span>
                  </div>
                </Link>
                <SignOutButton onSignOut={handleSignOutAction} />
              </div>
            ) : (
              <TransitionLink href="/login" className="flex items-center gap-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 px-6 py-2 rounded-full hover:bg-blue-500 hover:text-white transition-all text-xs font-bold tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                Authorization
              </TransitionLink>
            )}
          </div>
        </div>
      </header>

      {/* 🚀 巨幕英雄区 (Absolute Focus) */}
      <section className="relative z-10 w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-20">
        
        <div className="animate-float-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-3 bg-blue-500/10 border border-blue-500/30 px-4 py-1.5 rounded-full mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
            <span className="text-[10px] font-mono font-bold tracking-[0.4em] text-blue-400 uppercase">Fleet Mission Status</span>
          </div>
        </div>

        <h1 className="animate-float-up text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/40 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] mb-6 max-w-5xl" style={{ animationDelay: '0.2s' }}>
          {cardTitle}
        </h1>
        
        <p className="animate-float-up text-sm md:text-base text-zinc-400 tracking-widest max-w-2xl mx-auto leading-relaxed mb-16" style={{ animationDelay: '0.3s' }}>
          {cardSubtitle}
        </p>

        <div className="animate-float-up" style={{ animationDelay: '0.4s' }}>
          <TransitionLink 
            href={session ? "/dashboard" : "/login"} 
            className="spring-btn-hero group relative inline-flex items-center justify-center gap-4 px-12 py-5 rounded-full bg-white text-black font-bold text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 tracking-[0.15em]">{btnText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
          </TransitionLink>
        </div>

        {/* 滚动指引 */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40 animate-bounce">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-400">Scroll to Explore Databanks</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        </div>
      </section>

      {/* 📂 隐匿式下沉导航区 (Below-the-fold) */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-40">
        
        {/* 隔离线 */}
        <div className="flex items-center justify-center gap-6 mb-20 opacity-30">
          <div className="h-px bg-gradient-to-r from-transparent to-white/50 w-32 md:w-64"></div>
          <span className="w-2 h-2 rotate-45 border border-white/50"></span>
          <div className="h-px bg-gradient-to-l from-transparent to-white/50 w-32 md:w-64"></div>
        </div>

        {isCaptain && (
          <div className="mb-12">
            <AddCardForm />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {links.map((link: Bookmark, index: number) => (
            <div key={link.id} className="fade-in-nav opacity-0" style={{ animationDelay: `${(index * 100) + 200}ms` }}>
              <NavigationCard 
                id={link.id} 
                title={link.name} 
                description={link.description || ""} 
                url={link.url} 
                showDelete={isCaptain} 
              />
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}