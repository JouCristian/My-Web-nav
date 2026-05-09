"use server"

import { prisma } from "@/lib/db"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { NotificationType } from "@prisma/client"

// 获取当前用户的通知列表
export async function getNotifications(limit: number = 20) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, notifications: [] }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return { success: true, notifications }
}

// 获取未读通知数量
export async function getUnreadCount() {
  const session = await auth()
  if (!session?.user?.id) return 0

  const count = await prisma.notification.count({
    where: { 
      userId: session.user.id,
      isRead: false 
    },
  })

  return count
}

// 标记单条通知为已读
export async function markAsRead(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.notification.update({
    where: { 
      id: notificationId,
      userId: session.user.id  // 确保只能标记自己的通知
    },
    data: { isRead: true }
  })

  revalidatePath("/")
  return { success: true }
}

// 标记所有通知为已读
export async function markAllAsRead() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.notification.updateMany({
    where: { 
      userId: session.user.id,
      isRead: false 
    },
    data: { isRead: true }
  })

  revalidatePath("/")
  return { success: true }
}

// 删除单条通知
export async function deleteNotification(notificationId: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.notification.delete({
    where: { 
      id: notificationId,
      userId: session.user.id
    },
  })

  revalidatePath("/")
  return { success: true }
}

// 清空所有已读通知
export async function clearReadNotifications() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.notification.deleteMany({
    where: { 
      userId: session.user.id,
      isRead: true 
    },
  })

  revalidatePath("/")
  return { success: true }
}

// ==========================================
// 创建通知的内部方法（供其他模块调用）
// ==========================================

interface CreateNotificationParams {
  type: NotificationType
  title: string
  content: string
  targetUrl?: string
  userId: string
}

// 创建单条通知
export async function createNotification(params: CreateNotificationParams) {
  return await prisma.notification.create({
    data: {
      type: params.type,
      title: params.title,
      content: params.content,
      targetUrl: params.targetUrl,
      userId: params.userId,
    }
  })
}

// 批量创建通知（如集结通知发送给所有船员）
export async function createBulkNotifications(
  userIds: string[],
  notification: Omit<CreateNotificationParams, 'userId'>
) {
  return await prisma.notification.createMany({
    data: userIds.map(userId => ({
      type: notification.type,
      title: notification.title,
      content: notification.content,
      targetUrl: notification.targetUrl,
      userId,
    }))
  })
}

// 发送集结通知给所有船员
export async function notifyRollCall(creatorName: string) {
  // 获取所有正式船员（非PENDING）
  const members = await prisma.user.findMany({
    where: { 
      role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
    },
    select: { id: true }
  })

  await createBulkNotifications(
    members.map(m => m.id),
    {
      type: 'ROLL_CALL',
      title: '全舰集结令',
      content: `${creatorName} 发起了全舰集结，请立即签到！`,
      targetUrl: '/dashboard/attendance',
    }
  )
}

// 通知所有船员（通用函数）
export async function notifyAllCrew(notification: {
  type: 'ROLL_CALL' | 'FEEDBACK_REPLY' | 'LEAVE_APPROVED' | 'LEAVE_REJECTED'
  title: string
  content: string
  targetUrl?: string
}) {
  // 获取所有正式船员（非PENDING）
  const members = await prisma.user.findMany({
    where: { 
      role: { in: ['MEMBER', 'ADMIN', 'OWNER'] }
    },
    select: { id: true }
  })

  await createBulkNotifications(
    members.map(m => m.id),
    notification
  )
}

// 发送反馈回复通知
export async function notifyFeedbackReply(
  feedbackId: string,
  feedbackTitle: string,
  authorId: string,
  replierName: string
) {
  await createNotification({
    type: 'FEEDBACK_REPLY',
    title: '反馈已收到回复',
    content: `${replierName} 回复了你的反馈「${feedbackTitle}」`,
    targetUrl: `/feedback#${feedbackId}`,
    userId: authorId,
  })
}

// 发送请假审批通知
export async function notifyLeaveApproval(
  userId: string,
  approved: boolean,
  reason?: string
) {
  await createNotification({
    type: approved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED',
    title: approved ? '请假申请已批准' : '请假申请被拒绝',
    content: approved 
      ? '你的请假申请已被管理员批准' 
      : `你的请假申请被拒绝${reason ? `，原因：${reason}` : ''}`,
    targetUrl: '/dashboard/attendance?tab=leave',
    userId,
  })
}

// ==========================================
// 浏览器推送订阅管理
// ==========================================

// 保存推送订阅
export async function savePushSubscription(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.pushSubscription.upsert({
    where: {
      userId_endpoint: {
        userId: session.user.id,
        endpoint: subscription.endpoint,
      }
    },
    update: {
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }
  })

  return { success: true }
}

// 删除推送订阅
export async function removePushSubscription(endpoint: string) {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Unauthorized")

  await prisma.pushSubscription.deleteMany({
    where: {
      userId: session.user.id,
      endpoint,
    }
  })

  return { success: true }
}
