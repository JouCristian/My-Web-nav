'use server'

import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache'
import { prisma } from '@/lib/db'
import { auth } from '@/auth'

// 缓存的 FAQ 查询（30秒缓存，带标签用于精确失效）
const getCachedFAQQuestions = unstable_cache(
  async () => {
    // @ts-ignore - 模型会在数据库迁移后生成
    const questions = await prisma.fAQQuestion.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        answers: {
          orderBy: { createdAt: 'asc' }
        }
      }
    })
    return questions
  },
  ['faq-questions'],
  { revalidate: 30, tags: ['faq'] }
)

// 获取所有FAQ问题及其回答
export async function getFAQQuestions() {
  try {
    return await getCachedFAQQuestions()
  } catch (error) {
    console.error('获取FAQ问题失败:', error)
    return []
  }
}

// 提交新问题（需要登录）
export async function submitFAQQuestion(content: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('请先登录')
  }

  if (!content.trim()) {
    throw new Error('问题内容不能为空')
  }

  try {
    // 获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // @ts-ignore - 模型会在数据库迁移后生成
    await prisma.fAQQuestion.create({
      data: {
        content: content.trim(),
        authorId: session.user.id,
        authorName: user?.nickname || user?.name || session.user.name,
        authorImage: user?.customAvatar || user?.image || session.user.image,
      }
    })

    // 失效缓存并刷新页面
    revalidateTag('faq', 'max')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('提交问题失败:', error)
    throw new Error('提交问题失败')
  }
}

// 提交回答（仅船员、舰长、管理员可以）
export async function submitFAQAnswer(questionId: string, content: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('请先登录')
  }

  if (!content.trim()) {
    throw new Error('回答内容不能为空')
  }

  try {
    // 获取用户信息并验证权限
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      throw new Error('用户不存在')
    }

    // 检查是否有回答权限（MEMBER、ADMIN、OWNER 或 isCaptain）
    // @ts-ignore
    const isCaptain = session.user.isCaptain
    const canAnswer = user.role === 'MEMBER' || user.role === 'ADMIN' || user.role === 'OWNER' || isCaptain

    if (!canAnswer) {
      throw new Error('没有回答权限')
    }

    // 确定角色标签（存储为字符串）
    let authorRole: string = user.role
    if (isCaptain) {
      authorRole = 'CAPTAIN'
    }

    // @ts-ignore - 模型会在数据库迁移后生成
    await prisma.fAQAnswer.create({
      data: {
        content: content.trim(),
        questionId,
        authorId: session.user.id,
        authorName: user.nickname || user.name || session.user.name,
        authorImage: user.customAvatar || user.image || session.user.image,
        authorRole: authorRole,
      }
    })

    // 失效缓存并刷新页面
    revalidateTag('faq', 'max')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('提交回答失败:', error)
    throw new Error('提交回答失败')
  }
}

// 删除问题（仅管理员或问题作者可以）
export async function deleteFAQQuestion(questionId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('请先登录')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // @ts-ignore - 模型会在数据库迁移后生成
    const question = await prisma.fAQQuestion.findUnique({
      where: { id: questionId }
    })

    if (!question) {
      throw new Error('问题不存在')
    }

    // @ts-ignore
    const isCaptain = session.user.isCaptain
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER' || isCaptain
    const isAuthor = question.authorId === session.user.id

    if (!isAdmin && !isAuthor) {
      throw new Error('没有删除权限')
    }

    // @ts-ignore - 模型会在数据库迁移后生成
    await prisma.fAQQuestion.delete({
      where: { id: questionId }
    })

    // 失效缓存并刷新页面
    revalidateTag('faq', 'max')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('删除问题失败:', error)
    throw new Error('删除问题失败')
  }
}

// 删除回答（仅管理员或回答作者可以）
export async function deleteFAQAnswer(answerId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error('请先登录')
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    // @ts-ignore - 模型会在数据库迁移后生成
    const answer = await prisma.fAQAnswer.findUnique({
      where: { id: answerId }
    })

    if (!answer) {
      throw new Error('回答不存在')
    }

    // @ts-ignore
    const isCaptain = session.user.isCaptain
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'OWNER' || isCaptain
    const isAuthor = answer.authorId === session.user.id

    if (!isAdmin && !isAuthor) {
      throw new Error('没有删除权限')
    }

    // @ts-ignore - 模型会在数据库迁移后生成
    await prisma.fAQAnswer.delete({
      where: { id: answerId }
    })

    // 失效缓存并刷新页面
    revalidateTag('faq', 'max')
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('删除回答失败:', error)
    throw new Error('删除回答失败')
  }
}
