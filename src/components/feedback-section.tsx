'use client'

import { useState, useTransition, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import GlassSurface from './GlassSurface'
import { submitFeedback, submitFeedbackReply, deleteFeedback, deleteFeedbackReply, updateFeedbackStatus } from '@/app/actions/feedback'
import { OptimizedAvatar } from './optimized-image'
import { useConfirmDialog } from './confirm-dialog'

// 滚动条样式
const scrollbarStyles = `
  .feedback-scrollbar {
    overflow-y: scroll;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    transition: scrollbar-color 0.3s ease;
  }
  .feedback-scrollbar:hover {
    scrollbar-color: rgba(6, 182, 212, 0.15) transparent;
  }
  .feedback-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .feedback-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .feedback-scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
    transition: background 0.3s ease;
  }
  .feedback-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(6, 182, 212, 0.15);
  }
  .feedback-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(6, 182, 212, 0.25);
  }
  
  .feedback-glass-item {
    width: 100% !important;
    transition: all 0.45s cubic-bezier(0.32, 0.72, 0, 1) !important;
    contain: layout style;
  }
  .feedback-glass-item .glass-surface__content {
    align-items: stretch !important;
    justify-content: flex-start !important;
    width: 100% !important;
  }
`

interface FeedbackReply {
  id: string
  content: string
  authorId: string
  authorName: string | null
  authorImage: string | null
  authorRole: string | null
  createdAt: Date
}

interface Feedback {
  id: string
  type: 'BUG' | 'DESIGN' | 'FEATURE'
  title: string
  content: string
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED'
  authorId: string
  authorName: string | null
  authorImage: string | null
  createdAt: Date
  replies: FeedbackReply[]
}

// 动画配置
const smoothBezier = [0.32, 0.72, 0, 1]
const silkyBezier = [0.23, 1, 0.32, 1]
const gentleElastic = [0.68, -0.55, 0.265, 1.55]

const arrowTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 20,
  mass: 0.8
}

// 折叠面板组件
function CollapsePanel({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 头像组件
function Avatar({ src, name, size = 'md', userId }: { src?: string | null; name?: string | null; size?: 'sm' | 'md'; userId?: string }) {
  const avatar = (
    <OptimizedAvatar 
      src={src} 
      alt={name || '用户头像'} 
      size={size}
      fallbackText={name || undefined}
      className="border border-white/10"
    />
  )
  
  if (userId) {
    return (
      <Link 
        href={`/profile/${userId}`} 
        className="shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        onClick={(e) => e.stopPropagation()}
      >
        {avatar}
      </Link>
    )
  }
  
  return avatar
}

// 类型标签配置
const typeConfig = {
  BUG: { label: 'BUG', color: 'bg-red-500/20 border-red-500/40 text-red-400', icon: '🐛' },
  DESIGN: { label: '设计建议', color: 'bg-violet-500/20 border-violet-500/40 text-violet-400', icon: '🎨' },
  FEATURE: { label: '功能建议', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400', icon: '💡' }
}

// 状态标签配置
const statusConfig = {
  PENDING: { label: '待处理', color: 'bg-zinc-500/20 border-zinc-500/40 text-zinc-400' },
  REVIEWING: { label: '处理中', color: 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' },
  RESOLVED: { label: '已解决', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' },
  REJECTED: { label: '已关闭', color: 'bg-red-500/20 border-red-500/40 text-red-400' }
}

// 单个反馈项组件
function FeedbackItem({ 
  feedback, 
  isLoggedIn, 
  isAdmin, 
  currentUserId 
}: { 
  feedback: Feedback
  isLoggedIn: boolean
  isAdmin: boolean
  currentUserId?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const { confirm, DialogComponent } = useConfirmDialog()
  const scrollPositionRef = useRef<number>(0)
  const statusButtonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  const STATUS_OPTIONS = [
    { value: 'PENDING',   label: '待处理', color: 'text-zinc-400',  bg: 'bg-zinc-500/10',  border: 'border-zinc-500/30',  dot: 'bg-zinc-400'  },
    { value: 'REVIEWING', label: '处理中', color: 'text-cyan-400',  bg: 'bg-cyan-500/10',  border: 'border-cyan-500/30',  dot: 'bg-cyan-400'  },
    { value: 'RESOLVED',  label: '已解决', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
    { value: 'REJECTED',  label: '已关闭', color: 'text-red-400',   bg: 'bg-red-500/10',   border: 'border-red-500/30',   dot: 'bg-red-400'   },
  ]
  const currentStatus = STATUS_OPTIONS.find(s => s.value === feedback.status) ?? STATUS_OPTIONS[0]

  const canDelete = isAdmin || feedback.authorId === currentUserId

  const handleSubmitReply = () => {
    if (!replyContent.trim()) return
    scrollPositionRef.current = window.scrollY
    startTransition(async () => {
      await submitFeedbackReply(feedback.id, replyContent)
      setReplyContent('')
      setIsReplying(false)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      })
    })
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: '删除反馈',
      message: '确定要删除这条反馈吗？所有回复也会被删除。',
      variant: 'danger'
    })
    if (!confirmed) return
    scrollPositionRef.current = window.scrollY
    startTransition(async () => {
      await deleteFeedback(feedback.id)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      })
    })
  }

  const handleDeleteReply = async (replyId: string) => {
    const confirmed = await confirm({
      title: '删除回复',
      message: '确定要删除这条回复吗？',
      variant: 'danger'
    })
    if (!confirmed) return
    scrollPositionRef.current = window.scrollY
    startTransition(async () => {
      await deleteFeedbackReply(replyId)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      })
    })
  }

  const handleStatusChange = (status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED') => {
    scrollPositionRef.current = window.scrollY
    startTransition(async () => {
      await updateFeedbackStatus(feedback.id, status)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      })
    })
  }

  const type = typeConfig[feedback.type]
  const status = statusConfig[feedback.status]

  return (
    <>
      {DialogComponent}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="relative w-full"
      >
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={20}
          brightness={110}
          opacity={0.25}
          blur={15}
          displace={1}
          mixBlendMode="normal"
          backgroundOpacity={0.08}
          className="feedback-glass-item"
        >
          <div className="p-4 sm:p-5 w-full">
            {/* 头部 */}
            <div 
              className="flex items-start justify-between gap-3 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <Avatar src={feedback.authorImage} name={feedback.authorName} userId={feedback.authorId} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-zinc-100 text-sm">{feedback.authorName || '匿名用户'}</span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${type.color}`}>
                      {type.icon} {type.label}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {new Date(feedback.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-medium text-zinc-200 line-clamp-1">{feedback.title}</h4>
                  <p className="mt-1 text-sm text-zinc-400 line-clamp-2">{feedback.content}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                {feedback.replies.length > 0 && (
                  <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                    {feedback.replies.length} 回复
                  </span>
                )}
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={arrowTransition}
                  className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-zinc-400"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
            </div>

            {/* 展开内容 */}
            <CollapsePanel isOpen={isExpanded}>
              <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
                {/* 完整内容 */}
                <div className="p-3 bg-white/5 rounded-xl text-sm text-zinc-300 whitespace-pre-wrap">
                  {feedback.content}
                </div>

                {/* 回复列表 */}
                {feedback.replies.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2 border-cyan-500/30">
                    {feedback.replies.map(reply => (
                      <div key={reply.id} className="flex items-start gap-3 group">
                        <Avatar src={reply.authorImage} name={reply.authorName} size="sm" userId={reply.authorId} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-200 text-sm">{reply.authorName}</span>
                            {reply.authorRole && (
                              <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                                {reply.authorRole}
                              </span>
                            )}
                            <span className="text-xs text-zinc-500">
                              {new Date(reply.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteReply(reply.id)}
                                className="opacity-0 group-hover:opacity-100 ml-auto p-1 text-zinc-500 hover:text-red-400 transition-all"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-zinc-400">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex items-center gap-2 flex-wrap">
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => setIsReplying(!isReplying)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        回复
                      </button>

                      {/* 状态切换 - 自定义下拉 */}
                      <div className="relative">
                        <button
                          ref={statusButtonRef}
                          onClick={(e) => { 
                            e.stopPropagation()
                            if (statusButtonRef.current) {
                              const rect = statusButtonRef.current.getBoundingClientRect()
                              setDropdownPos({ top: rect.bottom + 6, left: rect.left })
                            }
                            setIsStatusOpen(v => !v) 
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors duration-200 ${currentStatus.bg} ${currentStatus.border} ${currentStatus.color} hover:brightness-125`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentStatus.dot}`} />
                          {currentStatus.label}
                          <motion.svg
                            animate={{ rotate: isStatusOpen ? 180 : 0 }}
                            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                            className="w-3 h-3 opacity-70"
                            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </motion.svg>
                        </button>

                        <AnimatePresence>
                          {isStatusOpen && (
                            <>
                              {/* 点击外部关闭 */}
                              <div className="fixed inset-0 z-[9998]" onClick={() => setIsStatusOpen(false)} />
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                                style={{ 
                                  position: 'fixed',
                                  top: dropdownPos.top,
                                  left: dropdownPos.left,
                                  transformOrigin: 'top left'
                                }}
                                className="z-[9999] min-w-[130px] rounded-xl border border-white/10 bg-[#0d1117]/98 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden"
                              >
                                {STATUS_OPTIONS.map((opt, i) => (
                                  <motion.button
                                    key={opt.value}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.06, ease: [0.32, 0.72, 0, 1] }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleStatusChange(opt.value as any)
                                      setIsStatusOpen(false)
                                    }}
                                    className={`w-full flex items-center gap-2.5 px-4 py-3 text-xs font-medium transition-all duration-200 ${
                                      feedback.status === opt.value 
                                        ? `${opt.bg} ${opt.color}` 
                                        : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot} ${feedback.status === opt.value ? 'ring-2 ring-offset-1 ring-offset-transparent ring-current/30' : ''}`} />
                                    {opt.label}
                                    {feedback.status === opt.value && (
                                      <motion.svg 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.25, delay: 0.1 }}
                                        className={`w-3.5 h-3.5 ml-auto ${opt.color}`} 
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </motion.svg>
                                    )}
                                  </motion.button>
                                ))}
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                  
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      删除
                    </button>
                  )}
                </div>

                {/* 回复输入框 */}
                <AnimatePresence>
                  {isReplying && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="输入回复内容..."
                          className="flex-1 p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                          rows={2}
                        />
                        <button
                          onClick={handleSubmitReply}
                          disabled={isPending || !replyContent.trim()}
                          className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 rounded-xl font-medium text-sm hover:bg-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          发送
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CollapsePanel>
          </div>
        </GlassSurface>
      </motion.div>
    </>
  )
}

// 主组件
export function FeedbackSection({
  feedbacks,
  isLoggedIn,
  isAdmin,
  currentUserId,
  className = ''
}: {
  feedbacks: Feedback[]
  isLoggedIn: boolean
  isAdmin: boolean
  currentUserId?: string
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'BUG' | 'DESIGN' | 'FEATURE'>('BUG')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const scrollPositionRef = useRef<number>(0)

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return
    scrollPositionRef.current = window.scrollY
    startTransition(async () => {
      await submitFeedback(feedbackType, title, content)
      setTitle('')
      setContent('')
      setIsSubmitting(false)
      requestAnimationFrame(() => {
        window.scrollTo({ top: scrollPositionRef.current, behavior: 'instant' })
      })
    })
  }

  return (
    <section className={`relative ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
      {/* 区块标题 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <h2 className="text-xs font-mono tracking-[0.3em] text-zinc-400 uppercase">
            Feedback Hub
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* 主容器 */}
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={24}
        brightness={120}
        opacity={0.4}
        blur={20}
        displace={1.2}
        mixBlendMode="normal"
        backgroundOpacity={0.1}
        className="feedback-glass-item"
      >
        <div className="p-5 sm:p-6 w-full">
          {/* 折叠头部 */}
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center"
                whileHover={{ 
                  scale: 1.08, 
                  rotate: [0, -8, 8, -4, 0],
                  borderColor: 'rgba(6, 182, 212, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.4 }}
              >
                  <motion.svg
                    className="w-6 h-6"
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={2}
                  >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </motion.svg>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 tracking-wide">
                  BUG反馈 & 设计建议
                </h3>
                <p className="text-sm text-zinc-500">
                  发现问题或有好点子？告诉我们，一起让系统更好
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="hidden sm:block px-3 py-1 text-xs font-medium rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                {feedbacks.length} 条反馈
              </span>
              <motion.div
                animate={{ 
                  rotate: isExpanded ? 180 : 0,
                  backgroundColor: isExpanded ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)'
                }}
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.95 }}
                transition={arrowTransition}
                className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-zinc-100 transition-colors duration-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* 展开内容 */}
          <CollapsePanel isOpen={isExpanded}>
            <div className="pt-6 mt-6 border-t border-white/5">
              {/* 提��按钮 */}
              {isLoggedIn ? (
                <div className="mb-6">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsSubmitting(!isSubmitting)
                    }}
                    className={`
                      relative w-full p-4 flex items-center justify-center gap-3 
                      rounded-2xl font-medium overflow-hidden
                      transition-all duration-500 ease-out
                      ${isSubmitting 
                        ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-300' 
                        : 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 text-cyan-400 hover:from-cyan-500/15 hover:to-blue-500/15 hover:border-cyan-500/35'
                      }
                      group
                    `}
                  >
                    <span className="absolute inset-0 overflow-hidden rounded-2xl">
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </span>
                    
                    <motion.div
                      animate={{ rotate: isSubmitting ? 45 : 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </motion.div>
                    <span className="relative z-10">提交反馈</span>
                  </button>

                  {/* 提交表单 */}
                  <AnimatePresence>
                    {isSubmitting && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                          {/* 类型选择 */}
                          <div className="flex gap-2">
                            {(['BUG', 'DESIGN', 'FEATURE'] as const).map(type => (
                              <button
                                key={type}
                                onClick={() => setFeedbackType(type)}
                                className={`flex-1 py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                                  feedbackType === type
                                    ? typeConfig[type].color
                                    : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'
                                }`}
                              >
                                {typeConfig[type].icon} {typeConfig[type].label}
                              </button>
                            ))}
                          </div>
                          
                          {/* 标题 */}
                          <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="简短描述问题或建议..."
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50"
                          />
                          
                          {/* 内容 */}
                          <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="详细描述..."
                            rows={4}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none"
                          />
                          
                          {/* 提交按钮 */}
                          <button
                            onClick={handleSubmit}
                            disabled={isPending || !title.trim() || !content.trim()}
                            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                          >
                            {isPending ? '提交中...' : '提交反馈'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="mb-6 p-4 flex items-center justify-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-zinc-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  登录后可以提交反馈
                </div>
              )}

              {/* 反馈列表 */}
              <div className="space-y-4 max-h-[500px] overflow-y-auto feedback-scrollbar pr-2">
                <AnimatePresence>
                  {feedbacks.length > 0 ? (
                    feedbacks.map(feedback => (
                      <FeedbackItem
                        key={feedback.id}
                        feedback={feedback}
                        isLoggedIn={isLoggedIn}
                        isAdmin={isAdmin}
                        currentUserId={currentUserId}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-12 text-center text-zinc-500"
                    >
                      <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <p>暂无反馈，成为第一个提交的人吧</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CollapsePanel>
        </div>
      </GlassSurface>
    </section>
  )
}
