'use client'

import { useEffect, useState } from 'react'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'
import { formatDateTime } from '@/lib/utils/format'

interface BankTransferRequest {
  id: string
  created_at: string
  customer_name: string
  service_type: string
  service_date: string
  start_time: string
  status: string
  estimated_price: number
}

export default function AdminBankTransfersPage() {
  const [requests, setRequests] = useState<BankTransferRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests?status=PENDING_TRANSFER', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
        setError(null)
      } else {
        const data = await res.json().catch(() => null)
        setError(data?.error || `데이터를 불러오지 못했습니다. (${res.status})`)
      }
    } catch {
      setError('서버에 연결할 수 없습니다.')
    }
    setIsLoading(false)
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

  const handleCancel = async (requestId: string, customerName: string) => {
    if (!confirm(`${customerName}님의 계좌이체 요청을 취소하시겠습니까?`)) return

    setCancellingId(requestId)
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: 'PATCH',
      })
      const result = await res.json()

      if (result.success) {
        alert('요청이 취소되었습니다.')
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

  useEffect(() => {
    fetchRequests()
  }, [])

  return (
    <div className="max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">계좌이체 관리</h1>
        <span className="text-sm text-gray-500">
          입금대기 {requests.length}건
        </span>
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
            <button
              onClick={() => { setIsLoading(true); setError(null); fetchRequests() }}
              className="mt-3 px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">요청일시</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">고객</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">서비스</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">예약일시</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDateTime(req.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{req.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {SERVICE_TYPE_LABELS[req.service_type as ServiceType] || req.service_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {req.service_date} {req.start_time?.substring(0, 5)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {req.estimated_price.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-800">
                          입금대기
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirmTransfer(req.id, req.customer_name)}
                            disabled={confirmingId === req.id}
                            className="min-h-[32px] px-3 text-xs font-bold bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                          >
                            {confirmingId === req.id ? '처리중...' : '입금확인'}
                          </button>
                          <button
                            onClick={() => handleCancel(req.id, req.customer_name)}
                            disabled={cancellingId === req.id}
                            className="min-h-[32px] px-3 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                          >
                            {cancellingId === req.id ? '처리중...' : '취소'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      입금대기 중인 요청이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
