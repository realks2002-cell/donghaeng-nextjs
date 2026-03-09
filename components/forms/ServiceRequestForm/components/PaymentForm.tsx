'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { loadTossPayments, ANONYMOUS } from '@tosspayments/tosspayments-sdk'
import { useFormContext } from '../context/FormContext'
import { calculatePrice } from '../types'
import { SERVICE_TYPES, ServiceType, VEHICLE_SUPPORT_DEFAULT_PRICE } from '@/lib/constants/pricing'
import { BANK_ACCOUNT_INFO } from '@/lib/constants/bank-account'
import { CreditCard, Building2 } from 'lucide-react'

interface PaymentFormProps {
  user?: { id: string; name: string; email: string } | null
}

const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''

export default function PaymentForm({
  user = null,
}: PaymentFormProps) {
  const { formData, servicePrices, rawPrices } = useFormContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [sdkReady, setSdkReady] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'transfer' | 'bank_transfer'>('card')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paymentRef = useRef<any>(null)

  const basePrice = calculatePrice(formData.serviceType, formData.durationHours, servicePrices)
  const vehicleSupportPriceValue = rawPrices['차량지원'] ?? VEHICLE_SUPPORT_DEFAULT_PRICE
  const vehicleSupportPrice = formData.vehicleSupport ? vehicleSupportPriceValue : 0
  const estimatedPrice = basePrice + vehicleSupportPrice
  const serviceLabel = formData.serviceType
    ? SERVICE_TYPES[formData.serviceType as ServiceType]?.label
    : '-'

  // SDK 초기화 (카드결제 선택 시에만)
  useEffect(() => {
    if (paymentMethod === 'bank_transfer') return

    async function initSDK() {
      try {
        if (!clientKey) {
          console.error('TossPayments client key is not set')
          return
        }
        const tossPayments = await loadTossPayments(clientKey)
        const customerKey = user?.id || ANONYMOUS
        const payment = tossPayments.payment({ customerKey })
        paymentRef.current = payment
        setSdkReady(true)
      } catch (error) {
        console.error('TossPayments SDK init error:', error)
        toast.error('결제 시스템 초기화에 실패했습니다.')
      }
    }

    initSDK()
  }, [user, paymentMethod])

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
  })

  const handlePayment = useCallback(async () => {
    if (!sdkReady || !paymentRef.current) {
      toast.error('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      // 클라이언트에서 UUID 생성, 폼 데이터를 sessionStorage에 저장
      const orderId = crypto.randomUUID()
      const orderName = `${serviceLabel} ${formData.durationHours}시간`

      sessionStorage.setItem('service_request_form_data', JSON.stringify({
        ...buildRequestBody(),
        payment_method: 'CARD',
      }))

      await paymentRef.current.requestPayment({
        method: 'CARD',
        amount: {
          currency: 'KRW',
          value: estimatedPrice,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: formData.guestName || undefined,
        customerMobilePhone: formData.guestPhone?.replace(/-/g, '') || undefined,
        card: {
          useEscrow: false,
          flowMode: 'DEFAULT',
          useCardPoint: false,
          useAppCardOnly: false,
        },
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
  }, [formData, estimatedPrice, serviceLabel, sdkReady])

  const handleTransfer = useCallback(async () => {
    if (!sdkReady || !paymentRef.current) {
      toast.error('결제 시스템이 준비되지 않았습니다. 잠시 후 다시 시도해주세요.')
      return
    }

    setIsProcessing(true)

    // 토스 dimmer div 추가를 감지하여 내부에 닫기 버튼 inject
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (node instanceof HTMLElement && node.id === '__tosspayments_payment-gateway_dimmer__') {
            if (document.getElementById('toss-transfer-close')) return
            const closeBtn = document.createElement('button')
            closeBtn.id = 'toss-transfer-close'
            closeBtn.innerHTML = '✕'
            closeBtn.setAttribute('aria-label', '결제 취소')
            closeBtn.style.cssText = 'position:fixed;top:12px;right:12px;z-index:99999999;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,0.7);color:white;font-size:20px;border:2px solid rgba(255,255,255,0.3);cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);'
            closeBtn.onclick = () => {
              closeBtn.remove()
              window.location.reload()
            }
            node.appendChild(closeBtn)
            observer.disconnect()
            return
          }
        }
      }
    })
    observer.observe(document.body, { childList: true })

    try {
      const orderId = crypto.randomUUID()
      const orderName = `${serviceLabel} ${formData.durationHours}시간`

      sessionStorage.setItem('service_request_form_data', JSON.stringify({
        ...buildRequestBody(),
        payment_method: 'TRANSFER',
      }))

      await paymentRef.current.requestPayment({
        method: 'TRANSFER',
        amount: {
          currency: 'KRW',
          value: estimatedPrice,
        },
        orderId,
        orderName,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: formData.guestName || undefined,
        customerMobilePhone: formData.guestPhone?.replace(/-/g, '') || undefined,
        transfer: {
          cashReceipt: {
            type: '소득공제',
          },
          useEscrow: false,
        },
      })
    } catch (error) {
      console.error('Transfer payment error:', error)
      if (error instanceof Error && error.message.includes('USER_CANCEL')) {
        toast.error('결제가 취소되었습니다.')
      } else {
        toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.')
      }
    } finally {
      observer.disconnect()
      document.getElementById('toss-transfer-close')?.remove()
      setIsProcessing(false)
    }
  }, [formData, estimatedPrice, serviceLabel, sdkReady])

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

      {/* 결제 방법 선택 */}
      <div className="mt-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">결제 방법</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setPaymentMethod('card')}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
              paymentMethod === 'card'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            카드결제
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('transfer')}
            className={`relative min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
              paymentMethod === 'transfer'
                ? 'border-[#0064FF] bg-[#0064FF]/5 text-[#0064FF]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="absolute -top-2 -right-2 bg-[#0064FF] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">NEW</span>
            <span className="font-bold text-[#0064FF] text-xs tracking-tight">toss</span>
            <span className="text-sm">퀵계좌이체</span>
          </button>
          <button
            type="button"
            onClick={() => setPaymentMethod('bank_transfer')}
            className={`min-h-[44px] flex items-center justify-center gap-2 rounded-lg border-2 p-3 text-sm font-medium transition-colors ${
              paymentMethod === 'bank_transfer'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Building2 className="h-5 w-5" />
            무통장입금
          </button>
        </div>
      </div>

      {/* SDK 로딩 상태 (카드/계좌이체) */}
      {(paymentMethod === 'card' || paymentMethod === 'transfer') && !sdkReady && (
        <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
          <span className="text-sm text-gray-500">결제 시스템을 준비하는 중...</span>
        </div>
      )}

      {/* 카드결제: 안내 */}
      {paymentMethod === 'card' && sdkReady && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            결제하기 버튼을 누르면 토스페이먼츠 결제창이 열립니다.
            <br />
            결제창에서 원하시는 결제 수단을 선택해주세요.
          </p>
        </div>
      )}

      {/* 계좌이체: 안내 */}
      {paymentMethod === 'transfer' && sdkReady && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            결제하기 버튼을 누르면 토스페이먼츠 계좌이체 결제창이 열립니다.
            <br />
            결제창에서 출금 계좌를 선택하여 결제해주세요.
          </p>
        </div>
      )}

      {/* 계좌이체: 입금 계좌 안내 */}
      {paymentMethod === 'bank_transfer' && (
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
        {paymentMethod === 'card' && (
          <button
            type="button"
            onClick={handlePayment}
            disabled={isProcessing || !sdkReady}
            className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리 중...' : `${estimatedPrice.toLocaleString()}원 결제하기`}
          </button>
        )}
        {paymentMethod === 'transfer' && (
          <button
            type="button"
            onClick={handleTransfer}
            disabled={isProcessing || !sdkReady}
            className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? '처리 중...' : `${estimatedPrice.toLocaleString()}원 결제하기`}
          </button>
        )}
        {paymentMethod === 'bank_transfer' && (
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
