'use client'

import { useEffect, useState } from 'react'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/constants/status'
import { formatDate, formatDateTime } from '@/lib/utils/format'

interface Stats {
  total_users: number
  total_managers: number
  pending_requests: number
  total_revenue: number
}

interface RecentRequest {
  id: string
  created_at: string
  customer_name: string
  service_type: string
  service_date: string
  start_time: string
  status: string
  estimated_price: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_managers: 0,
    pending_requests: 0,
    total_revenue: 0,
  })
  const [recentRequests, setRecentRequests] = useState<RecentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()

        setStats(data.stats)
        setRecentRequests(data.recentRequests)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-[1408px]">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1408px]">
      <h1 className="text-2xl font-bold mb-6">대시보드</h1>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">전체 회원</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_users.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">전체 매니저</div>
          <div className="text-3xl font-bold text-gray-900">
            {stats.total_managers.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">대기 중인 요청</div>
          <div className="text-3xl font-bold text-primary">
            {stats.pending_requests.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-600 mb-1">총 매출</div>
          <div className="text-3xl font-bold text-green-600">
            {stats.total_revenue.toLocaleString()}원
          </div>
        </div>
      </div>

      {/* 최근 요청 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">최근 서비스 요청</h2>

        {recentRequests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    요청일시
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    고객
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    서비스
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                    일시
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    금액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDateTime(req.created_at)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {SERVICE_TYPE_LABELS[req.service_type as ServiceType] || req.service_type}
                    </td>
                    <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                      {formatDate(req.service_date)} {req.start_time?.substring(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          STATUS_STYLES[req.status] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {STATUS_LABELS[req.status] || req.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {req.estimated_price.toLocaleString()}원
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">최근 요청이 없습니다.</p>
        )}
      </div>
    </div>
  )
}
