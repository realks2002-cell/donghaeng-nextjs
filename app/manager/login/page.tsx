'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'

export default function ManagerLoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 허용
    const value = e.target.value.replace(/[^0-9]/g, '')
    setPhone(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!phone || !password) {
      setError('전화번호와 비밀번호를 입력해주세요.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/manager/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '로그인에 실패했습니다.')
        setLoading(false)
        return
      }

      router.push('/manager/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError('로그인 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Image
            src="/images/app-logo.png"
            alt="행복안심동행 로고"
            width={120}
            height={91}
            className="mx-auto mb-4"
            priority
          />
          <h1 className="text-3xl font-bold text-primary">행복안심동행</h1>
          <p className="mt-2 text-gray-600">매니저 로그인</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="01012345678"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required
                  autoComplete="off"
                />
                <p className="mt-1 text-xs text-gray-500">숫자만 입력해주세요</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="6자리"
                    required
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label="비밀번호 표시/숨기기"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] w-full bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </div>
          </form>
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/manager/signup" className="text-primary hover:underline font-medium">
              회원가입
            </Link>
          </p>
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            일반 사용자 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
