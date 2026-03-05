'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { resubscribeIfGranted } from '@/lib/push-utils'

/**
 * Silent push re-subscription component.
 * Only re-subscribes when permission is already 'granted' (from a previous session).
 * Does NOT call Notification.requestPermission() — that must happen via user gesture
 * in NotificationBanner.
 */
export default function PushNotificationSetup() {
  const pathname = usePathname()
  const subscribedRef = useRef(false)

  useEffect(() => {
    if (pathname === '/manager/login' || pathname === '/manager/signup') {
      return
    }

    if (subscribedRef.current) {
      return
    }

    resubscribeIfGranted().then((ok) => {
      if (ok) subscribedRef.current = true
    })
  }, [pathname])

  return null
}
