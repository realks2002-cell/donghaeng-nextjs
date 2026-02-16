'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFormContext } from '../context/FormContext'
import { TIME_OPTIONS, DURATION_OPTIONS, calculatePrice } from '../types'
import { SERVICE_TYPES, ServiceType } from '@/lib/constants/pricing'

export default function DateTimeForm() {
  const router = useRouter()
  const { formData, updateFormData } = useFormContext()

  // 최소 날짜: 오늘
  const minDate = new Date().toISOString().split('T')[0]

  const estimatedPrice = calculatePrice(formData.serviceType, formData.durationHours)
  const pricePerHour = formData.serviceType
    ? SERVICE_TYPES[formData.serviceType as ServiceType]?.pricePerHour ?? 0
    : 0

  const handleNext = () => {
    if (!formData.serviceDate) {
      toast.error('서비스 날짜를 선택해주세요.')
      return
    }
    if (!formData.startTime) {
      toast.error('서비스 시간을 선택해주세요.')
      return
    }
    if (!formData.durationHours) {
      toast.error('예상 소요 시간을 선택해주세요.')
      return
    }
    router.push('/requests/new/manager')
  }

  const handlePrev = () => {
    router.back()
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">언제 서비스가 필요하신가요?</h2>

      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="service_date" className="block text-sm font-medium text-gray-700">
            날짜
          </label>
          <input
            type="date"
            id="service_date"
            value={formData.serviceDate}
            onChange={(e) => updateFormData({ serviceDate: e.target.value })}
            min={minDate}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
            시작 시간
          </label>
          <select
            id="start_time"
            value={formData.startTime}
            onChange={(e) => updateFormData({ startTime: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">선택</option>
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="block text-sm font-medium text-gray-700">예상 소요 시간</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((hours) => (
              <label
                key={hours}
                className={`flex min-h-[44px] cursor-pointer items-center rounded-lg border px-4 transition-all ${
                  formData.durationHours === hours
                    ? 'border-primary ring-2 ring-primary'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="duration_hours"
                  value={hours}
                  checked={formData.durationHours === hours}
                  onChange={() => updateFormData({ durationHours: hours })}
                  className="sr-only"
                />
                {hours}시간
              </label>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-700">예상 금액</p>
          <p className="mt-1 text-xl font-bold text-primary">{estimatedPrice.toLocaleString()}원</p>
          <p className="mt-1 text-xs text-gray-500">
            선택한 서비스 요금 {pricePerHour.toLocaleString()}원/시간 × {formData.durationHours || 0}
            시간 · 최종 금액은 실제 소요 시간에 따라 달라질 수 있습니다.
          </p>
        </div>
      </div>

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
          onClick={handleNext}
          className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90"
        >
          다음
        </button>
      </div>
    </div>
  )
}
