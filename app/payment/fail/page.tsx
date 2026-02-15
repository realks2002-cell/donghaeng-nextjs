'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PaymentFailPage() {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')
  const message = searchParams.get('message')

  // 에러 메시지 한글화
  const getErrorMessage = (code: string | null, message: string | null): string => {
    if (!code && !message) return '결제 처리 중 문제가 발생했습니다.'

    const errorMessages: Record<string, string> = {
      'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
      'PAY_PROCESS_ABORTED': '결제 진행 중 문제가 발생했습니다.',
      'REJECT_CARD_COMPANY': '카드사에서 결제를 거절했습니다.',
      'INVALID_CARD_NUMBER': '카드 번호가 올바르지 않습니다.',
      'INVALID_CARD_EXPIRATION': '카드 유효기간이 올바르지 않습니다.',
      'EXCEED_MAX_AMOUNT': '결제 한도를 초과했습니다.',
      'INVALID_STOPPED_CARD': '사용이 정지된 카드입니다.',
      'INVALID_CARD_LOST': '분실 신고된 카드입니다.',
      'NOT_SUPPORTED_INSTALLMENT_PLAN_CARD_OR_MERCHANT': '할부 결제가 지원되지 않습니다.',
    }

    if (code && errorMessages[code]) {
      return errorMessages[code]
    }

    return message || '결제 처리 중 문제가 발생했습니다.'
  }

  const errorMessage = getErrorMessage(code, message)

  return (
    <div className="min-h-screen bg-gray-50 py-16 pt-24">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">결제 실패</h1>
          <p className="mt-2 text-gray-600">{errorMessage}</p>

          {code && (
            <div className="mt-4 rounded-lg bg-gray-50 p-3">
              <p className="text-xs text-gray-500">
                오류 코드: {code}
              </p>
            </div>
          )}

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

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-600">
              결제 문제가 계속되면 고객센터로 문의해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
