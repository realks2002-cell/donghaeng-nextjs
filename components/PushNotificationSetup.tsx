'use client'

import { useEffect } from 'react'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

async function subscribeToPush() {
  // Capacitor 네이티브 앱에서는 FCM을 사용하므로 Web Push 건너뛰기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ('Capacitor' in window) {
    return
  }

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Check existing subscription
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      // Already subscribed, send to server to ensure it's saved
      await saveSubscription(existingSubscription)
      return
    }

    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    })

    await saveSubscription(subscription)
  } catch (error) {
    console.error('Push subscription failed:', error)
  }
}

async function saveSubscription(subscription: PushSubscription) {
  const key = subscription.getKey('p256dh')
  const auth = subscription.getKey('auth')

  if (!key || !auth) {
    console.error('Missing subscription keys')
    return
  }

  try {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        p256dh: btoa(Array.from(new Uint8Array(key), (b) => String.fromCharCode(b)).join('')),
        auth: btoa(Array.from(new Uint8Array(auth), (b) => String.fromCharCode(b)).join('')),
      }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      console.error(`Failed to save push subscription: ${response.status} ${text}`)
    } else {
      console.log('Push subscription saved successfully')
    }
  } catch (error) {
    console.error('Failed to save push subscription:', error)
  }
}

export default function PushNotificationSetup() {
  useEffect(() => {
    subscribeToPush()
  }, [])

  return null
}
