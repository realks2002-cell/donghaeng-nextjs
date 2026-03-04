'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { formatKoreanPhone } from '@/lib/utils/validation'

interface Settlement {
  manager_id: string
  manager_name: string
  manager_phone: string
  bank_name: string | null
  bank_account: string | null
  bank_holder: string | null
  service_count: number
  total_amount: number
  refund_amount: number
  commission_amount: number
  net_amount: number
}

export default function ManagerSettlementPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [commissionRate, setCommissionRate] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [startDate, setStartDate] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  })
  const [endDate, setEndDate] = useState(() => {
    const now = new Date()
    const last = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`
  })

  useEffect(() => {
    const fetchSettlements = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ start: startDate, end: endDate })
        const res = await fetch(`/api/admin/manager-settlement?${params}`)
        const data = await res.json()
        setSettlements(data.settlements || [])
        setCommissionRate(data.commission_rate ?? 0)
      } catch (error) {
        console.error('Error fetching settlements:', error)
      }
      setIsLoading(false)
    }

    fetchSettlements()
  }, [startDate, endDate])

  // 요약 통계
  const totalNet = settlements.reduce((sum, s) => sum + s.net_amount, 0)
  const totalServiceCount = settlements.reduce((sum, s) => sum + s.service_count, 0)
  const managerCount = settlements.length

  const handleExportCSV = useCallback(() => {
    if (settlements.length === 0) return

    const BOM = '\uFEFF'
    const header = ['매니저명', '연락처', '서비스 건수', '총 결제액', '환불액', '수수료', '정산액', '은행명', '계좌번호', '예금주']
    const rows = settlements.map((s) => [
      s.manager_name,
      s.manager_phone,
      s.service_count,
      s.total_amount,
      s.refund_amount,
      s.commission_amount,
      s.net_amount,
      s.bank_name || '',
      s.bank_account || '',
      s.bank_holder || '',
    ])

    const csvContent = BOM + [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `매니저정산_${startDate}~${endDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }, [settlements, startDate, endDate])

  return (
    <div className="max-w-[1408px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">매니저 정산</h1>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              if (e.target.value > endDate) setEndDate(e.target.value)
            }}
            className="min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <span className="text-gray-500 text-sm">~</span>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="min-h-[44px] px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleExportCSV}
            disabled={settlements.length === 0}
            className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV 내보내기
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <>
          {/* 요약 카드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">총 정산액</p>
              <p className="text-2xl font-bold text-primary mt-1">{totalNet.toLocaleString()}원</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">수수료율</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{commissionRate}%</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">매니저 수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{managerCount}명</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">서비스 건수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalServiceCount}건</p>
            </div>
          </div>

          {/* 정산 테이블 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">매니저명</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">연락처</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">서비스 건수</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">총 결제액</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">환불액</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">수수료</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">정산액</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">은행정보</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {settlements.length > 0 ? (
                    settlements.map((s) => (
                      <tr key={s.manager_id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.manager_name}</td>
                        <td className="px-3 py-3 text-sm text-gray-700 whitespace-nowrap">{formatKoreanPhone(s.manager_phone)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{s.service_count}건</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{s.total_amount.toLocaleString()}원</td>
                        <td className="px-4 py-3 text-sm text-red-600">
                          {s.refund_amount > 0 ? `-${s.refund_amount.toLocaleString()}원` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-orange-600">
                          {s.commission_amount > 0 ? `-${s.commission_amount.toLocaleString()}원` : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-primary">{s.net_amount.toLocaleString()}원</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {s.bank_name
                            ? `${s.bank_name} ${s.bank_account || ''}${s.bank_holder ? ` (${s.bank_holder})` : ''}`
                            : <span className="text-gray-400">미등록</span>
                          }
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                        해당 기간의 정산 데이터가 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
