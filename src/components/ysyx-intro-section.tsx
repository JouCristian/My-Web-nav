"use client"

import { useRef, useEffect, useState } from "react"
import { SpotlightCard } from "./spotlight-card"
import SplitText from "./split-text"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface YsyxIntroSectionProps {
  className?: string
}

const introCards = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    ),
    title: "公益免费",
    desc: "报名学习完全免费，降低芯片设计门槛"
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
    ),
    title: "RISC-V 架构",
    desc: "学习开源指令集，设计可运行 Linux 的处理器"
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    title: "硅上教学",
    desc: "真实流片制造，带着自己设计的芯片毕业"
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    ),
    title: "开源社区",
    desc: "与甲辰计划、Chisel 社区联动，提供实习就业机会"
  }
]

export function YsyxIntroSection({ className }: YsyxIntroSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [cardVisible, setCardVisible] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const animationTriggeredRef = useRef(false)

  useEffect(() => {
    if (!cardRef.current) return
    
    // If animation was already triggered, keep visible
    if (animationTriggeredRef.current) {
      setCardVisible(true)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: cardRef.current,
      start: "top 85%",
      once: true,
      onEnter: () => {
        animationTriggeredRef.current = true
        setCardVisible(true)
      }
    })

    return () => {
      // Don't reset visibility on cleanup if animation already triggered
      if (!animationTriggeredRef.current) {
        trigger.kill()
      }
    }
  }, [])

  // 监听滚动容器
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      // 当滚动到最后一张卡片附近时显示按钮
      const isNearEnd = scrollLeft + clientWidth >= scrollWidth - 50
      setShowButton(isNearEnd)
    }

    container.addEventListener('scroll', handleScroll)
    // 初始检查
    handleScroll()

    return () => container.removeEventListener('scroll', handleScroll)
  }, [cardVisible])

  return (
    <section className={`relative z-10 w-full py-16 sm:py-24 ${className || ''}`}>
      <div className="w-full">
        {/* 使用 items-center 让左右两边垂直居中对齐 */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* 左侧：大字标题和介绍文字 */}
          <div className="w-full lg:w-[45%] text-center lg:text-left flex flex-col justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.15]">
              <SplitText
                text="什么是"
                tag="span"
                className="block text-white"
                splitType="chars"
                delay={80}
                duration={0.8}
                ease="power3.out"
                from={{ opacity: 0, y: 60 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.2}
                rootMargin="-50px"
                textAlign="left"
              />
              <SplitText
                text="「一生一芯」？"
                tag="span"
                className="block text-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.6)] whitespace-nowrap"
                splitType="chars"
                delay={60}
                duration={0.8}
                ease="power3.out"
                from={{ opacity: 0, y: 60, scale: 0.9 }}
                to={{ opacity: 1, y: 0, scale: 1 }}
                threshold={0.2}
                rootMargin="-50px"
                textAlign="left"
              />
            </h2>
            
            <SplitText
              text="「一生一芯」是中国科学院大学计算所发起的开源芯片教育项目，旨在让每一位学生都能设计属于自己的 CPU 处理器。"
              tag="p"
              className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0"
              splitType="words"
              delay={40}
              duration={0.6}
              ease="power2.out"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-80px"
              textAlign="left"
            />
            
            <SplitText
              text="通过系统的课程学习和实践，你将掌握数字电路设计、计算机体系结构、操作系统等核心知识，并最终完成一颗可以运行 Linux 的 RISC-V 处理器。"
              tag="p"
              className="text-base text-zinc-500 leading-relaxed max-w-lg mx-auto lg:mx-0"
              splitType="words"
              delay={30}
              duration={0.5}
              ease="power2.out"
              from={{ opacity: 0, y: 20 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="left"
            />
          </div>
          
          {/* 右侧：Mac 风格窗口卡片 + Spotlight 效果 */}
          <div 
            ref={cardRef}
            className={`w-full lg:w-[55%] lg:flex-shrink-0 transition-all duration-1000 ease-out ${
              cardVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-16'
            }`}
          >
            <SpotlightCard 
              className="bg-[#0c0c14]/95 backdrop-blur-2xl border border-white/[0.08] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              spotlightColor="rgba(255, 255, 255, 0.15)"
            >
              {/* Mac 窗口顶栏 */}
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.06] bg-white/[0.02] rounded-t-2xl -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 relative z-10">
                {/* 三个圆点按钮 */}
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.6)]" />
                </div>
                
                {/* 窗口标题 */}
                <div className="flex-1 flex justify-center">
                  <span className="text-xs font-mono text-zinc-500 tracking-wider">ysyx.oscc.cc</span>
                </div>
                
                {/* 占位，保持居中 */}
                <div className="w-[52px]" />
              </div>
              
              {/* 内容区域 - 横向滑动卡片 */}
              <div className="relative z-10 pt-6 sm:pt-8">
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-6 px-1 snap-x snap-mandatory scrollbar-hide"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {introCards.map((card, index) => (
                    <div 
                      key={index}
                      className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start"
                    >
                      <div className="h-full p-5 sm:p-6 rounded-xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] hover:border-white/[0.15] transition-all duration-300 hover:bg-white/[0.04]">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-400/5 border border-cyan-400/20 flex items-center justify-center mb-4 text-cyan-400">
                          {card.icon}
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">{card.title}</h4>
                        <p className="text-sm text-zinc-400 leading-relaxed">{card.desc}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* 最后一张：按钮卡片 */}
                  <div className="flex-shrink-0 w-[240px] sm:w-[280px] snap-start">
                    <div className="h-full p-5 sm:p-6 rounded-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center mb-5">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8 text-white">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </div>
                      <p className="text-sm text-zinc-400 mb-5">开启你的芯片设计之旅</p>
                      <a
                        href="https://ysyx.oscc.cc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white text-black font-bold text-sm transition-all hover:bg-cyan-400 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        <span className="tracking-wider">打开一生一芯官网</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* 滚动指示器 */}
                <div className={`flex items-center justify-center gap-2 mt-2 transition-opacity duration-300 ${showButton ? 'opacity-30' : 'opacity-60'}`}>
                  <span className="text-[10px] text-zinc-500 font-mono tracking-wider uppercase">
                    {showButton ? '已到达终点' : '左右滑动探索'}
                  </span>
                  {!showButton && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-zinc-500 animate-pulse">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  )}
                </div>
              </div>
            </SpotlightCard>
          </div>
          
        </div>
      </div>
    </section>
  )
}
