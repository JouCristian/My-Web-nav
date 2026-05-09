// Service Worker for Push Notifications

self.addEventListener('push', function(event) {
    if (!event.data) return
  
    const data = event.data.json()
    
    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'default',
      data: {
        url: data.url || '/'
      },
      vibrate: [100, 50, 100],
      requireInteraction: true
    }
  
    event.waitUntil(
      self.registration.showNotification(data.title || '通知', options)
    )
  })
  
  self.addEventListener('notificationclick', function(event) {
    event.notification.close()
  
    const url = event.notification.data?.url || '/'
  
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
        // 如果已有窗口打开，聚焦并导航
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus()
            client.navigate(url)
            return
          }
        }
        // 否则打开新窗口
        if (clients.openWindow) {
          return clients.openWindow(url)
        }
      })
    )
  })
  