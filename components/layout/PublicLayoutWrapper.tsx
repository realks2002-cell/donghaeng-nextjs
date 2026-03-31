'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import HeaderWrapper from './HeaderWrapper'
import Footer from './Footer'
import BottomNavigation from './BottomNavigation'
import { isNativeApp } from '@/lib/capacitor'

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isApp, setIsApp] = useState(false)

  useEffect(() => {
    const native = isNativeApp()
    setIsApp(native)
    if (native) {
      document.documentElement.classList.add('native-app')
    }
  }, [])

  const isAdminPage = pathname.startsWith('/admin')
  const isManagerPage = pathname.startsWith('/manager') && !pathname.startsWith('/manager/recruit')
  const isMobilePayment = pathname === '/payment/mobile'

  if (isAdminPage || isManagerPage || isMobilePayment) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      {!isApp && <HeaderWrapper />}
      <main className={`flex-1 ${isApp ? 'pb-16' : ''}`}>{children}</main>
      {!isApp && <Footer />}
      <BottomNavigation />
    </div>
  )
}
