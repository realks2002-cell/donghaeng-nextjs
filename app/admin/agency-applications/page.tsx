'use client'

import { useEffect, useState } from 'react'
import { formatDateTime } from '@/lib/utils/format'
import { formatKoreanPhone } from '@/lib/utils/validation'

interface AgencyApplication {
  id: string
  name: string
  phone: string
  email: string
  region: string
  memo: string | null
  status: 'pending' | 'reviewed' | 'rejected'
  created_at: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기',
  reviewed: '검토완료',
  rejected: '반려',
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function AdminAgencyApplicationsPage() {
  const [applications, setApplications] = useState<AgencyApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const perPage = 20


  const fetchApplications = async () => {
    setIsLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    })
    if (search) params.set('search', search)

    try {
      const res = await fetch(`/api/admin/agency-applications?${params}`)
      const result = await res.json()
      if (result.success) {
        setApplications(result.data)
        setTotalCount(result.totalCount)
      }
    } catch {
      console.error('Failed to fetch agency applications')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchApplications()
  }

  const handleStatusChange = async (id: string, newStatus: 'reviewed' | 'rejected') => {
    const label = newStatus === 'reviewed' ? '검토완료' : '반려'
    if (!confirm(`상태를 "${label}"(으)로 변경하시겠습니까?`)) return

    setProcessingId(id)
    try {
      const res = await fetch(`/api/admin/agency-applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      const result = await res.json()
      if (result.success) {
        await fetchApplications()
      } else {
        alert(result.message || '상태 변경에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const totalPages = Math.ceil(totalCount / perPage)

  return (
    <div className="max-w-[1408px]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">대리점 신청 관리</h1>
      </div>

      {/* 검색 */}
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="이름, 전화번호, 이메일, 지역으로 검색"
          className="min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full max-w-md"
        />
        <button
          type="submit"
          className="min-h-[44px] px-6 bg-primary text-white font-medium rounded-lg hover:opacity-90"
        >
          검색
        </button>
      </form>

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
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">신청일</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">이름</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">전화번호</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">이메일</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">희망지역</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">문의사항</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">처리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applications.length > 0 ? (
                  applications.map((app) => (
                    <tr key={app.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDateTime(app.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{formatKoreanPhone(app.phone)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{app.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{app.region}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {app.memo || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {app.status === 'pending' ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleStatusChange(app.id, 'reviewed')}
                              disabled={processingId === app.id}
                              className="min-h-[26px] px-2 text-xs font-bold bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                            >
                              검토완료
                            </button>
                            <button
                              onClick={() => handleStatusChange(app.id, 'rejected')}
                              disabled={processingId === app.id}
                              className="min-h-[26px] px-2 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                            >
                              반려
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">처리완료</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      대리점 신청 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-4 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="min-h-[36px] px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              이전
            </button>
            <span className="text-sm text-gray-600">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="min-h-[36px] px-3 py-1 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
