// src/components/sign-out-button.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createRoot } from "react-dom/client"

// 🚀 核心黑魔法：脱离当前页面的独立动画遮罩层。
// 无论后台页面怎么跳转、怎么刷新，这个动画都会坚持执行完毕，彻底杜绝“硬切”！
const StandaloneOverlay = ({ onSignOut, onComplete }: { onSignOut: () => Promise<void>, onComplete: () => void }) => {
  // 5个精密衔接的物理相位
  const [phase, setPhase] = useState<'BLUR' | 'SHRINK' | 'MORPH' | 'EXPAND' | 'DONE'>('BLUR')

  useEffect(() => {
    const runSequence = async () => {
      // 1. BLUR：瞬间覆盖高斯模糊，红圈在屏幕外就绪
      await new Promise(r => setTimeout(r, 50)); 
      
      // 2. SHRINK：红圈向内塌缩，阴影吞噬屏幕变黑
      setPhase('SHRINK');
      await new Promise(r => setTimeout(r, 1200));
      
      // 3. MORPH：红点变成绿色，开始太空失重水滴波动
      setPhase('MORPH');
      // 给一点时间让用户看清水滴动画
      await new Promise(r => setTimeout(r, 800)); 
      
      // 🚀 关键节点：在水滴波动期间，静默执行退出的网络请求！
      // 此时无论后台怎么跳转，前台动画都不会被打断
      try {
        await onSignOut();
      } catch(e) {
        console.error("Sign out sequence error:", e)
      }
      
      // 预留时间让未登录页面在后台渲染完毕
      await new Promise(r => setTimeout(r, 600)); 
      
      // 4. EXPAND：后台准备就绪，绿环向外爆发，拉开黑幕，模糊非线性消散
      setPhase('EXPAND');
      await new Promise(r => setTimeout(r, 1200));
      
      // 5. 动画结束，销毁脱离层
      setPhase('DONE');
      setTimeout(onComplete, 300);
    }
    
    runSequence();
  }, [])

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden pointer-events-none flex items-center justify-center">
      
      {/* 🚀 永驻的低透明度量子噪点，彻底根治色彩断层 */}
      <div 
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay z-[100000] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 🚀 核心全息扫描圈 */}
      <motion.div
        initial="BLUR"
        animate={phase}
        variants={{
          BLUR: {
            width: "300vmax", // 初始极其巨大，在屏幕外
            height: "300vmax",
            borderWidth: "4px",
            borderColor: "rgba(239, 68, 68, 1)", 
            backgroundColor: "rgba(239, 68, 68, 0)", // 内部透明
            boxShadow: "0 0 0 0vmax black", // 阴影还没进来
            backdropFilter: "blur(20px)", // 高斯模糊覆盖全屏
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "50%",
            scale: 1,
          },
          SHRINK: {
            width: "24px",
            height: "24px",
            borderWidth: "12px", // 变成实心小点
            borderColor: "rgba(239, 68, 68, 1)",
            backgroundColor: "rgba(239, 68, 68, 1)",
            // 🚀 核心魔法：使用庞大的黑色阴影填补红圈外的空白！红圈缩到哪，黑色就跟到哪！
            boxShadow: "0 0 0 200vmax black", 
            backdropFilter: "blur(20px)", // 内部依然模糊，但范围仅剩24px
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: "50%",
            scale: 1,
            transition: { type: "spring", stiffness: 100, damping: 20 }
          },
          MORPH: {
            width: "24px",
            height: "24px",
            borderWidth: "12px",
            borderColor: "rgba(16, 185, 129, 1)", // 顶级色彩过度：转为翡翠绿
            backgroundColor: "rgba(16, 185, 129, 1)",
            boxShadow: "0 0 0 200vmax black, 0 0 30px 10px rgba(16, 185, 129, 0.4)", // 绿色光晕
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            // 🚀 行业级失重波动算法矩阵
            borderRadius: ["50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "50%"],
            scale: [1, 1.3, 0.8, 1.2, 1], // 模拟水滴的呼吸脉冲
            transition: {
              backgroundColor: { duration: 0.8 },
              borderColor: { duration: 0.8 },
              borderRadius: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
              scale: { duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
            }
          },
          EXPAND: {
            width: "300vmax", // 猛然向外拉开黑幕
            height: "300vmax",
            borderWidth: "2px",
            borderColor: "rgba(16, 185, 129, 0)", // 绿环非线性消散
            backgroundColor: "rgba(16, 185, 129, 0)",
            boxShadow: "0 0 0 0vmax black, 0 0 0px 0px rgba(16, 185, 129, 0)", // 阴影退去，露出未登录页面
            backdropFilter: "blur(0px)", // 高斯模糊随着绿环拉开而丝滑消散
            WebkitBackdropFilter: "blur(0px)",
            borderRadius: "50%",
            scale: 1,
            transition: { type: "spring", stiffness: 70, damping: 25 }
          },
          DONE: {
            opacity: 0,
            transition: { duration: 0.2 }
          }
        }}
        style={{
          // 🚀 绝对居中锚定，无论任何屏幕尺寸，永远保证是完美圆形
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
        }}
      />

      {/* 🚀 状态文字浮层，配合水滴的变形进行交互 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[100001]">
        <AnimatePresence mode="wait">
          {phase === 'SHRINK' && (
            <motion.div
              key="shrink"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="text-center mt-32"
            >
              <div className="text-red-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                CRITICAL: SYSTEM LOCKDOWN
              </div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4">
                &gt; PURGING DATA
              </div>
            </motion.div>
          )}
          {phase === 'MORPH' && (
            <motion.div
              key="morph"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="text-center mt-32"
            >
              <div className="text-emerald-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                ESTABLISHING SECURE LINK
              </div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4">
                &gt; SAFE MODE READY
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}

export function SignOutButton({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleSignOut = () => {
    if (isExiting) return
    setIsExiting(true)

    // 🚀 创建脱离于 React 路由系统的独立 DOM 容器
    const overlayDiv = document.createElement('div')
    document.body.appendChild(overlayDiv)
    const root = createRoot(overlayDiv)

    // 将动画交由独立 root 渲染
    root.render(
      <StandaloneOverlay 
        onSignOut={onSignOut} 
        onComplete={() => {
          // 动画大功告成后，完美销毁容器，不留一丝痕迹
          root.unmount()
          overlayDiv.remove()
          setIsExiting(false)
        }} 
      />
    )
  }

  return (
    <button 
      onClick={handleSignOut}
      disabled={isExiting}
      className="group flex items-center gap-4 bg-black/25 px-5 py-3 rounded-2xl border border-white/10 backdrop-blur-md hover:border-red-500/40 transition-all duration-500 active:scale-[0.95] disabled:opacity-50 shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]"
    >
      <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/20 group-hover:bg-red-500/10 transition-colors duration-500">
        <div className={`w-3 h-3 rounded-full ${isExiting ? 'bg-zinc-600' : 'bg-red-500 group-hover:animate-pulse'} transition-all duration-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]`} />
        {!isExiting && (
          <div className="absolute inset-0 rounded-full border border-red-500/30 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        )}
      </div>
      <div className="flex flex-col items-start text-left">
        <span className={`text-[10px] uppercase tracking-[0.2em] font-mono transition-colors duration-500 ${isExiting ? 'text-zinc-500' : 'text-zinc-500 group-hover:text-red-400'}`}>
          {isExiting ? "Phase Shifting..." : "Status: Online"}
        </span>
        <span className="text-sm font-bold text-white tracking-widest font-[family-name:var(--font-space)]">
          脱离指挥舱
        </span>
      </div>
    </button>
  )
}