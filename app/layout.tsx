import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import HeaderWrapper from '@/components/layout/HeaderWrapper'
import Footer from '@/components/layout/Footer'
import { Toaster } from 'sonner'
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '행복안심동행 - 믿을 수 있는 병원동행과 돌봄 서비스',
  description: '병원 동행부터 가사, 육아, 일상 케어까지. 전문 교육을 이수한 매니저가 가족의 마음으로 함께합니다.',
  keywords: '병원동행, 돌봄서비스, 노인돌봄, 간병, 동행서비스, 아이돌봄, 가사동행',
  openGraph: {
    title: '행복안심동행 - 믿을 수 있는 병원동행과 돌봄 서비스',
    description: '병원 동행부터 가사, 육아, 일상 케어까지. 전문 교육을 이수한 매니저가 가족의 마음으로 함께합니다.',
    type: 'website',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  const isAdminPage = pathname.startsWith('/admin')
  const isManagerPage = pathname.startsWith('/manager')

  // 관리자/매니저 페이지는 헤더/푸터 없이 렌더링 (자체 레이아웃 사용)
  if (isAdminPage || isManagerPage) {
    return (
      <html lang="ko">
        <head>
          {isManagerPage && (
            <>
              <link rel="manifest" href="/manifest.json" />
              <meta name="theme-color" content="#16a34a" />
              <meta name="apple-mobile-web-app-capable" content="yes" />
              <meta name="apple-mobile-web-app-status-bar-style" content="default" />
              <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
              <meta name="apple-mobile-web-app-title" content="동행매니저" />
              <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
            </>
          )}
        </head>
        <body className={`${inter.className} antialiased min-h-screen`}>
          <Toaster position="top-center" richColors />
          {isManagerPage && <ServiceWorkerRegistration />}
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Toaster position="top-center" richColors />
        <HeaderWrapper />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
