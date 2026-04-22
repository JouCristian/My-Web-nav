// src/app/loading.tsx

export default function Loading() {
  return (
    <main className="min-h-screen bg-black p-10 text-white font-[family-name:var(--font-space)]">
      
      {/* 🚀 1. 模拟页眉 Skeleton (对齐 Profile 页面的返回/导航布局) */}
      <div className="flex justify-between items-center max-w-5xl mx-auto mb-16 h-10 border-b border-white/5 pb-6">
        {/* 控制中心文字占位 */}
        <div className="w-40 h-8 rounded-lg bg-white/5 animate-pulse"></div>
        {/* 返回导航/待命状态占位 */}
        <div className="w-32 h-8 rounded-2xl bg-white/5 animate-pulse"></div>
      </div>

      {/* 🚀 2. 中央系统处理单元 Skeleton (带有呼吸光晕和闪烁效果) */}
      {/* animate-flame-active 提供常亮呼吸，animate-flicker 提供极微弱的电位闪烁 */}
      <div className="flex flex-col items-center mb-20 max-w-md mx-auto p-8 rounded-[2.5rem] bg-black/40 border border-white/10 backdrop-blur-xl animate-flame-active relative overflow-hidden group">
        
        {/* 蓝色呼吸小标题：与 ProfileForm 一致 */}
        <h1 className="text-sm font-bold tracking-[0.3em] font-mono text-center uppercase text-blue-400/80 mb-6">
          System Loading / 同步中
        </h1>
        
        {/* 动态加载圈：模拟头像圈的结构，但增加旋转 */}
        <div className="w-24 h-24 rounded-full border-2 border-white/20 p-1 mb-4 flex items-center justify-center relative">
          <div className="absolute inset-0 rounded-full border-t-2 border-white/50 animate-spin"></div>
          <div className="w-6 h-6 rounded-full border-b-2 border-white animate-pulse"></div>
        </div>
        
        {/* 系统提示文本占位 */}
        <p className="text-[10px] text-zinc-600 font-mono tracking-tighter opacity-60">
          Fetching Mission Control protocols...
        </p>

        {/* 内部微弱闪烁 */}
        <div className="absolute inset-0 bg-white/2 pointer-events-none opacity-0 animate-flicker"></div>
      </div>

      {/* 🚀 3. 书签卡片 Grid Skeleton (模拟 NavigationCard 的内部结构) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="relative h-44 rounded-3xl bg-black border border-white/10 p-6 flex flex-col justify-between overflow-hidden group shadow-[0_0_20px_rgba(255,255,255,0.02)]"
          >
            {/* 卡片上半部分：图标与文本区域 */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {/* 🚀 左侧图标占位：w-10 h-10，与 NavigationCard 一致 */}
                <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse"></div>
                
                {/* 🚀 右侧标题和副标题占位 */}
                <div className="space-y-2 flex-1">
                  {/* 标题：text-lg */}
                  <div className="w-3/4 h-5 rounded bg-white/10 animate-pulse"></div>
                  {/* 副标题：font-mono text-xs text-zinc-600 */}
                  <div className="w-1/2 h-4 rounded bg-white/5 animate-pulse font-mono"></div>
                </div>
              </div>
              
              {/* 🚀 底部描述文本占位：text-sm text-zinc-500 */}
              <div className="space-y-2 mt-4">
                <div className="w-full h-3 rounded bg-white/5 animate-pulse"></div>
                <div className="w-5/6 h-3 rounded bg-white/5 animate-pulse"></div>
              </div>
            </div>

            {/* 卡片下半部分：模拟操作/状态区域 */}
            {/* 🚀 右下角小标签占位：text-[10px] uppercase font-mono */}
            <div className="w-24 h-5 rounded-md bg-white/5 animate-pulse mt-4 ml-auto"></div>

            {/* 🚀 保持全局一致的微弱闪烁叠加层 */}
            <div className="absolute inset-0 bg-white/2 pointer-events-none opacity-0 animate-flicker"></div>
          </div>
        ))}
      </div>

      {/* 🚀 4. 页脚 Skeleton (对齐 Profile 页面的 Version 系统布局) */}
      <div className="mt-24 pt-6 border-t border-white/5 text-center max-w-5xl mx-auto">
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono">
          Starbase Profile System v2.0
        </p>
      </div>
    </main>
  )
}