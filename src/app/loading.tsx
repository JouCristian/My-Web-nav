// src/app/loading.tsx
export default function Loading() {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <h1 className="text-4xl font-bold mb-4 text-center tracking-widest opacity-20">加载中...</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* 生成 6 个亮闪闪的占位方块 */}
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse border border-white/5"></div>
          ))}
        </div>
      </main>
    )
  }