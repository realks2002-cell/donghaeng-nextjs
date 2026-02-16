'use client'

import { useEffect, useState } from 'react'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface DesignatedRequest {
  id: string
  created_at: string
  customer_name: string
  customer_phone: string
  service_type: string
  service_date: string
  start_time: string
  status: string
  estimated_price: number
  manager_name: string
  manager_phone: string
}

export default function AdminDesignatedMatchingPage() {
  const [requests, setRequests] = useState<DesignatedRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/designated-matching', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Error:', error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleAction = async (requestId: string, action: 'approve' | 'reject') => {
    const label = action === 'approve' ? '승인' : '거절'
    if (!confirm(`이 매칭을 ${label}하시겠습니까?`)) return

    setProcessingId(requestId)
    try {
      const res = await fetch('/api/admin/designated-matching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      })
      const result = await res.json()

      if (result.success) {
        if (action === 'approve') {
          alert('매칭이 승인되었습니다.')
          window.location.href = '/admin/requests'
        } else {
          alert('매칭이 거절되었습니다.')
          await fetchData()
        }
      } else {
        alert(result.error || `${label} 처리에 실패했습니다.`)
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">지정 매니저 매칭</h1>
      <p className="text-gray-600 mb-6">고객이 지정한 매니저 매칭 요청을 승인 또는 거절하세요.</p>

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지정 매니저</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(req.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{req.customer_name}</div>
                        <div className="text-gray-500 text-xs">{req.customer_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {SERVICE_TYPE_LABELS[req.service_type as ServiceType] || req.service_type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {req.service_date}
                        <br />
                        <span className="text-gray-500">{req.start_time}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{req.manager_name}</div>
                        <div className="text-gray-500 text-xs">{req.manager_phone}</div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {req.estimated_price.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(req.id, 'approve')}
                            disabled={processingId === req.id}
                            className="min-h-[32px] px-3 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'reject')}
                            disabled={processingId === req.id}
                            className="min-h-[32px] px-3 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                          >
                            거절
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      지정 매니저 매칭 대기 건이 없습니다.
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
