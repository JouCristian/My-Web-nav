import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint, keys } = await request.json()

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    // 使用 upsert 避免重复
    await prisma.pushSubscription.upsert({
      where: {
        userId_endpoint: {
          userId: session.user.id,
          endpoint
        }
      },
      update: {
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      create: {
        userId: session.user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push Subscribe] Error:', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (endpoint) {
      await prisma.pushSubscription.deleteMany({
        where: {
          userId: session.user.id,
          endpoint
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Push Unsubscribe] Error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
}
