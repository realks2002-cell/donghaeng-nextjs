'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X, RefreshCw } from 'lucide-react'
import { usePushNotification } from '@/components/hooks/usePushNotification'

function isPwaMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function NotificationBanner() {
  const { status, deniedReason, errorMessage, subscribe, retry, loading } = usePushNotification()
  const [dismissed, setDismissed] = useState(false)
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    setIsPwa(isPwaMode())
    if (localStorage.getItem('notif-denied-dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  // Hide banner for these states
  if (status === 'subscribed' || status === 'unsupported' || status === 'loading' || dismissed) {
    return null
  }

  // Denied — red banner with retry
  if (status === 'denied') {
    const isVapidMissing = deniedReason === 'no-vapid'
    const isError = deniedReason === 'error'
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <BellOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">
              {isVapidMissing
                ? '알림 서버 설정 오류'
                : isError
                  ? '알림 설정 중 오류가 발생했습니다'
                  : '알림이 차단되어 있습니다'}
            </p>
            <p className="mt-1 text-sm text-red-600">
              {isVapidMissing
                ? '푸시 알림 서버 키가 설정되지 않았습니다. 관리자에게 문의해 주세요.'
                : isError
                  ? '아래 오류 정보를 관리자에게 전달해 주세요.'
                  : isPwa
                    ? 'Android 설정 > 앱 > 동행매니저 > 알림에서 허용해 주세요.'
                    : '브라우저 주소창 왼쪽 자물쇠(🔒) 아이콘 > 알림 허용으로 변경해 주세요.'}
            </p>
            {errorMessage && (
              <p className="mt-1.5 break-all font-mono text-xs text-red-500">
                {errorMessage}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {!isVapidMissing && (
              <button
                onClick={async () => {
                  const sub = await retry()
                  if (sub) {
                    localStorage.removeItem('notif-denied-dismissed')
                  }
                }}
                disabled={loading}
                className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? '확인 중...' : '설정 변경 후 확인'}
              </button>
            )}
            <button
              onClick={() => { localStorage.setItem('notif-denied-dismissed', '1'); setDismissed(true) }}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-red-400 hover:text-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Prompt — blue banner
  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <Bell className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">알림을 켜주세요</p>
          <p className="mt-1 text-sm text-blue-600">
            새 서비스 요청이 들어오면 즉시 알림을 받을 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => subscribe()}
            disabled={loading}
            className="min-h-[44px] inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '설정 중...' : '알림 켜기'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-blue-400 hover:text-blue-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
