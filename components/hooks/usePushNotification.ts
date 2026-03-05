'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribePush, unsubscribePush, saveSubscription, urlBase64ToUint8Array } from '@/lib/push-utils'

export type PushStatus = 'loading' | 'unsupported' | 'prompt' | 'denied' | 'subscribed'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)

    if (!supported) {
      setLoading(false)
      return
    }

    async function init() {
      try {
        const registration = await navigator.serviceWorker.ready
        const existingSub = await registration.pushManager.getSubscription()

        if (existingSub) {
          // Re-save to server to keep DB in sync
          await saveSubscription(existingSub)
          setSubscription(existingSub)
        } else if (Notification.permission === 'granted' && VAPID_PUBLIC_KEY) {
          // Permission granted from previous session but no subscription — auto-resubscribe
          try {
            const newSub = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
            })
            const saved = await saveSubscription(newSub)
            if (saved) {
              setSubscription(newSub)
            }
          } catch {
            // Failed to auto-resubscribe, user can retry manually
          }
        }
      } catch {
        // SW not ready or other error
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const subscribe = useCallback(async () => {
    setLoading(true)
    try {
      const sub = await subscribePush()
      setSubscription(sub)
      return sub
    } finally {
      setLoading(false)
    }
  }, [])

  const unsubscribe = useCallback(async () => {
    if (!subscription) return false
    setLoading(true)
    try {
      const ok = await unsubscribePush(subscription)
      if (ok) {
        setSubscription(null)
      }
      return ok
    } finally {
      setLoading(false)
    }
  }, [subscription])

  // retry is same as subscribe — calls requestPermission again
  const retry = subscribe

  let status: PushStatus
  if (loading) {
    status = 'loading'
  } else if (!isSupported) {
    status = 'unsupported'
  } else if (subscription) {
    status = 'subscribed'
  } else if (typeof Notification !== 'undefined' && Notification.permission === 'denied') {
    status = 'denied'
  } else {
    status = 'prompt'
  }

  return { status, subscription, subscribe, unsubscribe, retry, loading }
}
