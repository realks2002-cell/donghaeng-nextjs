'use client'

import { toast } from 'sonner'
import { ServiceRequestFormData, SERVICE_TYPES, ServiceType } from './types'
import { ServiceType as PricingServiceType, DEFAULT_SERVICE_PRICES } from '@/lib/constants/pricing'

interface Step2ServiceProps {
  data: ServiceRequestFormData
  onUpdate: (data: Partial<ServiceRequestFormData>) => void
  onNext: () => void
  onPrev: () => void
  servicePrices?: Record<PricingServiceType, number>
}

export default function Step2Service({ data, onUpdate, onNext, onPrev, servicePrices = DEFAULT_SERVICE_PRICES }: Step2ServiceProps) {
  const handleSelect = (serviceType: ServiceType) => {
    onUpdate({ serviceType })
  }

  const handleNext = () => {
    if (!data.serviceType) {
      toast.error('서비스를 선택해주세요.')
      return
    }
    onNext()
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">어떤 서비스가 필요하신가요?</h2>

      <div className="mt-4 space-y-2">
        {(Object.entries(SERVICE_TYPES) as [ServiceType, { label: string; description: string; pricePerHour: number }][]).map(
          ([key, { label, description }]) => {
            // 동적 가격 사용
            const dynamicPrice = servicePrices[key as PricingServiceType] || DEFAULT_SERVICE_PRICES[key as PricingServiceType]

            return (
              <label
                key={key}
                className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                  data.serviceType === key
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="service_type"
                  value={key}
                  checked={data.serviceType === key}
                  onChange={() => handleSelect(key)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{label}</span>
                    <span className="text-sm text-primary font-medium">
                      {dynamicPrice.toLocaleString()}원/시간
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-600">{description}</p>
                </div>
              </label>
            )
          }
        )}
      </div>

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
          onClick={handleNext}
          className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90"
        >
          다음
        </button>
      </div>
    </div>
  )
}
