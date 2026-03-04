'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  SERVICE_TYPE_LABELS,
  DEFAULT_SERVICE_PRICES,
  type ServiceType,
} from '@/lib/constants/pricing'
import { TIME_OPTIONS, DURATION_OPTIONS } from '@/components/forms/ServiceRequestForm/types'
import { formatKoreanPhone } from '@/lib/utils/validation'

interface AddressResult {
  address: string
  jibunAddress?: string
  zipCode?: string
  buildingName?: string
}

const SERVICE_TYPES: ServiceType[] = [
  'hospital_companion',
  'daily_care',
  'life_companion',
  'elderly_care',
  'child_care',
  'other',
]

function getTodayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdminRegisterServicePage() {
  const router = useRouter()

  // Form state
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [serviceType, setServiceType] = useState<ServiceType | ''>('')
  const [serviceDate, setServiceDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationHours, setDurationHours] = useState(0)
  const [address, setAddress] = useState('')
  const [addressDetail, setAddressDetail] = useState('')
  const [details, setDetails] = useState('')

  // Address search state
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [searchResults, setSearchResults] = useState<AddressResult[]>([])

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<{ requestId: string; estimatedPrice: number } | null>(null)

  // Dynamic prices
  const [prices, setPrices] = useState<Record<ServiceType, number>>(DEFAULT_SERVICE_PRICES)

  useEffect(() => {
    fetch('/api/service-prices')
      .then((res) => res.json())
      .then((data) => {
        if (data.prices) {
          const mapped = { ...DEFAULT_SERVICE_PRICES }
          const keyMap: Record<string, ServiceType> = {
            '병원 동행': 'hospital_companion',
            '가사돌봄': 'daily_care',
            '생활동행': 'life_companion',
            '노인 돌봄': 'elderly_care',
            '아이 돌봄': 'child_care',
            '기타': 'other',
          }
          Object.entries(data.prices).forEach(([label, price]) => {
            const key = keyMap[label]
            if (key) mapped[key] = price as number
          })
          setPrices(mapped)
        }
      })
      .catch(() => {})
  }, [])

  // Estimated price calculation
  const estimatedPrice = useMemo(() => {
    if (!serviceType || !durationHours) return 0
    return prices[serviceType] * durationHours
  }, [serviceType, durationHours, prices])

  const handleAddressSearch = async () => {
    if (!address.trim()) {
      setSearchMessage('주소를 입력한 뒤 검색해주세요.')
      return
    }

    setIsSearching(true)
    setSearchMessage('')
    setSearchResults([])

    try {
      const res = await fetch(`/api/address/search?keyword=${encodeURIComponent(address)}`)
      const result = await res.json()

      if (result.success && result.items?.length > 0) {
        if (result.items.length === 1) {
          selectAddress(result.items[0])
        } else {
          setSearchResults(result.items)
          setSearchMessage(`아래에서 주소를 선택해주세요 (${result.items.length}개)`)
        }
      } else {
        setSearchMessage(result.message || '일치하는 주소를 찾지 못했습니다.')
      }
    } catch {
      setSearchMessage('주소 검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectAddress = (item: AddressResult) => {
    setAddress(item.address)
    setSearchResults([])
    setSearchMessage('주소가 선택되었습니다.')
    setErrors((prev) => {
      const next = { ...prev }
      delete next.address
      return next
    })
  }

  const resetForm = () => {
    setGuestName('')
    setGuestPhone('')
    setServiceType('')
    setServiceDate('')
    setStartTime('')
    setDurationHours(0)
    setAddress('')
    setAddressDetail('')
    setDetails('')
    setSearchMessage('')
    setSearchResults([])
    setErrors({})
    setSuccess(null)
  }

  const handleSubmit = async () => {
    // Client-side validation
    const newErrors: Record<string, string> = {}

    if (!guestName.trim()) newErrors.guestName = '고객 이름을 입력해주세요'
    const cleanPhone = guestPhone.replace(/-/g, '')
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) newErrors.guestPhone = '올바른 전화번호를 입력해주세요'
    if (!serviceType) newErrors.serviceType = '서비스 종류를 선택해주세요'
    if (!serviceDate) newErrors.serviceDate = '서비스 날짜를 확인해주세요'
    if (!startTime) newErrors.startTime = '시작 시간을 선택해주세요'
    if (!durationHours) newErrors.durationHours = '소요 시간을 선택해주세요'
    if (!address.trim()) newErrors.address = '주소를 입력해주세요'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/admin/register-service', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName.trim(),
          guest_phone: cleanPhone,
          service_type: serviceType,
          service_date: serviceDate,
          start_time: startTime,
          duration_hours: durationHours,
          address: address.trim(),
          address_detail: addressDetail.trim() || null,
          details: details.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrors({ submit: data.error || '등록에 실패했습니다.' })
        return
      }

      setSuccess({
        requestId: data.request_id,
        estimatedPrice: data.estimated_price,
      })
    } catch {
      setErrors({ submit: '서버 연결에 실패했습니다.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Success view
  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-lg border bg-white p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">서비스가 등록되었습니다</h2>
          <p className="mt-2 text-gray-600">
            예상 금액: <span className="font-semibold text-primary">{success.estimatedPrice.toLocaleString()}원</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">매니저에게 알림이 전송되었습니다.</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/requests')}
              className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 hover:bg-gray-50"
            >
              목록으로 이동
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90"
            >
              추가 등록
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">서비스 직접 등록</h1>
      <p className="mt-1 text-sm text-gray-600">콜센터 접수 시 관리자가 직접 서비스 요청을 등록합니다.</p>

      <div className="mt-6 space-y-6">
        {/* 고객 정보 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">고객 정보</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="guest_name" className="block text-sm font-medium text-gray-700">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="guest_name"
                value={guestName}
                onChange={(e) => {
                  setGuestName(e.target.value)
                  setErrors((prev) => { const n = { ...prev }; delete n.guestName; return n })
                }}
                className={`mt-1 block w-full rounded-lg border px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors.guestName ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="고객 이름"
              />
              {errors.guestName && <p className="mt-1 text-sm text-red-600">{errors.guestName}</p>}
            </div>
            <div>
              <label htmlFor="guest_phone" className="block text-sm font-medium text-gray-700">
                전화번호 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="guest_phone"
                value={guestPhone}
                onChange={(e) => {
                  setGuestPhone(formatKoreanPhone(e.target.value))
                  setErrors((prev) => { const n = { ...prev }; delete n.guestPhone; return n })
                }}
                maxLength={13}
                className={`mt-1 block w-full rounded-lg border px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors.guestPhone ? 'border-red-300' : 'border-gray-300'}`}
                placeholder="010-0000-0000"
              />
              {errors.guestPhone && <p className="mt-1 text-sm text-red-600">{errors.guestPhone}</p>}
            </div>
          </div>
        </section>

        {/* 서비스 선택 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">서비스 선택 <span className="text-red-500">*</span></h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {SERVICE_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setServiceType(type)
                  setErrors((prev) => { const n = { ...prev }; delete n.serviceType; return n })
                }}
                className={`min-h-[44px] rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  serviceType === type
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'
                }`}
              >
                {SERVICE_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
          {errors.serviceType && <p className="mt-2 text-sm text-red-600">{errors.serviceType}</p>}
        </section>

        {/* 날짜/시간 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">날짜 / 시간</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">
                날짜 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="service_date"
                value={serviceDate}
                min={getTodayString()}
                onChange={(e) => {
                  setServiceDate(e.target.value)
                  setErrors((prev) => { const n = { ...prev }; delete n.serviceDate; return n })
                }}
                className={`mt-1 block w-full rounded-lg border px-4 h-[48px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors.serviceDate ? 'border-red-300' : 'border-gray-300'}`}
              />
              {errors.serviceDate && <p className="mt-1 text-sm text-red-600">{errors.serviceDate}</p>}
            </div>
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                시작 시간 <span className="text-red-500">*</span>
              </label>
              <select
                id="start_time"
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value)
                  setErrors((prev) => { const n = { ...prev }; delete n.startTime; return n })
                }}
                className={`mt-1 block w-full rounded-lg border px-4 h-[48px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors.startTime ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value="">선택</option>
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {errors.startTime && <p className="mt-1 text-sm text-red-600">{errors.startTime}</p>}
            </div>
            <div>
              <label htmlFor="duration_hours" className="block text-sm font-medium text-gray-700">
                소요 시간 <span className="text-red-500">*</span>
              </label>
              <select
                id="duration_hours"
                value={durationHours}
                onChange={(e) => {
                  setDurationHours(Number(e.target.value))
                  setErrors((prev) => { const n = { ...prev }; delete n.durationHours; return n })
                }}
                className={`mt-1 block w-full rounded-lg border px-4 h-[48px] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors.durationHours ? 'border-red-300' : 'border-gray-300'}`}
              >
                <option value={0}>선택</option>
                {DURATION_OPTIONS.map((h) => (
                  <option key={h} value={h}>{h}시간</option>
                ))}
              </select>
              {errors.durationHours && <p className="mt-1 text-sm text-red-600">{errors.durationHours}</p>}
            </div>
          </div>
        </section>

        {/* 방문 주소 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">방문 주소</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                주소 <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value)
                    setErrors((prev) => { const n = { ...prev }; delete n.address; return n })
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddressSearch()
                    }
                  }}
                  className={`block flex-1 rounded-lg border px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${errors.address ? 'border-red-300' : 'border-gray-300'}`}
                  placeholder="도로명 또는 지번 주소 입력 후 검색"
                />
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  disabled={isSearching || !address.trim()}
                  className="shrink-0 min-h-[44px] rounded-lg bg-primary px-4 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? '검색 중...' : '주소 검색'}
                </button>
              </div>
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}

              {searchMessage && (
                <p className={`mt-1 text-sm ${
                  searchMessage.includes('선택되었습니다') ? 'text-green-600'
                    : searchMessage.includes('선택해주세요') ? 'text-gray-600'
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
              <label htmlFor="address_detail" className="block text-sm font-medium text-gray-700">
                상세 주소 <span className="text-gray-400">(선택)</span>
              </label>
              <input
                type="text"
                id="address_detail"
                value={addressDetail}
                onChange={(e) => setAddressDetail(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="동/호수 등"
              />
            </div>
          </div>
        </section>

        {/* 상세 요청사항 */}
        <section className="rounded-lg border bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">상세 요청사항 <span className="text-gray-400 text-sm font-normal">(선택)</span></h2>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            className="mt-4 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            placeholder="고객의 요청사항을 입력해주세요"
          />
        </section>

        {/* 예상 금액 */}
        {estimatedPrice > 0 && (
          <section className="rounded-lg border border-primary/30 bg-primary/5 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">예상 금액</span>
              <span className="text-xl font-bold text-primary">{estimatedPrice.toLocaleString()}원</span>
            </div>
            {serviceType && (
              <p className="mt-1 text-sm text-gray-500 text-right">
                {SERVICE_TYPE_LABELS[serviceType]} {prices[serviceType].toLocaleString()}원/시간 × {durationHours}시간
              </p>
            )}
          </section>
        )}

        {/* 에러 메시지 */}
        {errors.submit && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* 등록 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full min-h-[44px] rounded-lg bg-primary px-6 py-3 text-lg font-semibold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '등록 중...' : '서비스 등록'}
        </button>
      </div>
    </div>
  )
}
