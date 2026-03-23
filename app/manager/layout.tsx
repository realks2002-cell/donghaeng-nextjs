import type { Metadata, Viewport } from 'next'
import ManagerLayoutClient from './ManagerLayoutClient'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

export const metadata: Metadata = {
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
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
