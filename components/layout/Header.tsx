'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { HeartHandshake, Menu, X } from 'lucide-react'

const APP_NAME = '행복안심동행'

interface HeaderProps {
  user?: {
    name: string
    role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
  } | null
}

export default function Header({ user }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-5 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : ''
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group" aria-label={`${APP_NAME} 홈`}>
          <div className="bg-orange-500 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gray-900">
            행복안심<span className="text-orange-500">동행</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/about" className="text-lg text-gray-900 hover:text-orange-600 font-medium transition-colors">
            회사소개
          </Link>
          <Link href="/service-guide" className="text-lg text-gray-900 hover:text-orange-600 font-medium transition-colors">
            서비스이용
          </Link>
          <Link href="/faq" className="text-lg text-gray-900 hover:text-orange-600 font-medium transition-colors">
            자주 묻는 질문
          </Link>

          {user?.role === 'MANAGER' && (
            <>
              <Link href="/manager/requests" className="text-lg text-gray-900 hover:text-orange-600 font-medium transition-colors">
                새 요청
              </Link>
              <Link href="/manager/schedule" className="text-lg text-gray-900 hover:text-orange-600 font-medium transition-colors">
                내 일정
              </Link>
            </>
          )}

          {user ? (
            <>
              <span className="text-base text-gray-900">{user.name} 님</span>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  window.location.href = '/'
                }}
                className="text-lg px-6 py-3 rounded-full font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-gray-900 hover:text-orange-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/manager/recruit" className="text-lg text-gray-900 hover:text-orange-600 font-medium transition-colors">
                매니저 지원
              </Link>
              <Link href="/auth/login" className="text-lg px-6 py-2.5 rounded-full font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-900 hover:border-gray-400">
                회원 로그인
              </Link>
              <Link href="/auth/signup" className="text-lg px-6 py-2.5 rounded-full font-semibold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 bg-[#ffc000] hover:bg-[#e6ad00] text-gray-900 shadow-lg shadow-[#ffc000]/20">
                회원가입
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden p-2 text-gray-900 min-h-[44px] min-w-[44px]"
          aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden bg-white border-t`}>
        <nav className="px-4 py-4 space-y-1" aria-label="모바일 메뉴">
          <Link href="/about" className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
            회사소개
          </Link>
          <Link href="/service-guide" className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
            서비스이용
          </Link>
          <Link href="/faq" className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
            자주 묻는 질문
          </Link>

          {user?.role === 'MANAGER' && (
            <>
              <Link href="/manager/requests" className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                새 요청
              </Link>
              <Link href="/manager/schedule" className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                내 일정
              </Link>
            </>
          )}

          {user ? (
            <>
              <div className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900">
                {user.name} 님
              </div>
              <button
                onClick={async () => {
                  await fetch('/api/auth/logout', { method: 'POST' })
                  setMobileMenuOpen(false)
                  window.location.href = '/'
                }}
                className="min-h-[44px] w-full flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100 text-left"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/manager/recruit" className="min-h-[44px] flex items-center px-4 py-2 text-base font-medium text-gray-900 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                매니저 지원
              </Link>
              <Link href="/auth/login" className="min-h-[40px] flex items-center px-4 py-2 text-base font-medium text-gray-900 border-2 border-gray-300 rounded-lg hover:border-gray-400" onClick={() => setMobileMenuOpen(false)}>
                회원 로그인
              </Link>
              <Link href="/auth/signup" className="min-h-[40px] flex items-center px-4 py-2 text-base font-medium text-gray-900 bg-[#ffc000] rounded-lg hover:bg-[#e6ad00]" onClick={() => setMobileMenuOpen(false)}>
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </nav>
  )
}
