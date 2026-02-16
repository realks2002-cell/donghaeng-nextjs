'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface ServiceRequest {
  id: string
  customer_id: string | null
  customer_name: string
  customer_phone: string
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  address: string
  address_detail: string | null
  details: string | null
  status: string
  estimated_price: number
  created_at: string
  is_applied?: boolean
}

interface Application {
  id: string
  request_id: string
  status: string
  created_at: string
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  customer_name: string
  request_status: string
  estimated_price: number
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours > 0 && mins > 0) {
    return `${hours}시간 ${mins}분`
  } else if (hours > 0) {
    return `${hours}시간`
  } else {
    return `${mins}분`
  }
}

function DashboardContent() {
  const searchParams = useSearchParams()
  const tab = searchParams.get('tab')

  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    if (tab === 'matching') {
      fetchApplications()
    } else {
      fetchRequests()
    }
  }, [tab])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/manager/requests')
      if (res.ok) {
        const data = await res.json()
        setRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error)
    }
    setLoading(false)
  }

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/manager/applications')
      if (res.ok) {
        const data = await res.json()
        setApplications(data.applications || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    }
    setLoading(false)
  }

  const handleApply = async () => {
    if (!selectedRequest) return

    setApplying(true)
    try {
      const res = await fetch('/api/manager/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: selectedRequest.id,
          message: '',
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // 성공 모달
        toast.success('지원이 완료되었습니다!')
        setSelectedRequest(null)
        fetchRequests()
      } else if (res.status === 409) {
        // 🆕 이미 지원자가 있는 경우 (선착순 실패)
        toast.error('이미 지원자가 있어 지원이 불가합니다.', {
          description: '다른 서비스 요청을 확인해보세요.'
        })
        setSelectedRequest(null)
        fetchRequests()
      } else {
        // 기타 오류
        toast.error(data.error || '지원에 실패했습니다.')
      }
    } catch (error) {
      console.error('Apply error:', error)
      toast.error('지원 중 오류가 발생했습니다.')
    }
    setApplying(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">대기중</span>
      case 'ACCEPTED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">수락됨</span>
      case 'REJECTED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">거절됨</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <>
      {/* 탭 네비게이션 */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-1">
          <Link
            href="/manager/dashboard"
            className={`px-6 py-4 text-sm font-medium ${
              tab !== 'matching'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            서비스 요청
          </Link>
          <Link
            href="/manager/dashboard?tab=matching"
            className={`px-6 py-4 text-sm font-medium ${
              tab === 'matching'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            내 매칭현황
          </Link>
        </nav>
      </div>

      {tab === 'matching' ? (
        // 매칭 현황 탭
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">내 매칭 현황</h2>
            <p className="text-gray-600 mt-1">지원한 서비스 요청의 매칭 상태를 확인하세요.</p>
          </div>

          {applications.length > 0 ? (
            <>
              {/* 모바일 카드 뷰 */}
              <div className="md:hidden space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{SERVICE_TYPE_LABELS[app.service_type as ServiceType] || app.service_type}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {app.service_date} {app.start_time.substring(0, 5)}
                        </p>
                      </div>
                      {getStatusBadge(app.status)}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">고객</span>
                        <span className="text-gray-900 font-medium">{app.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">지원일</span>
                        <span className="text-gray-900">{app.created_at}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 데스크탑 테이블 뷰 */}
              <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">근무일시</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">지원일</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {applications.map((app) => (
                        <tr key={app.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {app.service_date}
                            <br />
                            <span className="text-gray-500">{app.start_time.substring(0, 5)}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{SERVICE_TYPE_LABELS[app.service_type as ServiceType] || app.service_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{app.customer_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{app.created_at}</td>
                          <td className="px-4 py-3 text-sm">{getStatusBadge(app.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">지원한 서비스 요청이 없습니다.</p>
            </div>
          )}
        </>
      ) : (
        // 서비스 요청 탭
        <>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">서비스 요청</h2>
            <p className="text-gray-600 mt-1">매칭을 기다리는 고객의 서비스 요청입니다. 클릭하여 지원하세요.</p>
          </div>

          {requests.length > 0 ? (
            <>
              {/* 모바일 카드 뷰 */}
              <div className="md:hidden space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className={`bg-white rounded-lg border border-gray-200 p-4 ${
                      request.is_applied ? 'opacity-60' : 'cursor-pointer'
                    }`}
                    onClick={() => !request.is_applied && setSelectedRequest(request)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{SERVICE_TYPE_LABELS[request.service_type as ServiceType] || request.service_type}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {request.service_date} {request.start_time.substring(0, 5)}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-lg font-bold text-primary">
                          {request.estimated_price.toLocaleString()}원
                        </p>
                        {request.is_applied ? (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            지원완료
                          </span>
                        ) : (
                          <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            매칭대기
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">고객</span>
                        <span className="text-gray-900 font-medium">{request.customer_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">위치</span>
                        <span className="text-gray-900 text-right flex-1 ml-2">{request.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">소요시간</span>
                        <span className="text-gray-900">{formatDuration(request.duration_minutes)}</span>
                      </div>
                      {request.details && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-gray-500">요청사항</span>
                          <p className="text-gray-700 mt-1">{request.details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* 데스크탑 테이블 뷰 */}
              <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">근무일시</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">위치</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">특기사항</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">소요시간</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">금액</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr
                          key={request.id}
                          className={`hover:bg-gray-50 ${
                            request.is_applied ? 'opacity-60' : 'cursor-pointer'
                          }`}
                          onClick={() => !request.is_applied && setSelectedRequest(request)}
                        >
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {request.service_date}
                            <br />
                            <span className="text-gray-500">{request.start_time.substring(0, 5)}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{SERVICE_TYPE_LABELS[request.service_type as ServiceType] || request.service_type}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{request.customer_name}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {request.address.length > 15 ? request.address.substring(0, 15) + '...' : request.address}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {request.details ? (
                              <span className="text-gray-700">
                                {request.details.length > 30 ? request.details.substring(0, 30) + '...' : request.details}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatDuration(request.duration_minutes)}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-primary">
                            {request.estimated_price.toLocaleString()}원
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {request.is_applied ? (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                지원완료
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                매칭대기
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">현재 매칭을 기다리는 서비스 요청이 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* 지원하기 모달 */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold">서비스 지원</h2>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="px-6 py-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">서비스</span>
                    <p className="font-semibold">{SERVICE_TYPE_LABELS[selectedRequest.service_type as ServiceType] || selectedRequest.service_type}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">금액</span>
                    <p className="font-bold text-primary">
                      {selectedRequest.estimated_price.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">날짜/시간</span>
                    <p className="font-medium">
                      {selectedRequest.service_date} {selectedRequest.start_time.substring(0, 5)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">소요시간</span>
                    <p className="font-medium">{formatDuration(selectedRequest.duration_minutes)}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">고객</span>
                    <p className="font-medium">{selectedRequest.customer_name}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">주소</span>
                    <p className="font-medium">{selectedRequest.address}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">요청사항</span>
                    <p className="font-medium text-gray-700">{selectedRequest.details || '없음'}</p>
                  </div>
                </div>
              </div>
              <div className="text-center py-4">
                <p className="text-lg font-medium">이 서비스에 지원하시겠습니까?</p>
                <p className="text-sm text-gray-500 mt-1">지원 후 고객 확인 시 매칭이 완료됩니다.</p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={applying}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:opacity-90 font-medium disabled:opacity-50"
              >
                {applying ? '지원 중...' : '지원하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default function ManagerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}
