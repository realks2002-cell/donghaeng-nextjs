'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ServiceRequest {
  id: string
  created_at: string
  customer_name: string
  service_type: string
  service_date: string
  start_time: string
  status: string
  estimated_price: number
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  MATCHING: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: '대기중',
  CONFIRMED: '확인됨',
  MATCHING: '매칭중',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRequests = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('service_requests')
        .select(`
          id,
          created_at,
          guest_name,
          service_type,
          service_date,
          start_time,
          status,
          estimated_price,
          customer_id,
          users!service_requests_customer_id_fkey (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching requests:', error)
      } else if (data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formatted = data.map((req: any) => ({
          id: req.id,
          created_at: req.created_at,
          customer_name: req.users?.name || req.guest_name || '비회원',
          service_type: req.service_type,
          service_date: req.service_date,
          start_time: req.start_time?.slice(0, 5) || '',
          status: req.status,
          estimated_price: req.estimated_price || 0,
        }))
        setRequests(formatted)
      }

      setIsLoading(false)
    }

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
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
                      <td className="px-4 py-3 text-sm text-gray-900">{req.service_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {req.service_date} {req.start_time}
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
