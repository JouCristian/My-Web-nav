// src/app/page.tsx
import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { TransitionLink } from "@/components/transition-link"
import { prisma } from "@/lib/db"
import { auth, signOut } from "@/auth" 
import { TopNavDock } from "@/components/top-nav-dock" 
import { HideSpacetime } from "@/components/hide-spacetime" 
import RotatingText from "@/components/RotatingText" 
import ShinyText from "@/components/ShinyText" 
import LogoLoop from "@/components/LogoLoop" 
import { HeroBackground } from "@/components/hero-background"

export const revalidate = 60;

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

  let cardTitle = "「一生一芯」·西科星际舰队";
  let cardSubtitle = "加入我们，在星海中探索 CPU 的精妙设计！仅限授权船员和管理组访问。";
  let btnText = "开启星际之旅";

  if (isAuthorizedCrew) {
    cardSubtitle = "全星系广播、船员档案管理、跃迁集结签到与考勤大盘。嘿伙计！今天干得怎么样？";
    btnText = "进入舰队中枢";
  } else if (isCommander) {
    cardTitle = "「一生一芯」·星际指挥中枢";
    cardSubtitle = "全星系广播、船员档案管理、跃迁集结签到与考勤大盘。好好干，伙计们！";
    btnText = "登入最高指挥大屏";
  }

  const handleSignOutAction = async () => {
    "use server"
    await signOut()
  }

  const generatedLogos = links.map(link => ({
    title: link.name,
    href: link.url,
    node: (
      <div className="group flex items-center gap-3 px-2 py-1.5 pr-5 bg-white/[0.03] border border-white/[0.08] rounded-full backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.15]">
        <div className="obsidian-icon-loop w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] text-white font-black uppercase shrink-0">
          {link.name.substring(0, 1)}
        </div>
        <span className="text-sm font-bold text-zinc-300 tracking-wider whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,1)] group-hover:text-cyan-400 transition-colors duration-300">
          {link.name}
        </span>
      </div>
    )
  }));

  return (
    // 增加 overflow-x-hidden 确保没有任何元素能横向撑破屏幕
    <main className="min-h-screen bg-[#020205] text-white selection:bg-blue-500/30 relative overflow-x-hidden">
      
      <HideSpacetime />

      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. 文本上浮：加快速度，削弱模糊感，提升干脆度 */
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(5px); }
          100% { opacity: 1; transform: none; filter: none; }
        }
        .animate-float-up { 
          animation: float-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) backwards; 
        }

        /* 2. 🚀 Dock 专属：极其纯净的淡入！没有任何位移，绝对不破坏液态玻璃渲染 */
        @keyframes dock-fade {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-dock-fade {
          animation: dock-fade 1s cubic-bezier(0.22, 1, 0.36, 1) backwards;
        }

        /* 3. LogoLoop 与按钮：弹簧放大，加快节奏 */
        @keyframes spring-scale-up {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: none; filter: none; }
        }
        .animate-spring-scale {
          animation: spring-scale-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
        }

        /* 4. 背景专属：纯净渐显，移除可能导致底闪的 scale 变化 */
        @keyframes fade-in-bg {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-bg-fade {
          animation: fade-in-bg 1.5s cubic-bezier(0.22, 1, 0.36, 1) backwards; 
        }

        /* 按钮微交互 */
        .spring-btn-hero { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .spring-btn-hero:hover { transform: scale(1.05) translateY(-5px); box-shadow: 0 20px 40px rgba(59,130,246,0.3), inset 0 0 20px rgba(255,255,255,0.1); }
        .spring-btn-hero:active { transform: scale(0.95) translateY(2px); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        .obsidian-icon-loop {
          background-color: rgba(6, 8, 15, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          border-bottom: 1px solid rgba(0, 0, 0, 0.5);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .group:hover .obsidian-icon-loop {
          background-color: rgba(34, 211, 238, 0.15);
          border-top: 1px solid rgba(34, 211, 238, 0.6);
          color: #ffffff;
          box-shadow: 
            0 8px 20px rgba(0, 0, 0, 0.9), 
            0 0 15px rgba(34, 211, 238, 0.35), 
            inset 0 2px 5px rgba(255, 255, 255, 0.15);
        }
      `}} />

      {/* 🚀 背景：极度纯净平滑淡入 */}
      <div className="fixed inset-0 z-0 pointer-events-none animate-bg-fade bg-[#020205]">
        <HeroBackground />
      </div>

      {/* 🚀 Dock 栏：改为纯透明度渐显，液态玻璃 0秒生效 */}
      <div className="fixed top-0 left-0 right-0 z-[100] animate-dock-fade" style={{ animationDelay: '0s' }}>
        <TopNavDock session={session} dbUser={dbUser} isCaptain={isCaptain} onSignOut={handleSignOutAction} />
      </div>

      <section className="relative z-10 w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-5 sm:px-4 pt-32 sm:pt-24 md:pt-10 pb-12 pointer-events-none">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,4,10,0.6)_0%,transparent_65%)] z-0 pointer-events-none"></div>

        {/* 动画排期极速压缩：0.1s -> 0.3s -> 0.4s */}
        <div className="animate-float-up pointer-events-auto relative z-10 mb-6 sm:mb-8 font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-widest text-zinc-100 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]" style={{ animationDelay: '0.1s' }}>
          <RotatingText
            prefix="Creating"
            texts={['thinking!', 'coding!', 'components!', 'ysyxing!']}
            mainClassName="px-4 py-1.5 sm:px-4 sm:py-1.5 md:px-6 md:py-2 bg-cyan-400 text-black overflow-hidden rounded-[1.1rem] sm:rounded-[1.2rem] shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center"
            staggerFrom={"last"}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-120%", opacity: 0 }} 
            staggerDuration={0.025} 
            transition={{ type: "spring", damping: 25, stiffness: 300 }} 
            rotationInterval={3500} 
            animatePresenceMode="popLayout" 
          />
        </div>

        <h1 className="animate-float-up pointer-events-auto relative z-10 text-3xl sm:text-4xl md:text-6xl lg:text-7xl md:whitespace-nowrap font-bold tracking-tight md:tracking-tighter font-[family-name:var(--font-space)] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] mb-5 sm:mb-6 px-2 text-balance leading-[1.15]" style={{ animationDelay: '0.2s' }}>
          <ShinyText 
            text={cardTitle} 
            speed={2} 
            delay={0}
            color="rgba(255, 255, 255, 0.65)" 
            shineColor="#ffffff" 
            spread={100}
            direction="left"
          />
        </h1>
        
        <p className="animate-float-up pointer-events-auto relative z-10 text-sm sm:text-base md:text-lg md:whitespace-nowrap text-zinc-300 tracking-wider sm:tracking-widest mx-auto leading-relaxed mb-12 sm:mb-16 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-4 max-w-md sm:max-w-none text-balance" style={{ animationDelay: '0.3s' }}>
          {cardSubtitle}
        </p>

        {/* 按钮爽快弹入 */}
        <div className="animate-spring-scale pointer-events-auto relative z-10" style={{ animationDelay: '0.4s' }}>
          <TransitionLink 
            href={session ? "/dashboard" : "/login"} 
            className="spring-btn-hero group relative inline-flex items-center justify-center gap-3 sm:gap-4 px-9 py-4 sm:px-12 sm:py-5 rounded-full bg-white text-black font-bold text-base sm:text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <span className="relative z-10 tracking-[0.12em] sm:tracking-[0.15em]">{btnText}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 sm:w-5 sm:h-5 relative z-10 transition-transform group-hover:translate-x-1"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>
          </TransitionLink>
        </div>

        {/* 向下滚动提示 */}
        <div className="hidden sm:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-3 opacity-40 pointer-events-auto z-10 animate-float-up" style={{ animationDelay: '0.6s' }}>
          <div className="animate-bounce flex flex-col items-center gap-3">
            <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-400">Scroll to Explore Databanks</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-40">
        
        {generatedLogos.length > 0 && (
          <div className="w-full mb-16 relative overflow-hidden pointer-events-auto z-10 mask-edges animate-spring-scale" style={{ animationDelay: '0.4s' }}>
            <LogoLoop
              logos={generatedLogos}
              speed={45}
              direction="left"
              logoHeight={48}
              gap={40}
              hoverSpeed={15}
              scaleOnHover={true} 
              fadeOut={false} 
            />
          </div>
        )}

        <div className="flex items-center justify-center gap-4 sm:gap-6 mb-12 sm:mb-20 opacity-30 animate-spring-scale" style={{ animationDelay: '0.5s' }}>
          <div className="h-px bg-gradient-to-r from-transparent to-white/50 w-20 sm:w-32 md:w-64"></div>
          <span className="w-2 h-2 rotate-45 border border-white/50"></span>
          <div className="h-px bg-gradient-to-l from-transparent to-white/50 w-20 sm:w-32 md:w-64"></div>
        </div>

        {isCaptain && (
          <div className="mb-8 sm:mb-12 animate-spring-scale" style={{ animationDelay: '0.55s' }}>
            <AddCardForm />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {links.map((link: Bookmark, index: number) => (
            /* 书签卡片瀑布流加载速度提升：从 700ms 起步降至 500ms 起步 */
            <div key={link.id} className="animate-float-up" style={{ animationDelay: `${(index * 50) + 500}ms` }}>
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