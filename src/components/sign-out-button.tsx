// src/components/sign-out-button.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createRoot } from "react-dom/client"

// 🚀 脱离态独立渲染层
const StandaloneOverlay = ({ onSignOut, onComplete }: { onSignOut: () => Promise<void>, onComplete: () => void }) => {
  const [phase, setPhase] = useState<'BLUR' | 'SHRINK' | 'MORPH' | 'EXPAND' | 'DONE'>('BLUR')

  useEffect(() => {
    const runSequence = async () => {
      // 1. BLUR阶段：准备就绪
      await new Promise(r => setTimeout(r, 50)); 
      
      // 2. SHRINK阶段：弹簧蓄力塌缩
      setPhase('SHRINK');
      // 延长等待时间，让用户充分享受“弹簧被缓缓压紧”的非线性丝滑感
      await new Promise(r => setTimeout(r, 1800)); 
      
      // 3. MORPH阶段：红绿幻化，太空水滴失重波动
      setPhase('MORPH');
      await new Promise(r => setTimeout(r, 1000)); 
      
      // 🚀 静默执行退出，后台页面开始重载
      try {
        await onSignOut();
      } catch(e) {
        console.error("Sign out sequence error:", e)
      }
      
      // 留出时间给后台渲染新页面，同时前台水滴继续波动
      await new Promise(r => setTimeout(r, 1000)); 
      
      // 4. EXPAND阶段：弹簧释放，绿环爆发，黑幕推开
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
      
      {/* 🚀 量子噪点层：防断层 */}
      <div 
        className="absolute inset-0 opacity-[0.12] mix-blend-overlay z-[100000] pointer-events-none" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      />

      {/* 🚀 核心修复：将磨砂玻璃层独立出来！
          它只负责覆盖全屏的模糊，并通过 opacity 进行平滑消散，彻底根治 GPU 的硬切断层 BUG */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          opacity: phase === 'BLUR' || phase === 'SHRINK' || phase === 'MORPH' ? 1 : 0
        }}
        // 配合绿环扩张，进行长达 1.5 秒的幽灵般消散
        transition={{ duration: phase === 'EXPAND' ? 1.5 : 0.8, ease: "easeInOut" }}
        className="absolute inset-0 backdrop-blur-[20px] bg-[#02040a]/40 z-[99999]"
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
            // 稍大一点(40px)让水滴的动态更清晰
            width: "40px", height: "40px", 
            borderWidth: "2px", 
            borderColor: "rgba(239, 68, 68, 0.9)", // 高亮激光边
            backgroundColor: "rgba(239, 68, 68, 0.15)", // 虚幻通透的内芯
            // 黑色阴影吞噬背景，同时加上内外红光晕
            boxShadow: "0 0 0 200vmax black, 0 0 20px 2px rgba(239, 68, 68, 0.8), inset 0 0 10px 2px rgba(239, 68, 68, 0.5)", 
            borderRadius: "50%",
            scale: 1,
            // 🚀 弹簧被缓缓压紧的非线性动画
            transition: { type: "spring", stiffness: 45, damping: 12 } 
          },
          MORPH: {
            width: "40px", height: "40px",
            borderWidth: "2px",
            borderColor: "rgba(16, 185, 129, 0.9)", // 转换为翡翠绿激光边
            backgroundColor: "rgba(16, 185, 129, 0.15)", // 绿色通透内芯
            boxShadow: "0 0 0 200vmax black, 0 0 20px 2px rgba(16, 185, 129, 0.8), inset 0 0 10px 2px rgba(16, 185, 129, 0.5)", 
            // 太空水滴失重波动计算矩阵
            borderRadius: ["50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "50%"],
            scale: [1, 1.25, 0.85, 1.15, 1], // 水滴的呼吸脉冲感
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
            borderColor: "rgba(16, 185, 129, 0)", // 绿环飞出时非线性消散
            backgroundColor: "rgba(16, 185, 129, 0)",
            boxShadow: "0 0 0 0vmax black, 0 0 0px 0px rgba(16, 185, 129, 0)", // 黑幕被强力推走
            borderRadius: "50%",
            scale: 1,
            // 🚀 弹簧释放爆发的非线性动画 (阻尼略大，确保尾段优雅)
            transition: { type: "spring", stiffness: 35, damping: 15 } 
          },
          DONE: {
            opacity: 0,
            transition: { duration: 0.2 }
          }
        }}
        style={{
          // 绝对居中锚定，永远是完美的圆
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
              <div className="text-red-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                CRITICAL: SYSTEM LOCKDOWN
              </div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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
              <div className="text-emerald-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]">
                ESTABLISHING SECURE LINK
              </div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
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