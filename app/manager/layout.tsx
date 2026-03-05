import type { Metadata, Viewport } from 'next'
import ManagerLayoutClient from './ManagerLayoutClient'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: '동행매니저',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ServiceWorkerRegistration />
      <ManagerLayoutClient>{children}</ManagerLayoutClient>
    </>
  )
}
