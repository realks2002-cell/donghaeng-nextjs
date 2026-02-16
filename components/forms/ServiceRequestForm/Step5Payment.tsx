'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ServiceRequestFormData, calculatePrice } from './types'
import { SERVICE_TYPES, ServiceType, DEFAULT_SERVICE_PRICES } from '@/lib/constants/pricing'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'

interface Step5PaymentProps {
  data: ServiceRequestFormData
  onUpdate: (data: Partial<ServiceRequestFormData>) => void
  onPrev: () => void
  onSubmit: () => void
  isLoggedIn?: boolean
  user?: { id: string; name: string; email: string } | null
  servicePrices?: Record<ServiceType, number>
}

export default function Step5Payment({
  data,
  onUpdate,
  onPrev,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSubmit: _onSubmit,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isLoggedIn: _isLoggedIn = false,
  user = null,
  servicePrices = DEFAULT_SERVICE_PRICES,
}: Step5PaymentProps) {
  const [ready, setReady] = useState(false)
  const [widgetError, setWidgetError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [widgets, setWidgets] = useState<any>(null)
  const initializedRef = useRef(false)

  const estimatedPrice = calculatePrice(data.serviceType, data.durationHours, servicePrices)
  const serviceLabel = data.serviceType ? SERVICE_TYPES[data.serviceType as ServiceType]?.label : '-'

  // 1단계: 토스페이먼츠 SDK v2 로드 및 위젯 객체 생성
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    async function fetchPaymentWidgets() {
      try {
        const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY
        console.log('TossPayments clientKey:', clientKey ? `Set (${clientKey.substring(0, 20)}...)` : 'Not set')

        if (!clientKey || clientKey === 'your_toss_client_key') {
          throw new Error('결제 클라이언트 키가 설정되지 않았습니다.')
        }

        const tossPayments = await loadTossPayments(clientKey)

        // 비회원: ANONYMOUS, 회원: user.id
        const customerKey = user?.id || ANONYMOUS
        console.log('Creating widgets with customerKey:', user?.id ? 'user-id' : 'ANONYMOUS')

        const w = tossPayments.widgets({ customerKey })
        setWidgets(w)
      } catch (error) {
        console.error('Payment SDK load error:', error)
        setWidgetError(error instanceof Error ? error.message : '결제 시스템 초기화에 실패했습니다.')
      }
    }

    fetchPaymentWidgets()
  }, [user?.id])

  // 2단계: 위젯 객체가 준비되면 결제 UI 렌더링
  useEffect(() => {
    if (widgets == null) return

    async function renderPaymentWidgets() {
      try {
        // 금액 설정 (renderPaymentMethods 보다 먼저 호출)
        await widgets.setAmount({ currency: 'KRW', value: estimatedPrice })

        // 결제 UI + 약관 UI 렌더링
        await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-widget',
            variantKey: 'DEFAULT',
          }),
          widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT',
          }),
        ])

        console.log('Payment widget rendered successfully')
        setReady(true)
      } catch (error) {
        console.error('Payment widget render error:', error)
        setWidgetError(error instanceof Error ? error.message : '결제 UI 렌더링에 실패했습니다.')
      }
    }

    renderPaymentWidgets()
  }, [widgets, estimatedPrice])

  const handlePayment = async () => {
    if (!data.confirmTerms) {
      toast.error('서비스 이용약관에 동의해주세요.')
      return
    }

    if (!widgets) {
      toast.error('결제 시스템을 초기화하는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      // 서비스 요청을 먼저 DB에 저장
      const saveResponse = await fetch('/api/requests/save-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_type: data.serviceType,
          service_date: data.serviceDate,
          start_time: data.startTime,
          duration_hours: data.durationHours,
          address: data.guestAddress,
          address_detail: data.guestAddressDetail,
          phone: data.guestPhone,
          lat: data.guestLat,
          lng: data.guestLng,
          details: data.details,
          designated_manager_id: data.designatedManagerId,
          guest_name: data.guestName,
          guest_phone: data.guestPhone,
          guest_address: data.guestAddress,
          guest_address_detail: data.guestAddressDetail,
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || '서비스 요청 저장에 실패했습니다.')
      }

      const saveResult = await saveResponse.json()
      if (!saveResult.ok || !saveResult.request_id) {
        throw new Error(saveResult.error || '서비스 요청 저장에 실패했습니다.')
      }

      const orderId = saveResult.request_id
      const orderName = `${serviceLabel} 서비스`

      // 결제 요청
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const successUrl = `${baseUrl}/payment/success`
      const failUrl = `${baseUrl}/payment/fail`

      await widgets.requestPayment({
        orderId,
        orderName,
        successUrl,
        failUrl,
        customerEmail: user?.email,
        customerName: user?.name || data.guestName,
      })
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : '결제 처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">결제하기</h2>

      {/* 주문 요약 */}
      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <h3 className="font-semibold text-sm text-gray-700">주문 정보</h3>
        <dl className="mt-2 space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">서비스</dt>
            <dd className="font-medium">{serviceLabel}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">일시</dt>
            <dd className="font-medium">
              {data.serviceDate && data.startTime ? `${data.serviceDate} ${data.startTime}` : '-'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">예상 시간</dt>
            <dd className="font-medium">{data.durationHours ? `${data.durationHours}시간` : '-'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">위치</dt>
            <dd className="font-medium text-xs">
              {data.guestAddress}
              {data.guestAddressDetail && ` ${data.guestAddressDetail}`}
            </dd>
          </div>
        </dl>
        <div className="mt-3 border-t pt-3 flex justify-between items-center">
          <dt className="font-semibold text-gray-700">결제 금액</dt>
          <dd className="text-xl font-bold text-primary">{estimatedPrice.toLocaleString()}원</dd>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          ※ 최종 금액은 실제 소요 시간에 따라 달라질 수 있습니다.
        </p>
      </div>

      {/* 토스페이먼츠 결제 위젯 */}
      <div className="mt-6">
        {widgetError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-semibold">결제 시스템 초기화 실패</p>
            <p className="mt-1">{widgetError}</p>
            <p className="mt-2 text-xs">페이지를 새로고침하거나 관리자에게 문의하세요.</p>
          </div>
        ) : (
          <>
            {!ready && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2 text-gray-600">결제 시스템 로딩 중...</span>
              </div>
            )}
            <div id="payment-widget" className={!ready ? 'hidden' : ''}></div>
            <div id="agreement" className={!ready ? 'hidden' : ''}></div>
          </>
        )}
      </div>

      <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={data.confirmTerms}
          onChange={(e) => onUpdate({ confirmTerms: e.target.checked })}
          className="mt-1"
        />
        <span className="text-sm text-gray-700">
          위 내용을 확인했으며 서비스 이용약관에 동의합니다.
        </span>
      </label>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handlePayment}
          disabled={!ready || isProcessing || !!widgetError}
          className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? '처리 중...' : '결제하기'}
        </button>
      </div>
    </div>
  )
}
