"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

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
            verticalBeamOffset={0.0}
            horizontalSizing={0.7}
            verticalSizing={5.5}
            wispDensity={2.0}
            wispSpeed={21.5}
            wispIntensity={7}
            flowSpeed={0.35}
            flowStrength={0.65}
            fogIntensity={0.95}
            fogScale={0.4}
            fogFallSpeed={1.55}
            decay={1.0}
            falloffStart={1.0}
          />
        </div>

        {/* 右侧：文字内容区域 - 与激光流等高，内容居中偏下 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-10 lg:px-14 py-8 lg:py-12"
        >
          {/* 小标签 */}
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-purple-400 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase">
              SWUST YSYX Team
            </span>
          </div>

          {/* 主标题 */}
          <h3 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
            西南科技大学
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              一生一芯小组
            </span>
          </h3>

          {/* 副标题 */}
          <p className="text-zinc-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-lg">
            从零开始，亲手设计属于自己的处理器。
            <br className="hidden sm:block" />
            在星海中探索 CPU 的精妙设计，记录每一次突破与成长。
          </p>

          {/* 统计数据 */}
          <div className="flex gap-8 sm:gap-12 mb-6 sm:mb-8">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  --
                </span>
              </div>
              <div className="text-zinc-500 text-xs sm:text-sm mt-1">成果展示</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  --
                </span>
              </div>
              <div className="text-zinc-500 text-xs sm:text-sm mt-1">活跃成员</div>
            </div>
          </div>

          {/* 提示文字 */}
          <div className="flex items-center gap-2 text-zinc-500 text-xs sm:text-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>仅舰长和管理员可添加成果图片</span>
          </div>
        </motion.div>
      </div>

      {/* 下方卡片 - 全部用于图片展示 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative w-full -mt-[320px] sm:-mt-[420px] z-10"
      >
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
                成果图片展示区
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
