import Link from "next/link";
// eslint-disable-next-line @next/next/no-img-element

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-transparent pt-24 pb-12 px-4 sm:p-6 md:p-10 sm:pt-24 md:pt-24 text-white flex flex-col items-center justify-center relative z-10 overflow-x-hidden">
      
      {/* 返回按钮：桌面绝对定位，移动端正常文档流避免与 Dock 重叠 */}
      <div className="md:absolute md:top-8 md:left-8 mb-6 md:mb-0 self-start">
        <Link 
          href="/"
          className="group flex items-center gap-2 sm:gap-3 bg-black/25 px-3 sm:px-5 py-2 sm:py-3 rounded-xl sm:rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
        >
          <div className="relative flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-white/10 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-zinc-400 transition-colors hidden sm:block">
              Return
            </span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
              返回主控台
            </span>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-3xl mx-auto text-center animate-fade-in-up">
        {/* 标题 */}
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-6 sm:mb-10 tracking-[0.05em] sm:tracking-[0.1em] md:tracking-[0.2em] font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)] text-balance">
          添加舰长微信，<br className="md:hidden" />共同探索未知
        </h1>

        {/* 🚀 改进后的超大常亮呼吸卡片 */}
        {/* 1. max-w-2xl 让卡片更宽大 */}
        {/* 2. 使用 animate-flame-active 让它自动呼吸 */}
        <div className="relative mx-auto w-full max-w-2xl animate-flame-active rounded-[1.5rem] sm:rounded-[2rem]">
          <div className="block bg-black/40 p-4 sm:p-6 md:p-12 rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            
            {/* 顶部装饰条 */}
            <div className="flex items-center justify-between mb-5 sm:mb-8 border-b border-white/5 pb-4 sm:pb-6 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)] shrink-0" />
                <span className="text-[9px] sm:text-[10px] md:text-xs text-zinc-400 font-mono tracking-[0.2em] sm:tracking-[0.3em] uppercase truncate">Secure Communication Encrypted</span>
              </div>
              <span className="text-white/20 text-base sm:text-lg shrink-0">✦</span>
            </div>

            {/* 🚀 图片区域优化：移除了 bg-white 和 p-4，去除了白边 */}
            <div className="relative mx-auto max-w-md bg-transparent rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
              {/* 二维码图片 */}
              <img 
                src="/Wechat(1).png" 
                alt="JouCristian WeChat QR Code" 
                className="w-full h-auto block" // block 去除图片底部的微小空隙
              />
              
              {/* 扫描线动画保持 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="w-full h-[3px] bg-green-400/60 blur-[2px] absolute top-0 -translate-y-full animate-[scan_3s_ease-in-out_infinite]" />
              </div>
            </div>

            {/* 底部信息区 */}
            <div className="mt-10 space-y-3">
              <p className="text-zinc-300 text-lg font-medium tracking-widest">
                识别上方星际通讯码
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10">
                <p className="text-[11px] text-zinc-500 font-mono tracking-[0.5em] uppercase">
                  Captain ID: JouCristian
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}
