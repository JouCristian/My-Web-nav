// src/components/top-nav-dock.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createRoot } from "react-dom/client"
import { motion, AnimatePresence } from "framer-motion"
import Dock, { DockItemData } from "./dock"

// 🚀 脱离态独立渲染层
const StandaloneOverlay = ({ onSignOut, onComplete }: { onSignOut: () => Promise<void>, onComplete: () => void }) => {
  const [phase, setPhase] = useState<'BLUR' | 'SHRINK' | 'MORPH' | 'EXPAND' | 'DONE'>('BLUR')

  useEffect(() => {
    const runSequence = async () => {
      await new Promise(r => setTimeout(r, 50)); 
      setPhase('SHRINK');
      await new Promise(r => setTimeout(r, 1600)); 
      setPhase('MORPH');
      await new Promise(r => setTimeout(r, 800)); 
      try {
        await onSignOut();
      } catch(e) {
        console.error("Sign out sequence error:", e)
      }
      await new Promise(r => setTimeout(r, 1200)); 
      setPhase('EXPAND');
      await new Promise(r => setTimeout(r, 1800)); 
      setPhase('DONE');
      setTimeout(onComplete, 300);
    }
    runSequence();
  }, [])

  return (
    <div className="fixed inset-0 z-[99999] overflow-hidden pointer-events-none flex items-center justify-center">
      <AnimatePresence>
        {['BLUR', 'SHRINK', 'MORPH'].includes(phase) && (
          <motion.div 
            key="noise-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 mix-blend-overlay z-[100000] pointer-events-none" 
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {['BLUR', 'SHRINK', 'MORPH'].includes(phase) && (
          <motion.div
            key="glass-layer"
            initial={{ opacity: 0, backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)", WebkitBackdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#02040a]/40 z-[99998] pointer-events-none"
          />
        )}
      </AnimatePresence>
      <motion.div
        initial="BLUR"
        animate={phase}
        variants={{
          BLUR: { width: "300vmax", height: "300vmax", borderWidth: "2px", borderColor: "rgba(239, 68, 68, 0)", backgroundColor: "rgba(239, 68, 68, 0)", boxShadow: "0 0 0 0vmax black, 0 0 0px 0px rgba(239, 68, 68, 0)", borderRadius: "50%", scale: 1 },
          SHRINK: { width: "36px", height: "36px", borderWidth: "2px", borderColor: "rgba(239, 68, 68, 0.7)", backgroundColor: "rgba(239, 68, 68, 0.05)", boxShadow: "0 0 0 200vmax black, 0 0 25px 4px rgba(239, 68, 68, 0.6), inset 0 0 12px 2px rgba(239, 68, 68, 0.4)", borderRadius: "50%", scale: 1, transition: { type: "spring", stiffness: 40, damping: 12, mass: 1.2 } },
          MORPH: { width: "36px", height: "36px", borderWidth: "2px", borderColor: "rgba(16, 185, 129, 0.7)", backgroundColor: "rgba(16, 185, 129, 0.05)", boxShadow: "0 0 0 200vmax black, 0 0 25px 4px rgba(16, 185, 129, 0.6), inset 0 0 12px 2px rgba(16, 185, 129, 0.4)", borderRadius: ["50%", "30% 70% 70% 30% / 30% 30% 70% 70%", "70% 30% 30% 70% / 70% 70% 30% 30%", "50%"], scale: [1, 1.25, 0.85, 1.15, 1], transition: { backgroundColor: { duration: 1 }, borderColor: { duration: 1 }, boxShadow: { duration: 1 }, borderRadius: { duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }, scale: { duration: 2.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" } } },
          EXPAND: { width: "300vmax", height: "300vmax", borderWidth: "4px", borderColor: "rgba(16, 185, 129, 0)", backgroundColor: "rgba(16, 185, 129, 0)", boxShadow: "0 0 0 200vmax black, 0 0 0px 0px rgba(16, 185, 129, 0)", borderRadius: "50%", scale: 1, transition: { type: "spring", stiffness: 45, damping: 14, mass: 1 } },
          DONE: { opacity: 0, transition: { duration: 0.2 } }
        }}
        style={{ position: "absolute", top: "50%", left: "50%", x: "-50%", y: "-50%", zIndex: 100001 }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[100002]">
        <AnimatePresence mode="wait">
          {phase === 'SHRINK' && (
            <motion.div key="shrink" initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} transition={{ duration: 0.8 }} className="text-center mt-36">
              <div className="text-red-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">CRITICAL: SYSTEM LOCKDOWN</div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">&gt; PURGING DATA</div>
            </motion.div>
          )}
          {phase === 'MORPH' && (
            <motion.div key="morph" initial={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }} transition={{ duration: 0.8 }} className="text-center mt-36">
              <div className="text-emerald-500 font-mono text-xs tracking-[0.5em] animate-pulse drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">ESTABLISHING SECURE LINK</div>
              <div className="text-white font-bold text-3xl tracking-[0.2em] font-[family-name:var(--font-space)] mt-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">&gt; SAFE MODE READY</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export function TopNavDock({ session, dbUser, isCaptain, onSignOut }: any) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const handleSignOutWithAnimation = () => {
    if (isExiting) return;
    setIsExiting(true);

    const overlayDiv = document.createElement('div');
    document.body.appendChild(overlayDiv);
    const root = createRoot(overlayDiv);

    root.render(
      <StandaloneOverlay 
        onSignOut={onSignOut} 
        onComplete={() => {
          root.unmount();
          overlayDiv.remove();
          setIsExiting(false);
        }} 
      />
    );
  };

  const isAuthorized = isCaptain || (dbUser && (dbUser.role === "ADMIN" || dbUser.role === "OWNER" || dbUser.role === "MEMBER"));

  // 头像渲染逻辑
  const avatarImage = dbUser?.customAvatar || session?.user?.image;

  const items: DockItemData[] = [
    {
      label: '星际导航站',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
      onClick: () => router.push('/')
    },
    ...(isAuthorized ? [{
      label: '舰队中枢',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
      onClick: () => router.push('/dashboard')
    }] : []),
    ...(!isCaptain ? [{
      label: '联系舰长',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>,
      onClick: () => router.push('/contact')
    }] : []),
    {
      label: 'JouCristian',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>,
      onClick: () => window.open("https://github.com/JouCristian", "_blank", "noopener,noreferrer")
    },
    {
      label: '一生一芯',
      icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>,
      onClick: () => window.open("https://ysyx.oscc.cc", "_blank", "noopener,noreferrer")
    },
    ...(session ? [
      {
        label: '宇航员档案',
        icon: avatarImage 
          ? <img src={avatarImage} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> 
          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
        onClick: () => router.push('/profile')
      },
      {
        label: '脱离指挥舱',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
        onClick: handleSignOutWithAnimation,
        className: 'hover:!bg-red-500/20 hover:!border-red-500/50 hover:!text-red-400 hover:!shadow-[0_0_15px_rgba(239,68,68,0.5)]'
      }
    ] : [
      {
        label: '授权登入',
        icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
        onClick: () => router.push('/login'),
        className: 'hover:!bg-blue-500/20 hover:!border-blue-500/50 hover:!text-blue-400 hover:!shadow-[0_0_15px_rgba(59,130,246,0.5)]'
      }
    ])
  ];

  /* 🚀 极其关键：通过 className 强制清除 Dock 自身可能的背景色和边框，把底色交给液态玻璃 */
  return <Dock items={items} className="!bg-transparent !border-none !shadow-none" />;
}