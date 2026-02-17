'use client'

import { useEffect, useState } from 'react'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface ServiceRequest {
  id: string
  created_at: string
  customer_name: string
  service_type: string
  service_date: string
  start_time: string
  status: string
  estimated_price: number
  manager_name: string | null
  manager_phone: string | null
  is_designated: boolean
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  MATCHING: 'bg-purple-100 text-purple-800',
  MATCHED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확인됨',
  MATCHING: '매칭중',
  MATCHED: '매칭완료',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
}

const CANCELLABLE_STATUSES = ['CONFIRMED', 'MATCHING', 'MATCHED']

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/requests', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
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

  useEffect(() => {
    fetchRequests()
  }, [])

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">예약요청 및 매칭 현황</h1>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청일시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">예약일시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">매니저</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">구분</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(req.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{req.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{SERVICE_TYPE_LABELS[req.service_type as ServiceType] || req.service_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {req.service_date} {req.start_time}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {req.manager_name ? (
                          <div>
                            <div className="font-medium text-gray-900">{req.manager_name}</div>
                            <div className="text-gray-500 text-xs">{req.manager_phone}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusStyles[req.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[req.status] || req.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {req.estimated_price.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {req.is_designated ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-800">
                            지정
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {CANCELLABLE_STATUSES.includes(req.status) ? (
                          <button
                            onClick={() => handleCancel(req.id, req.customer_name)}
                            disabled={cancellingId === req.id}
                            className="min-h-[26px] px-2 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                          >
                            {cancellingId === req.id ? '처리 중...' : '취소'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      요청이 없습니다.
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
