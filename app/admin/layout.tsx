'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Users,
  ShieldCheck,
  UserPlus,
  ClipboardList,
  CheckCircle,
  XCircle,
  CreditCard,
  BarChart3,
  DollarSign,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: '대시보드', icon: Home },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/managers', label: '매니저 관리', icon: ShieldCheck, dividerAfter: true },
  { href: '/admin/manager-applications', label: '매니저 지원확인', icon: UserPlus },
  { href: '/admin/requests', label: '예약요청 및 매칭 현황', icon: ClipboardList },
  { href: '/admin/designated-matching', label: '지정 매니저 매칭', icon: CheckCircle, dividerAfter: true },
  { href: '/admin/payments', label: '결제 내역 조회', icon: CreditCard },
  { href: '/admin/refund-info', label: '취소요청 및 환불', icon: XCircle },
  { href: '/admin/revenue', label: '일/월 매출 집계', icon: BarChart3, dividerAfter: true },
  { href: '/admin/service-prices', label: '서비스 가격 설정', icon: DollarSign },
  { href: '/admin/settings', label: '관리자 설정', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 로그인 페이지는 사이드바 없이 렌더링
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 - 데스크탑 */}
      <aside className="hidden w-64 bg-white border-r border-gray-200 md:block">
        <div className="flex flex-col h-full">
          {/* 로고 */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200">
            <Link href="/admin" className="text-xl font-bold text-primary">
              행복안심동행 관리자
            </Link>
          </div>

          {/* 메뉴 */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <div key={item.href}>
                  <Link
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
                  {item.dividerAfter && <hr className="my-3 border-gray-200" />}
                </div>
              )
            })}
          </nav>

          {/* 하단 정보 */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              <div className="font-medium">관리자</div>
            </div>
            <Link
              href="/admin/logout"
              className="mt-3 min-h-[35px] inline-flex items-center justify-center w-full px-3 py-1.5 text-sm font-bold text-red-400 border border-red-200 rounded-lg hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Link>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 모바일 헤더 */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-primary">행복안심동행 관리자</span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
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
                  <div key={item.href}>
                    <Link
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
                    {item.dividerAfter && <hr className="my-3 border-gray-200" />}
                  </div>
                )
              })}
            </nav>
          </div>
        )}

        {/* 콘텐츠 영역 */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
