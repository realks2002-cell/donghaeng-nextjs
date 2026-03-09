'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils/format'

interface WorkRecord {
  id: string
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  customer_name: string
  address: string
  status: string
  final_price: number
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

export default function SchedulePage() {
  const [records, setRecords] = useState<WorkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/manager/schedule')
      if (res.ok) {
        const data = await res.json()
        setRecords(data.records || [])
      }
    } catch (error) {
      console.error('Failed to fetch schedule:', error)
    }
    setLoading(false)
  }

  const handleServiceAction = async (recordId: string) => {
    if (!confirm('서비스를 완료하시겠습니까?')) return

    setProcessingId(recordId)
    try {
      const res = await fetch(`/api/manager/service/${recordId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      })
      const result = await res.json()
      if (result.success) {
        await fetchRecords()
      } else {
        alert(result.message || '상태 변경에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">완료</span>
      case 'MATCHED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">예정</span>
      case 'CONFIRMED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">확정</span>
      case 'IN_PROGRESS':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">진행중</span>
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">취소됨</span>
      case 'PENDING_TRANSFER':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">입금대기</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  const getActionButton = (record: WorkRecord) => {
    if (record.status === 'MATCHED') {
      return (
        <button
          onClick={() => handleServiceAction(record.id)}
          disabled={processingId === record.id}
          className="min-h-[32px] px-3 text-xs font-bold bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {processingId === record.id ? '처리중...' : '서비스 완료'}
        </button>
      )
    }
    return null
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
      <div className="mb-6">
        <h2 className="text-2xl font-bold">내 근무기록</h2>
        <p className="text-gray-600 mt-1">완료된 서비스와 예정된 근무를 확인하세요.</p>
      </div>

      {records.length > 0 ? (
        <>
          {/* 모바일 카드 뷰 */}
          <div className="md:hidden space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.service_type}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(record.service_date)} {record.start_time.substring(0, 5)}
                    </p>
                  </div>
                  {getStatusBadge(record.status)}
                </div>
                <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">고객</span>
                    <span className="text-gray-900 font-medium">{record.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">위치</span>
                    <span className="text-gray-900 text-right flex-1 ml-2">{record.address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">소요시간</span>
                    <span className="text-gray-900">{formatDuration(record.duration_minutes)}</span>
                  </div>
                  {record.final_price > 0 && (
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-500">금액</span>
                      <span className="text-primary font-bold">{record.final_price.toLocaleString()}원</span>
                    </div>
                  )}
                </div>
                {getActionButton(record) && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {getActionButton(record)}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 데스크탑 테이블 뷰 */}
          <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">근무일시</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">서비스</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">고객</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">위치</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">소요시간</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">금액</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(record.service_date)}
                        <br />
                        <span className="text-gray-500">{record.start_time.substring(0, 5)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.service_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.customer_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {record.address.length > 20 ? record.address.substring(0, 20) + '...' : record.address}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatDuration(record.duration_minutes)}</td>
                      <td className="px-4 py-3 text-sm font-medium text-primary">
                        {record.final_price > 0 ? `${record.final_price.toLocaleString()}원` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">{getStatusBadge(record.status)}</td>
                      <td className="px-4 py-3 text-sm">
                        {getActionButton(record) || <span className="text-gray-400 text-xs">-</span>}
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
          <p className="text-gray-500">근무 기록이 없습니다.</p>
        </div>
      )}
    </>
  )
}
