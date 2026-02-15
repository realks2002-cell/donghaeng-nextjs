'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    address: '',
    addressDetail: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [addressResults, setAddressResults] = useState<{ address: string }[]>([])
  const [isSearching, setIsSearching] = useState(false)

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const searchAddress = async () => {
    if (!formData.address.trim()) {
      setError('주소를 입력한 뒤 검색해주세요.')
      return
    }

    setIsSearching(true)
    setAddressResults([])

    try {
      const response = await fetch(`/api/address/search?keyword=${encodeURIComponent(formData.address)}`)
      const data = await response.json()

      if (data.success && data.items?.length > 0) {
        setAddressResults(data.items)
        setError('')
      } else {
        setError(data.message || '일치하는 주소를 찾지 못했습니다.')
      }
    } catch {
      setError('주소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectAddress = (address: string) => {
    updateField('address', address)
    setAddressResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // 유효성 검사
    if (!formData.terms) {
      setError('서비스 이용약관 및 개인정보 처리방침에 동의해주세요.')
      return
    }
    if (formData.password.length < 6) {
      setError('비밀번호는 6자 이상 입력해주세요.')
      return
    }
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!formData.name.trim()) {
      setError('이름을 입력해주세요.')
      return
    }
    if (!formData.phone.trim()) {
      setError('전화번호를 입력해주세요.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      // 전화번호 정규화 (숫자만)
      const normalizedPhone = formData.phone.replace(/[^0-9]/g, '')

      // 더미 이메일 생성 (Supabase Auth 요구사항)
      const dummyEmail = `user_${normalizedPhone}_${Date.now()}@dolbom.local`

      // Supabase Auth 회원가입
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dummyEmail,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: normalizedPhone,
          },
        },
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          setError('이미 사용 중인 전화번호입니다.')
        } else {
          setError(authError.message)
        }
        return
      }

      if (authData.user) {
        // users 테이블에 사용자 정보 저장
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersTable = supabase.from('users') as any
        const { error: insertError } = await usersTable.insert({
          auth_id: authData.user.id,
          email: dummyEmail,
          name: formData.name,
          phone: normalizedPhone,
          address: formData.address || null,
          address_detail: formData.addressDetail || null,
          role: 'CUSTOMER',
        })

        if (insertError) {
          console.error('User insert error:', insertError)
        }
      }

      // 회원가입 성공
      router.push('/auth/login?registered=true')
    } catch (err) {
      console.error('Signup error:', err)
      setError('회원가입 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-md mt-48 text-base">
        <h1 className="text-3xl font-bold">회원가입</h1>
        <p className="mt-2 text-lg text-gray-600">정보를 입력하세요.</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* 비밀번호 */}
          <div>
            <label htmlFor="password" className="block text-base font-medium text-gray-700">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => updateField('password', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12"
                placeholder="6자리"
                required
                autoComplete="new-password"
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

          {/* 비밀번호 확인 */}
          <div>
            <label htmlFor="passwordConfirm" className="block text-base font-medium text-gray-700">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                id="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={(e) => updateField('passwordConfirm', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 pr-12"
                placeholder="6자리"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700"
                aria-label="비밀번호 확인 표시/숨기기"
              >
                {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label htmlFor="name" className="block text-base font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="실명"
              required
              autoComplete="name"
            />
          </div>

          {/* 전화번호 */}
          <div>
            <label htmlFor="phone" className="block text-base font-medium text-gray-700">
              전화번호
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3"
              placeholder="010-1234-5678"
              required
            />
          </div>

          {/* 주소 */}
          <div>
            <label htmlFor="address" className="block text-base font-medium text-gray-700">
              주소
            </label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                id="address"
                value={formData.address}
                onChange={(e) => updateField('address', e.target.value)}
                className="block flex-1 rounded-lg border border-gray-300 px-4 py-3"
                placeholder="도로명 또는 지번 주소 입력 후 검색"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={searchAddress}
                disabled={isSearching || !formData.address.trim()}
                className="shrink-0 min-h-[44px] min-w-[44px] rounded-lg bg-primary px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? '검색 중…' : '주소 검색'}
              </button>
            </div>

            {/* 주소 검색 결과 */}
            {addressResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {addressResults.map((item, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectAddress(item.address)}
                    className="flex min-h-[44px] w-full items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm hover:bg-primary hover:text-white transition-colors"
                  >
                    {item.address}
                  </button>
                ))}
              </div>
            )}

            {/* 상세 주소 */}
            <div className="mt-2">
              <label htmlFor="addressDetail" className="block text-sm font-medium text-gray-700">
                상세 주소 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                type="text"
                id="addressDetail"
                value={formData.addressDetail}
                onChange={(e) => updateField('addressDetail', e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3"
                placeholder="동/호수 등"
              />
            </div>
          </div>

          {/* 약관 동의 */}
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              id="terms"
              checked={formData.terms}
              onChange={(e) => updateField('terms', e.target.checked)}
              className="mt-1"
              required
            />
            <label htmlFor="terms" className="text-base text-gray-700">
              서비스 이용약관 및 개인정보 처리방침에 동의합니다.
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex min-h-[44px] w-full items-center justify-center rounded-lg bg-primary text-lg font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <p className="mt-6 text-center text-base text-gray-600">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="font-medium text-primary hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
