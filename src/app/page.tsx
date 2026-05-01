// src/app/page.tsx
import { NavigationCard } from "@/components/navigation-card"
import { AddCardForm } from "@/components/add-card-form"
import { TransitionLink } from "@/components/transition-link"
import { prisma } from "@/lib/db"
import { auth, signOut } from "@/auth" 
import { TopNavDock } from "@/components/top-nav-dock" 
import { HideSpacetime } from "@/components/hide-spacetime" 
import DotField from "@/components/DotField" 
import RotatingText from "@/components/RotatingText" 
import ShinyText from "@/components/ShinyText" 
import Aurora from "@/components/Aurora" 
import LogoLoop from "@/components/LogoLoop" 
import GlassSurface from "@/components/GlassSurface" // 🚀 引入高级光学玻璃引擎

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

  // 🚀 核心重构：为跑马灯注入“液态玻璃外壳”与“黑曜石首字母图标”
  const generatedLogos = links.map(link => ({
    title: link.name,
    href: link.url,
    node: (
      // group 类名用于触发悬停时内部黑曜石图标的联动点亮
      <div className="relative group flex items-center h-[48px] px-1.5 pr-4 min-w-[140px] justify-center">
        
        {/* 🚀 底层：物理级光学液态玻璃 (完美移植了你调校的色散与模糊参数) */}
        <div className="absolute inset-0 z-0 pointer-events-none rounded-[24px]">
          <GlassSurface
            width="100%"
            height="100%"
            borderRadius={24} // 高度 48px，完美的胶囊圆角 24px
            backgroundOpacity={0.37}
            saturation={1}
            borderWidth={0.07}
            brightness={50}
            opacity={0.93}
            blur={11}
            displace={0.5} 
            distortionScale={-180}
            redOffset={0}
            greenOffset={10}
            blueOffset={20}
          />
        </div>

        {/* 🚀 顶层内容：黑曜石首字母图标 + 强对比度抗锯齿文本 */}
        <div className="relative z-10 flex items-center gap-3 w-full">
          <div className="obsidian-icon-loop w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] text-white font-black uppercase shrink-0">
            {link.name.substring(0, 1)}
          </div>
          <span className="text-sm font-bold text-zinc-100 tracking-wider whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,1)] group-hover:text-cyan-400 transition-colors">
            {link.name}
          </span>
        </div>
      </div>
    )
  }));

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

        /* 跑马灯渐隐遮罩 */
        .mask-edges {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }

        /* 🚀 为 LogoLoop 定制的黑曜石物理切边按钮样式 */
        .obsidian-icon-loop {
          background-color: rgba(6, 8, 15, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.25);
          border-bottom: 1px solid rgba(0, 0, 0, 0.5);
          box-shadow: 0 5px 10px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        /* 胶囊悬停时，联动点亮黑曜石内部赛博青色光效 */
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

      <div className="fixed inset-0 z-0 pointer-events-none opacity-60 mix-blend-screen">
        <Aurora
          colorStops={["#A855F7", "#3b82f6", "#22d3ee"]} 
          blend={0.6}
          amplitude={1.2}
          speed={0.5}
        />
      </div>

      <div className="fixed inset-0 z-0 pointer-events-auto mix-blend-screen opacity-100">
        <DotField
          dotRadius={2.0} 
          dotSpacing={22}
          cursorRadius={300}
          cursorForce={0.15}
          bulgeOnly={true}
          bulgeStrength={80}
          glowRadius={220}
          sparkle={false} 
          waveAmplitude={0}
          gradientFrom="rgba(168, 85, 247, 1)"  
          gradientTo="rgba(168, 85, 247, 0.3)"    
          glowColor="rgba(168, 85, 247, 0.2)"
        />
      </div>

      <TopNavDock session={session} dbUser={dbUser} isCaptain={isCaptain} onSignOut={handleSignOutAction} />

      <section className="relative z-10 w-full min-h-[90vh] flex flex-col items-center justify-center text-center px-4 pt-10 pointer-events-none">
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,4,10,0.6)_0%,transparent_65%)] z-0 pointer-events-none"></div>

        <div className="animate-float-up pointer-events-auto relative z-10 mb-8 font-mono text-xl sm:text-2xl md:text-3xl font-bold tracking-widest text-zinc-100 drop-shadow-[0_2px_10px_rgba(0,0,0,1)]" style={{ animationDelay: '0.1s' }}>
          <RotatingText
            prefix="Creating"
            texts={['thinking!', 'coding!', 'components!', 'ysyxing!']}
            mainClassName="px-4 py-1.5 md:px-6 md:py-2 bg-cyan-400 text-black overflow-hidden rounded-[1.2rem] shadow-[0_0_20px_rgba(34,211,238,0.4)] flex items-center justify-center"
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

        <h1 className="animate-float-up pointer-events-auto relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-nowrap font-bold tracking-tighter font-[family-name:var(--font-space)] drop-shadow-[0_4px_30px_rgba(0,0,0,0.8)] mb-6" style={{ animationDelay: '0.2s' }}>
          <ShinyText 
            text={cardTitle} 
            speed={3} 
            delay={0}
            color="rgba(255, 255, 255, 0.65)" 
            shineColor="#ffffff" 
            spread={100}
            direction="left"
          />
        </h1>
        
        <p className="animate-float-up pointer-events-auto relative z-10 text-sm sm:text-base md:text-lg whitespace-nowrap text-zinc-300 tracking-widest mx-auto leading-relaxed mb-16 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" style={{ animationDelay: '0.3s' }}>
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
        
        {generatedLogos.length > 0 && (
          <div className="w-full mb-16 relative overflow-hidden pointer-events-auto z-10 mask-edges">
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