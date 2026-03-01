'use client'

import { usePathname } from 'next/navigation'
import HeaderWrapper from './HeaderWrapper'
import Footer from './Footer'

export default function PublicLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdminPage = pathname.startsWith('/admin')
  const isManagerPage = pathname.startsWith('/manager') && !pathname.startsWith('/manager/recruit')

  if (isAdminPage || isManagerPage) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <HeaderWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
