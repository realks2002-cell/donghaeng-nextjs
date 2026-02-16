'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ServiceRequestFormData, initialFormData, Step, ServiceType } from './types'
import { loadServicePrices, getDynamicPrices, ServiceType as PricingServiceType } from '@/lib/constants/pricing'
import ProgressBar from './ProgressBar'
import Step1UserType from './Step1UserType'
import Step1_5GuestInfo from './Step1_5GuestInfo'
import Step2Service from './Step2Service'
import Step3DateTime from './Step3DateTime'
import Step3_5ManagerSelect from './Step3_5ManagerSelect'
import Step4Details from './Step4Details'
import Step5Payment from './Step5Payment'

interface ServiceRequestFormProps {
  isLoggedIn?: boolean
  user?: { id: string; name: string; email: string; phone?: string; address?: string } | null
}

export default function ServiceRequestForm({ isLoggedIn = false, user = null }: ServiceRequestFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [servicePrices, setServicePrices] = useState<Record<PricingServiceType, number> | null>(null)

  // 컴포넌트 마운트 시 서비스 가격 로드
  useEffect(() => {
    loadServicePrices().then((prices) => {
      setServicePrices(prices)
    })
  }, [])

  // 로그인한 회원은 Step 1.5부터 시작
  const [step, setStep] = useState<Step>(isLoggedIn ? 1.5 : 1)

  // isLoggedIn이 변경되면 step 동기화
  useEffect(() => {
    if (isLoggedIn && step === 1) {
      setStep(1.5)
    }
  }, [isLoggedIn, step])

  const [formData, setFormData] = useState<ServiceRequestFormData>(() => {
    const initial = { ...initialFormData }

    // URL 파라미터에서 서비스 타입 가져오기
    const serviceParam = searchParams.get('service')
    if (serviceParam && ['hospital_companion', 'daily_care', 'life_companion', 'elderly_care', 'child_care', 'other'].includes(serviceParam)) {
      initial.serviceType = serviceParam as ServiceType
    }

    // 로그인한 회원은 자동으로 member 설정 및 정보 채우기
    if (isLoggedIn && user) {
      initial.userType = 'member'
      initial.guestName = user.name || ''
      initial.guestPhone = user.phone || ''
      initial.guestAddress = user.address || ''
    }

    return initial
  })

  const updateFormData = (data: Partial<ServiceRequestFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    // Step 1에서 회원 선택 시 로그인 페이지로 리다이렉트
    if (step === 1 && formData.userType === 'member' && !isLoggedIn) {
      router.push(`/auth/login?redirect=${encodeURIComponent('/requests/new')}`)
      return
    }

    // 스텝 순서: 1 → 1.5 → 2 → 3 → 3.5 → 4 → 5
    const nextSteps: Record<Step, Step> = {
      1: 1.5,
      1.5: 2,
      2: 3,
      3: 3.5,
      3.5: 4,
      4: 5,
      5: 5, // 마지막
    }
    setStep(nextSteps[step])
  }

  const handlePrev = () => {
    // 로그인한 회원은 Step 1.5가 첫 단계
    if (isLoggedIn && step === 1.5) return

    const prevSteps: Record<Step, Step> = {
      1: 1, // 첫 단계
      1.5: 1,
      2: 1.5,
      3: 2,
      3.5: 3,
      4: 3.5,
      5: 4,
    }
    setStep(prevSteps[step])
  }

  const handleSubmit = async () => {
    router.push('/')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6">
      <h1 className="text-2xl font-bold">서비스 요청</h1>
      <p className="mt-1 text-gray-600">원하는 서비스와 일시를 선택해주세요.</p>

      <ProgressBar currentStep={step} />

      <div className="mt-6">
        {step === 1 && (
          <Step1UserType
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        )}

        {step === 1.5 && (
          <Step1_5GuestInfo
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
            isLoggedIn={isLoggedIn}
          />
        )}

        {step === 2 && (
          <Step2Service
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
            servicePrices={servicePrices || getDynamicPrices()}
          />
        )}

        {step === 3 && (
          <Step3DateTime
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {step === 3.5 && (
          <Step3_5ManagerSelect
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {step === 4 && (
          <Step4Details
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        )}

        {step === 5 && (
          <Step5Payment
            data={formData}
            onUpdate={updateFormData}
            onPrev={handlePrev}
            onSubmit={handleSubmit}
            isLoggedIn={isLoggedIn}
            user={user}
            servicePrices={servicePrices || getDynamicPrices()}
          />
        )}
      </div>
    </div>
  )
}
