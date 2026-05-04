import { getStats } from "@/app/actions"

// SVG 图标组件
function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function VisitIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CrewIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  accentColor: string
  borderColor: string
  bgColor: string
}

function StatCard({ icon, label, value, accentColor, borderColor, bgColor }: StatCardProps) {
  return (
    <div className={`relative group flex items-center gap-4 px-5 py-4 rounded-2xl border ${borderColor} ${bgColor} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] animate-flame-hover`}>
      {/* 图标容器 */}
      <div className={`shrink-0 w-10 h-10 rounded-xl ${bgColor} border ${borderColor} flex items-center justify-center`}>
        <div className={`w-5 h-5 ${accentColor}`}>
          {icon}
        </div>
      </div>
      
      {/* 文字内容 */}
      <div className="flex flex-col">
        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">{label}</span>
        <span className={`text-2xl font-bold ${accentColor} font-[family-name:var(--font-space)] tracking-wide`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
      </div>
      
      {/* 装饰光点 */}
      <div className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${accentColor.replace('text-', 'bg-')} opacity-60 animate-pulse`} />
    </div>
  )
}

export async function StatsCards() {
  const stats = await getStats()
  
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<BookmarkIcon className="w-full h-full" />}
          label="收藏书签"
          value={stats.bookmarkCount}
          accentColor="text-cyan-400"
          borderColor="border-cyan-500/20"
          bgColor="bg-cyan-500/5"
        />
        <StatCard
          icon={<VisitIcon className="w-full h-full" />}
          label="今日访问"
          value={stats.todayVisits}
          accentColor="text-amber-400"
          borderColor="border-amber-500/20"
          bgColor="bg-amber-500/5"
        />
        <StatCard
          icon={<CrewIcon className="w-full h-full" />}
          label="船员人数"
          value={stats.crewCount}
          accentColor="text-purple-400"
          borderColor="border-purple-500/20"
          bgColor="bg-purple-500/5"
        />
      </div>
    </div>
  )
}
