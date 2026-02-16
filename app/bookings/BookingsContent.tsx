'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { toast } from 'sonner'
import { validateKoreanPhone, formatKoreanPhone } from '@/lib/utils/validation'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기중', color: 'bg-gray-100 text-gray-800' },
  CONFIRMED: { label: '확정', color: 'bg-green-100 text-green-800' },
  MATCHING: { label: '매칭중', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: '진행중', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
}

const SERVICE_LABELS: Record<string, string> = {
  hospital_companion: '병원 동행',
  daily_care: '가사돌봄',
  life_companion: '생활동행',
  elderly_care: '노인 돌봄',
  child_care: '아이 돌봄',
  other: '기타',
}

interface ServiceRequest {
  id: string
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  address: string
  status: string
  estimated_price: number
  created_at: string
  manager_id?: string | null
}

interface BookingsContentProps {
  isLoggedIn: boolean
  memberRequests: ServiceRequest[]
}

export default function BookingsContent({ isLoggedIn, memberRequests }: BookingsContentProps) {
  const [activeTab, setActiveTab] = useState<'member' | 'guest'>(isLoggedIn ? 'member' : 'guest')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestRequests, setGuestRequests] = useState<ServiceRequest[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleGuestLookup = async () => {
    if (!guestName.trim()) {
      toast.error('이름을 입력해주세요.')
      return
    }
    if (!guestPhone.trim()) {
      toast.error('전화번호를 입력해주세요.')
      return
    }
    if (!validateKoreanPhone(guestPhone)) {
      toast.error('올바른 전화번호 형식을 입력해주세요. (예: 010-1234-5678)')
      return
    }
    setIsSearching(true)
    setHasSearched(false)

    try {
      const res = await fetch('/api/requests/guest-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: guestName.trim(), phone: guestPhone }),
      })
      const result = await res.json()

      if (result.ok) {
        setGuestRequests(result.requests || [])
        setHasSearched(true)
      } else {
        toast.error(result.error || '조회에 실패했습니다.')
      }
    } catch {
      toast.error('조회 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const renderRequestList = (requests: ServiceRequest[]) => {
    if (requests.length === 0) {
      return (
        <div className="rounded-lg border bg-white p-8 text-center">
          <p className="text-gray-600">예약 내역이 없습니다.</p>
          <Link
            href="/requests/new"
            className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90"
          >
            서비스 요청하기
          </Link>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {requests.map((request) => {
          const status = STATUS_LABELS[request.status] || STATUS_LABELS.PENDING
          const serviceLabel = SERVICE_LABELS[request.service_type] || request.service_type
          const formattedDate = format(new Date(request.service_date), 'yyyy년 M월 d일 (EEE)', { locale: ko })
          const durationHours = Math.floor(request.duration_minutes / 60)

          return (
            <Link
              key={request.id}
              href={`/requests/${request.id}`}
              className="block rounded-lg border bg-white p-6 shadow-sm hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{serviceLabel}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {formattedDate} {request.start_time} · {durationHours}시간
                  </p>
                  <p className="mt-1 text-sm text-gray-500 truncate max-w-md">
                    {request.address}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    {request.estimated_price?.toLocaleString()}원
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {format(new Date(request.created_at), 'M/d 요청')}
                  </p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold">예약 조회</h1>
        <p className="mt-1 text-gray-600">서비스 예약 내역을 확인하세요.</p>

        {/* 탭 UI */}
        <div className="mt-6 flex border-b">
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => setActiveTab('member')}
              className={`min-h-[44px] px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'member'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              내 예약
            </button>
          )}
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            className={`min-h-[44px] px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'guest'
                ? 'border-b-2 border-primary text-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            비회원 예약 조회
          </button>
        </div>

        <div className="mt-6">
          {/* 회원 탭 */}
          {activeTab === 'member' && isLoggedIn && renderRequestList(memberRequests)}

          {/* 비회원 탭 */}
          {activeTab === 'guest' && (
            <div>
              <div className="rounded-lg border bg-white p-6">
                <h2 className="text-lg font-semibold">비회원 예약 조회</h2>
                <p className="mt-1 text-sm text-gray-600">
                  예약 시 입력한 이름과 전화번호로 조회할 수 있습니다.
                </p>

                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="lookup_name" className="block text-sm font-medium text-gray-700">
                      이름
                    </label>
                    <input
                      type="text"
                      id="lookup_name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="예약 시 입력한 이름"
                    />
                  </div>

                  <div>
                    <label htmlFor="lookup_phone" className="block text-sm font-medium text-gray-700">
                      전화번호
                    </label>
                    <input
                      type="tel"
                      id="lookup_phone"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(formatKoreanPhone(e.target.value))}
                      maxLength={13}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="010-1234-5678"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLookup}
                    disabled={isSearching}
                    className="min-h-[44px] w-full rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSearching ? '조회 중...' : '예약 조회'}
                  </button>
                </div>
              </div>

              {hasSearched && (
                <div className="mt-6">
                  {guestRequests.length === 0 ? (
                    <div className="rounded-lg border bg-white p-8 text-center">
                      <p className="text-gray-600">해당 정보로 조회된 예약이 없습니다.</p>
                      <p className="mt-2 text-sm text-gray-500">
                        예약 시 입력한 이름과 전화번호가 정확한지 확인해주세요.
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-4 text-sm text-gray-600">
                        총 {guestRequests.length}건의 예약이 조회되었습니다.
                      </p>
                      {renderRequestList(guestRequests)}
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
