'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const supabase = createClient()

      // 전화번호 정규화 (숫자만)
      const normalizedPhone = phone.replace(/[^0-9]/g, '')

      if (!normalizedPhone) {
        setError('전화번호를 입력해주세요.')
        setIsLoading(false)
        return
      }

      // 전화번호로 사용자 이메일 조회
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const usersTable = supabase.from('users') as any
      const { data: userData, error: userError } = await usersTable
        .select('email')
        .eq('phone', normalizedPhone)
        .single()

      if (userError || !userData) {
        setError('전화번호 또는 비밀번호가 올바르지 않습니다.')
        setIsLoading(false)
        return
      }

      // 조회된 이메일로 로그인
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password,
      })

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('전화번호 또는 비밀번호가 올바르지 않습니다.')
        } else {
          setError(authError.message)
        }
        return
      }

      router.push(redirect)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gray-50 px-4 pt-[250px]">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold">로그인</h1>
        <p className="mt-2 text-lg text-gray-600">전화번호와 비밀번호를 입력하세요.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="phone" className="block text-base font-medium text-gray-700">
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onInput={(e) => {
                const target = e.target as HTMLInputElement
                target.value = target.value.replace(/[^0-9]/g, '')
                setPhone(target.value)
              }}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="01012345678"
              pattern="[0-9]*"
              inputMode="numeric"
              required
              autoComplete="off"
            />
            <p className="mt-1 text-sm text-gray-500">숫자만 입력해주세요</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12 text-lg focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <Link href="#" className="mt-1 block text-base text-primary hover:underline">
              비밀번호를 잊으셨나요?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary font-medium text-lg text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-6 text-center text-base text-gray-600">
          계정이 없으신가요?{' '}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
