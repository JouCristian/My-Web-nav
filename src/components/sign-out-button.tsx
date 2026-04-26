// src/components/sign-out-button.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createRoot } from "react-dom/client"

// 🚀 核心黑魔法：脱离当前页面的独立动画遮罩层
const StandaloneOverlay = ({ onSignOut, onComplete }: { onSignOut: () => Promise<void>, onComplete: () => void }) => {
  const [phase, setPhase] = useState<'BLUR' | 'SHRINK' | 'MORPH' | 'EXPAND' | 'DONE'>('BLUR')

  useEffect(() => {
    const runSequence = async () => {
      // 1. BLUR阶段：瞬间启动
      await new Promise(r => setTimeout(r, 50)); 
      
      // 2. SHRINK阶段：红环非线性弹簧蓄力塌缩
      setPhase('SHRINK');
      // 给足时间，享受“弹簧被缓缓压至极限”的物理视觉
      await new Promise(r => setTimeout(r, 1600)); 
      
      // 3. MORPH阶段：幻化为全息绿色，水滴失重波动
      setPhase('MORPH');
      await new Promise(r => setTimeout(r, 800)); 
      
      // 🚀 静默执行退出，后台页面开始重载为未登录状态
      try {
        await onSignOut();
      } catch(e) {
        console.error("Sign out sequence error:", e)
      }
      
      // 留出时间给后台渲染新页面，同时前台绿水滴继续波动
      await new Promise(r => setTimeout(r, 1200)); 
      
      // 4. EXPAND阶段：弹簧释放，绿环爆发推开黑幕，模糊同步消散
      setPhase('EXPAND');
      // 等待扩张动画与模糊消散动画彻底完成
      await new Promise(r => setTimeout(r, 1800)); 
      
      // 5. 销毁前台脱离层
      setPhase('DONE');
      setTimeout(onComplete, 300);
    }
    
    runSequence();
  }, [])

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden pointer-events-none flex items-center justify-center">
      
      {/* 🚀 量子噪点层：永驻底层，打破纯色背景的渲染断层 */}
      <div 
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay z-[100000] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 🚀 独立磨砂玻璃层：精准消除断层 BUG
          通过强制同步 animate backdropFilter，确保在任何浏览器下都能丝滑消散到 0px */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
        animate={{
          opacity: (phase === 'EXPAND' || phase === 'DONE') ? 0 : 1,
          backdropFilter: (phase === 'EXPAND' || phase === 'DONE') ? "blur(0px)" : "blur(20px)",
          WebkitBackdropFilter: (phase === 'EXPAND' || phase === 'DONE') ? "blur(0px)" : "blur(20px)",
        }}
        transition={
          phase === 'EXPAND' 
            ? { type: "spring", stiffness: 45, damping: 14, mass: 1 } // 🚀 完美绑定绿环的弹簧参数
            : { duration: 0.8 }
        }
        className="absolute inset-0 bg-[#02040a]/20 z-[99998]"
      />

      {/* 🚀 核心物理渲染圈 (全息激光水滴) */}
      <motion.div
        initial="BLUR"
        animate={phase}
        variants={{
          BLUR: {
            width: "300vmax", height: "300vmax",
            borderWidth: "2px", borderColor: "rgba(239, 68, 68, 0)", 
            backgroundColor: "rgba(239, 68, 68, 0)",
            boxShadow: "0 0 0 0vmax black, 0 0 0px 0px rgba(239, 68, 68, 0)", 
            borderRadius: "50%",
            scale: 1,
          },
          SHRINK: {
            width: "36px", height: "36px", 
            borderWidth: "2px", 
            // 🚀 虚幻质感：边缘高亮，内心几乎透明，强烈的内外红光晕
            borderColor: "rgba(239, 68, 68, 0.7)", 
            backgroundColor: "rgba(239, 68, 68, 0.05)", 
            boxShadow: "0 0 0 200vmax black, 0 0 25px 4px rgba(239, 68, 68, 0.6), inset 0 0 12px 2px rgba(239, 68, 68, 0.4)", 
            borderRadius: "50%",
            scale: 1,
            // 🚀 弹簧蓄力感：低劲度，强阻尼，模拟被渐渐压紧的迟缓感
            transition: { type: "spring", stiffness: 40, damping: 12, mass: 1.2 } 
          },
          MORPH: {
            width: "36px", height: "36px",
            borderWidth: "2px",
            // 🚀 虚幻质感：转化为翡翠绿激光光晕
            borderColor: "rgba(16, 185, 129, 0.7)", 
            backgroundColor: "rgba(16, 185, 129, 0.05)", 
            boxShadow: "0 0 0 200vmax black, 0 0 25px 4px rgba(16, 185, 129, 0.6), inset 0 0 12px 2px rgba(16, 185, 129, 0.4)", 
            // 🚀 行业级失重波动矩阵
            borderRadius: ["50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "50%"],
            scale: [1, 1.25, 0.85, 1.15, 1], // 配合形变产生呼吸脉冲
            transition: {
              backgroundColor: { duration: 1 },
              borderColor: { duration: 1 },
              boxShadow: { duration: 1 },
              borderRadius: { duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" },
              scale: { duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
            }
          },
          EXPAND: {
            width: "300vmax", height: "300vmax",
            borderWidth: "4px",
            borderColor: "rgba(16, 185, 129, 0)", // 边缘光圈消散
            backgroundColor: "rgba(16, 185, 129, 0)",
            // 🚀 随着元素变大到 300vmax，外围的黑色阴影被物理推挤出屏幕
            boxShadow: "0 0 0 200vmax black, 0 0 0px 0px rgba(16, 185, 129, 0)", 
            borderRadius: "50%",
            scale: 1,
            // 🚀 弹簧释放感：高劲度，提供爆发的舒展感，并在末端伴随舒适回弹
            transition: { type: "spring", stiffness: 45, damping: 14, mass: 1 } 
          },
          DONE: {
            opacity: 0,
            transition: { duration: 0.2 }
          }
        }}
        style={{
          // 绝对居中，保证各种比例屏幕下都是完美圆圈
          position: "absolute",
          top: "50%",
          left: "50%",
          x: "-50%",
          y: "-50%",
          zIndex: 100001
        }}
      />

      {/* 🚀 状态文字浮层 */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[100002]">
        <AnimatePresence mode="wait">
          {phase === 'SHRINK' && (
            <motion.div
              key="shrink"
              initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 0.8 }}
              className="text-center mt-36"
            >
              <div className="text-red-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                CRITICAL: SYSTEM LOCKDOWN
              </div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
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
              className="text-center mt-36"
            >
              <div className="text-emerald-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
                ESTABLISHING SECURE LINK
              </div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
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

    // 创建脱离于 React 路由系统的独立 DOM 容器
    const overlayDiv = document.createElement('div')
    document.body.appendChild(overlayDiv)
    const root = createRoot(overlayDiv)

    root.render(
      <StandaloneOverlay 
        onSignOut={onSignOut} 
        onComplete={() => {
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