import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PublicLayoutWrapper from '@/components/layout/PublicLayoutWrapper'
import { Toaster } from 'sonner'

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <Toaster position="top-center" richColors />
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  )
}
