'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// 自定义滚动条样式 + FAQ专用玻璃项样式
const scrollbarStyles = `
  .faq-scrollbar {
    overflow-y: scroll;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    transition: scrollbar-color 0.3s ease;
  }
  .faq-scrollbar:hover {
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }
  .faq-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .faq-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .faq-scrollbar::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 3px;
    transition: background 0.3s ease;
  }
  .faq-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.15);
  }
  .faq-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
  }
  
  /* FAQ玻璃项 - 内容区撑满，宽度过渡 */
  .faq-glass-item {
    width: 100% !important;
    transition: all 0.45s cubic-bezier(0.32, 0.72, 0, 1) !important;
  }
  .faq-glass-item .glass-surface__content {
    align-items: stretch !important;
    justify-content: flex-start !important;
    width: 100% !important;
  }
`
import GlassSurface from './GlassSurface'
import { submitFAQQuestion, submitFAQAnswer, deleteFAQQuestion, deleteFAQAnswer } from '@/app/actions/faq'

interface FAQAnswer {
  id: string
  content: string
  authorId: string
  authorName: string | null
  authorImage: string | null
  authorRole: string | null
  createdAt: Date
}

interface FAQQuestion {
  id: string
  content: string
  authorId: string
  authorName: string | null
  authorImage: string | null
  createdAt: Date
  answers: FAQAnswer[]
}

interface FAQSectionProps {
  className?: string
  questions: FAQQuestion[]
  isLoggedIn: boolean
  canAnswer: boolean
  isAdmin: boolean
  currentUserId?: string
}

// 超丝滑贝塞尔曲线配置
const silkyBezier = [0.25, 0.1, 0.25, 1] as [number, number, number, number]
const smoothBezier = [0.4, 0, 0.2, 1] as [number, number, number, number]
const gentleElastic = [0.68, -0.15, 0.32, 1.15] as [number, number, number, number]

// 箭头旋转动画
const arrowTransition = {
  duration: 0.35,
  ease: silkyBezier
}

// 简洁的折叠面板 - 无嵌套，无卡顿
function CollapsePanel({ 
  isOpen, 
  children,
  className = ''
}: { 
  isOpen: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div 
          className={className}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
            opacity: { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
          }}
          style={{ overflow: 'visible' }}
        >
          <div style={{ overflow: 'hidden', marginBottom: -1 }}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 角色标签组件
function RoleBadge({ role }: { role: string | null }) {
  if (!role) return null
  
  const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
    OWNER: { label: '舰长', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
    ADMIN: { label: '管理员', color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30' },
    MEMBER: { label: '船员', color: 'text-cyan-400', bg: 'bg-cyan-500/20 border-cyan-500/30' },
    CAPTAIN: { label: '舰长', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30' },
  }
  
  const config = roleConfig[role] || { label: role, color: 'text-zinc-400', bg: 'bg-zinc-500/20 border-zinc-500/30' }
  
  return (
    <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${config.bg} ${config.color}`}>
      {config.label}
    </span>
  )
}

// 头像组件
function Avatar({ src, name, size = 'md' }: { src?: string | null; name?: string | null; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm'
  
  if (src) {
    return (
      <img 
        src={src} 
        alt={name || '用户头像'} 
        className={`${sizeClass} rounded-full object-cover border border-white/10`}
      />
    )
  }
  
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center font-medium text-zinc-300`}>
      {name?.charAt(0)?.toUpperCase() || '?'}
    </div>
  )
}

// 单个问答项
function FAQItem({ 
  question, 
  canAnswer, 
  isAdmin,
  currentUserId 
}: { 
  question: FAQQuestion
  canAnswer: boolean
  isAdmin: boolean
  currentUserId?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmitAnswer = () => {
    if (!replyContent.trim()) return
    startTransition(async () => {
      await submitFAQAnswer(question.id, replyContent)
      setReplyContent('')
      setIsReplying(false)
    })
  }

  const handleDeleteQuestion = () => {
    if (!confirm('确定要删除这个问题吗？所有回答也会被删除。')) return
    startTransition(async () => {
      await deleteFAQQuestion(question.id)
    })
  }

  const handleDeleteAnswer = (answerId: string) => {
    if (!confirm('确定要删除这个回答吗？')) return
    startTransition(async () => {
      await deleteFAQAnswer(answerId)
    })
  }

  const canDeleteQuestion = isAdmin || currentUserId === question.authorId

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: smoothBezier }}
      className="relative w-full"
    >
      <GlassSurface
        width="100%"
        height="auto"
        className="faq-glass-item"
        borderRadius={16}
        brightness={120}
        opacity={0.4}
        blur={20}
        displace={1.2}
        mixBlendMode="normal"
        backgroundOpacity={0.08}
      >
        <div className="p-4 sm:p-5 w-full min-w-0">
          {/* 问题头部 */}
          <div 
            className="flex items-start gap-3 cursor-pointer group w-full min-w-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Avatar src={question.authorImage} name={question.authorName} />
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-zinc-200 truncate">
                  {question.authorName || '匿名用户'}
                </span>
                <span className="text-[10px] text-zinc-500">
                  {new Date(question.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {question.content}
              </p>
            </div>
            
            {/* 展开/收起指示器 */}
            <div className="flex items-center gap-2">
              {question.answers.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                  {question.answers.length} 回答
                </span>
              )}
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={arrowTransition}
                className="text-zinc-500 group-hover:text-zinc-200 transition-colors duration-150"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* 展开内容 */}
          <CollapsePanel isOpen={isExpanded}>
            <div className="pt-4 mt-4 border-t border-white/5 overflow-hidden">
                  {/* 回答列表 - 带最大高度，滚动条hover时显示 */}
                  {question.answers.length > 0 ? (
                    <div className="space-y-4 mb-4 max-h-[280px] pr-2 faq-scrollbar">
                      {question.answers.map((answer) => (
                        <motion.div
                          key={answer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.35, ease: smoothBezier }}
                          className="flex items-start gap-3 pl-4 border-l-2 border-cyan-500/30"
                        >
                          <Avatar src={answer.authorImage} name={answer.authorName} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-medium text-zinc-200 truncate">
                                {answer.authorName || '匿名用户'}
                              </span>
                              <RoleBadge role={answer.authorRole} />
                              <span className="text-[10px] text-zinc-500">
                                {new Date(answer.createdAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            <p className="text-sm text-zinc-400 leading-relaxed break-words overflow-hidden">
                              {answer.content}
                            </p>
                          </div>
                          {(isAdmin || currentUserId === answer.authorId) && (
                            <button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              disabled={isPending}
                              className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500 italic mb-4">暂无回答，等待船员解答...</p>
                  )}

                  {/* 操作按钮区 */}
                  <div className="flex items-center gap-2">
                    {canAnswer && (
                      <button
                        onClick={() => setIsReplying(!isReplying)}
                        className={`
                          relative flex items-center gap-2 px-3 py-2 text-sm font-medium 
                          rounded-xl overflow-hidden transition-all duration-400
                          ${isReplying 
                            ? 'text-cyan-300 bg-cyan-500/20 border border-cyan-500/40' 
                            : 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/15 hover:border-cyan-500/30'
                          }
                          group
                        `}
                      >
                        {/* 高光效果 */}
                        <span className="absolute inset-0 overflow-hidden rounded-xl">
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </span>
                        
                        <motion.svg 
                          className="w-4 h-4" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                          animate={{ rotate: isReplying ? 180 : 0 }}
                          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </motion.svg>
                        <span>{isReplying ? '收起' : '回答问题'}</span>
                      </button>
                    )}
                    {canDeleteQuestion && (
                      <button
                        onClick={handleDeleteQuestion}
                        disabled={isPending}
                        className="relative flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/15 hover:border-red-500/30 transition-all duration-300 overflow-hidden group"
                      >
                        <span className="absolute inset-0 overflow-hidden rounded-xl">
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-600 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>删除问题</span>
                      </button>
                    )}
                  </div>

                  {/* 回答输入框 - 在按钮下方展开 */}
                  <AnimatePresence>
                    {isReplying && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                          opacity: { duration: 0.25, ease: [0.32, 0.72, 0, 1] }
                        }}
                        style={{ overflow: 'hidden' }}
                      >
                        <motion.div 
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1], delay: 0.02 }}
                          className="mt-4 space-y-3"
                        >
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="输入你的回答..."
                            rows={3}
                            autoFocus
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors duration-300"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setIsReplying(false)
                              }}
                              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors duration-200"
                            >
                              取消
                            </button>
                            <button
                              onClick={handleSubmitAnswer}
                              disabled={isPending || !replyContent.trim()}
                              className="px-4 py-2 text-sm font-medium text-black bg-cyan-400 rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                              {isPending ? '提交中...' : '提交回答'}
                            </button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
            </div>
          </CollapsePanel>
        </div>
      </GlassSurface>
    </motion.div>
  )
}

export function FAQSection({ 
  className = '', 
  questions, 
  isLoggedIn, 
  canAnswer,
  isAdmin,
  currentUserId 
}: FAQSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isAsking, setIsAsking] = useState(false)
  const [questionContent, setQuestionContent] = useState('')
  const [isPending, startTransition] = useTransition()

  const handleSubmitQuestion = () => {
    if (!questionContent.trim()) return
    startTransition(async () => {
      await submitFAQQuestion(questionContent)
      setQuestionContent('')
      setIsAsking(false)
    })
  }

  return (
    <section className={`relative ${className}`}>
      {/* 注入滚动条样式 */}
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      
      {/* 区块标题 */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <h2 className="text-xs font-mono tracking-[0.3em] text-zinc-400 uppercase">
            FAQ Center
          </h2>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      </div>

      {/* 主容器 - 可折叠 */}
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
        className="faq-glass-item"
      >
        <div className="p-5 sm:p-6 w-full">
          {/* 折叠头部 */}
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-4">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center"
                whileHover={{ 
                  scale: 1.08, 
                  rotate: [0, -8, 8, -4, 0],
                  borderColor: 'rgba(245, 158, 11, 0.5)'
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  scale: { duration: 0.3, ease: silkyBezier },
                  rotate: { duration: 0.5, ease: gentleElastic }
                }}
              >
                <motion.svg 
                  className="w-6 h-6 text-amber-400" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth={2}
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </motion.svg>
              </motion.div>
              <div>
                <h3 className="text-lg font-bold text-zinc-100 tracking-wide">
                  常见问题
                </h3>
                <p className="text-sm text-zinc-500">
                  有问题？在这里提问，船员和管理组会为你解答
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="hidden sm:block px-3 py-1 text-xs font-medium rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400">
                {questions.length} 个问题
              </span>
              <motion.div
                animate={{ 
                  rotate: isExpanded ? 180 : 0,
                  scale: 1,
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
                  {/* 登录提示 */}
                  {!isLoggedIn && (
                    <div className="mb-6 p-4 flex items-center justify-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-zinc-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      登录后可以提问
                    </div>
                  )}

                  {/* 提问按钮 - 始终可见 + 下方展开输入框 */}
                  {isLoggedIn && (
                    <div className="mb-6">
                      {/* 按钮 - 不消失，hover只有高光效果 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsAsking(!isAsking)
                        }}
                        className={`
                          relative w-full p-4 flex items-center justify-center gap-3 
                          rounded-2xl font-medium overflow-hidden
                          transition-all duration-500 ease-out
                          ${isAsking 
                            ? 'bg-amber-500/15 border border-amber-500/40 text-amber-300' 
                            : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-amber-400 hover:from-amber-500/15 hover:to-orange-500/15 hover:border-amber-500/35'
                          }
                          group
                        `}
                      >
                        {/* 高光扫过效果 */}
                        <span className="absolute inset-0 overflow-hidden rounded-2xl">
                          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        </span>
                        
                        {/* 加号图标 - hover 旋转 */}
                        <motion.div
                          animate={{ rotate: isAsking ? 45 : 0 }}
                          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
                          className="relative"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                          </svg>
                        </motion.div>
                        
                        {/* 灯泡图标 - hover 显示 */}
                        <motion.svg 
                          className="w-5 h-5" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          stroke="currentColor" 
                          strokeWidth={2}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: isAsking ? 1 : 0, 
                            scale: isAsking ? 1 : 0.8,
                            y: isAsking ? 0 : 4
                          }}
                          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </motion.svg>
                        
                        <span>{isAsking ? '收起' : '提出新问题'}</span>
                      </button>
                      
                      {/* 输入框 - 在按钮下方展开 */}
                      <AnimatePresence>
                        {isAsking && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                              height: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
                              opacity: { duration: 0.25, ease: [0.32, 0.72, 0, 1] }
                            }}
                            style={{ overflow: 'hidden' }}
                          >
                            <motion.div 
                              initial={{ y: -10, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              exit={{ y: -10, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1], delay: 0.02 }}
                              className="mt-3 p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3"
                            >
                              <textarea
                                value={questionContent}
                                onChange={(e) => setQuestionContent(e.target.value)}
                                placeholder="输入你的问题..."
                                rows={3}
                                autoFocus
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none transition-colors duration-300"
                              />
                              <div className="flex items-center gap-2 justify-end">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setIsAsking(false)
                                  }}
                                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 rounded-lg transition-colors duration-200"
                                >
                                  取消
                                </button>
                                <button
                                  onClick={() => {
                                    handleSubmitQuestion()
                                  }}
                                  disabled={isPending || !questionContent.trim()}
                                  className="px-4 py-2 text-sm font-medium text-black bg-amber-400 rounded-xl hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                >
                                  {isPending ? '提交中...' : '提交问题'}
                                </button>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* 问题列表 - 带最大高度，滚动条hover时显示 */}
                  {questions.length > 0 ? (
                    <div className="flex flex-col gap-4 max-h-[60vh] faq-scrollbar pr-2 w-full">
                      <AnimatePresence mode="popLayout">
                        {questions.map((question) => (
                          <FAQItem
                            key={question.id}
                            question={question}
                            canAnswer={canAnswer}
                            isAdmin={isAdmin}
                            currentUserId={currentUserId}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-zinc-500 text-sm">暂无问题</p>
                      <p className="text-zinc-600 text-xs mt-1">成为第一个提问的人吧</p>
                    </div>
                  )}
            </div>
          </CollapsePanel>
        </div>
      </GlassSurface>
    </section>
  )
}
