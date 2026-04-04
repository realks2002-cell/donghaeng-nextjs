'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Phone, Home, ClipboardList, Calendar } from 'lucide-react'
import { isNativeApp, setupBackButton } from '@/lib/capacitor'

const HELPDESK_TEL = 'tel:1668-5535'

const tabs = [
  { href: '/manager/dashboard', label: '서비스 요청', icon: Home },
  { href: '/manager/dashboard?tab=matching', label: '매칭현황', icon: ClipboardList },
  { href: '/manager/schedule', label: '근무기록', icon: Calendar },
]

function BottomNavContent() {
  const [isApp, setIsApp] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')

  useEffect(() => {
    setIsApp(isNativeApp())
    setupBackButton()
  }, [])

  if (!isApp) return null

  const hiddenPaths = ['/manager/login', '/manager/signup', '/manager/signup-complete', '/manager/recruit']
  if (hiddenPaths.some(p => pathname === p)) return null

  const isTabActive = (href: string) => {
    if (href.includes('?tab=matching')) {
      return pathname === '/manager/dashboard' && currentTab === 'matching'
    }
    if (href === '/manager/dashboard') {
      return pathname === '/manager/dashboard' && currentTab !== 'matching'
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 manager-bottom-nav"
      aria-label="하단 네비게이션"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = isTabActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </Link>
          )
        })}
        <a
          href={HELPDESK_TEL}
          className="flex flex-col items-center justify-center gap-1 min-w-[64px] min-h-[44px] text-gray-500 transition-colors"
        >
          <Phone className="w-5 h-5" strokeWidth={2} />
          <span className="text-[10px] font-medium">헬프데스크</span>
        </a>
      </div>
    </nav>
  )
}

export default function ManagerBottomNavigation() {
  return (
    <Suspense>
      <BottomNavContent />
    </Suspense>
  )
}
