"use client"

import { useRef, useEffect, useState } from "react"
import { SpotlightCard } from "./spotlight-card"
import SplitText from "./split-text"
import ScrollStack, { ScrollStackItem } from "./scroll-stack"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface YsyxIntroSectionProps {
  className?: string
}

// 卡片数据 - 每张卡片有独特的渐变色
const stackCards = [
  {
    title: "公益免费",
    subtitle: "零门槛开启芯片设计之旅",
    desc: "报名学习完全免费，中科院大学计算所倾力打造，让每位学生都能接触前沿芯片技术。",
    gradient: "from-emerald-500/90 to-teal-600/90",
    iconBg: "bg-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
      </svg>
    )
  },
  {
    title: "RISC-V 架构",
    subtitle: "掌握开源指令集精髓",
    desc: "学习国际主流开源指令集，设计可运行 Linux 操作系统的 RISC-V 处理器核心。",
    gradient: "from-violet-500/90 to-purple-600/90",
    iconBg: "bg-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
    )
  },
  {
    title: "硅上教学",
    subtitle: "真实流片验证设计",
    desc: "不止于仿真，通过真实的芯片流片制造过程，带着自己设计的芯片毕业。",
    gradient: "from-orange-500/90 to-amber-600/90",
    iconBg: "bg-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    )
  },
  {
    title: "开源社区",
    subtitle: "连接产业与学术",
    desc: "与甲辰计划、Chisel 社区深度联动，优秀学员可获得实习和就业推荐机会。",
    gradient: "from-sky-500/90 to-blue-600/90",
    iconBg: "bg-white/20",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
      </svg>
    )
  }
]

export function YsyxIntroSection({ className }: YsyxIntroSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardVisible, setCardVisible] = useState(false)
  const [stackComplete, setStackComplete] = useState(false)
  const animationTriggeredRef = useRef(false)

  useEffect(() => {
    if (!cardRef.current) return
    
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
      if (!animationTriggeredRef.current) {
        trigger.kill()
      }
    }
  }, [])

  return (
    <section className={`relative z-10 w-full py-16 sm:py-24 ${className || ''}`}>
      <div className="w-full">
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
          
          {/* 右侧：Mac 风格窗口卡片 + ScrollStack */}
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
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.6)]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.6)]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs font-mono text-zinc-500 tracking-wider">ysyx.oscc.cc</span>
                </div>
                <div className="w-[52px]" />
              </div>
              
              {/* 内容区域 - ScrollStack 垂直堆叠 */}
              <div className="relative z-10 h-[420px] sm:h-[480px] overflow-hidden -mx-5 sm:-mx-6 -mb-5 sm:-mb-6">
                <ScrollStack
                  className="h-full"
                  itemDistance={100}
                  stackDistance={10}
                  stackPosition={0.05}
                  baseScale={0.94}
                  rotationAmount={0.2}
                  blurAmount={0.8}
                  onStackComplete={() => setStackComplete(true)}
                >
                  {stackCards.map((card, index) => (
                    <ScrollStackItem key={index}>
                      <div className={`h-52 sm:h-56 rounded-2xl bg-gradient-to-br ${card.gradient} p-5 sm:p-6 flex flex-col justify-between shadow-lg`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xl sm:text-2xl font-bold text-white mb-1">{card.title}</h4>
                            <p className="text-sm text-white/80">{card.subtitle}</p>
                          </div>
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${card.iconBg} flex items-center justify-center text-white flex-shrink-0`}>
                            {card.icon}
                          </div>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed line-clamp-2">{card.desc}</p>
                      </div>
                    </ScrollStackItem>
                  ))}
                  
                  {/* 最后一张：CTA 卡片 */}
                  <ScrollStackItem>
                    <div className="h-52 sm:h-56 rounded-2xl bg-gradient-to-br from-zinc-800/90 to-zinc-900/90 border border-white/10 p-5 sm:p-6 flex flex-col items-center justify-center text-center shadow-lg">
                      <p className="text-zinc-400 text-sm mb-4">准备好开始你的芯片设计之旅了吗？</p>
                      <a
                        href="https://ysyx.oscc.cc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-white text-black font-bold transition-all hover:bg-cyan-400 hover:text-white active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                      >
                        <span className="tracking-wider">打开一生一芯官网</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5 transition-transform group-hover:translate-x-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    </div>
                  </ScrollStackItem>
                </ScrollStack>
              </div>
            </SpotlightCard>
          </div>
          
        </div>
      </div>
    </section>
  )
}
