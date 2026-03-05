'use client'

import { useState, useEffect, useCallback } from 'react'
import { subscribePush, unsubscribePush, saveSubscription, urlBase64ToUint8Array } from '@/lib/push-utils'
import type { SubscribeResult } from '@/lib/push-utils'

export type PushStatus = 'loading' | 'unsupported' | 'prompt' | 'denied' | 'subscribed'
export type DeniedReason = 'denied' | 'no-vapid' | 'error' | null

export function usePushNotification() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [deniedReason, setDeniedReason] = useState<DeniedReason>(null)
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
        } else {
          // Check if permission is already denied via PushManager API
          const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
          if (vapidKey) {
            try {
              const permState = await registration.pushManager.permissionState({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
              })
              if (permState === 'denied') {
                setDeniedReason('denied')
              }
            } catch {
              // permissionState not supported — ignore
            }
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
    setDeniedReason(null)
    try {
      const result: SubscribeResult = await subscribePush()
      if (result.ok) {
        setSubscription(result.subscription)
        return result.subscription
      } else {
        // Map failure reason
        if (result.reason === 'unsupported') {
          // Should not happen since isSupported is checked, but handle anyway
        } else {
          setDeniedReason(result.reason)
        }
        return null
      }
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
        setDeniedReason(null)
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
  } else if (deniedReason) {
    status = 'denied'
  } else {
    status = 'prompt'
  }

  return { status, deniedReason, subscription, subscribe, unsubscribe, retry, loading }
}
