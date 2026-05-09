"use client"

import { useState, useEffect, useRef, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notification'

// 贝塞尔曲线配置
const smoothEase = [0.32, 0.72, 0, 1]
const gentleEase = [0.25, 0.46, 0.45, 0.94]

type Notification = {
  id: string
  type: string
  title: string
  content: string
  targetUrl: string | null
  isRead: boolean
  createdAt: Date
}

// 通知类型图标和颜色配置
const NOTIFICATION_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  ROLL_CALL: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    color: 'text-amber-400',
    bg: 'bg-amber-500/10'
  },
  FEEDBACK_REPLY: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  LEAVE_APPROVED: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  LEAVE_REJECTED: {
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'text-red-400',
    bg: 'bg-red-500/10'
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return new Date(date).toLocaleDateString('zh-CN')
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isPending, startTransition] = useTransition()
  const [isMounted, setIsMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    setIsMounted(true)
    fetchNotifications()
    // 每30秒刷新一次
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const result = await getNotifications()
      if (result.success && result.notifications) {
        setNotifications(result.notifications)
        setUnreadCount(result.notifications.filter((n: Notification) => !n.isRead).length)
      }
    } catch (e) {
      console.error('Failed to fetch notifications', e)
    }
  }

  const handleOpen = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const panelWidth = 320 // 面板宽度
      const padding = 12 // 屏幕边距
      
      // 计算 left 位置，确保面板不超出屏幕
      let left = rect.left
      // 如果面板会超出右边界，改为右对齐
      if (left + panelWidth > window.innerWidth - padding) {
        left = window.innerWidth - panelWidth - padding
      }
      // 确保不超出左边界
      left = Math.max(padding, left)
      
      setDropdownPos({ 
        top: rect.bottom + 8, 
        left
      })
    }
    setIsOpen(true)
  }

  const handleMarkAsRead = async (id: string) => {
    startTransition(async () => {
      await markAsRead(id)
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    })
  }

  const handleMarkAllAsRead = async () => {
    startTransition(async () => {
      await markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id)
    }
    setIsOpen(false)
  }

  return (
    <>
      {/* 铃铛按钮 - Dock风格 */}
      <motion.button
        ref={buttonRef}
        onClick={handleOpen}
        className="relative inline-flex items-center justify-center w-[42px] h-[42px] rounded-full"
        style={{
          backgroundColor: 'rgba(6, 8, 15, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderTop: '1px solid rgba(255, 255, 255, 0.25)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          outline: 'none'
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.backgroundColor = 'rgba(34, 211, 238, 0.15)'
          btn.style.borderTop = '1px solid rgba(34, 211, 238, 0.6)'
          btn.style.color = '#ffffff'
          btn.style.boxShadow = '0 12px 25px rgba(0, 0, 0, 0.9), 0 0 25px rgba(34, 211, 238, 0.25), inset 0 2px 5px rgba(255, 255, 255, 0.15)'
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.backgroundColor = 'rgba(6, 8, 15, 0.75)'
          btn.style.borderTop = '1px solid rgba(255, 255, 255, 0.25)'
          btn.style.color = 'rgba(255, 255, 255, 0.95)'
          btn.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.8), inset 0 2px 5px rgba(255, 255, 255, 0.05)'
        }}
        tabIndex={0}
        role="button"
      >
        {/* 铃铛图标 */}
        <motion.div
          animate={unreadCount > 0 ? { 
            rotate: [0, -12, 12, -8, 8, -4, 4, 0],
          } : {}}
          transition={{ 
            duration: 0.8, 
            ease: [0.34, 1.56, 0.64, 1], 
            repeat: unreadCount > 0 ? Infinity : 0, 
            repeatDelay: 4 
          }}
          className="flex items-center justify-center w-[45%] h-[45%]"
        >
          <svg
            className="w-full h-full text-zinc-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 1))' }}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" 
            />
          </svg>
        </motion.div>
        
        {/* 未读徽章 */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
              className="absolute -top-2 -right-2"
            >
              {/* 呼吸光圈 */}
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-red-500"
              />
              {/* 徽章主体 */}
              <div className="relative min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 text-white text-[10px] font-bold shadow-[0_2px_8px_rgba(239,68,68,0.6),0_0_0_2px_rgba(0,0,0,0.3)]">
                {unreadCount > 99 ? '99+' : unreadCount}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Portal 渲染下拉面板 */}
      {isMounted && createPortal(
        <AnimatePresence>
          {isOpen && (
            <>
              {/* 背景遮罩 */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0"
                style={{ zIndex: 99998 }}
                onClick={() => setIsOpen(false)}
              />
              
              {/* 通知面板 */}
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.95 }}
                transition={{ duration: 0.4, ease: smoothEase }}
                style={{
                  position: 'fixed',
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                  transformOrigin: 'top left',
                  zIndex: 99999
                }}
                className="w-[340px] sm:w-[380px] max-h-[70vh] rounded-2xl border border-white/10 bg-[#0a0e14]/98 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.05)] overflow-hidden flex flex-col"
              >
                {/* 头部 */}
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">通知中心</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-md bg-red-500/20 text-red-400">
                        {unreadCount} 条未读
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      disabled={isPending}
                      className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors disabled:opacity-50"
                    >
                      全部已读
                    </button>
                  )}
                </div>

                {/* 通知列表 */}
                <div className="flex-1 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                      <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span className="text-xs font-mono tracking-wider">暂无通知</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {notifications.map((notification, index) => {
                        const config = NOTIFICATION_CONFIG[notification.type] || NOTIFICATION_CONFIG.ROLL_CALL
                        const NotificationWrapper = notification.targetUrl ? Link : 'div'
                        const wrapperProps = notification.targetUrl 
                          ? { href: notification.targetUrl } 
                          : {}
                        
                        return (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.04, ease: smoothEase }}
                          >
                            <NotificationWrapper
                              {...wrapperProps as any}
                              onClick={() => handleNotificationClick(notification)}
                              className={`flex gap-3 p-4 cursor-pointer transition-all duration-300 hover:bg-white/5 ${
                                !notification.isRead ? 'bg-white/[0.02]' : ''
                              }`}
                            >
                              {/* 图标 */}
                              <div className={`shrink-0 w-9 h-9 rounded-xl ${config.bg} ${config.color} flex items-center justify-center`}>
                                {config.icon}
                              </div>
                              
                              {/* 内容 */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <span className={`text-sm font-medium ${!notification.isRead ? 'text-white' : 'text-zinc-400'}`}>
                                    {notification.title}
                                  </span>
                                  {!notification.isRead && (
                                    <span className="shrink-0 w-2 h-2 mt-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
                                  )}
                                </div>
                                <p className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                                  {notification.content}
                                </p>
                                <span className="mt-1.5 text-[10px] text-zinc-600 font-mono">
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </NotificationWrapper>
                          </motion.div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 底部 */}
                {notifications.length > 0 && (
                  <div className="px-4 py-3 border-t border-white/5 shrink-0">
                    <Link
                      href="/dashboard/notifications"
                      onClick={() => setIsOpen(false)}
                      className="block w-full text-center text-xs text-zinc-500 hover:text-cyan-400 transition-colors py-1"
                    >
                      查看全部通知
                    </Link>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  )
}
