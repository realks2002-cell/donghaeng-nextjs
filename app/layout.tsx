import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  const isAdminPage = pathname.startsWith('/admin')

  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let user = null
  if (authUser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = supabase.from('users') as any
    const { data: userData } = await usersTable
      .select('name, role')
      .eq('auth_id', authUser.id)
      .single()

    if (userData) {
      user = {
        name: userData.name as string,
        role: userData.role as 'CUSTOMER' | 'MANAGER' | 'ADMIN',
      }
    }
  }

  // 관리자 페이지는 헤더/푸터 없이 렌더링
  if (isAdminPage) {
    return (
      <html lang="ko">
        <body className={`${inter.className} antialiased min-h-screen`}>
          <Toaster position="top-center" richColors />
          {children}
        </body>
      </html>
    )
  }

  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased min-h-screen flex flex-col`}>
        <Toaster position="top-center" richColors />
        <Header user={user} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
