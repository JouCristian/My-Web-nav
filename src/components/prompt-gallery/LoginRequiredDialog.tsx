"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"

// 与项目内 confirm-dialog / admin-auth-modal 完全一致的弹窗动画
const uiSpring = { type: "spring" as const, stiffness: 350, damping: 25 }

interface LoginRequiredDialogProps {
  open: boolean
  onClose: () => void
}

export function LoginRequiredDialog({ open, onClose }: LoginRequiredDialogProps) {
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) onClose()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  const goToLogin = () => {
    onClose()
    router.push("/login")
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景高斯模糊（与现有弹窗一致） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
            transition={uiSpring}
            className="relative z-10 w-full max-w-md"
          >
            <div
              className="login-required-breathe relative flex w-full flex-col overflow-hidden rounded-2xl bg-[#060813]/95 p-5 sm:rounded-3xl sm:p-8"
              style={
                {
                  "--dialog-glow": "rgba(234, 179, 8, 0.2)",
                  "--dialog-shadow": "rgba(234, 179, 8, 0.4)",
                  "--dialog-border": "rgba(234, 179, 8, 0.5)",
                } as React.CSSProperties
              }
            >
              {/* 网格背景 */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative z-10 mb-4 flex items-center gap-3">
                <div className="h-2.5 w-2.5 shrink-0 animate-pulse rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.8)]" />
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">Login Required</span>
              </div>

              <div className="relative z-10 mb-4 flex items-center gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/[0.08]">
                  <Star className="h-5 w-5 fill-amber-300 text-amber-300" />
                </span>
                <h2 className="font-[family-name:var(--font-space)] text-xl font-bold tracking-[0.05em] text-white sm:text-2xl">
                  需要登录后才能收藏
                </h2>
              </div>

              <p className="relative z-10 mb-6 text-sm leading-relaxed text-zinc-400 sm:text-base">
                收藏夹与你的账号绑定。请先登录，登录后即可把喜欢的提示词收进「我的收藏」，随时回来查看。
              </p>

              <div className="relative z-10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-white transition-all hover:bg-white/10 active:scale-95 sm:px-6 sm:py-3"
                >
                  稍后再说
                </button>
                <button
                  type="button"
                  onClick={goToLogin}
                  className="rounded-xl border border-yellow-500/30 bg-yellow-500/20 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.1em] text-yellow-300 transition-all hover:bg-yellow-500/30 active:scale-95 sm:px-6 sm:py-3"
                >
                  前往登录
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )

  if (!isMounted) return null

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes login-required-breathe {
          0%, 100% { box-shadow: 0 0 40px var(--dialog-glow), inset 0 0 15px var(--dialog-glow); border-color: rgba(255,255,255,0.1); }
          50% { box-shadow: 0 0 70px var(--dialog-shadow), inset 0 0 25px var(--dialog-glow); border-color: var(--dialog-border); }
        }
        .login-required-breathe {
          border: 1px solid rgba(255,255,255,0.1);
          animation: login-required-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `,
        }}
      />
      {createPortal(modalContent, document.body)}
    </>
  )
}
