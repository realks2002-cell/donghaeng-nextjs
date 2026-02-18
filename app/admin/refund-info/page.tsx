'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface RefundRecord {
  id: string
  order_id: string
  service_request_id: string | null
  amount: number
  refund_amount: number
  method: string | null
  status: string
  partial_refunded: boolean
  created_at: string
  refunded_at: string | null
  service_requests: {
    service_type: string
    service_date: string
    status: string
    phone: string
    guest_name: string | null
    guest_phone: string | null
    customer_id: string | null
  } | null
}

const getRefundLabel = (refund: RefundRecord) => {
  if (refund.status === 'REFUNDED' && refund.service_requests?.status === 'CANCELLED') {
    return { label: '취소 환불', style: 'bg-purple-100 text-purple-800' }
  }
  if (refund.status === 'PARTIAL_REFUNDED') {
    return { label: '부분환불', style: 'bg-orange-100 text-orange-800' }
  }
  return { label: '전액환불', style: 'bg-gray-100 text-gray-800' }
}

export default function AdminRefundInfoPage() {
  const [refunds, setRefunds] = useState<RefundRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchRefunds = async () => {
      const supabase = createClient()

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const paymentsTable = supabase.from('payments') as any
      const { data, error } = await paymentsTable
        .select('*, service_requests(service_type, service_date, status, phone, guest_name, guest_phone, customer_id)')
        .in('status', ['REFUNDED', 'PARTIAL_REFUNDED'])
        .order('refunded_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching refunds:', error)
        setIsLoading(false)
        return
      }

      const records: RefundRecord[] = data || []

      // 고객 이름 조회
      const customerIds = records
        .map((r) => r.service_requests?.customer_id)
        .filter((id): id is string => !!id)

      if (customerIds.length > 0) {
        const { data: customers } = await supabase
          .from('users')
          .select('id, name')
          .in('id', customerIds)

        if (customers) {
          const map: Record<string, string> = {}
          customers.forEach((c: { id: string; name: string }) => {
            map[c.id] = c.name
          })
          setCustomerMap(map)
        }
      }

      setRefunds(records)
      setIsLoading(false)
    }

    fetchRefunds()
  }, [])

  const getCustomerName = (record: RefundRecord) => {
    const sr = record.service_requests
    if (!sr) return '-'
    if (sr.customer_id && customerMap[sr.customer_id]) {
      return customerMap[sr.customer_id]
    }
    return sr.guest_name || '비회원'
  }

  const getPhone = (record: RefundRecord) => {
    const sr = record.service_requests
    if (!sr) return '-'
    return sr.guest_phone || sr.phone || '-'
  }

  // 통계 계산
  const totalRefundAmount = refunds.reduce((sum, r) => sum + (r.refund_amount || 0), 0)
  const cancelRefundCount = refunds.filter(
    (r) => r.status === 'REFUNDED' && r.service_requests?.status === 'CANCELLED'
  ).length
  const fullRefundCount = refunds.filter(
    (r) => r.status === 'REFUNDED' && r.service_requests?.status !== 'CANCELLED'
  ).length
  const partialRefundCount = refunds.filter((r) => r.status === 'PARTIAL_REFUNDED').length

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">취소요청 및 환불</h1>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">총 환불 건수</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{refunds.length}건</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">총 환불 금액</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{totalRefundAmount.toLocaleString()}원</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">취소 환불</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">{cancelRefundCount}건</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-500">전액 / 부분</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {fullRefundCount} / {partialRefundCount}
          </p>
        </div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">환불일시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">고객</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">연락처</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">환불금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제수단</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {refunds.length > 0 ? (
                  refunds.map((refund) => (
                    <tr key={refund.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {refund.refunded_at
                          ? new Date(refund.refunded_at).toLocaleString('ko-KR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {refund.service_requests
                          ? SERVICE_TYPE_LABELS[refund.service_requests.service_type as ServiceType] || refund.service_requests.service_type
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {getCustomerName(refund)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {getPhone(refund)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {refund.amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">
                        -{refund.refund_amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {refund.method || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(() => {
                          const { label, style } = getRefundLabel(refund)
                          return (
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${style}`}>
                              {label}
                            </span>
                          )
                        })()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      환불 내역이 없습니다.
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
