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
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return
  }

  if (!VAPID_PUBLIC_KEY) {
    console.warn('VAPID public key not configured')
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready

    // Request notification permission
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return
    }

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription()

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })
    }

    // Always save to ensure keys are stored correctly
    await saveSubscription(subscription)
  } catch (error) {
    console.error('Push subscription failed:', error)
  }
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
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
        p256dh: arrayBufferToBase64Url(key),
        auth: arrayBufferToBase64Url(auth),
      }),
    })

    if (!response.ok) {
      console.error('Failed to save push subscription')
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
