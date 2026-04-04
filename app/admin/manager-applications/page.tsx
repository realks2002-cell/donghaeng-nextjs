'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'
import { STATUS_LABELS, STATUS_STYLES } from '@/lib/constants/status'
import { formatKoreanPhone } from '@/lib/utils/validation'
import { formatDate, formatDateTime } from '@/lib/utils/format'
import Pagination from '@/components/admin/Pagination'

interface ApplicationRecord {
  id: string
  manager_id: string
  service_request_id: string
  status: string
  message: string | null
  created_at: string
  manager_name: string
  manager_phone: string
  service_type: string
  service_date: string
  start_time: string
  customer_name: string
  request_status: string
  estimated_price: number
}

const PER_PAGE = 20

function ManagerApplicationsContent() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1', 10)
  const [applications, setApplications] = useState<ApplicationRecord[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const offset = (page - 1) * PER_PAGE

  const fetchApplications = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('manager_applications') as any
    const { count } = await table.select('*', { count: 'exact', head: true })
    setTotal(count || 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await table
      .select(`
        id,
        manager_id,
        service_request_id,
        status,
        message,
        created_at,
        managers (name, phone),
        service_requests (
          service_type,
          service_date,
          start_time,
          status,
          estimated_price,
          customer_id,
          guest_name
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + PER_PAGE - 1)

    if (error) {
      console.error('Error fetching applications:', error)
      setIsLoading(false)
      return
    }

    // 고객 이름 조회
    const customerIds = (data || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((a: any) => a.service_requests?.customer_id)
      .filter((id: string | null) => id !== null && id !== undefined)

    let customerMap: Record<string, string> = {}
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', customerIds)
      if (customers) {
        customerMap = customers.reduce((acc: Record<string, string>, c: { id: string; name: string }) => {
          acc[c.id] = c.name
          return acc
        }, {})
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatted: ApplicationRecord[] = (data || []).map((app: any) => {
      const sr = app.service_requests
      const customerName = sr?.customer_id
        ? customerMap[sr.customer_id] || '비회원'
        : sr?.guest_name || '비회원'

      return {
        id: app.id,
        manager_id: app.manager_id,
        service_request_id: app.service_request_id,
        status: app.status,
        message: app.message,
        created_at: app.created_at,
        manager_name: app.managers?.name || '-',
        manager_phone: app.managers?.phone || '-',
        service_type: sr?.service_type || '-',
        service_date: sr?.service_date || '-',
        start_time: sr?.start_time || '-',
        customer_name: customerName,
        request_status: sr?.status || '-',
        estimated_price: sr?.estimated_price || 0,
      }
    })

    setApplications(formatted)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchApplications()
  }, [page])

  const handleAction = async (applicationId: string, action: 'reject') => {
    if (!confirm('이 매칭을 취소하시겠습니까?')) return

    setProcessingId(applicationId)
    try {
      const res = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const result = await res.json()
      if (result.success) {
        await fetchApplications()
      } else {
        alert(result.message || '매칭 취소에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="max-w-[1408px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">매니저 지원확인</h1>
      </div>

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
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">지원일시</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">매니저</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">서비스</th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">예약일시</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">고객</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">금액</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDateTime(app.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="font-medium text-gray-900">{app.manager_name}</div>
                        <div className="text-gray-500 text-xs">{formatKoreanPhone(app.manager_phone)}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{SERVICE_TYPE_LABELS[app.service_type as ServiceType] || app.service_type}</td>
                      <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(app.service_date)}
                        <br />
                        <span className="text-gray-500">{app.start_time.substring(0, 5)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{app.customer_name}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {app.estimated_price.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            STATUS_STYLES[app.request_status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {STATUS_LABELS[app.request_status] || app.request_status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {app.status === 'ACCEPTED' ? (
                          <button
                            onClick={() => handleAction(app.id, 'reject')}
                            disabled={processingId === app.id}
                            className="min-h-[26px] px-2 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                          >
                            매칭 취소
                          </button>
                        ) : app.status === 'REJECTED' ? (
                          <span className="text-xs text-gray-400">취소됨</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      매니저 지원 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <Pagination total={total} perPage={PER_PAGE} basePath="/admin/manager-applications" />
      </div>
    </div>
  )
}

export default function AdminManagerApplicationsPage() {
  return (
    <Suspense>
      <ManagerApplicationsContent />
    </Suspense>
  )
}
