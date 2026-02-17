'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface Payment {
  id: string
  order_id: string
  service_request_id: string | null
  amount: number
  refund_amount: number
  method: string | null
  status: string
  refunded_at: string | null
  partial_refunded: boolean
  created_at: string
  service_requests: {
    service_type: string
    phone: string
    guest_name: string | null
    guest_phone: string | null
  } | null
}

const statusLabels: Record<string, string> = {
  PAID: '결제완료',
  PENDING: '대기중',
  REFUNDED: '전액환불',
  PARTIAL_REFUNDED: '부분환불',
  FAILED: '실패',
  CANCELLED: '취소',
}

const statusStyles: Record<string, string> = {
  PAID: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  PARTIAL_REFUNDED: 'bg-orange-100 text-orange-800',
  FAILED: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  // 부분환불 모달
  const [refundModal, setRefundModal] = useState<Payment | null>(null)
  const [refundAmount, setRefundAmount] = useState('')

  const fetchPayments = async () => {
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = supabase.from('payments') as any
    const { data, error } = await paymentsTable
      .select('*, service_requests(service_type, phone, guest_name, guest_phone)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching payments:', error)
    } else {
      setPayments(data || [])
    }

    setIsLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleFullRefund = async (payment: Payment) => {
    if (!confirm(`주문 ${payment.order_id.slice(0, 8)}...\n${payment.amount.toLocaleString()}원 전액 환불하시겠습니까?`)) {
      return
    }

    setProcessingId(payment.id)
    try {
      const res = await fetch(`/api/admin/payments/${payment.id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'full' }),
      })
      const result = await res.json()
      if (result.success) {
        await fetchPayments()
      } else {
        alert(result.message || '환불 처리에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const handlePartialRefundSubmit = async () => {
    if (!refundModal) return

    const amount = parseInt(refundAmount, 10)
    if (!amount || amount <= 0) {
      alert('환불 금액을 입력해주세요.')
      return
    }

    const remainingRefundable = refundModal.amount - (refundModal.refund_amount || 0)
    if (amount > remainingRefundable) {
      alert(`환불 가능 금액은 ${remainingRefundable.toLocaleString()}원입니다.`)
      return
    }

    setProcessingId(refundModal.id)
    try {
      const res = await fetch(`/api/admin/payments/${refundModal.id}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'partial', refundAmount: amount }),
      })
      const result = await res.json()
      if (result.success) {
        setRefundModal(null)
        setRefundAmount('')
        await fetchPayments()
      } else {
        alert(result.message || '부분 환불 처리에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setProcessingId(null)
    }
  }

  const canRefund = (payment: Payment) => {
    return payment.status === 'PAID' || payment.status === 'PARTIAL_REFUNDED'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">결제 내역 조회</h1>

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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">서비스</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">요청자</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제일시</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">주문번호</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">환불금액</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">결제수단</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">환불처리</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.service_requests
                          ? SERVICE_TYPE_LABELS[payment.service_requests.service_type as ServiceType] || payment.service_requests.service_type
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.service_requests ? (
                          <div>
                            {payment.service_requests.guest_name && (
                              <div className="font-medium">{payment.service_requests.guest_name}</div>
                            )}
                            <div className="text-gray-500">{payment.service_requests.guest_phone || payment.service_requests.phone || '-'}</div>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(payment.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                        {payment.order_id.slice(0, 12)}...
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {payment.amount.toLocaleString()}원
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.refund_amount > 0 ? (
                          <span className="text-red-600 font-medium">
                            -{payment.refund_amount.toLocaleString()}원
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{payment.method || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusStyles[payment.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[payment.status] || payment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {canRefund(payment) ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleFullRefund(payment)}
                              disabled={processingId === payment.id}
                              className="min-h-[26px] px-2 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                            >
                              전액환불
                            </button>
                            <button
                              onClick={() => {
                                setRefundModal(payment)
                                setRefundAmount('')
                              }}
                              disabled={processingId === payment.id}
                              className="min-h-[26px] px-2 text-xs font-bold bg-orange-300 text-white rounded-md hover:bg-orange-400 disabled:opacity-50"
                            >
                              부분환불
                            </button>
                          </div>
                        ) : payment.status === 'REFUNDED' ? (
                          <span className="text-xs text-gray-400">환불완료</span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      결제 내역이 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 부분환불 모달 */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">부분 환불</h3>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">결제 금액</span>
                <span className="font-medium">{refundModal.amount.toLocaleString()}원</span>
              </div>
              {refundModal.refund_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">기존 환불액</span>
                  <span className="text-red-600 font-medium">-{refundModal.refund_amount.toLocaleString()}원</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="text-gray-600">환불 가능 금액</span>
                <span className="font-bold text-primary">
                  {(refundModal.amount - (refundModal.refund_amount || 0)).toLocaleString()}원
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">환불 금액 (원)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="환불할 금액을 입력하세요"
                max={refundModal.amount - (refundModal.refund_amount || 0)}
                min={1}
                className="w-full min-h-[44px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRefundModal(null)
                  setRefundAmount('')
                }}
                className="flex-1 min-h-[44px] rounded-lg border border-gray-300 bg-white font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handlePartialRefundSubmit}
                disabled={processingId === refundModal.id}
                className="flex-1 min-h-[35px] rounded-lg bg-orange-300 font-bold text-white hover:bg-orange-400 disabled:opacity-50"
              >
                {processingId === refundModal.id ? '처리 중...' : '환불하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
