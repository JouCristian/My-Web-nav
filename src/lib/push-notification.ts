import webPush from 'web-push'
import { prisma } from '@/lib/db'

// 配置 VAPID 密钥（需要在环境变量中设置）
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

if (vapidPublicKey && vapidPrivateKey) {
  webPush.setVapidDetails(
    'mailto:admin@example.com',
    vapidPublicKey,
    vapidPrivateKey
  )
}

export interface PushPayload {
  title: string
  body: string
  icon?: string
  url?: string
  tag?: string
}

// 发送推送通知给指定用户
export async function sendPushNotification(userId: string, payload: PushPayload) {
  if (!vapidPublicKey || !vapidPrivateKey) {
    console.log('[Push] VAPID keys not configured, skipping push notification')
    return
  }

  try {
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId }
    })

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: {
                p256dh: sub.p256dh,
                auth: sub.auth
              }
            },
            JSON.stringify(payload)
          )
        } catch (error: any) {
          // 如果订阅已过期，删除它
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { id: sub.id }
            })
          }
          throw error
        }
      })
    )

    const success = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    console.log(`[Push] Sent to ${success}/${subscriptions.length} subscriptions (${failed} failed)`)
  } catch (error) {
    console.error('[Push] Failed to send notification:', error)
  }
}

// 发送推送通知给多个用户
export async function sendPushNotificationToUsers(userIds: string[], payload: PushPayload) {
  await Promise.allSettled(
    userIds.map(userId => sendPushNotification(userId, payload))
  )
}

// 获取公钥（用于前端订阅）
export function getVapidPublicKey() {
  return vapidPublicKey
}
