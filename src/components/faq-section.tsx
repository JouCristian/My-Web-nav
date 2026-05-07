'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  canAnswer: boolean // 船员、舰长、管理员可以回答
  isAdmin: boolean   // 管理员可以删除任何问题/回答
  currentUserId?: string
}

// 贝塞尔曲线配置
const smoothBezier = [0.22, 1, 0.36, 1] as [number, number, number, number]
const elasticBezier = [0.34, 1.56, 0.64, 1] as [number, number, number, number]

// 箭头旋转动画 - 更快速响应
const arrowTransition = {
  type: "spring" as const,
  stiffness: 500,
  damping: 30
}

// 可展开面板组件 - 带弹性形变效果
function ExpandablePanel({ 
  isOpen, 
  children,
  className = ''
}: { 
  isOpen: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className={`relative ${className}`}>
          {/* 形变装饰层 - 只影响背景 */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent rounded-xl pointer-events-none"
            initial={{ scaleX: 1.03, scaleY: 0.7, opacity: 0 }}
            animate={{ 
              scaleX: [1.03, 0.98, 1.01, 1], 
              scaleY: [0.7, 1.05, 0.98, 1],
              opacity: [0, 0.5, 0.3, 0]
            }}
            exit={{ 
              scaleX: [1, 1.02, 1.05], 
              scaleY: [1, 0.95, 0.6],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 0.5,
              ease: elasticBezier,
              times: [0, 0.4, 0.7, 1]
            }}
            style={{ originY: 0 }}
          />
          
          {/* 内容层 - 只做高度和透明度动画 */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
              transition: {
                height: { duration: 0.45, ease: elasticBezier },
                opacity: { duration: 0.3, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                opacity: { duration: 0.2 }
              }
            }}
            className="overflow-hidden"
          >
            {children}
          </motion.div>
        </div>
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
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: smoothBezier }}
      className="relative"
    >
      <GlassSurface
        width="100%"
        height="auto"
        borderRadius={16}
        brightness={120}
        opacity={0.4}
        blur={20}
        displace={1.2}
        mixBlendMode="normal"
        backgroundOpacity={0.08}
      >
        <div className="p-4 sm:p-5">
          {/* 问题头部 */}
          <div 
            className="flex items-start gap-3 cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Avatar src={question.authorImage} name={question.authorName} />
            <div className="flex-1 min-w-0">
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
          <ExpandablePanel isOpen={isExpanded}>
            <div className="pt-4 mt-4 border-t border-white/5">
                  {/* 回答列表 */}
                  {question.answers.length > 0 ? (
                    <div className="space-y-4 mb-4">
                      {question.answers.map((answer) => (
                        <motion.div
                          key={answer.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, ease: smoothBezier }}
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
                            <p className="text-sm text-zinc-400 leading-relaxed">
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
                    {canAnswer && !isReplying && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsReplying(true)}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-xl hover:bg-cyan-500/20 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        回答问题
                      </motion.button>
                    )}
                    {canDeleteQuestion && (
                      <button
                        onClick={handleDeleteQuestion}
                        disabled={isPending}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        删除问题
                      </button>
                    )}
                  </div>

                  {/* 回答输入框 */}
                  <ExpandablePanel isOpen={isReplying}>
                    <div className="mt-4 space-y-3">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="输入你的回答..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 resize-none transition-colors"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setIsReplying(false)}
                              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                              取消
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSubmitAnswer}
                              disabled={isPending || !replyContent.trim()}
                              className="px-4 py-2 text-sm font-medium text-black bg-cyan-400 rounded-xl hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              {isPending ? '提交中...' : '提交回答'}
                            </motion.button>
                          </div>
                    </div>
                  </ExpandablePanel>
                </div>
          </ExpandablePanel>
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

      {/* 主容器 - 可折�� */}
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
      >
        <div className="p-5 sm:p-6">
          {/* 折叠头部 */}
          <div 
            className="flex items-center justify-between cursor-pointer group"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
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
          <ExpandablePanel isOpen={isExpanded}>
            <div className="pt-6 mt-6 border-t border-white/5">
                  {/* 提问按钮 */}
                  {isLoggedIn && !isAsking && (
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setIsAsking(true)}
                      className="w-full mb-6 p-4 flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl text-amber-400 font-medium hover:from-amber-500/20 hover:to-orange-500/20 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      提出新问题
                    </motion.button>
                  )}

                  {!isLoggedIn && (
                    <div className="mb-6 p-4 flex items-center justify-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl text-zinc-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      登录后可以提问
                    </div>
                  )}

                  {/* 提问输入框 */}
                  <ExpandablePanel isOpen={isAsking} className="mb-6">
                    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                          <textarea
                            value={questionContent}
                            onChange={(e) => setQuestionContent(e.target.value)}
                            placeholder="输入你的问题..."
                            rows={3}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => setIsAsking(false)}
                              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
                            >
                              取消
                            </button>
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleSubmitQuestion}
                              disabled={isPending || !questionContent.trim()}
                              className="px-4 py-2 text-sm font-medium text-black bg-amber-400 rounded-xl hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                              {isPending ? '提交中...' : '提交问题'}
                            </motion.button>
                          </div>
                    </div>
                  </ExpandablePanel>

                  {/* 问题列表 */}
                  {questions.length > 0 ? (
                    <div className="space-y-4">
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
          </ExpandablePanel>
        </div>
      </GlassSurface>
    </section>
  )
}
