'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

const BANKS = [
  '국민은행', '신한은행', '하나은행', '우리은행', '농협', '기업은행',
  '카카오뱅크', '케이뱅크', '수협은행', 'SC제일은행', '부산은행',
  '대구은행', '광주은행', '경남은행', '제주은행', '우체국', '토스뱅크',
]

export default function ManagerSignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    ssn: '',
    phone: '',
    address1: '',
    address2: '',
    bank: '',
    accountNumber: '',
    specialty: '',
    password: '',
    passwordConfirm: '',
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!terms) {
      setError('서비스 이용약관에 동의해주세요.')
      return
    }
    if (!privacy) {
      setError('개인정보 이용에 동의해주세요.')
      return
    }
    if (!formData.name) {
      setError('이름을 입력해주세요.')
      return
    }
    if (!formData.gender) {
      setError('성별을 선택해주세요.')
      return
    }
    if (!formData.ssn) {
      setError('주민번호를 입력해주세요.')
      return
    }
    if (!formData.phone) {
      setError('전화번호를 입력해주세요.')
      return
    }
    if (!formData.address1) {
      setError('주소를 입력해주세요.')
      return
    }
    if (!formData.bank) {
      setError('은행을 선택해주세요.')
      return
    }
    if (!formData.accountNumber) {
      setError('계좌번호를 입력해주세요.')
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

    setLoading(true)

    try {
      // FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name)
      submitData.append('gender', formData.gender)
      submitData.append('ssn', formData.ssn)
      submitData.append('phone', formData.phone)
      submitData.append('address1', formData.address1)
      submitData.append('address2', formData.address2)
      submitData.append('bank', formData.bank)
      submitData.append('accountNumber', formData.accountNumber)
      submitData.append('specialty', formData.specialty)
      submitData.append('password', formData.password)
      if (photo) {
        submitData.append('photo', photo)
      }

      const res = await fetch('/api/manager/signup', {
        method: 'POST',
        body: submitData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '회원가입에 실패했습니다.')
        setLoading(false)
        return
      }

      router.push('/manager/signup-complete')
    } catch (err) {
      console.error('Signup error:', err)
      setError('회원가입 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-2xl mt-12 text-base">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">행복안심동행</h1>
          <p className="mt-2 text-lg text-gray-600">매니저 회원가입</p>
        </div>

        {/* 회원가입 폼 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-base font-medium text-gray-700 mb-1">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="홍길동"
                required
              />
            </div>

            {/* 성별 */}
            <div>
              <label className="block text-base font-medium text-gray-700 mb-1">
                성별 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <label className="inline-flex items-center text-base cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="M"
                    checked={formData.gender === 'M'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300"
                    required
                  />
                  <span className="ml-2">남</span>
                </label>
                <label className="inline-flex items-center text-base cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="F"
                    checked={formData.gender === 'F'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary border-gray-300"
                    required
                  />
                  <span className="ml-2">여</span>
                </label>
              </div>
            </div>

            {/* 사진 업로드 */}
            <div>
              <label htmlFor="photo" className="block text-base font-medium text-gray-700 mb-1">
                사진 업로드
              </label>
              <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                className="block w-full text-base text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:bg-primary file:text-white"
              />
              {photoPreview && (
                <div className="mt-2">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                </div>
              )}
            </div>

            {/* 주민번호 */}
            <div>
              <label htmlFor="ssn" className="block text-base font-medium text-gray-700 mb-1">
                주민번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="ssn"
                name="ssn"
                value={formData.ssn}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="123456-1234567"
                required
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label htmlFor="phone" className="block text-base font-medium text-gray-700 mb-1">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="010-1234-5678"
                required
                autoComplete="tel"
              />
            </div>

            {/* 주소1 */}
            <div>
              <label htmlFor="address1" className="block text-base font-medium text-gray-700 mb-1">
                주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address1"
                name="address1"
                value={formData.address1}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="서울시 강남구 테헤란로 123"
                required
              />
            </div>

            {/* 주소2 */}
            <div>
              <label htmlFor="address2" className="block text-base font-medium text-gray-700 mb-1">
                상세주소
              </label>
              <input
                type="text"
                id="address2"
                name="address2"
                value={formData.address2}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="101동 101호"
              />
            </div>

            {/* 은행 선택 */}
            <div>
              <label htmlFor="bank" className="block text-base font-medium text-gray-700 mb-1">
                은행 <span className="text-red-500">*</span>
              </label>
              <select
                id="bank"
                name="bank"
                value={formData.bank}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="" disabled>은행을 선택하세요</option>
                {BANKS.map((bank) => (
                  <option key={bank} value={bank}>{bank}</option>
                ))}
              </select>
            </div>

            {/* 계좌번호 */}
            <div>
              <label htmlFor="accountNumber" className="block text-base font-medium text-gray-700 mb-1">
                계좌번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="accountNumber"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="123-456-789012"
                required
              />
            </div>

            {/* 특기 */}
            <div>
              <label htmlFor="specialty" className="block text-base font-medium text-gray-700 mb-1">
                특기
              </label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="예: 간병, 요리, 청소, 반려동물 돌봄 등"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="6자 이상"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-base font-medium text-gray-700 mb-1">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  id="passwordConfirm"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  className="min-h-[44px] block w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="6자 이상"
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPasswordConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* 약관 동의 */}
            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  required
                />
                <label htmlFor="terms" className="ml-2 text-base text-gray-700">
                  <a href="#" className="text-primary hover:underline">서비스 이용약관</a>에 동의합니다.{' '}
                  <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="privacy"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                  required
                />
                <label htmlFor="privacy" className="ml-2 text-base text-gray-700">
                  <a href="#" className="text-primary hover:underline">개인정보 이용</a>에 동의합니다.{' '}
                  <span className="text-red-500">*</span>
                </label>
              </div>
            </div>

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="min-h-[44px] w-full bg-primary text-white text-lg rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? '가입 중...' : '회원가입'}
            </button>
          </form>
        </div>

        {/* 하단 링크 */}
        <div className="mt-6 text-center">
          <p className="text-base text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/manager/login" className="text-primary hover:underline font-medium">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
