'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

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

// 서비스 타입 한글 매핑
const serviceTypeLabels: Record<string, string> = {
  HOSPITAL_COMPANION: '병원 동행',
  BABY_CARE: '아이돌봄',
  HOUSEWORK: '가사돌봄',
  SENIOR_CARE: '노인돌봄',
  LIFE_COMPANION: '생활동행',
}

// 상태 한글 매핑
const statusLabels: Record<string, string> = {
  PENDING: '대기 중',
  CONFIRMED: '확인됨',
  COMPLETED: '완료',
  CANCELLED: '취소됨',
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
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
      const supabase = createClient()

      // 통계 조회
      const [usersRes, managersRes, requestsRes, paymentsRes] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'MANAGER'),
        supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
        supabase.from('payments').select('amount').eq('status', 'SUCCESS'),
      ])

      const totalRevenue = paymentsRes.data?.reduce((sum, p: { amount?: number }) => sum + (p.amount || 0), 0) || 0

      setStats({
        total_users: usersRes.count || 0,
        total_managers: managersRes.count || 0,
        pending_requests: requestsRes.count || 0,
        total_revenue: totalRevenue,
      })

      // 최근 요청 조회
      const { data: requests } = await supabase
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
        .limit(10)

      if (requests) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedRequests = requests.map((req: any) => ({
          id: req.id,
          created_at: req.created_at,
          customer_name: req.users?.name || req.guest_name || '비회원',
          service_type: req.service_type,
          service_date: req.service_date,
          start_time: req.start_time?.slice(0, 5) || '',
          status: req.status,
          estimated_price: req.estimated_price || 0,
        }))
        setRecentRequests(formattedRequests)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
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
    <div className="max-w-7xl mx-auto">
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    요청일시
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    고객
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    서비스
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    일시
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    상태
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    금액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(req.created_at).toLocaleString('ko-KR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{req.customer_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {serviceTypeLabels[req.service_type] || req.service_type}
                    </td>
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
