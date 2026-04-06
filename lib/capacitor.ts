import { API_BASE } from '@/lib/api-base'

export function isNativeApp(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return typeof window !== 'undefined' && !!(window as any).Capacitor
}

let backButtonInitialized = false

export async function registerFcmToken() {
  if (!isNativeApp()) return

  // 이미 서버에 등록된 토큰이면 스킵
  const existingToken = localStorage.getItem('manager_fcm_token_registered')
  if (existingToken) return

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = window as any
    if (!win.Capacitor?.Plugins?.PushNotifications) {
      console.warn('[FCM] PushNotifications 플러그인 없음')
      return
    }

    const PushNotifications = win.Capacitor.Plugins.PushNotifications

    const permStatus = await PushNotifications.checkPermissions()
    if (permStatus.receive === 'prompt') {
      const result = await PushNotifications.requestPermissions()
      if (result.receive !== 'granted') return
    } else if (permStatus.receive !== 'granted') {
      return
    }

    PushNotifications.addListener('registration', async (token: { value: string }) => {
      console.log('[FCM] 토큰 수신:', token.value.substring(0, 20) + '...')
      localStorage.setItem('manager_fcm_token', token.value)

      const managerToken = localStorage.getItem('manager_token')
      if (!managerToken) {
        console.warn('[FCM] manager_token 없음, 서버 등록 보류')
        return
      }

      try {
        const res = await fetch(`${API_BASE}/api/push/fcm-subscribe`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${managerToken}`,
          },
          body: JSON.stringify({ fcm_token: token.value }),
        })

        if (res.ok) {
          console.log('[FCM] 서버 등록 성공')
          localStorage.setItem('manager_fcm_token_registered', token.value)
        } else {
          console.error('[FCM] 서버 등록 실패:', res.status, await res.text().catch(() => ''))
        }
      } catch (err) {
        console.error('[FCM] 서버 등록 에러:', err)
      }
    })

    PushNotifications.addListener('registrationError', (err: { error: string }) => {
      console.error('[FCM] 등록 에러:', err.error)
    })

    await PushNotifications.register()
  } catch (err) {
    console.error('[FCM] registerFcmToken 에러:', err)
  }
}

export async function setupBackButton() {
  if (!isNativeApp() || backButtonInitialized) return
  backButtonInitialized = true

  const { App } = await import('@capacitor/app')

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back()
    } else {
      App.minimizeApp()
    }
  })
}
