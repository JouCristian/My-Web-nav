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
import GlassSurface from "@/components/GlassSurface"
import { StatsCards } from "@/components/stats-cards"
import { Footer } from "@/components/footer"
import { YsyxIntroSection } from "@/components/ysyx-intro-section"
import { AchievementGallerySection } from "@/components/achievement-gallery-section"
import { getStats } from "@/app/actions"

export const revalidate = 60;

type BookmarkCategory = 'TOOL' | 'DOC' | 'TUTORIAL' | 'RESOURCE' | 'COMMUNITY' | 'OTHER'

interface Bookmark {
  id: number;
  name: string;
  url: string;
  description: string | null;
  category: BookmarkCategory;
  iconSvg: string | null;
  createdAt: Date;
}

export default async function Home() {
  const session = await auth()
  const links = await prisma.bookmark.findMany({ orderBy: { createdAt: 'desc' } })
  const stats = await getStats()

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
    <main className="min-h-screen bg-[#020205] text-white selection:bg-blue-500/30 relative overflow-x-hidden">
      
      <HideSpacetime />

      <style dangerouslySetInnerHTML={{ __html: `
        /* 1. 文本上浮：干净利落的缓出 */
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-float-up { 
          animation: float-up 0.8s cubic-bezier(0.22, 1, 0.36, 1) both; 
        }

        /* 🚀 2. 修复后的 Dock 专属顶部入场动画：防止重置 Tailwind 居中属性 */
        @keyframes dock-entry {
          0% { opacity: 0; transform: translateY(-30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); } 
        }
        .animate-dock-entry {
          animation: dock-entry 1s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* 3. LogoLoop 与按钮：弹簧放大 */
        @keyframes spring-scale-up {
          0% { opacity: 0; transform: scale(0.9) translateY(20px); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); filter: blur(0px); }
        }
        .animate-spring-scale {
          animation: spring-scale-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }

        /* 4. 背景专属：纯净渐显 */
        @keyframes fade-in-bg {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-bg-fade {
          animation: fade-in-bg 1.5s cubic-bezier(0.22, 1, 0.36, 1) both; 
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

      {/* 背景：极度纯净平滑淡入 */}
      <div className="fixed inset-0 z-0 pointer-events-none animate-bg-fade bg-[#020205]">
        <HeroBackground />
      </div>

      {/* 🚀 修复核心：双层嵌套方案！外层负责顶部绝对居中，内层负责入场动画，再配合液态玻璃底座 */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
        <div className="animate-dock-entry pointer-events-auto" style={{ animationDelay: '0.1s' }}>
          <GlassSurface 
            width="auto"
            height="auto"
            borderRadius={35}
            brightness={120}           
            opacity={0.4}              
            blur={20}                 
            displace={1.2}             
            mixBlendMode="normal"
            backgroundOpacity={0.15}
            className="min-w-[320px]"
          >
            <TopNavDock session={session} dbUser={dbUser} isCaptain={isCaptain} onSignOut={handleSignOutAction} />
          </GlassSurface>
        </div>
      </div>

      {/* Hero 区 - 核心内容垂��居中 */}
      <section className="relative z-10 w-full min-h-[55vh] sm:min-h-[58vh] flex flex-col items-center justify-center text-center px-5 sm:px-4 pt-28 sm:pt-32 pb-8 pointer-events-none">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,4,10,0.6)_0%,transparent_65%)] z-0 pointer-events-none"></div>

        <div className="animate-float-up pointer-events-auto relative z-10 mb-5 sm:mb-6 font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-widest text-zinc-100 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]" style={{ animationDelay: '0.1s' }}>
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

        <h1 className="animate-float-up pointer-events-auto relative z-10 text-3xl sm:text-4xl md:text-6xl lg:text-7xl md:whitespace-nowrap font-bold tracking-tight md:tracking-tighter font-[family-name:var(--font-space)] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] mb-4 sm:mb-5 px-2 text-balance leading-[1.15]" style={{ animationDelay: '0.2s' }}>
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
        
        <p className="animate-float-up pointer-events-auto relative z-10 text-sm sm:text-base md:text-lg md:whitespace-nowrap text-zinc-300 tracking-wider sm:tracking-widest mx-auto leading-relaxed mb-8 sm:mb-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] px-4 max-w-md sm:max-w-none text-balance" style={{ animationDelay: '0.3s' }}>
          {cardSubtitle}
        </p>

        {/* 按钮 */}
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
      </section>

      {/* 统计数据卡片区 - 独立 section */}
      <section className="relative z-10 w-full flex flex-col items-center px-4 py-6 sm:py-8 pointer-events-none">
        <div className="animate-spring-scale pointer-events-auto overflow-visible" style={{ animationDelay: '0.5s' }}>
          <StatsCards stats={stats} />
        </div>

        {/* 向下滚动提示 */}
        <div className="hidden sm:flex flex-col items-center gap-2 opacity-40 pointer-events-auto z-10 animate-float-up mt-8" style={{ animationDelay: '0.6s' }}>
          <div className="animate-bounce flex flex-col items-center gap-2">
            <span className="text-[9px] font-mono tracking-[0.4em] uppercase text-zinc-400">Scroll to Explore Databanks</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-zinc-500"><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
          </div>
        </div>
      </section>

      {/* LogoLoop 和卡片区 */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pb-24 sm:pb-40 pt-4 sm:pt-6">

        {generatedLogos.length > 0 && (
          <div className="w-full mb-8 sm:mb-10 relative overflow-hidden pointer-events-auto z-10 mask-edges animate-spring-scale" style={{ animationDelay: '0.65s' }}>
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

        {/* 一生一芯介绍区块 */}
        <YsyxIntroSection className="animate-float-up mb-12 sm:mb-16" />

        {/* 成果展示区块 */}
        <AchievementGallerySection 
          className="animate-float-up mb-12 sm:mb-16" 
          isCaptain={isCaptain}
          isAdmin={isCommander}
        />

        {isCaptain && (
          <div className="mb-8 sm:mb-12 animate-spring-scale" style={{ animationDelay: '0.55s' }}>
            <AddCardForm />
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {links.map((link: Bookmark, index: number) => (
            <div key={link.id} className="animate-float-up" style={{ animationDelay: `${(index * 50) + 500}ms` }}>
              <NavigationCard 
                id={link.id} 
                title={link.name} 
                description={link.description || ""} 
                url={link.url} 
                showDelete={isCaptain}
                category={link.category}
                iconSvg={link.iconSvg}
              />
            </div>
          ))}
        </div>
      </section>

      {/* 底部页脚 */}
      <Footer />
    </main>
  )
}
