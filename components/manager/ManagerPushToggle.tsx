'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { isNativeApp } from '@/lib/capacitor'
import { toast } from 'sonner'
import { managerFetch } from '@/lib/api-base'

const PUSH_STORAGE_KEY = 'manager_push_enabled'
const FCM_TOKEN_KEY = 'manager_fcm_token'

async function requestFcmToken(): Promise<string | null> {
  // google-services.json 미설정 시 네이티브 크래시 방지: localStorage에 저장된 토큰만 사용
  return localStorage.getItem(FCM_TOKEN_KEY)
}

export default function ManagerPushToggle() {
  const [isApp, setIsApp] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [pushLoading, setPushLoading] = useState(false)

  useEffect(() => {
    if (!isNativeApp()) return
    setIsApp(true)
    const stored = localStorage.getItem(PUSH_STORAGE_KEY)
    if (stored !== null) {
      setPushEnabled(stored === 'true')
    } else {
      managerFetch('/api/manager/push-toggle')
        .then(res => res.json())
        .then(data => {
          setPushEnabled(data.enabled ?? true)
          localStorage.setItem(PUSH_STORAGE_KEY, String(data.enabled ?? true))
        })
        .catch(() => {})
    }
  }, [])

  const handleToggle = useCallback(async () => {
    if (pushLoading) return
    setPushLoading(true)

    try {
      if (pushEnabled) {
        const res = await managerFetch('/api/manager/push-toggle', { method: 'DELETE' })
        if (res.ok) {
          setPushEnabled(false)
          localStorage.setItem(PUSH_STORAGE_KEY, 'false')
          toast.success('알림이 꺼졌습니다')
        }
      } else {
        let fcmToken = localStorage.getItem(FCM_TOKEN_KEY)
        if (!fcmToken) {
          fcmToken = await requestFcmToken()
        }
        if (fcmToken) {
          const res = await managerFetch('/api/manager/push-toggle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fcm_token: fcmToken }),
          })
          if (res.ok) {
            setPushEnabled(true)
            localStorage.setItem(PUSH_STORAGE_KEY, 'true')
            toast.success('알림이 켜졌습니다')
          }
        } else {
          setPushEnabled(true)
          localStorage.setItem(PUSH_STORAGE_KEY, 'true')
          toast.success('알림이 켜졌습니다')
        }
      }
    } catch {
      toast.error('알림 설정 변경에 실패했습니다')
    } finally {
      setPushLoading(false)
    }
  }, [pushEnabled, pushLoading])

  if (!isApp) return null

  const Icon = pushEnabled ? Bell : BellOff

  return (
    <button
      onClick={handleToggle}
      disabled={pushLoading}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
        pushEnabled ? 'text-green-600' : 'text-gray-400'
      } disabled:opacity-50`}
      aria-label={pushEnabled ? '알림 끄기' : '알림 켜기'}
    >
      <Icon className="w-5 h-5" strokeWidth={pushEnabled ? 2.5 : 2} />
    </button>
  )
}
