'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { createNotification } from '@/app/actions/notification'

// 缓存反馈列表
const getCachedFeedbacks = unstable_cache(
  async () => {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    return feedbacks
  },
  ['feedbacks'],
  { revalidate: 30, tags: ['feedback'] }
)

export async function getFeedbacks() {
  try {
    return await getCachedFeedbacks()
  } catch (error) {
    console.error('获取反馈失败:', error)
    return []
  }
}

export async function submitFeedback(type: 'BUG' | 'DESIGN' | 'FEATURE', title: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('请先登录')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) throw new Error('用户不存在')

  await prisma.feedback.create({
    data: {
      type,
      title,
      content,
      authorId: user.id,
      authorName: user.realName || user.name || user.nickname || user.githubName || '匿名用户',
      authorImage: user.customAvatar || user.image
    }
  })

  revalidateTag('feedback', 'max')
  revalidatePath('/')
}

export async function submitFeedbackReply(feedbackId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('请先登录')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) throw new Error('用户不存在')

  // 仅舰长和管理员可以回复
  if (user.role !== 'OWNER' && user.role !== 'ADMIN') {
    throw new Error('仅管理员可以回复')
  }

  // 获取反馈信息
  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId }
  })

  await prisma.feedbackReply.create({
    data: {
      content,
      feedbackId,
      authorId: user.id,
      authorName: user.realName || user.name || user.nickname || user.githubName || '管理员',
      authorImage: user.customAvatar || user.image,
      authorRole: user.role === 'OWNER' ? '舰长' : '管理员'
    }
  })

  // 通知反馈提交者
  if (feedback && feedback.authorId !== user.id) {
    await createNotification({
      userId: feedback.authorId,
      type: 'FEEDBACK_REPLY',
      title: '您的反馈有新回复',
      content: `${user.realName || user.name || '管理员'}回复了您的反馈「${feedback.title}」`,
      targetUrl: `/?feedback=${feedbackId}`
    })
  }

  revalidateTag('feedback', 'max')
  revalidatePath('/')
}

export async function updateFeedbackStatus(feedbackId: string, status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED') {
  const session = await auth()
  if (!session?.user?.id) throw new Error('请先登录')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    throw new Error('仅管理员可以更新状态')
  }

  await prisma.feedback.update({
    where: { id: feedbackId },
    data: { status }
  })

  revalidateTag('feedback', 'max')
  revalidatePath('/')
}

// 搜索和筛选反馈
export async function searchFeedbacks(params: {
  query?: string
  type?: 'BUG' | 'DESIGN' | 'FEATURE' | null
  status?: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REJECTED' | null
  timeRange?: 'all' | 'week' | 'month' | null
  authorId?: string | null
}) {
  const { query, type, status, timeRange, authorId } = params

  // 构建查询条件
  const where: any = {}

  // 关键词搜索
  if (query && query.trim()) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { content: { contains: query, mode: 'insensitive' } }
    ]
  }

  // 类型筛选
  if (type) {
    where.type = type
  }

  // 状态筛选
  if (status) {
    where.status = status
  }

  // 时间范围
  if (timeRange && timeRange !== 'all') {
    const now = new Date()
    if (timeRange === 'week') {
      where.createdAt = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
    } else if (timeRange === 'month') {
      where.createdAt = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
    }
  }

  // 作者筛选
  if (authorId) {
    where.authorId = authorId
  }

  const feedbacks = await prisma.feedback.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  return feedbacks.map(f => ({
    id: f.id,
    type: f.type,
    title: f.title,
    content: f.content,
    status: f.status,
    authorId: f.authorId,
    authorName: f.authorName,
    authorImage: f.authorImage,
    createdAt: f.createdAt.toISOString(),
    replies: f.replies.map(r => ({
      id: r.id,
      content: r.content,
      authorId: r.authorId,
      authorName: r.authorName,
      authorImage: r.authorImage,
      authorRole: r.authorRole,
      createdAt: r.createdAt.toISOString()
    }))
  }))
}

export async function deleteFeedback(feedbackId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('请先登录')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  const feedback = await prisma.feedback.findUnique({
    where: { id: feedbackId }
  })

  if (!feedback) throw new Error('反馈不存在')

  // 仅作者或管理员可以删除
  const isAuthor = feedback.authorId === session.user.id
  const isAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN'

  if (!isAuthor && !isAdmin) {
    throw new Error('没有权限删除')
  }

  await prisma.feedback.delete({
    where: { id: feedbackId }
  })

  revalidateTag('feedback', 'max')
  revalidatePath('/')
}

export async function deleteFeedbackReply(replyId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error('请先登录')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  // 仅管理员可以删除回复
  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    throw new Error('仅管理员可以删除回复')
  }

  await prisma.feedbackReply.delete({
    where: { id: replyId }
  })

  revalidateTag('feedback', 'max')
  revalidatePath('/')
}
