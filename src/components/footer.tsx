// 社交链接配置
const SOCIAL_LINKS = [
  {
    name: 'GitHub',
    url: 'https://github.com/JouCristian',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
    ),
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@%E9%82%B9%E4%BF%8A%E6%AF%85',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    name: 'Gitee',
    url: 'https://gitee.com/joujous',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.016 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.63c0 .327.266.592.593.592h5.63c.982 0 1.778-.796 1.778-1.778v-.296a.593.593 0 0 0-.592-.593h-4.15a.592.592 0 0 1-.592-.592v-1.482a.593.593 0 0 1 .593-.592h6.815c.327 0 .593.265.593.592v3.408a4 4 0 0 1-4 4H5.926a.593.593 0 0 1-.593-.593V9.778a4.444 4.444 0 0 1 4.445-4.444h8.296z"/>
      </svg>
    ),
  },
  {
    name: '小红书',
    url: 'https://xhslink.com/m/5MoeGYOxt4h',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14.5h-7a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h2.5v-4H9a.5.5 0 0 1-.5-.5V9a.5.5 0 0 1 .5-.5h2.5V7a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1.5H15a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1.5v4h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5z"/>
      </svg>
    ),
  },
]

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="relative w-full mt-20 border-t border-white/5">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
      
      <div className="relative max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col items-center gap-6">
          {/* 社交图标 */}
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative p-3 rounded-xl bg-white/5 border border-white/10 text-zinc-400 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-110 active:scale-95"
                title={link.name}
              >
                {link.icon}
                {/* Hover 提示 */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {link.name}
                </span>
              </a>
            ))}
          </div>
          
          {/* 分割线装饰 */}
          <div className="flex items-center gap-4 w-full max-w-xs">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-white/20 text-xs">*</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          
          {/* 版权信息 */}
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-zinc-500 text-sm">
              <span className="text-zinc-400 font-medium">西科星际舰队</span>
              <span className="mx-2 text-zinc-600">|</span>
              <span className="font-[family-name:var(--font-space)] tracking-wider">XIKE STARFLEET</span>
            </p>
            <p className="text-zinc-600 text-xs">
              &copy; {currentYear} All rights reserved. Built with passion.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
