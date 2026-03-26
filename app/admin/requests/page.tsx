'use client'

import { useEffect, useState } from 'react'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/constants/status'
import { formatKoreanPhone } from '@/lib/utils/validation'
import { formatDateShort, formatDateTimeShort } from '@/lib/utils/format'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface ServiceRequest {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  address: string
  address_detail: string
  service_type: string
  service_date: string
  start_time: string
  status: string
  estimated_price: number
  manager_name: string | null
  manager_phone: string | null
  vehicle_support: boolean
  is_designated: boolean
}

const CANCELLABLE_STATUSES = ['CONFIRMED', 'MATCHED', 'PENDING_TRANSFER']

const STATUS_FILTERS: { key: string | null; label: string }[] = [
  { key: 'CONFIRMED', label: '매칭중' },
  { key: 'PENDING_TRANSFER', label: '입금대기' },
  { key: 'MATCHED', label: '매칭완료' },
  { key: 'COMPLETED', label: '서비스 완료' },
  { key: 'CANCELLED', label: '취소' },
  { key: null, label: '전체' },
]

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string | null>('CONFIRMED')

  const filteredRequests = activeFilter
    ? requests.filter(r => r.status === activeFilter)
    : requests

  // 수동 매칭 모달 상태
  const [manualMatchOpen, setManualMatchOpen] = useState(false)
  const [manualMatchRequestId, setManualMatchRequestId] = useState<string | null>(null)
  const [searchPhone, setSearchPhone] = useState('')
  const [searchName, setSearchName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<{ id: string; name: string; phone: string; specialty: string }[]>([])
  const [searchMessage, setSearchMessage] = useState('')
  const [isMatching, setIsMatching] = useState(false)


  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
        setError(null)
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || `데이터를 불러오지 못했습니다. (${res.status})`)
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
      setError('서버에 연결할 수 없습니다.')
    }
    setIsLoading(false)
  }

  const handleCancel = async (requestId: string, customerName: string) => {
    if (!confirm(`${customerName}님의 서비스 요청을 취소하시겠습니까?\n\n취소 시 자동으로 전액 환불 처리됩니다.`)) return

    setCancellingId(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH',
      })
      const result = await res.json()

      if (result.success) {
        alert('서비스 요청이 취소되었습니다.\n결제 금액은 자동으로 환불 처리되었습니다.')
        await fetchRequests()
      } else {
        alert(result.message || '취소 처리에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setCancellingId(null)
    }
  }

  const handleConfirmTransfer = async (requestId: string, customerName: string) => {
    if (!confirm(`${customerName}님의 계좌이체 입금을 확인하시겠습니까?`)) return

    setConfirmingId(requestId)
    try {
      const res = await fetch('/api/admin/confirm-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_request_id: requestId }),
      })
      const result = await res.json()

      if (result.success) {
        alert('입금이 확인되었습니다.')
        await fetchRequests()
      } else {
        alert(result.message || '처리에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setConfirmingId(null)
    }
  }

  const openManualMatch = (serviceRequestId: string) => {
    setManualMatchRequestId(serviceRequestId)
    setSearchPhone('')
    setSearchName('')
    setSearchResults([])
    setSearchMessage('')
    setManualMatchOpen(true)
  }

  const handleManagerSearch = async () => {
    if (!searchPhone.trim() && !searchName.trim()) {
      setSearchMessage('전화번호 또는 이름을 입력해주세요.')
      return
    }
    setIsSearching(true)
    setSearchMessage('')
    setSearchResults([])
    try {
      const res = await fetch('/api/managers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: searchPhone, name: searchName }),
      })
      const data = await res.json()
      if (data.ok) {
        setSearchResults(data.managers || [])
        if (data.managers?.length === 0) {
          setSearchMessage('검색 결과가 없습니다.')
        }
      } else {
        setSearchMessage(data.message || '검색에 실패했습니다.')
      }
    } catch {
      setSearchMessage('서버 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleManualMatch = async (managerId: string, managerName: string) => {
    if (!confirm(`${managerName} 매니저를 이 요청에 배정하시겠습니까?`)) return
    setIsMatching(true)
    try {
      const res = await fetch('/api/admin/manual-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_request_id: manualMatchRequestId, manager_id: managerId }),
      })
      const result = await res.json()
      if (result.success) {
        alert('매칭이 완료되었습니다.')
        setManualMatchOpen(false)
        await fetchRequests()
      } else {
        alert(result.message || '매칭 처리에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setIsMatching(false)
    }
  }

  useEffect(() => {
    fetchRequests()
    const interval = setInterval(() => {
      fetchRequests()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="max-w-[1408px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">예약요청 및 매칭 현황</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_FILTERS.map((f) => {
          const isActive = activeFilter === f.key
          const count = f.key
            ? requests.filter(r => r.status === f.key).length
            : requests.length
          const activeStyle = f.key
            ? STATUS_STYLES[f.key] || 'bg-gray-100 text-gray-800'
            : 'bg-gray-800 text-white'
          return (
            <button
              key={f.key ?? '__all'}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isActive ? activeStyle : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
              <span className={`ml-1.5 text-xs ${isActive ? 'opacity-80' : 'opacity-60'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => { setIsLoading(true); setError(null); fetchRequests() }} className="mt-3 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
              다시 시도
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">요청일시</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">고객</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">고객 전화번호</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">주소</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">서비스</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">예약일시</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">매니저</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">매니저 전화번호</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">차량</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">구분</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-2 py-2 text-xs text-center text-gray-900 whitespace-nowrap">
                        {formatDateTimeShort(req.created_at)}
                      </td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">{req.customer_name}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900 whitespace-nowrap">
                        {req.customer_phone ? formatKoreanPhone(req.customer_phone) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-2 py-2 text-xs text-gray-900 !text-left max-w-[180px]">
                        <div className="break-words">{req.address}{req.address_detail ? ` ${req.address_detail}` : ''}</div>
                      </td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">{SERVICE_TYPE_LABELS[req.service_type as ServiceType] || req.service_type}</td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900 whitespace-nowrap">
                        {formatDateShort(req.service_date)} {req.start_time?.substring(0, 5)}
                      </td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">
                        {req.manager_name || <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900 whitespace-nowrap">
                        {req.manager_phone ? formatKoreanPhone(req.manager_phone) : <span className="text-gray-400">-</span>}
                      </td>
                      <td className="px-2 py-2 text-xs text-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[req.status] || req.status}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-xs text-center text-gray-900">
                        {req.estimated_price.toLocaleString()}원
                      </td>
                      <td className="px-2 py-2 text-xs text-center">
                        {req.vehicle_support ? (
                          <span className="px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">O</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs text-center">
                        {req.is_designated ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-800">
                            지정
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-2 py-2 text-xs text-center">
                        <div className="flex justify-center gap-1">
                          {req.status === 'PENDING_TRANSFER' && (
                            <button
                              onClick={() => handleConfirmTransfer(req.id, req.customer_name)}
                              disabled={confirmingId === req.id}
                              className="min-h-[26px] px-2 text-xs font-bold bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                            >
                              {confirmingId === req.id ? '처리중...' : '입금확인'}
                            </button>
                          )}
                          {CANCELLABLE_STATUSES.includes(req.status) && (
                            <button
                              onClick={() => handleCancel(req.id, req.customer_name)}
                              disabled={cancellingId === req.id}
                              className="min-h-[26px] px-2 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                            >
                              {cancellingId === req.id ? '처리중...' : '취소'}
                            </button>
                          )}
                          {req.status === 'CONFIRMED' && !req.manager_name && (
                            <button
                              onClick={() => openManualMatch(req.id)}
                              className="min-h-[26px] px-2 text-xs font-bold bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            >
                              수동 매칭
                            </button>
                          )}
                          {!CANCELLABLE_STATUSES.includes(req.status) && req.status !== 'CONFIRMED' && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={13} className="px-4 py-8 text-center text-gray-500">
                      요청이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={manualMatchOpen} onOpenChange={setManualMatchOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>수동 매니저 매칭</DialogTitle>
            <DialogDescription>매니저를 검색하여 서비스 요청에 배정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="전화번호"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManagerSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="이름"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManagerSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleManagerSearch}
                disabled={isSearching}
                className="min-h-[44px] px-4 text-sm font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isSearching ? '검색중...' : '검색'}
              </button>
            </div>

            {searchMessage && (
              <p className="text-sm text-gray-500 text-center">{searchMessage}</p>
            )}

            {searchResults.length > 0 && (
              <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-md divide-y divide-gray-200">
                {searchResults.map((mgr) => (
                  <div key={mgr.id} className="flex items-center justify-between px-3 py-2">
                    <div>
                      <div className="font-medium text-sm">{mgr.name}</div>
                      <div className="text-xs text-gray-500">{formatKoreanPhone(mgr.phone)}</div>
                      {mgr.specialty && (
                        <div className="text-xs text-gray-400">{mgr.specialty}</div>
                      )}
                    </div>
                    <button
                      onClick={() => handleManualMatch(mgr.id, mgr.name)}
                      disabled={isMatching}
                      className="min-h-[32px] px-3 text-xs font-bold bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                    >
                      선택
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
