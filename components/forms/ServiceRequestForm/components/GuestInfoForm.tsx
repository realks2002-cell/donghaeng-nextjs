'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useFormContext } from '../context/FormContext'
import { validateKoreanPhone, formatKoreanPhone } from '@/lib/utils/validation'

interface AddressResult {
  address: string
  jibunAddress?: string
  zipCode?: string
  buildingName?: string
}

interface GuestInfoFormProps {
  isLoggedIn?: boolean
}

export default function GuestInfoForm({ isLoggedIn = false }: GuestInfoFormProps) {
  const router = useRouter()
  const { formData, updateFormData } = useFormContext()
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [searchResults, setSearchResults] = useState<AddressResult[]>([])
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(isLoggedIn)

  // 로그인한 사용자 정보 자동 채우기 (한 번만 실행)
  useEffect(() => {
    async function loadUserInfo() {
      if (!isLoggedIn) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setIsLoading(false)
          return
        }

        // users 테이블에서 정보 조회
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: userData, error } = await (supabase.from('users') as any)
          .select('name, phone, address, address_detail')
          .eq('auth_id', user.id)
          .single()

        if (error || !userData) {
          console.error('[GuestInfoForm] Failed to load user data:', error)
          toast.error('사용자 정보를 불러오는데 실패했습니다.')
          setIsLoading(false)
          return
        }

        // 폼 데이터에 자동 채우기
        updateFormData({
          guestName: (userData.name as string) || '',
          guestPhone: formatKoreanPhone((userData.phone as string) || ''),
          guestAddress: (userData.address as string) || '',
          guestAddressDetail: (userData.address_detail as string) || '',
        })

        setIsLoading(false)
      } catch (err) {
        console.error('[GuestInfoForm] Error loading user info:', err)
        setIsLoading(false)
      }
    }

    loadUserInfo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]) // updateFormData 제거 - 무한 루프 방지

  const handleAddressSearch = async () => {
    if (!formData.guestAddress.trim()) {
      setSearchMessage('주소를 입력한 뒤 검색해주세요.')
      return
    }

    setIsSearching(true)
    setSearchMessage('')
    setSearchResults([])

    try {
      const res = await fetch(`/api/address/search?keyword=${encodeURIComponent(formData.guestAddress)}`)
      const result = await res.json()

      if (result.success && result.items?.length > 0) {
        if (result.items.length === 1) {
          // 결과 1개: 자동 선택
          selectAddress(result.items[0])
        } else {
          // 결과 여러 개: 목록 표시
          setSearchResults(result.items)
          setSearchMessage(`아래에서 주소를 선택해주세요 (${result.items.length}개)`)
        }
      } else {
        setSearchMessage(result.message || '일치하는 주소를 찾지 못했습니다.')
      }
    } catch (error) {
      console.error('Address search error:', error)
      setSearchMessage('주소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectAddress = (item: AddressResult) => {
    updateFormData({
      guestAddress: item.address,
      guestLat: 0,
      guestLng: 0,
    })
    setSearchResults([])
    setSearchMessage('주소가 선택되었습니다.')
  }

  const handleNext = () => {
    // 로그인한 회원은 검증 건너뛰기
    if (isLoggedIn) {
      router.push('/requests/new/service')
      return
    }

    if (!formData.guestName.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }
    if (!formData.guestPhone.trim()) {
      toast.error('전화번호를 입력해주세요.')
      return
    }
    if (!validateKoreanPhone(formData.guestPhone)) {
      toast.error('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
      return
    }
    if (!formData.guestAddress.trim()) {
      toast.error('주소를 입력해주세요.')
      return
    }
    // 비회원만 개인정보 동의 확인
    if (!isLoggedIn && !formData.privacyConsent) {
      toast.error('개인정보 수집 및 이용에 동의해주세요.')
      return
    }
    router.push('/requests/new/service')
  }

  const handlePrev = () => {
    router.back()
  }

  // 로딩 중 표시
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse space-y-4 w-full">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">신청자 정보를 입력해주세요</h2>
      <p className="mt-2 text-sm text-gray-600">
        {isLoggedIn
          ? '로그인한 회원 정보가 자동으로 입력되었습니다.'
          : '서비스 신청을 위해 연락받으실 정보를 입력해주세요.'}
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            type="text"
            id="guest_name"
            value={formData.guestName}
            onChange={(e) => updateFormData({ guestName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="이름을 입력하세요"
            readOnly={isLoggedIn}
          />
        </div>

        <div>
          <label htmlFor="guest_phone" className="block text-sm font-medium text-gray-700">
            전화번호
          </label>
          <input
            type="tel"
            id="guest_phone"
            value={formData.guestPhone}
            onChange={(e) => {
              const formatted = formatKoreanPhone(e.target.value)
              updateFormData({ guestPhone: formatted })
            }}
            maxLength={13}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="010-1234-5678"
            readOnly={isLoggedIn}
          />
        </div>

        <div>
          <label htmlFor="guest_address" className="block text-sm font-medium text-gray-700">
            방문주소
          </label>
          <div className="mt-1 flex gap-2">
            <input
              type="text"
              id="guest_address"
              value={formData.guestAddress}
              onChange={(e) => updateFormData({ guestAddress: e.target.value })}
              className="block flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="도로명 또는 지번 주소 입력 후 검색"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isSearching || !formData.guestAddress.trim()}
              className="shrink-0 min-h-[44px] rounded-lg bg-primary px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '검색 중...' : '주소 검색'}
            </button>
          </div>

          {searchMessage && (
            <p
              className={`mt-1 text-sm ${
                searchMessage.includes('선택되었습니다')
                  ? 'text-green-600'
                  : searchMessage.includes('선택해주세요')
                    ? 'text-gray-600'
                    : 'text-red-600'
              }`}
            >
              {searchMessage}
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="mt-2 space-y-1">
              {searchResults.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectAddress(item)}
                  className="flex min-h-[44px] w-full items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm hover:bg-primary hover:text-white transition-colors"
                >
                  {item.address}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="guest_address_detail" className="block text-sm font-medium text-gray-700">
            상세 주소 <span className="text-gray-400">(선택)</span>
          </label>
          <input
            type="text"
            id="guest_address_detail"
            value={formData.guestAddressDetail}
            onChange={(e) => updateFormData({ guestAddressDetail: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="동/호수 등"
          />
        </div>
      </div>

      {/* 개인정보 수집동의 (비회원만) */}
      {!isLoggedIn && (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                        수집항목
                      </td>
                      <td className="px-4 py-2.5">이름, 전화번호, 주소</td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                        수집목적
                      </td>
                      <td className="px-4 py-2.5">돌봄 서비스 예약 및 연락</td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                        보유기간
                      </td>
                      <td className="px-4 py-2.5">서비스 완료 후 1년</td>
                    </tr>
                    <tr>
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">
                        동의 거부
                      </td>
                      <td className="px-4 py-2.5">
                        동의를 거부할 수 있으나, 거부 시 서비스 이용이 불가합니다.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={formData.privacyConsent}
              onChange={(e) => updateFormData({ privacyConsent: e.target.checked })}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              개인정보 수집 및 이용에 동의합니다
            </span>
          </label>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        {!isLoggedIn && (
          <button
            type="button"
            onClick={handlePrev}
            className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 hover:bg-gray-50"
          >
            이전
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 ml-auto"
        >
          다음
        </button>
      </div>
    </div>
  )
}
