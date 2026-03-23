'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [adminId, setAdminId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // 관리자 로그인 API 호출
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || '관리자 ID 또는 비밀번호가 올바르지 않습니다.')
        return
      }

      router.push('/admin')
      router.refresh()
    } catch {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">행복안심동행</h1>
          <p className="mt-2 text-lg text-gray-600">관리자 로그인</p>
        </div>

        {/* 로그인 폼 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin_id" className="block text-base font-medium text-gray-700 mb-1">
                관리자 ID
              </label>
              <input
                type="text"
                id="admin_id"
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="관리자 ID 입력"
                required
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 text-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="6자리"
                  required
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700"
                  aria-label="비밀번호 표시/숨기기"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="min-h-[44px] w-full bg-primary text-white rounded-lg font-medium text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-base text-gray-600 hover:text-gray-900">
            일반 사용자 로그인
          </Link>
        </div>
      </div>
    </div>
  )
}
