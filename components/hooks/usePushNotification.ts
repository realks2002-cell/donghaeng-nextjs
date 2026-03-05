'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribePush, unsubscribePush, saveSubscription } from '@/lib/push-utils'

export type PushStatus = 'loading' | 'unsupported' | 'prompt' | 'denied' | 'subscribed'

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [subscribeFailed, setSubscribeFailed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator &&
      'PushManager' in window

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
          await saveSubscription(existingSub).catch(() => {})
          setSubscription(existingSub)
        }
        // No existing subscription → show prompt banner (user clicks to subscribe)
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
    setSubscribeFailed(false)
    try {
      const sub = await subscribePush()
      if (sub) {
        setSubscription(sub)
      } else {
        // subscribePush returned null → user denied or error
        setSubscribeFailed(true)
      }
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
        setSubscribeFailed(false)
      }
      return ok
    } finally {
      setLoading(false)
    }
  }, [subscription])

  const retry = subscribe

  let status: PushStatus
  if (loading) {
    status = 'loading'
  } else if (!isSupported) {
    status = 'unsupported'
  } else if (subscription) {
    status = 'subscribed'
  } else if (subscribeFailed) {
    status = 'denied'
  } else {
    status = 'prompt'
  }

  return { status, subscription, subscribe, unsubscribe, retry, loading }
}
