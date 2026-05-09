'use server'

import { prisma } from '@/lib/db'
import { auth } from '@/auth'
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'

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
