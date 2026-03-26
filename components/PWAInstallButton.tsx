'use client'

import { useState, useEffect, useCallback } from 'react'
import { Download, Share, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type BrowserType = 'inapp' | 'android' | 'ios' | 'desktop'

function detectBrowser(): BrowserType {
  if (typeof navigator === 'undefined') return 'desktop'
  const ua = navigator.userAgent

  if (/NAVER|KAKAOTALK|FB_IAB|Instagram|Line|DaumApps|SamsungBrowser.*CrossApp/i.test(ua)) {
    return 'inapp'
  }

  if (/Android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  return 'desktop'
}

export default function PWAInstallButton() {
  const [browserType, setBrowserType] = useState<BrowserType>('desktop')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    setBrowserType(detectBrowser())

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setIsInstalled(true))

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleClick = useCallback(async () => {
    if (browserType === 'inapp') {
      const url = 'https://donghaeng77.co.kr/manager/recruit'
      const intentUrl = `intent://${url.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end`
      window.location.href = intentUrl
      return
    }

    if (browserType === 'ios') {
      setShowIOSGuide(true)
      return
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
      return
    }

    setShowIOSGuide(true)
  }, [browserType, deferredPrompt])

  if (isInstalled) return null

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        <Download className="h-4 w-4" />
        앱 설치
      </button>

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">앱 설치 방법</h3>
              <button onClick={() => setShowIOSGuide(false)} className="p-1">
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">1</span>
                <p>하단의 <Share className="inline h-4 w-4 text-blue-600" /> <strong>공유</strong> 버튼을 누르세요</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">2</span>
                <p><strong>홈 화면에 추가</strong>를 선택하세요</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">3</span>
                <p>오른쪽 상단 <strong>추가</strong>를 누르면 완료!</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
