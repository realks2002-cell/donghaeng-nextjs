'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, Loader2 } from 'lucide-react'
import { BANK_ACCOUNT_INFO } from '@/lib/constants/bank-account'

export default function TransferPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-primary" /></div>}>
      <TransferPendingContent />
    </Suspense>
  )
}

function TransferPendingContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')

  useEffect(() => {
    sessionStorage.removeItem('service_request_form_data')
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-16 pt-24">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">서비스 요청 접수</h1>
          <p className="mt-2 text-gray-600">아래 계좌로 입금해주시면 서비스가 확정됩니다.</p>

          {/* 주문 정보 */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4 text-left">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">주문번호</dt>
                <dd className="font-medium text-gray-900">{orderId?.slice(0, 8)}...</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">결제방법</dt>
                <dd className="font-medium text-gray-900">계좌이체</dd>
              </div>
            </dl>
          </div>

          {/* 입금 계좌 안내 */}
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-left">
            <h3 className="font-semibold text-sm text-amber-900 mb-3">입금 계좌 안내</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-amber-700">은행</dt>
                <dd className="font-medium text-amber-900">{BANK_ACCOUNT_INFO.bankName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-700">계좌번호</dt>
                <dd className="font-medium text-amber-900">{BANK_ACCOUNT_INFO.accountNumber}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-amber-700">예금주</dt>
                <dd className="font-medium text-amber-900">{BANK_ACCOUNT_INFO.accountHolder}</dd>
              </div>
              <div className="flex justify-between border-t border-amber-200 pt-2">
                <dt className="font-semibold text-amber-800">입금금액</dt>
                <dd className="font-bold text-amber-900">
                  {amount ? parseInt(amount, 10).toLocaleString() : '-'}원
                </dd>
              </div>
            </dl>
          </div>

          {/* 안내 */}
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800 text-left">
              입금 확인 후 매니저 배정이 진행됩니다.
              <br />
              입금자명은 신청자 이름과 동일하게 입금해주세요.
            </p>
          </div>

          <div className="mt-6 space-y-3">
            {orderId && (
              <Link
                href={`/requests/${orderId}`}
                className="block w-full min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90 text-center"
              >
                요청 상세 보기
              </Link>
            )}
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
