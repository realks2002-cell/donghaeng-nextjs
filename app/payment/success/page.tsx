'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Loader2 } from 'lucide-react'

interface PaymentResult {
  ok: boolean
  error?: string
  paymentKey?: string
  orderId?: string
  amount?: number
  method?: string
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [isProcessing, setIsProcessing] = useState(true)
  const [result, setResult] = useState<PaymentResult | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      const paymentKey = searchParams.get('paymentKey')
      const orderId = searchParams.get('orderId')
      const amount = searchParams.get('amount')

      if (!paymentKey || !orderId || !amount) {
        setResult({ ok: false, error: '결제 정보가 올바르지 않습니다.' })
        setIsProcessing(false)
        return
      }

      try {
        const response = await fetch('/api/payments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount: parseInt(amount, 10),
          }),
        })

        const data: PaymentResult = await response.json()
        setResult(data)
      } catch (error) {
        console.error('Payment confirm error:', error)
        setResult({ ok: false, error: '결제 확인 중 오류가 발생했습니다.' })
      } finally {
        setIsProcessing(false)
      }
    }

    confirmPayment()
  }, [searchParams])

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg text-gray-600">결제를 확인하는 중입니다...</p>
        </div>
      </div>
    )
  }

  if (!result?.ok) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 pt-24">
        <div className="mx-auto max-w-md px-4">
          <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">결제 확인 실패</h1>
            <p className="mt-2 text-gray-600">{result?.error || '결제 처리 중 문제가 발생했습니다.'}</p>
            <div className="mt-6 space-y-3">
              <Link
                href="/requests/new"
                className="block w-full min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90 text-center"
              >
                다시 요청하기
              </Link>
              <Link
                href="/"
                className="block w-full min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 text-center"
              >
                홈으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const orderId = searchParams.get('orderId')

  return (
    <div className="min-h-screen bg-gray-50 py-16 pt-24">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">결제 완료</h1>
          <p className="mt-2 text-gray-600">서비스 요청이 완료되었습니다.</p>

          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">주문번호</dt>
                <dd className="font-medium text-gray-900">{orderId?.slice(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">결제금액</dt>
                <dd className="font-medium text-primary">
                  {result.amount?.toLocaleString()}원
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">결제수단</dt>
                <dd className="font-medium text-gray-900">{result.method || '-'}</dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              요청 확인 후 매니저가 배정되면 알림을 보내드립니다.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href={`/requests/${orderId}`}
              className="block w-full min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90 text-center"
            >
              요청 상세 보기
            </Link>
            <Link
              href="/"
              className="block w-full min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 text-center"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
