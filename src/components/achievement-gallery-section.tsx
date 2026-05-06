"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import GlitchText from "./GlitchText";

// 动态导入 LaserFlow 避免 SSR 问题
const LaserFlow = dynamic(() => import("./LaserFlow"), { ssr: false });

interface AchievementGallerySectionProps {
  className?: string;
}

export function AchievementGallerySection({ className = "" }: AchievementGallerySectionProps) {
  return (
    <section className={`relative w-full ${className}`}>
      {/* 顶部区域：激光流 + 文字内容并排 */}
      <div className="relative w-full flex flex-col lg:flex-row items-stretch">
        {/* 左侧：激光流区域 */}
        <div className="relative w-full lg:w-1/2 h-[600px] sm:h-[750px] lg:h-[850px]">
          <LaserFlow
            color="#cf9eff"
            horizontalBeamOffset={0}
            verticalBeamOffset={-0.135}
            horizontalSizing={1.5}
            verticalSizing={1.5}
            wispDensity={6.0}
            wispSpeed={15.5}
            wispIntensity={8}
            flowSpeed={0.35}
            flowStrength={0.45}
            fogIntensity={0.55}
            fogScale={0.4}
            fogFallSpeed={1.55}
            decay={1.0}
            falloffStart={1.5}
          />
        </div>

        {/* 右侧：文字内容区域 - 内容集中在上半部分，避免被card遮挡 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full lg:w-1/2 flex flex-col justify-start px-6 sm:px-10 lg:px-16 pt-8 sm:pt-12 lg:pt-20 pb-[350px] sm:pb-[450px]"
        >
          {/* GlitchText 标题 */}
          <div className="mb-6 sm:mb-8">
            <GlitchText
              speed={1.8}
              enableShadows={true}
              enableOnHover={false}
              className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-[0.15em]"
            >
              SWUST YSYX TEAM
            </GlitchText>
          </div>

          {/* 主标题 - 更大更突出 */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white mb-2 leading-[1.1] tracking-tight">
            西南科技大学
          </h2>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 sm:mb-8 leading-[1.1] tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              一生一芯小组
            </span>
          </h2>

          {/* 副标题 - 更丰富的描述 */}
          <div className="space-y-3 mb-8 sm:mb-10 max-w-lg">
            <p className="text-zinc-300 text-base sm:text-lg lg:text-xl leading-relaxed font-medium">
              从零开始，亲手设计属于自己的处理器。
            </p>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              在星海中探索 CPU 的精妙设计，记录每一次突破与成长。
              我们是一群热爱计算机体系结构的探索者，致力于将理论转化为实践。
            </p>
          </div>

          {/* 特色标签 */}
          <div className="flex flex-wrap gap-2">
            {['RISC-V', 'CPU设计', '数字电路', '开源硬件', '流片验证'].map((tag) => (
              <span 
                key={tag}
                className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-zinc-400 text-xs sm:text-sm font-medium hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-300 transition-colors cursor-default"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* 下方卡片 - 全部用于图片展示 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full -mt-[325px] sm:-mt-[425px] z-10"      >
        {/* 图片展示卡片 - 带紫色边框，无内部黑框 */}
        <div
          className="relative w-full min-h-[400px] sm:min-h-[500px] rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-[#0a0a12]/90 backdrop-blur-xl p-6 sm:p-8 lg:p-10"
          style={{
            boxShadow: '0 0 80px rgba(207, 158, 255, 0.08), inset 0 0 60px rgba(0,0,0,0.5)'
          }}
        >
          {/* 图片展示区域占位 - 移除边框 */}
          <div className="w-full h-full min-h-[350px] sm:min-h-[420px] flex flex-col items-center justify-center gap-4 text-center p-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <svg className="w-10 h-10 sm:w-12 sm:h-12 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <p className="text-zinc-400 text-base sm:text-lg font-medium mb-2">
                成果���片展示区
              </p>
              <p className="text-zinc-500 text-sm">
                即将开放，敬请期待
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default AchievementGallerySection;
