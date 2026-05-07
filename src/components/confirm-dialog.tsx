"use client"

import { useState, useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"

const uiSpring = { type: "spring" as const, stiffness: 350, damping: 25 }

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "确认",
  cancelText = "取消",
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => { setIsMounted(true) }, [])

  // ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isLoading])

  const variantStyles = {
    danger: {
      glow: 'rgba(239, 68, 68, 0.2)',
      shadow: 'rgba(239, 68, 68, 0.4)',
      border: 'rgba(239, 68, 68, 0.5)',
      dotColor: 'bg-red-500',
      dotShadow: 'shadow-[0_0_15px_rgba(239,68,68,0.8)]',
      labelColor: 'text-red-500',
      buttonBg: 'bg-red-500/20 hover:bg-red-500/30 border-red-500/30',
      buttonText: 'text-red-400',
    },
    warning: {
      glow: 'rgba(234, 179, 8, 0.2)',
      shadow: 'rgba(234, 179, 8, 0.4)',
      border: 'rgba(234, 179, 8, 0.5)',
      dotColor: 'bg-yellow-500',
      dotShadow: 'shadow-[0_0_15px_rgba(234,179,8,0.8)]',
      labelColor: 'text-yellow-500',
      buttonBg: 'bg-yellow-500/20 hover:bg-yellow-500/30 border-yellow-500/30',
      buttonText: 'text-yellow-400',
    },
    info: {
      glow: 'rgba(59, 130, 246, 0.2)',
      shadow: 'rgba(59, 130, 246, 0.4)',
      border: 'rgba(59, 130, 246, 0.5)',
      dotColor: 'bg-blue-500',
      dotShadow: 'shadow-[0_0_15px_rgba(59,130,246,0.8)]',
      labelColor: 'text-blue-500',
      buttonBg: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30',
      buttonText: 'text-blue-400',
    },
  }

  const styles = variantStyles[variant]

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* 背景模糊 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#02040a]/60 backdrop-blur-[15px]"
            onClick={() => !isLoading && onClose()}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(10px)" }}
            transition={uiSpring}
            className="relative w-full max-w-md z-10"
          >
            <div 
              className="confirm-dialog-breathe w-full rounded-2xl sm:rounded-3xl bg-[#060813]/95 p-5 sm:p-8 flex flex-col relative overflow-hidden"
              style={{ 
                '--dialog-glow': styles.glow, 
                '--dialog-shadow': styles.shadow, 
                '--dialog-border': styles.border 
              } as React.CSSProperties}
            >
              {/* 网格背景 */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
                backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', 
                backgroundSize: '20px 20px' 
              }} />

              {/* 标题栏 */}
              <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className={`w-2.5 h-2.5 rounded-full ${styles.dotColor} animate-pulse ${styles.dotShadow} shrink-0`} />
                <span className={`text-xs font-mono font-bold tracking-[0.2em] uppercase ${styles.labelColor}`}>
                  {variant === 'danger' ? 'Warning' : variant === 'warning' ? 'Caution' : 'Info'}
                </span>
              </div>

              {/* 标题 */}
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-[0.05em] font-[family-name:var(--font-space)] mb-3 relative z-10">
                {title}
              </h2>

              {/* 消息内容 */}
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-6 relative z-10">
                {message}
              </p>

              {/* 按钮组 */}
              <div className="flex items-center justify-end gap-3 relative z-10">
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold tracking-[0.1em] uppercase text-xs hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl border ${styles.buttonBg} ${styles.buttonText} font-bold tracking-[0.1em] uppercase text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                >
                  {isLoading && (
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {confirmText}
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
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confirm-dialog-breathe { 
          0%, 100% { box-shadow: 0 0 40px var(--dialog-glow), inset 0 0 15px var(--dialog-glow); border-color: rgba(255,255,255,0.1); } 
          50% { box-shadow: 0 0 70px var(--dialog-shadow), inset 0 0 25px var(--dialog-glow); border-color: var(--dialog-border); } 
        }
        .confirm-dialog-breathe { 
          border: 1px solid rgba(255,255,255,0.1); 
          animation: confirm-dialog-breathe 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; 
        }
      `}} />
      {createPortal(modalContent, document.body)}
    </>
  )
}

// Hook 用于简化使用
export function useConfirmDialog() {
  const [state, setState] = useState<{
    isOpen: boolean
    title: string
    message: string
    variant: 'danger' | 'warning' | 'info'
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    resolve: null
  })

  const confirm = useCallback((options: {
    title: string
    message: string
    variant?: 'danger' | 'warning' | 'info'
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: options.title,
        message: options.message,
        variant: options.variant || 'danger',
        resolve
      })
    })
  }, [])

  const handleClose = useCallback(() => {
    state.resolve?.(false)
    setState(prev => ({ ...prev, isOpen: false, resolve: null }))
  }, [state.resolve])

  const handleConfirm = useCallback(() => {
    state.resolve?.(true)
    setState(prev => ({ ...prev, isOpen: false, resolve: null }))
  }, [state.resolve])

  const DialogComponent = (
    <ConfirmDialog
      isOpen={state.isOpen}
      onClose={handleClose}
      onConfirm={handleConfirm}
      title={state.title}
      message={state.message}
      variant={state.variant}
    />
  )

  return { confirm, DialogComponent }
}
