'use client'

import { useEffect, useState } from 'react'
import { Bell, BellOff, X } from 'lucide-react'

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

type PushState = 'loading' | 'subscribed' | 'not-subscribed' | 'denied' | 'unsupported'

const DISMISSED_KEY = 'push_banner_dismissed'

export default function PushNotificationBanner() {
  const [state, setState] = useState<PushState>('loading')
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(DISMISSED_KEY) === 'true'
    }
    return false
  })
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    checkPushState()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkPushState()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  async function checkPushState() {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setState('unsupported')
      return
    }

    if (!VAPID_PUBLIC_KEY) {
      setState('unsupported')
      return
    }

    const permission = Notification.permission
    if (permission === 'denied') {
      setState('denied')
      return
    }

    // permission이 granted 또는 default든, 실제 subscription 존재 여부로 판단
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        setState('subscribed')
        return
      }
    } catch {
      // SW 접근 실패 시 아래로 진행
    }

    // subscription이 없는 경우
    setState('not-subscribed')
  }

  async function handleSubscribe() {
    setSubscribing(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState('denied')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      })

      const key = subscription.getKey('p256dh')
      const auth = subscription.getKey('auth')
      if (key && auth) {
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
            p256dh: btoa(Array.from(new Uint8Array(key), (b) => String.fromCharCode(b)).join('')),
            auth: btoa(Array.from(new Uint8Array(auth), (b) => String.fromCharCode(b)).join('')),
          }),
        })
      }

      setState('subscribed')
    } catch (error) {
      console.error('Push subscribe error:', error)
    } finally {
      setSubscribing(false)
    }
  }

  // Capacitor 네이티브 앱에서는 FCM 사용하므로 배너 숨기기
  // Don't show banner if subscribed, loading, unsupported, or dismissed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (state === 'loading' || state === 'subscribed' || state === 'unsupported' || dismissed || (typeof window !== 'undefined' && 'Capacitor' in window)) {
    return null
  }

  return (
    <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-3 flex items-center gap-3">
      <BellOff className="w-5 h-5 text-orange-500 shrink-0" />
      <div className="flex-1 text-sm">
        {state === 'denied' ? (
          <span className="text-orange-800">
            알림이 차단되어 있습니다. 브라우저 설정에서 알림을 허용해주세요.
          </span>
        ) : (
          <span className="text-orange-800">
            새로운 서비스 요청 알림을 받으려면 알림을 켜주세요.
          </span>
        )}
      </div>
      {state === 'not-subscribed' && (
        <button
          onClick={handleSubscribe}
          disabled={subscribing}
          className="min-h-[36px] px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
        >
          <Bell className="w-4 h-4" />
          {subscribing ? '설정 중...' : '알림 켜기'}
        </button>
      )}
      <button
        onClick={() => {
          setDismissed(true)
          localStorage.setItem(DISMISSED_KEY, 'true')
        }}
        className="text-orange-400 hover:text-orange-600 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
