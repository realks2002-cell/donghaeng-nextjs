const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export async function saveSubscription(subscription: PushSubscription): Promise<boolean> {
  const key = subscription.getKey('p256dh')
  const auth = subscription.getKey('auth')

  if (!key || !auth) {
    console.error('Missing subscription keys')
    return false
  }

  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: arrayBufferToBase64Url(key),
        auth: arrayBufferToBase64Url(auth),
      }),
    })

    if (!response.ok) {
      console.error('Failed to save push subscription')
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to save push subscription:', error)
    return false
  }
}

export async function deleteSubscription(endpoint: string): Promise<boolean> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint }),
    })
    return true
  } catch (error) {
    console.error('Failed to delete push subscription:', error)
    return false
  }
}

/**
 * Full push subscription flow: request permission -> subscribe -> save to server.
 * Must be called from a user gesture (click/tap) handler for iOS PWA compatibility.
 * Returns PushSubscription on success, null on failure.
 */
export async function subscribePush(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return null
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured')
    return null
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return null
    }

    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })
    }

    const saved = await saveSubscription(subscription)
    return saved ? subscription : null
  } catch (error) {
    console.error('Push subscription failed:', error)
    return null
  }
}

/**
 * Unsubscribe from push notifications: browser unsubscribe + server DELETE.
 */
export async function unsubscribePush(subscription: PushSubscription): Promise<boolean> {
  try {
    const endpoint = subscription.endpoint
    await subscription.unsubscribe()
    await deleteSubscription(endpoint)
    return true
  } catch (error) {
    console.error('Push unsubscribe failed:', error)
    return false
  }
}
