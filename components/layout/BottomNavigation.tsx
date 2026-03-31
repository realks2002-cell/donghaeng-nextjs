'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ClipboardList, Calendar, User } from 'lucide-react'
import { isNativeApp, setupBackButton } from '@/lib/capacitor'
import { createClient } from '@/lib/supabase/client'

const tabs = [
  { href: '/', label: '홈', icon: Home },
  { href: '/requests/new', label: '서비스 신청', icon: ClipboardList },
  { href: '/bookings', label: '내 예약', icon: Calendar },
  { href: '/auth/login?redirect=/bookings', label: '마이페이지', icon: User, authHref: '/bookings' },
]

export default function BottomNavigation() {
  const [isApp, setIsApp] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsApp(isNativeApp())
    setupBackButton()

    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsLoggedIn(!!user)
    }
    checkAuth()
  }, [pathname])

  if (!isApp) return null

  const hiddenPaths = ['/payment/']
  if (hiddenPaths.some(p => pathname.startsWith(p))) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden" aria-label="하단 네비게이션">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon, authHref }) => {
          const resolvedHref = authHref && isLoggedIn ? authHref : href
          const isActive = resolvedHref === '/' ? pathname === '/' : pathname.startsWith(resolvedHref)
          return (
            <Link
              key={label}
              href={resolvedHref}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors ${
                isActive ? 'text-orange-500' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
