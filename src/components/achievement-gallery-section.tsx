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
    <section className={`relative w-full overflow-visible ${className}`}>
      {/* 激光流容器 - 允许溢出，不被截断 */}
      <div className="relative w-full overflow-visible">
        {/* LaserFlow 动画区域 - 使用负的top值让激光流延伸到section外部 */}
        <div className="absolute -top-[100px] sm:-top-[150px] left-0 right-0 h-[450px] sm:h-[550px] z-10 pointer-events-none overflow-visible">
          <LaserFlow
            color="#cf9eff"
            horizontalBeamOffset={-0.25}
            verticalBeamOffset={0.0}
            horizontalSizing={0.5}
            verticalSizing={4}
            wispDensity={1.6}
            wispSpeed={21.5}
            wispIntensity={5}
            flowSpeed={0.35}
            flowStrength={0.37}
            fogIntensity={0.82}
            fogScale={0.23}
            fogFallSpeed={1.55}
            decay={1.1}
            falloffStart={1.2}
          />
        </div>

        {/* 主内容卡片 - 顶部与激光流底部紧密贴合 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative w-full pt-[280px] sm:pt-[320px]"
        >
          {/* 内容卡片 - 带紫色边框 */}
          <div 
            className="relative w-full min-h-[450px] sm:min-h-[500px] rounded-2xl sm:rounded-3xl border border-purple-500/30 bg-[#0a0a12]/90 backdrop-blur-xl flex flex-col sm:flex-row"
            style={{
              boxShadow: '0 0 80px rgba(207, 158, 255, 0.08), inset 0 0 60px rgba(0,0,0,0.5)'
            }}
          >
            {/* 左侧：标题区域 */}
            <div className="flex-1 flex flex-col justify-center p-6 sm:p-10 lg:p-14">
              {/* 小标签 */}
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-purple-400 text-[10px] sm:text-xs font-mono tracking-[0.25em] uppercase">
                  SWUST YSYX Team
                </span>
              </div>

              {/* 主标题 */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight tracking-tight">
                西南科技大学
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                  一生一芯小组
                </span>
              </h3>

              {/* 副标题 */}
              <p className="text-zinc-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-6 sm:mb-8 max-w-md">
                从零开始，亲手设计属于自己的处理器。
                <br className="hidden sm:block" />
                在星海中探索 CPU 的精妙设计，记录每一次突破与成长。
              </p>

              {/* 统计数据 */}
              <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8">
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      --
                    </span>
                  </div>
                  <div className="text-zinc-500 text-xs sm:text-sm mt-1">成果展示</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
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
            </div>

            {/* 右侧：图片展示区域占位 */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 border-t sm:border-t-0 sm:border-l border-purple-500/20">
              <div className="w-full h-full min-h-[200px] sm:min-h-0 rounded-xl sm:rounded-2xl border-2 border-dashed border-purple-500/20 bg-purple-500/5 flex flex-col items-center justify-center gap-4 text-center p-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-zinc-400 text-sm sm:text-base font-medium mb-1">
                    成果图片展示区
                  </p>
                  <p className="text-zinc-500 text-xs sm:text-sm">
                    即将开放，敬请期待
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AchievementGallerySection;
