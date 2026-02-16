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
  const [isTermsOpen, setIsTermsOpen] = useState(false)
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [addressResults, setAddressResults] = useState<{ address: string }[]>([])
  const [isSearchingAddress, setIsSearchingAddress] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const searchAddress = async () => {
    if (!formData.address1.trim()) {
      setError('주소를 입력한 뒤 검색해주세요.')
      return
    }
    setIsSearchingAddress(true)
    setAddressResults([])
    setError('')
    try {
      const res = await fetch(`/api/address/search?keyword=${encodeURIComponent(formData.address1)}`)
      const data = await res.json()
      if (data.success && data.items?.length > 0) {
        setAddressResults(data.items)
      } else {
        setError(data.message || '일치하는 주소를 찾지 못했습니다.')
      }
    } catch {
      setError('주소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearchingAddress(false)
    }
  }

  const selectAddress = (address: string) => {
    setFormData((prev) => ({ ...prev, address1: address }))
    setAddressResults([])
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
    if (!formData.ssn || !/^\d{6}-\d{7}$/.test(formData.ssn)) {
      setError('주민번호 13자리를 모두 입력해주세요.')
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
    <div className="min-h-screen bg-gray-50 px-4 py-12" style={{ paddingTop: '120px' }}>
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
              <label htmlFor="ssn_front" className="block text-base font-medium text-gray-700 mb-1">
                주민번호 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="ssn_front"
                  inputMode="numeric"
                  value={formData.ssn.split('-')[0] || ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                    const back = formData.ssn.split('-')[1] || ''
                    setFormData((prev) => ({ ...prev, ssn: back ? `${v}-${back}` : v }))
                    if (v.length === 6) {
                      document.getElementById('ssn_back')?.focus()
                    }
                  }}
                  maxLength={6}
                  className="min-h-[44px] w-[120px] rounded-lg border border-gray-300 px-4 py-2 text-center tracking-widest focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="700504"
                  required
                />
                <span className="text-xl text-gray-400 font-bold">-</span>
                <input
                  type="password"
                  id="ssn_back"
                  inputMode="numeric"
                  value={formData.ssn.split('-')[1] || ''}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 7)
                    const front = formData.ssn.split('-')[0] || ''
                    setFormData((prev) => ({ ...prev, ssn: `${front}-${v}` }))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !(formData.ssn.split('-')[1] || '')) {
                      document.getElementById('ssn_front')?.focus()
                    }
                  }}
                  maxLength={7}
                  className="min-h-[44px] w-[140px] rounded-lg border border-gray-300 px-4 py-2 text-center tracking-widest focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="1234567"
                  required
                />
              </div>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  id="address1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                  className="min-h-[44px] block flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="도로명 또는 지번 주소 입력 후 검색"
                  required
                />
                <button
                  type="button"
                  onClick={searchAddress}
                  disabled={isSearchingAddress || !formData.address1.trim()}
                  className="shrink-0 min-h-[44px] rounded-lg bg-primary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearchingAddress ? '검색 중...' : '주소 검색'}
                </button>
              </div>
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
              {/* 서비스 이용약관 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={() => setIsTermsOpen(!isTermsOpen)}
                  className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span>서비스 이용약관</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${isTermsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isTermsOpen && (
                  <div className="mt-3 max-h-48 overflow-y-auto rounded border border-gray-200 bg-white p-4 text-sm text-gray-600 leading-relaxed">
                    <p className="font-medium text-gray-700 mb-2">제1조 (목적)</p>
                    <p className="mb-3">본 약관은 행복안심동행(이하 &quot;회사&quot;)이 제공하는 돌봄 서비스 중개 플랫폼의 매니저 이용에 관한 사항을 규정합니다.</p>
                    <p className="font-medium text-gray-700 mb-2">제2조 (매니저의 의무)</p>
                    <p className="mb-3">매니저는 서비스 제공 시 성실히 업무를 수행하며, 고객의 개인정보를 보호해야 합니다. 서비스 예약을 수락한 후 정당한 사유 없이 취소할 수 없습니다.</p>
                    <p className="font-medium text-gray-700 mb-2">제3조 (수수료 및 정산)</p>
                    <p className="mb-3">서비스 완료 후 정산은 등록된 계좌로 진행되며, 플랫폼 수수료가 차감됩니다. 정산 주기 및 수수료율은 별도 공지합니다.</p>
                    <p className="font-medium text-gray-700 mb-2">제4조 (계정 해지)</p>
                    <p>매니저는 언제든지 탈퇴를 요청할 수 있으며, 진행 중인 서비스가 완료된 후 처리됩니다.</p>
                  </div>
                )}

                <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={(e) => setTerms(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    서비스 이용약관에 동의합니다 <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>

              {/* 개인정보 수집동의 */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={() => setIsPrivacyOpen(!isPrivacyOpen)}
                  className="flex w-full items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span>개인정보 수집 및 이용 안내</span>
                  <svg
                    className={`h-5 w-5 transition-transform ${isPrivacyOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {isPrivacyOpen && (
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="overflow-hidden rounded border border-gray-200 bg-white">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          <tr className="border-b">
                            <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">수집항목</td>
                            <td className="px-4 py-2.5">이름, 성별, 주민번호, 전화번호, 주소, 사진, 은행·계좌번호, 특기</td>
                          </tr>
                          <tr className="border-b">
                            <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">수집목적</td>
                            <td className="px-4 py-2.5">매니저 본인 확인, 서비스 매칭, 정산 처리</td>
                          </tr>
                          <tr className="border-b">
                            <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">보유기간</td>
                            <td className="px-4 py-2.5">회원 탈퇴 후 1년 (법령에 따른 보관 의무 시 해당 기간)</td>
                          </tr>
                          <tr>
                            <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">동의 거부</td>
                            <td className="px-4 py-2.5">동의를 거부할 수 있으나, 거부 시 매니저 가입이 불가합니다.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={privacy}
                    onChange={(e) => setPrivacy(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    개인정보 수집 및 이용에 동의합니다 <span className="text-red-500">*</span>
                  </span>
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
