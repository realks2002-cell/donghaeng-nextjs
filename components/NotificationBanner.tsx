'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff, X, AlertTriangle, RefreshCw } from 'lucide-react'
import { useNotificationStatus } from '@/components/hooks/useNotificationStatus'
import { subscribePush } from '@/lib/push-utils'

function isPwaMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export default function NotificationBanner() {
  const { status, recheckStatus } = useNotificationStatus()
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [serverError, setServerError] = useState(false)
  const [isPwa, setIsPwa] = useState(false)

  useEffect(() => {
    setIsPwa(isPwaMode())
    // denied 배너를 이전에 닫았으면 다시 표시하지 않음
    if (localStorage.getItem('notif-denied-dismissed') === '1') {
      setDismissed(true)
    }
  }, [])

  const handleEnable = async () => {
    setLoading(true)
    setServerError(false)
    try {
      const result = await subscribePush()
      if (result === 'error') {
        setServerError(true)
        return
      }
      await recheckStatus()
    } finally {
      setLoading(false)
    }
  }

  const handleRecheck = async () => {
    setLoading(true)
    try {
      await recheckStatus()
      // 권한이 granted로 바뀌었으면 자동으로 구독 시도
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        localStorage.removeItem('notif-denied-dismissed')
        await subscribePush()
        await recheckStatus()
      }
    } finally {
      setLoading(false)
    }
  }

  // Server save failed — show error with retry
  if (serverError) {
    return (
      <div className="mb-4 rounded-lg border border-orange-200 bg-orange-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-orange-800">알림 설정에 실패했습니다</p>
            <p className="mt-1 text-sm text-orange-600">
              서버에 알림 정보를 저장하지 못했습니다. 다시 시도해 주세요.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleEnable}
              disabled={loading}
              className="min-h-[44px] inline-flex items-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? '재시도 중...' : '다시 시도'}
            </button>
            <button
              onClick={() => { setDismissed(true); setServerError(false) }}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-orange-400 hover:text-orange-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Already subscribed or dismissed — hide banner
  if (status === 'subscribed' || dismissed) {
    return null
  }

  // Unsupported browser — hide silently
  if (status === 'unsupported') {
    return null
  }

  // Denied — show warning with specific instructions
  if (status === 'denied') {
    return (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <BellOff className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">알림이 차단되어 있습니다</p>
            <p className="mt-1 text-sm text-red-600">
              {isPwa
                ? 'Android 설정 > 앱 > 동행매니저 > 알림에서 허용해 주세요.'
                : '브라우저 주소창 왼쪽 자물쇠(🔒) 아이콘 > 알림 허용으로 변경해 주세요.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecheck}
              disabled={loading}
              className="min-h-[44px] inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? '확인 중...' : '설정 변경 후 확인'}
            </button>
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

  // Default or granted-but-not-subscribed — show enable button
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
            onClick={handleEnable}
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
