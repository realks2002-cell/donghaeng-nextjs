'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFormContext } from '../context/FormContext'
import { calculatePrice } from '../types'
import { SERVICE_TYPES, ServiceType, DEFAULT_SERVICE_PRICES } from '@/lib/constants/pricing'

interface PaymentFormProps {
  user?: { id: string; name: string; email: string } | null
  servicePrices?: Record<ServiceType, number>
}

const PAYMENT_METHODS = [
  { id: '카드', label: '카드 결제', icon: '💳' },
  { id: '계좌이체', label: '계좌이체', icon: '🏦' },
  { id: '가상계좌', label: '가상계좌', icon: '📋' },
  { id: '휴대폰', label: '휴대폰 결제', icon: '📱' },
] as const

export default function PaymentForm({
  user = null,
  servicePrices = DEFAULT_SERVICE_PRICES,
}: PaymentFormProps) {
  const router = useRouter()
  const { formData, updateFormData, clearFormData } = useFormContext()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('카드')
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const estimatedPrice = calculatePrice(formData.serviceType, formData.durationHours, servicePrices)
  const serviceLabel = formData.serviceType
    ? SERVICE_TYPES[formData.serviceType as ServiceType]?.label
    : '-'

  const handlePayment = useCallback(async () => {
    if (!formData.confirmTerms) {
      toast.error('서비스 이용약관에 동의해주세요.')
      return
    }

    setIsProcessing(true)

    try {
      // 서비스 요청을 DB에 저장
      const saveResponse = await fetch('/api/requests/save-temp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          customer_id: user?.id || null,
          payment_method: selectedMethod,
          amount: estimatedPrice,
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

      // 성공 모달 표시
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Payment error:', error)
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.')
    } finally {
      setIsProcessing(false)
    }
  }, [formData, selectedMethod, estimatedPrice, user])

  const handleSuccessConfirm = () => {
    setShowSuccessModal(false)
    clearFormData()
    router.push('/')
  }

  const handlePrev = () => {
    router.back()
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

      {/* 결제 수단 선택 */}
      <div className="mt-6">
        <h3 className="font-semibold text-sm text-gray-700 mb-3">결제 수단</h3>
        <div className="grid grid-cols-2 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              type="button"
              onClick={() => setSelectedMethod(method.id)}
              className={`min-h-[44px] rounded-lg border-2 p-3 text-center transition-colors ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{method.icon}</span>
              <span className="ml-1 text-sm font-medium">{method.label}</span>
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 flex min-h-[44px] cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          checked={formData.confirmTerms}
          onChange={(e) => updateFormData({ confirmTerms: e.target.checked })}
          className="mt-1"
        />
        <span className="text-sm text-gray-700">
          위 내용을 확인했으며 서비스 이용약관에 동의합니다.
        </span>
      </label>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handlePayment}
          disabled={isProcessing}
          className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? '처리 중...' : '결제하기'}
        </button>
      </div>

      {/* 결제 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-bold text-gray-900">결제가 성공되었습니다</h3>
            <p className="mt-2 text-sm text-gray-600">
              서비스 요청이 접수되었습니다.
              <br />
              담당 매니저 배정 후 연락드리겠습니다.
            </p>
            <button
              type="button"
              onClick={handleSuccessConfirm}
              className="mt-6 min-h-[44px] w-full rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
