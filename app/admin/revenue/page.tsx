'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface PaymentRecord {
  id: string
  amount: number
  refund_amount: number
  status: string
  created_at: string
  approved_at: string | null
  service_requests: {
    service_type: string
    service_date: string
  } | null
}

interface DailySummary {
  date: string
  count: number
  totalAmount: number
  refundAmount: number
  netAmount: number
}

interface MonthlySummary {
  month: string
  count: number
  totalAmount: number
  refundAmount: number
  netAmount: number
}

interface ServiceSummary {
  serviceType: string
  label: string
  count: number
  totalAmount: number
}

export default function AdminRevenuePage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')

  useEffect(() => {
    const fetchPayments = async () => {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentsTable = supabase.from('payments') as any
      const { data, error } = await paymentsTable
        .select('id, amount, refund_amount, status, created_at, approved_at, service_requests(service_type, service_date)')
        .in('status', ['PAID', 'REFUNDED', 'PARTIAL_REFUNDED'])
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) {
        console.error('Error fetching payments:', error)
      } else {
        setPayments(data || [])
      }
      setIsLoading(false)
    }

    fetchPayments()
  }, [])

  // 전체 요약
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalRefund = payments.reduce((sum, p) => sum + (p.refund_amount || 0), 0)
  const netRevenue = totalPaid - totalRefund
  const paidCount = payments.filter((p) => p.status === 'PAID').length

  // 일별 집계
  const dailyMap = new Map<string, DailySummary>()
  payments.forEach((p) => {
    const date = p.created_at.slice(0, 10)
    const existing = dailyMap.get(date) || { date, count: 0, totalAmount: 0, refundAmount: 0, netAmount: 0 }
    existing.count += 1
    existing.totalAmount += p.amount
    existing.refundAmount += p.refund_amount || 0
    existing.netAmount = existing.totalAmount - existing.refundAmount
    dailyMap.set(date, existing)
  })
  const dailySummaries = Array.from(dailyMap.values()).sort((a, b) => b.date.localeCompare(a.date))

  // 월별 집계
  const monthlyMap = new Map<string, MonthlySummary>()
  payments.forEach((p) => {
    const month = p.created_at.slice(0, 7)
    const existing = monthlyMap.get(month) || { month, count: 0, totalAmount: 0, refundAmount: 0, netAmount: 0 }
    existing.count += 1
    existing.totalAmount += p.amount
    existing.refundAmount += p.refund_amount || 0
    existing.netAmount = existing.totalAmount - existing.refundAmount
    monthlyMap.set(month, existing)
  })
  const monthlySummaries = Array.from(monthlyMap.values()).sort((a, b) => b.month.localeCompare(a.month))

  // 서비스별 집계
  const serviceMap = new Map<string, ServiceSummary>()
  payments.forEach((p) => {
    const st = p.service_requests?.service_type || 'unknown'
    const existing = serviceMap.get(st) || {
      serviceType: st,
      label: SERVICE_TYPE_LABELS[st as ServiceType] || st,
      count: 0,
      totalAmount: 0,
    }
    existing.count += 1
    existing.totalAmount += p.amount - (p.refund_amount || 0)
    serviceMap.set(st, existing)
  })
  const serviceSummaries = Array.from(serviceMap.values()).sort((a, b) => b.totalAmount - a.totalAmount)

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">일/월 매출 집계</h1>

      {isLoading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-500">로딩 중...</p>
        </div>
      ) : (
        <>
          {/* 전체 요약 카드 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">총 결제 건수</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{payments.length}건</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">총 결제 금액</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalPaid.toLocaleString()}원</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">총 환불 금액</p>
              <p className="text-2xl font-bold text-red-600 mt-1">-{totalRefund.toLocaleString()}원</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">순매출</p>
              <p className="text-2xl font-bold text-primary mt-1">{netRevenue.toLocaleString()}원</p>
              <p className="text-xs text-gray-400 mt-1">유지 {paidCount}건</p>
            </div>
          </div>

          {/* 서비스별 매출 */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">서비스별 순매출</h2>
            {serviceSummaries.length > 0 ? (
              <div className="space-y-3">
                {serviceSummaries.map((s) => {
                  const percentage = netRevenue > 0 ? (s.totalAmount / netRevenue) * 100 : 0
                  return (
                    <div key={s.serviceType}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{s.label}</span>
                        <span className="text-sm text-gray-900">
                          {s.totalAmount.toLocaleString()}원
                          <span className="text-gray-400 ml-2">({s.count}건)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-primary rounded-full h-2 transition-all"
                          style={{ width: `${Math.max(percentage, 1)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">데이터가 없습니다.</p>
            )}
          </div>

          {/* 일별/월별 탭 */}
          <div className="mb-4 border-b border-gray-200">
            <nav className="flex gap-1">
              <button
                type="button"
                onClick={() => setViewMode('daily')}
                className={`px-6 py-3 text-sm font-medium ${
                  viewMode === 'daily'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                일별 집계
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`px-6 py-3 text-sm font-medium ${
                  viewMode === 'monthly'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                월별 집계
              </button>
            </nav>
          </div>

          {/* 집계 테이블 */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {viewMode === 'daily' ? '날짜' : '월'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">건수</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제 금액</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">환불 금액</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">순매출</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {viewMode === 'daily' ? (
                    dailySummaries.length > 0 ? (
                      dailySummaries.map((d) => (
                        <tr key={d.date}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{d.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{d.count}건</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{d.totalAmount.toLocaleString()}원</td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {d.refundAmount > 0 ? `-${d.refundAmount.toLocaleString()}원` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-primary">{d.netAmount.toLocaleString()}원</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">데이터가 없습니다.</td>
                      </tr>
                    )
                  ) : (
                    monthlySummaries.length > 0 ? (
                      monthlySummaries.map((m) => (
                        <tr key={m.month}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{m.month}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{m.count}건</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{m.totalAmount.toLocaleString()}원</td>
                          <td className="px-4 py-3 text-sm text-red-600">
                            {m.refundAmount > 0 ? `-${m.refundAmount.toLocaleString()}원` : '-'}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-primary">{m.netAmount.toLocaleString()}원</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">데이터가 없습니다.</td>
                      </tr>
                    )
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
