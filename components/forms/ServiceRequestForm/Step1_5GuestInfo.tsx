'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { ServiceRequestFormData } from './types'
import { validateKoreanPhone, formatKoreanPhone } from '@/lib/utils/validation'

interface AddressResult {
  address: string
  x: number
  y: number
}

interface Step1_5GuestInfoProps {
  data: ServiceRequestFormData
  onUpdate: (data: Partial<ServiceRequestFormData>) => void
  onNext: () => void
  onPrev: () => void
  isLoggedIn?: boolean
}

export default function Step1_5GuestInfo({
  data,
  onUpdate,
  onNext,
  onPrev,
  isLoggedIn = false
}: Step1_5GuestInfoProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [searchResults, setSearchResults] = useState<AddressResult[]>([])
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false)

  const handleAddressSearch = async () => {
    if (!data.guestAddress.trim()) {
      setSearchMessage('주소를 입력한 뒤 검색해주세요.')
      return
    }

    setIsSearching(true)
    setSearchMessage('')
    setSearchResults([])

    try {
      const res = await fetch(`/api/address/search?keyword=${encodeURIComponent(data.guestAddress)}`)
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
    onUpdate({
      guestAddress: item.address,
      guestLat: item.y,
      guestLng: item.x,
    })
    setSearchResults([])
    setSearchMessage('주소가 선택되었습니다.')
  }

  const handleNext = () => {
    // 로그인한 회원은 검증 건너뛰기
    if (isLoggedIn) {
      onNext()
      return
    }

    if (!data.guestName.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }
    if (!data.guestPhone.trim()) {
      toast.error('전화번호를 입력해주세요.')
      return
    }
    if (!validateKoreanPhone(data.guestPhone)) {
      toast.error('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
      return
    }
    if (!data.guestAddress.trim()) {
      toast.error('주소를 입력해주세요.')
      return
    }
    if (!data.privacyConsent) {
      toast.error('개인정보 수집 및 이용에 동의해주세요.')
      return
    }
    onNext()
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">신청자 정보를 입력해주세요</h2>
      <p className="mt-2 text-sm text-gray-600">서비스 신청을 위해 연락받으실 정보를 입력해주세요.</p>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700">
            이름
          </label>
          <input
            type="text"
            id="guest_name"
            value={data.guestName}
            onChange={(e) => onUpdate({ guestName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="이름을 입력하세요"
          />
        </div>

        <div>
          <label htmlFor="guest_phone" className="block text-sm font-medium text-gray-700">
            전화번호
          </label>
          <input
            type="tel"
            id="guest_phone"
            value={data.guestPhone}
            onChange={(e) => {
              const formatted = formatKoreanPhone(e.target.value)
              onUpdate({ guestPhone: formatted })
            }}
            maxLength={13}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="010-1234-5678"
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
              value={data.guestAddress}
              onChange={(e) => onUpdate({ guestAddress: e.target.value })}
              className="block flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="도로명 또는 지번 주소 입력 후 검색"
            />
            <button
              type="button"
              onClick={handleAddressSearch}
              disabled={isSearching || !data.guestAddress.trim()}
              className="shrink-0 min-h-[44px] rounded-lg bg-primary px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? '검색 중...' : '주소 검색'}
            </button>
          </div>

          {searchMessage && (
            <p className={`mt-1 text-sm ${
              searchMessage.includes('선택되었습니다')
                ? 'text-green-600'
                : searchMessage.includes('선택해주세요')
                  ? 'text-gray-600'
                  : 'text-red-600'
            }`}>
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
            value={data.guestAddressDetail}
            onChange={(e) => onUpdate({ guestAddressDetail: e.target.value })}
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
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">수집항목</td>
                      <td className="px-4 py-2.5">이름, 전화번호, 주소</td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">수집목적</td>
                      <td className="px-4 py-2.5">돌봄 서비스 예약 및 연락</td>
                    </tr>
                    <tr className="border-b">
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">보유기간</td>
                      <td className="px-4 py-2.5">서비스 완료 후 1년</td>
                    </tr>
                    <tr>
                      <td className="bg-gray-50 px-4 py-2.5 font-medium text-gray-700 whitespace-nowrap">동의 거부</td>
                      <td className="px-4 py-2.5">동의를 거부할 수 있으나, 거부 시 서비스 이용이 불가합니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={data.privacyConsent}
              onChange={(e) => onUpdate({ privacyConsent: e.target.checked })}
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
            onClick={onPrev}
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
