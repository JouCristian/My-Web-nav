"use client"

import { useRef, useEffect, useState } from "react"
import { SpotlightCard } from "./spotlight-card"
import SplitText from "./split-text"
import { ScrollVelocity } from "./scroll-velocity"
import { TextType } from "./text-type"
import TiltedCard from "./tilted-card"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface YsyxIntroSectionProps {
  className?: string
}

export function YsyxIntroSection({ className }: YsyxIntroSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardVisible, setCardVisible] = useState(false)
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
              
              {/* 内容区域 - 全新布局 */}
              <div className="relative z-10 pt-6 sm:pt-8 flex flex-col min-h-[380px] sm:min-h-[420px]">
                
                {/* 主内容区：左右布局 */}
                <div className="flex-1 flex gap-5 sm:gap-6 px-4 sm:px-5">
                  
                  {/* 左侧：Logo 图片 */}
                  <div className="flex-shrink-0 pt-1">
                    <TiltedCard
                      imageSrc="/images/ysyx-logo.png"
                      altText="一生一芯 Logo"
                      containerHeight="140px"
                      containerWidth="140px"
                      imageHeight="140px"
                      imageWidth="140px"
                      rotateAmplitude={16}
                      scaleOnHover={1.15}
                      showMobileWarning={false}
                      showTooltip={false}
                      displayOverlayContent={false}
                    />
                  </div>
                  
                  {/* 右侧：打字机标题 + 按钮 */}
                  <div className="flex-1 flex flex-col">
                    {/* 打字机效果标题 - 与左侧Logo顶部对齐 */}
                    <div className="mb-4">
                      <div className="text-lg sm:text-xl font-bold text-white min-h-[1.8em] leading-tight">
                        <TextType
                          text={[
                            "设计你的第一颗 CPU",
                            "从零开始的处理器之旅",
                            "让芯片设计不再遥不可及",
                            "用代码点亮你的硅梦想"
                          ]}
                          typingSpeed={80}
                          pauseDuration={2000}
                          deletingSpeed={40}
                          showCursor={true}
                          cursorCharacter="_"
                          cursorClassName="text-cyan-400"
                          className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-300"
                        />
                      </div>
                      <p className="text-xs text-zinc-600 mt-2 font-mono">YSYX · Open Source Chip Education</p>
                    </div>
                    
                    {/* 访问官网按钮 - 精致设计 */}
                    <a
                      href="https://ysyx.oscc.cc"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-cyan-400/5 border border-cyan-400/20 hover:border-cyan-400/40 hover:from-cyan-500/15 hover:to-cyan-400/10 transition-all duration-300 w-fit"
                    >
                      {/* 发光背景 */}
                      <div className="absolute inset-0 rounded-xl bg-cyan-400/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />
                      
                      {/* 按钮内容 */}
                      <div className="relative flex items-center gap-3">
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors duration-300">
                          进入官网
                        </span>
                        <div className="w-6 h-6 rounded-md bg-cyan-400/20 flex items-center justify-center group-hover:bg-cyan-400/30 group-hover:scale-110 transition-all duration-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                          </svg>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* 滚动关键词 - 紧贴底部分界线 */}
                <div className="overflow-hidden -mx-5 sm:-mx-6 mt-auto mb-0">
                  <ScrollVelocity
                    texts={[
                      <span key="row1" className="flex items-center gap-4 text-sm sm:text-base font-mono font-semibold text-zinc-400">
                        <span className="text-cyan-400">RISC-V</span>
                        <span className="text-zinc-600">·</span>
                        <span>Verilog</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-cyan-400">Linux</span>
                        <span className="text-zinc-600">·</span>
                        <span>NPC</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-cyan-400">SoC</span>
                        <span className="text-zinc-600">·</span>
                        <span>Chisel</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-cyan-400">FPGA</span>
                      </span>,
                      <span key="row2" className="flex items-center gap-4 text-sm sm:text-base font-mono font-semibold text-zinc-500">
                        <span>数字电路</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-cyan-400/80">体系结构</span>
                        <span className="text-zinc-600">·</span>
                        <span>操作系统</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-cyan-400/80">编译原理</span>
                        <span className="text-zinc-600">·</span>
                        <span>性能优化</span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-cyan-400/80">流片验证</span>
                      </span>
                    ]}
                    velocity={30}
                    numCopies={4}
                    className="[&>div]:gap-0.5"
                  />
                </div>

                {/* 底部：核心亮点列表 */}
                <div className="pt-4 border-t border-white/[0.06]">
                  <div className="grid grid-cols-2 gap-3 px-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                      <span className="text-zinc-400">国科大官方出品</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                      <span className="text-zinc-400">完整 CPU 设计流程</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                      <span className="text-zinc-400">可流片的真实芯片</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]" />
                      <span className="text-zinc-400">开源社区支持</span>
                    </div>
                  </div>
                </div>

              </div>
            </SpotlightCard>
          </div>
          
        </div>
      </div>
    </section>
  )
}
