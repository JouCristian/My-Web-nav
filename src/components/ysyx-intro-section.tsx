"use client"

import { useRef, useEffect, useState } from "react"
import { SpotlightCard } from "./spotlight-card"
import SplitText from "./split-text"
import { ScrollVelocity } from "./scroll-velocity"
import { TextType } from "./text-type"
import TiltedCard from "./tilted-card"
import GlareHover from "./glare-hover" 
import { motion } from "motion/react" // 引入 motion 实现整体缩放
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
          
          {/* 左侧：介绍文字 */}
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
          
          {/* 右侧：Mac 风格窗口卡片 */}
          <div 
            ref={cardRef}
            className={`w-full lg:w-[55%] lg:flex-shrink-0 transition-all duration-1000 ease-out ${
              cardVisible 
                ? 'opacity-100 translate-y-0' 
                : 'opacity-0 translate-y-16'
            }`}
          >
            <SpotlightCard 
              className="bg-[#16161b]/85 backdrop-blur-3xl backdrop-saturate-[180%] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
              spotlightColor="rgba(255, 255, 255, 0.08)"
            >
              <div className="flex items-center gap-2 px-5 py-4 border-b border-white/[0.08] bg-white/[0.04] rounded-t-2xl -mx-5 -mt-5 sm:-mx-6 sm:-mt-6 relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_8px_rgba(255,95,87,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_8px_rgba(254,188,46,0.4)]" />
                  <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_8px_rgba(40,200,64,0.4)]" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span className="text-xs font-mono text-zinc-400 tracking-wider">ysyx.oscc.cc</span>
                </div>
                <div className="w-[52px]" />
              </div>
              
              <div className="relative z-10 pt-10 sm:pt-14 flex flex-col min-h-[400px] sm:min-h-[460px]">
                
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 px-4 sm:px-6 lg:px-10">
                  
                  {/* 定点修改：图片 Card 整体放大逻辑 - 移动端使用较小尺寸 */}
                  <div className="flex-shrink-0 hidden sm:block">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative z-20"
                    >
                      <GlareHover
                        width="230px"
                        height="230px"
                        background="transparent"
                        borderRadius="24px"
                        borderColor="rgba(255,255,255,0.1)"
                        glareColor="#ffffff"
                        glareOpacity={0.3}
                        glareSize={250}
                        transitionDuration={1650}
                        playOnce={true}
                      >
                        <TiltedCard
                          imageSrc="/images/ysyx-logo.png"
                          altText="一生一芯 Logo"
                          containerHeight="240px"
                          containerWidth="240px"
                          imageHeight="240px"
                          imageWidth="240px"
                          rotateAmplitude={10}
                          scaleOnHover={1}
                          showMobileWarning={false}
                          showTooltip={false}
                          displayOverlayContent={true}
                        />
                      </GlareHover>
                    </motion.div>
                  </div>
                  
                  {/* 移动端使用较小尺寸的图片 */}
                  <div className="flex-shrink-0 block sm:hidden">
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative z-20"
                    >
                      <GlareHover
                        width="160px"
                        height="160px"
                        background="transparent"
                        borderRadius="16px"
                        borderColor="rgba(255,255,255,0.1)"
                        glareColor="#ffffff"
                        glareOpacity={0.3}
                        glareSize={180}
                        transitionDuration={1650}
                        playOnce={true}
                      >
                        <TiltedCard
                          imageSrc="/images/ysyx-logo.png"
                          altText="一生一芯 Logo"
                          containerHeight="160px"
                          containerWidth="160px"
                          imageHeight="160px"
                          imageWidth="160px"
                          rotateAmplitude={8}
                          scaleOnHover={1}
                          showMobileWarning={false}
                          showTooltip={false}
                          displayOverlayContent={true}
                        />
                      </GlareHover>
                    </motion.div>
                  </div>
                  
                  {/* 右侧：文字与按钮 */}
                  <div className="flex-1 flex justify-center w-full sm:w-auto">
                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                      <div className="mb-6">
                        <div className="text-xl sm:text-2xl font-bold text-white min-h-[1.8em] leading-tight">
                          <TextType
                            text={[
                              "设计你的第一颗 CPU",
                              "从零开始的处理器之旅",
                              "芯片设计不再遥不可及",
                              "用代码点亮你的硅梦想",
                              "加入西科一生一芯小组",
                              "共同进步！YSYX！"
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
                        <p className="text-xs text-zinc-500 mt-2 font-mono tracking-widest uppercase">YSYX · Open Source Chip Education</p>
                      </div>
                      
                      <a
                        href="https://ysyx.oscc.cc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="spring-btn-hero group relative inline-flex items-center justify-center gap-3 px-8 py-3.5 rounded-full bg-white text-black font-bold text-sm overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative z-10 tracking-[0.1em]">进入官网</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden -mx-5 sm:-mx-6 mt-8 mb-2">
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
                    className="[&>div]:gap-1"
                  />
                </div>

                <div className="pt-4 border-t border-white/[0.1]">
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
