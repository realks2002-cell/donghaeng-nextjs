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

/**
 * Full push subscription flow: request permission -> subscribe -> save to server.
 * Must be called from a user gesture (click/tap) handler for iOS PWA compatibility.
 * Returns 'subscribed' | 'denied' | 'unsupported' | 'error'
 */
export async function subscribePush(): Promise<'subscribed' | 'denied' | 'unsupported' | 'error'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported'
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured')
    return 'error'
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return 'denied'
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
    return saved ? 'subscribed' : 'error'
  } catch (error) {
    console.error('Push subscription failed:', error)
    return 'error'
  }
}

/**
 * Re-subscribe silently when permission is already granted (e.g. on page reload).
 * Does NOT request permission - safe to call in useEffect.
 */
export async function resubscribeIfGranted(): Promise<boolean> {
  if (
    !('serviceWorker' in navigator) ||
    !('PushManager' in window) ||
    !('Notification' in window) ||
    !VAPID_PUBLIC_KEY
  ) {
    return false
  }

  if (Notification.permission !== 'granted') {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })
    }

    return await saveSubscription(subscription)
  } catch (error) {
    console.error('Push re-subscription failed:', error)
    return false
  }
}
