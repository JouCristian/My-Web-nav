// src/app/page.tsx
import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { TransitionLink } from "@/components/transition-link"
import { prisma } from "@/lib/db"
import { auth, signOut } from "@/auth" 
import { TopNavDock } from "@/components/top-nav-dock" 
import { HideSpacetime } from "@/components/hide-spacetime" 
import Silk from "@/components/Silk" 
import RotatingText from "@/components/RotatingText" 

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
  if (session?.user?.id) {
    dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
  }

  const isCommander = isCaptain || (dbUser && (dbUser.role === "ADMIN" || dbUser.role === "OWNER"));
  const isAuthorizedCrew = dbUser && dbUser.role === "MEMBER";

  let cardTitle = (
    <>「一生一芯」·<span className="whitespace-nowrap">西科星际舰队</span></>
  );
  let cardSubtitle = "加入我们，在星海中探索 CPU 的精妙设计！仅限授权船员和管理组访问。";
  let btnText = "开启星际之旅";

  if (isAuthorizedCrew) {
    cardSubtitle = "全星系广播、船员档案管理、跃迁集结签到与考勤大盘。嘿伙计！今天干得怎么样？";
    btnText = "进入舰队中枢";
  } else if (isCommander) {
    cardTitle = (
      <>「一生一芯」·<span className="whitespace-nowrap">星际指挥中枢</span></>
    );
    cardSubtitle = "全星系广播、船员档案管理、跃迁集结签到与考勤大盘。好好干，伙计们！";
    btnText = "登入最高指挥大屏";
  }

  const handleSignOutAction = async () => {
    "use server"
    await signOut()
  }

  return (
    <main className="min-h-screen bg-[#020205] text-white selection:bg-blue-500/30 overflow-x-hidden relative">
      
      <HideSpacetime />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(40px) scale(0.95); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0px); }
        }
        .animate-float-up { opacity: 0; animation: float-up 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        .spring-btn-hero { transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .spring-btn-hero:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 20px 40px rgba(59,130,246,0.3), inset 0 0 20px rgba(255,255,255,0.1); }
        .spring-btn-hero:active { transform: scale(0.95) translateY(2px); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .fade-in-nav { animation: float-up 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}} />

      <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
        <Silk
          speed={6.8}           
          scale={0.8}           
          color="#A855F7"       
          noiseIntensity={1.1}  
          rotation={0}       
        />
      </div>

      <TopNavDock session={session} dbUser={dbUser} isCaptain={isCaptain} onSignOut={handleSignOutAction} />

      <section className="relative z-10 w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-10 pointer-events-none">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,4,10,0.4)_0%,transparent_60%)] z-0 pointer-events-none"></div>

        {/* 🚀 文本替换为指定内容，并移除了 uppercase 强制大写以尊重你的原始排版 */}
        <div className="animate-float-up pointer-events-auto relative z-10 flex items-center justify-center gap-2 mb-8 font-mono text-sm md:text-base font-bold tracking-widest text-zinc-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" style={{ animationDelay: '0.1s' }}>
          <span>Creating</span>
          <RotatingText
            texts={['thinking!', 'coding!', 'components!', 'YSYX!']}
            mainClassName="px-2 sm:px-2 md:px-3 bg-cyan-400 text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg shadow-[0_0_15px_rgba(34,211,238,0.5)]"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            rotationInterval={2800}
          />
        </div>

        <h1 className="animate-float-up pointer-events-auto relative z-10 text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-white/60 drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] mb-6 max-w-5xl" style={{ animationDelay: '0.2s', wordBreak: 'keep-all' }}>
          {cardTitle}
        </h1>
        
        <p className="animate-float-up pointer-events-auto relative z-10 text-sm md:text-base text-zinc-200 tracking-widest max-w-2xl mx-auto leading-relaxed mb-16 drop-shadow-[0_2px_15px_rgba(0,0,0,0.8)]" style={{ animationDelay: '0.3s' }}>
          {cardSubtitle}
        </p>

        <div className="animate-float-up pointer-events-auto relative z-10" style={{ animationDelay: '0.4s' }}>
          <TransitionLink 
            href={session ? "/dashboard" : "/login"} 
            className="spring-btn-hero group relative inline-flex items-center justify-center gap-4 px-12 py-5 rounded-full bg-white text-black font-bold text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 tracking-[0.15em]">{btnText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
          </TransitionLink>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40 animate-bounce pointer-events-auto z-10">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-400">Scroll to Explore Databanks</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-40">
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