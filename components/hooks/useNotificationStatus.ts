'use client'

import { useState, useEffect, useCallback } from 'react'

export type NotificationStatus =
  | 'unsupported'  // Browser doesn't support notifications/push
  | 'default'      // Permission not yet requested
  | 'denied'       // User blocked notifications
  | 'granted'      // Permission granted but not yet subscribed
  | 'subscribed'   // Permission granted AND push subscription active

export function useNotificationStatus() {
  const [status, setStatus] = useState<NotificationStatus>('unsupported')

  const checkStatus = useCallback(async () => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !('Notification' in window)
    ) {
      setStatus('unsupported')
      return
    }

    const permission = Notification.permission
    if (permission === 'denied') {
      setStatus('denied')
      return
    }

    if (permission === 'default') {
      setStatus('default')
      return
    }

    // permission === 'granted' — check if there's an active subscription
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setStatus(subscription ? 'subscribed' : 'granted')
    } catch {
      setStatus('granted')
    }
  }, [])

  useEffect(() => {
    checkStatus()
  }, [checkStatus])

  return { status, recheckStatus: checkStatus }
}
