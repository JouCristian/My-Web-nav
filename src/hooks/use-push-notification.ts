'use client'

import { useState, useEffect, useCallback } from 'react'

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // 检查浏览器支持
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      
      // 检查是否已订阅
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          setIsSubscribed(!!subscription)
        })
      })
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [isSupported])

  const subscribe = useCallback(async () => {
    if (!isSupported) return false

    try {
      // 请求权限
      const permissionGranted = await requestPermission()
      if (!permissionGranted) return false

      // 注册 service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // 获取 VAPID 公钥
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        console.warn('[Push] VAPID public key not configured')
        return false
      }

      // 创建订阅
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      // 发送到服务器
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(subscription.getKey('auth')!)
          }
        })
      })

      if (response.ok) {
        setIsSubscribed(true)
        return true
      }
      return false
    } catch (error) {
      console.error('[Push] Subscribe failed:', error)
      return false
    }
  }, [isSupported, requestPermission])

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return false

    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()

        // 通知服务器
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error('[Push] Unsubscribe failed:', error)
      return false
    }
  }, [isSupported])

  return {
    isSupported,
    isSubscribed,
    permission,
    subscribe,
    unsubscribe
  }
}

// 工具函数
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return window.btoa(binary)
}
