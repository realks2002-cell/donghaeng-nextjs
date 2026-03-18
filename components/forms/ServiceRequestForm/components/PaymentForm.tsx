'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { useFormContext } from '../context/FormContext'
import { calculatePrice } from '../types'
import { SERVICE_TYPES, ServiceType, VEHICLE_SUPPORT_DEFAULT_PRICE } from '@/lib/constants/pricing'
import { BANK_ACCOUNT_INFO } from '@/lib/constants/bank-account'
import { CreditCard, Building2, ArrowRightLeft, X } from 'lucide-react'

interface PaymentFormProps {
  user?: { id: string; name: string; email: string } | null
}

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''

export default function PaymentForm({
  user = null,
}: PaymentFormProps) {
  const { formData, servicePrices, rawPrices } = useFormContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sdkMode, setSdkMode] = useState<'widget' | 'payment' | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'TRANSFER' | 'BANK_TRANSFER'>('CARD')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const widgetsRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentInstanceRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentMethodWidgetRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agreementWidgetRef = useRef<any>(null)
  const widgetRenderedRef = useRef(false)

  const basePrice = calculatePrice(formData.serviceType, formData.durationHours, servicePrices)
  const vehicleSupportPriceValue = rawPrices['차량지원'] ?? VEHICLE_SUPPORT_DEFAULT_PRICE
  const vehicleSupportPrice = formData.vehicleSupport ? vehicleSupportPriceValue : 0
  const estimatedPrice = basePrice + vehicleSupportPrice
  const serviceLabel = formData.serviceType
    ? SERVICE_TYPES[formData.serviceType as ServiceType]?.label
    : '-'

  useEffect(() => {
    if (paymentMethod === 'BANK_TRANSFER') return

    let cancelled = false

    async function initSDK() {
      try {
        if (!clientKey) {
          console.error('TossPayments client key is not set')
          return
        }
        if (widgetsRef.current || paymentInstanceRef.current) return

        const tossPayments = await loadTossPayments(clientKey)
        const customerKey = user?.id || ANONYMOUS

        try {
          const widgets = tossPayments.widgets({ customerKey })
          if (cancelled) return
          widgetsRef.current = widgets
          setSdkMode('widget')
        } catch {
          console.warn('widgets() 초기화 실패, payment() 폴백으로 전환')
          const payment = tossPayments.payment({ customerKey })
          if (cancelled) return
          paymentInstanceRef.current = payment
          setSdkMode('payment')
        }

        if (!cancelled) setSdkReady(true)
      } catch (error) {
        console.error('TossPayments SDK init error:', error)
        if (!cancelled) setSdkMode(null)
        toast.error('결제 시스템 초기화에 실패했습니다.')
      }
    }

    initSDK()

    return () => { cancelled = true }
  }, [user, paymentMethod])

  useEffect(() => {
    if (!sdkReady || sdkMode !== 'widget' || !widgetsRef.current || paymentMethod === 'BANK_TRANSFER') return
    if (widgetRenderedRef.current) return

    let cancelled = false

    async function renderWidgets() {
      const widgets = widgetsRef.current
      try {
        await widgets.setAmount({
          currency: 'KRW',
          value: estimatedPrice,
        })

        if (cancelled) return

        const [pmWidget, agWidget] = await Promise.all([
          widgets.renderPaymentMethods({
            selector: '#payment-method',
          }),
          widgets.renderAgreement({
            selector: '#agreement',
            variantKey: 'AGREEMENT',
          }),
        ])
        paymentMethodWidgetRef.current = pmWidget
        agreementWidgetRef.current = agWidget

        if (!cancelled) {
          widgetRenderedRef.current = true
        }
      } catch (error) {
        console.error('Widget render error:', error)
      }
    }

    const timer = setTimeout(renderWidgets, 50)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [sdkReady, paymentMethod, estimatedPrice])

  useEffect(() => {
    if (!widgetRenderedRef.current || !widgetsRef.current) return

    widgetsRef.current.setAmount({
      currency: 'KRW',
      value: estimatedPrice,
    }).catch((err: unknown) => {
      console.error('setAmount error:', err)
    })
  }, [estimatedPrice])

  const buildRequestBody = () => ({
    service_type: formData.serviceType,
    service_date: formData.serviceDate,
    start_time: formData.startTime,
    duration_hours: formData.durationHours,
    address: formData.guestAddress,
    address_detail: formData.guestAddressDetail,
    phone: formData.guestPhone,
    lat: formData.guestLat,
    lng: formData.guestLng,
    details: formData.details,
    designated_manager_id: formData.designatedManagerId,
    guest_name: formData.guestName,
    guest_phone: formData.guestPhone,
    guest_address: formData.guestAddress,
    guest_address_detail: formData.guestAddressDetail,
    vehicle_support: formData.vehicleSupport || false,
  })

  const handleWidgetPayment = useCallback(async () => {
    if (!sdkReady || !widgetsRef.current) {
      toast.error('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      const orderId = crypto.randomUUID()
      const orderName = `${serviceLabel} ${formData.durationHours}시간`

      sessionStorage.setItem('payment_request_data', JSON.stringify({
        ...buildRequestBody(),
        payment_method: paymentMethod,
      }))

      await widgetsRef.current.requestPayment({
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: formData.guestName || undefined,
        customerMobilePhone: formData.guestPhone?.replace(/-/g, '') || undefined,
      })
    } catch (error) {
      console.error('Payment error:', error)
      if (error instanceof Error && error.message.includes('USER_CANCEL')) {
        toast.error('결제가 취소되었습니다.')
      } else {
        toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [formData, estimatedPrice, serviceLabel, sdkReady, paymentMethod])

  const handlePaymentFallback = useCallback(async () => {
    if (!sdkReady || !paymentInstanceRef.current) {
      toast.error('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      const orderId = crypto.randomUUID()
      const orderName = `${serviceLabel} ${formData.durationHours}시간`

      const method = paymentMethod as 'CARD' | 'TRANSFER'
      sessionStorage.setItem('payment_request_data', JSON.stringify({
        ...buildRequestBody(),
        payment_method: method,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestParams: any = {
        method,
        amount: { currency: 'KRW', value: estimatedPrice },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: formData.guestName || undefined,
        customerMobilePhone: formData.guestPhone?.replace(/-/g, '') || undefined,
      }

      if (method === 'TRANSFER') {
        requestParams.transfer = {
          cashReceipt: { type: '소득공제' },
          useEscrow: false,
        }
      }

      await paymentInstanceRef.current.requestPayment(requestParams)
    } catch (error) {
      console.error('Payment fallback error:', error)
      if (error instanceof Error && error.message.includes('USER_CANCEL')) {
        toast.error('결제가 취소되었습니다.')
      } else {
        toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.')
      }
    } finally {
      setIsProcessing(false)
    }
  }, [formData, estimatedPrice, serviceLabel, sdkReady, paymentMethod])

  const handleBankTransfer = useCallback(async () => {
    setIsProcessing(true)

    try {
      const saveResponse = await fetch('/api/requests/save-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...buildRequestBody(), payment_method: 'BANK_TRANSFER' }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || '서비스 요청 저장에 실패했습니다.')
      }

      const saveResult = await saveResponse.json()
      if (!saveResult.ok || !saveResult.request_id) {
        throw new Error(saveResult.error || '서비스 요청 저장에 실패했습니다.')
      }

      window.location.href = `/payment/transfer-pending?orderId=${saveResult.request_id}&amount=${saveResult.estimated_price}`
    } catch (error) {
      console.error('Bank transfer error:', error)
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }, [formData, estimatedPrice])

  const handlePrev = () => {
    window.history.back()
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
              {formData.serviceDate && formData.startTime
                ? `${formData.serviceDate} ${formData.startTime}`
                : '-'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-gray-600">예상 시간</dt>
            <dd className="font-medium">
              {formData.durationHours ? `${formData.durationHours}시간` : '-'}
            </dd>
          </div>
          {formData.vehicleSupport && (
            <div className="flex justify-between">
              <dt className="text-gray-600">차량지원</dt>
              <dd className="font-medium">+{vehicleSupportPriceValue.toLocaleString()}원</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-600">위치</dt>
            <dd className="font-medium text-xs">
              {formData.guestAddress}
              {formData.guestAddressDetail && ` ${formData.guestAddressDetail}`}
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

      {/* SDK 로딩 상태 */}
      {!sdkReady && paymentMethod !== 'BANK_TRANSFER' && clientKey && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <span className="text-sm text-gray-500">결제 시스템을 준비하는 중...</span>
        </div>
      )}
      {sdkReady && sdkMode === null && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-800">결제 시스템 초기화에 실패했습니다.</p>
          <p className="mt-1 text-xs text-red-600">잠시 후 다시 시도하거나, 무통장입금을 이용해주세요.</p>
        </div>
      )}

      {/* 결제 방법 선택 - 항상 3개 버튼 */}
      {sdkReady && sdkMode && (
        <div className="mt-6">
          <h3 className="font-semibold text-sm text-gray-700 mb-3">결제 방법</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('CARD')}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                paymentMethod === 'CARD'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <CreditCard className="h-4 w-4" />
              카드결제
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('TRANSFER')}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                paymentMethod === 'TRANSFER'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <ArrowRightLeft className="h-4 w-4" />
              토스 퀵계좌이체
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('BANK_TRANSFER')}
              className={`min-h-[44px] flex items-center justify-center gap-1.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
                paymentMethod === 'BANK_TRANSFER'
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-4 w-4" />
              무통장입금
            </button>
          </div>
          {/* 폴백 모드: 안내 텍스트 */}
          {sdkMode === 'payment' && (paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') && (
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-sm text-blue-800">
                {paymentMethod === 'CARD'
                  ? '결제하기 버튼을 누르면 카드 결제창이 열립니다.'
                  : '결제하기 버튼을 누르면 계좌이체 결제창이 열립니다.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 토스 결제 모달 위 취소 버튼 - 결제 진행 중일 때 iframe 위에 표시 */}
      {isProcessing && (paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') && (
        <div className="fixed top-4 right-4 z-[10000000]">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-white active:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
            결제 취소
          </button>
        </div>
      )}

      {/* 위젯 렌더링 영역 */}
      <div style={{ display: sdkMode === 'widget' && (paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') ? 'block' : 'none' }}>
        {sdkMode === 'widget' && (
          <>
            <div id="payment-method" className="mt-6" />
            <div id="agreement" />
          </>
        )}
      </div>

      {/* 무통장입금: 입금 계좌 안내 */}
      {paymentMethod === 'BANK_TRANSFER' && (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-semibold text-sm text-amber-900 mb-3">입금 계좌 안내</h4>
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
              <dd className="font-bold text-amber-900">{estimatedPrice.toLocaleString()}원</dd>
            </div>
          </dl>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-amber-700">
              ※ 입금 확인 후 서비스 요청이 접수됩니다.
            </p>
            <p className="text-xs text-amber-700">
              ※ 입금자명은 신청자 이름과 동일하게 입금해주세요.
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        {(paymentMethod === 'CARD' || paymentMethod === 'TRANSFER') && (
          <button
            type="button"
            onClick={sdkMode === 'widget' ? handleWidgetPayment : handlePaymentFallback}
            disabled={isProcessing || !sdkReady}
            className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리 중...' : `${estimatedPrice.toLocaleString()}원 결제하기`}
          </button>
        )}
        {paymentMethod === 'BANK_TRANSFER' && (
          <button
            type="button"
            onClick={handleBankTransfer}
            disabled={isProcessing}
            className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리 중...' : '무통장입금으로 신청하기'}
          </button>
        )}
      </div>
    </div>
  )
}
