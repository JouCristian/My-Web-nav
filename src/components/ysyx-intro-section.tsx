"use client"

import { SpotlightCard } from "./spotlight-card"

interface YsyxIntroSectionProps {
  className?: string
}

export function YsyxIntroSection({ className }: YsyxIntroSectionProps) {
  return (
    <section className={`relative z-10 w-full py-16 sm:py-24 ${className || ''}`}>
      <div className="w-full">
        {/* 使用 items-center 让左右两边垂直居中对齐 */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* 左侧：大字标题和介绍文字 */}
          <div className="w-full lg:w-[42%] text-center lg:text-left flex flex-col justify-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-8 leading-[1.15]">
              <span className="block">什么是</span>
              <span className="block text-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.6)]">「一生一芯」？</span>
            </h2>
            
            <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed mb-6 max-w-lg mx-auto lg:mx-0 text-pretty">
              「一生一芯」是中国科学院大学计算所发起的开源芯片教育项目，
              旨在让每一位学生都能设计属于自己的 CPU 处理器。
            </p>
            
            <p className="text-base text-zinc-500 leading-relaxed max-w-lg mx-auto lg:mx-0 text-pretty">
              通过系统的课程学习和实践，你将掌握数字电路设计、计算机体系结构、
              操作系统等核心知识，并最终完成一颗可以运行 Linux 的 RISC-V 处理器。
            </p>
          </div>
          
          {/* 右侧：Mac 风格窗口卡片 + Spotlight 效果 */}
          <div className="w-full lg:w-[58%] lg:flex-shrink-0">
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
              
              {/* 内容区域 - 增加高度 */}
              <div className="relative z-10 pt-6 sm:pt-8">
                {/* 占位内容，后续设计 */}
                <div className="flex flex-col items-center justify-center min-h-[380px] sm:min-h-[420px] text-zinc-500">
                  <div className="w-20 h-20 mb-5 rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/[0.08] flex items-center justify-center backdrop-blur-sm">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-10 h-10 text-zinc-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <span className="text-sm font-mono tracking-wider text-zinc-600">内容即将呈现</span>
                </div>
              </div>
            </SpotlightCard>
          </div>
          
        </div>
      </div>
    </section>
  )
}
