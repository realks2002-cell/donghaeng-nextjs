'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Calendar,
  ClipboardList,
  Menu,
  X,
  LogOut,
  Bell,
  BellOff,
  BellRing,
} from 'lucide-react'
import NotificationBanner from '@/components/NotificationBanner'
import { usePushNotification } from '@/components/hooks/usePushNotification'

const menuItems = [
  { href: '/manager/dashboard', label: '서비스 요청', icon: Home },
  { href: '/manager/dashboard?tab=matching', label: '내 매칭현황', icon: ClipboardList },
  { href: '/manager/schedule', label: '내 근무기록', icon: Calendar },
]

export default function ManagerLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { status: notifStatus, subscribe, unsubscribe, loading: notifLoading } = usePushNotification()

  const handleNotifToggle = async () => {
    if (notifLoading) return

    if (notifStatus === 'subscribed') {
      await unsubscribe()
    } else {
      // denied든 prompt든 항상 구독 시도. 실패하면 NotificationBanner가 안내.
      localStorage.removeItem('notif-denied-dismissed')
      await subscribe()
    }
  }

  // 로그인, 회원가입, 완료 페이지는 레이아웃 없이 렌더링
  if (
    pathname === '/manager/login' ||
    pathname === '/manager/signup' ||
    pathname === '/manager/signup-complete' ||
    pathname === '/manager/recruit'
  ) {
    return <>{children}</>
  }

  const isActive = (href: string) => {
    if (href.includes('?tab=matching')) {
      return pathname === '/manager/dashboard' &&
        (typeof window !== 'undefined' && window.location.search.includes('tab=matching'))
    }
    if (href === '/manager/dashboard') {
      return pathname === '/manager/dashboard' &&
        (typeof window === 'undefined' || !window.location.search.includes('tab=matching'))
    }
    return pathname.startsWith(href)
  }

  const handleLogout = async () => {
    try {
      localStorage.removeItem('manager_token')
      await fetch('/api/manager/logout', { method: 'POST' })
      router.push('/manager/login')
    } catch (error) {
      console.error('Logout error:', error)
      router.push('/manager/login')
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 - 데스크탑 */}
      <aside className="hidden w-64 bg-white border-r border-gray-200 md:block">
        <div className="flex flex-col h-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link href="/manager/dashboard" className="text-xl font-bold text-primary">
              행복안심동행 매니저
            </Link>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`min-h-[44px] flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* 알림 상태 + 로그아웃 */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            {notifStatus !== 'unsupported' && (
              <button
                onClick={handleNotifToggle}
                disabled={notifLoading}
                className="min-h-[44px] flex items-center gap-2 px-4 py-2 text-sm rounded-lg w-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {notifLoading ? (
                  <>
                    <Bell className="w-4 h-4 text-gray-400 animate-pulse" />
                    <span className="text-gray-500">처리 중...</span>
                  </>
                ) : notifStatus === 'subscribed' ? (
                  <>
                    <BellRing className="w-4 h-4 text-green-500" />
                    <span className="text-green-700">알림 켜짐</span>
                  </>
                ) : notifStatus === 'denied' ? (
                  <>
                    <BellOff className="w-4 h-4 text-red-500" />
                    <span className="text-red-600">알림 차단됨</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">알림 꺼짐</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={handleLogout}
              className="min-h-[44px] inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 모바일 헤더 */}
        <header className="sticky top-0 z-30 md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">행복안심동행 매니저</span>
            <div className="flex items-center gap-1">
              {notifStatus !== 'unsupported' && (
                <button
                  type="button"
                  onClick={handleNotifToggle}
                  disabled={notifLoading}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  {notifLoading ? (
                    <Bell className="w-5 h-5 text-gray-400 animate-pulse" />
                  ) : notifStatus === 'subscribed' ? (
                    <BellRing className="w-5 h-5 text-green-500" />
                  ) : notifStatus === 'denied' ? (
                    <BellOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Bell className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200">
            <nav className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`min-h-[44px] flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      active
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                )
              })}
              <hr className="my-2 border-gray-200" />
              <button
                onClick={handleLogout}
                className="min-h-[44px] flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                로그아웃
              </button>
            </nav>
          </div>
        )}

        {/* 콘텐츠 영역 */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50 relative z-0">
          <NotificationBanner />
          {children}
        </main>
      </div>
    </div>
  )
}
