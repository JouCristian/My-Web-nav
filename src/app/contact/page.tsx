import Link from "next/link";
// eslint-disable-next-line @next/next/no-img-element

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-transparent p-6 md:p-10 text-white flex flex-col items-center justify-center relative z-10">
      
      {/* 返回按钮 */}
      <div className="absolute top-8 right-8 md:right-auto md:left-8 mt-20 md:mt-0">
        <Link 
          href="/"
          className="group flex items-center gap-3 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md animate-flame-hover hover:border-white/30 transition-all duration-300 active:scale-[0.97]"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/20 group-hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-400 group-hover:text-white group-hover:-translate-x-0.5 transition-all">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </div>
          <div className="flex flex-col items-start hidden sm:flex">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono group-hover:text-zinc-400 transition-colors">
              Return
            </span>
            <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
              返回主控台
            </span>
          </div>
        </Link>
      </div>

      <div className="w-full max-w-3xl mx-auto text-center mt-20 md:mt-0 animate-fade-in-up">
        {/* 标题 */}
        <h1 className="text-3xl md:text-5xl font-bold mb-10 tracking-[0.1em] md:tracking-[0.2em] font-[family-name:var(--font-space)] text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-200 to-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
          添加舰长微信，<br className="md:hidden" />共同探索未知
        </h1>

        {/* 🚀 改进后的超大常亮呼吸卡片 */}
        {/* 1. max-w-2xl 让卡片更宽大 */}
        {/* 2. 使用 animate-flame-active 让它自动呼吸 */}
        <div className="relative mx-auto w-full max-w-2xl animate-flame-active rounded-[2rem]">
          <div className="block bg-black/40 p-6 md:p-12 rounded-[2rem] border border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
            
            {/* 顶部装饰条 */}
            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                <span className="text-[10px] md:text-xs text-zinc-400 font-mono tracking-[0.3em] uppercase">Secure Communication Encrypted</span>
              </div>
              <span className="text-white/20 text-lg">✦</span>
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