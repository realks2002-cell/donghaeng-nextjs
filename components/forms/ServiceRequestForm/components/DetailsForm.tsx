'use client'

import { useRouter } from 'next/navigation'
import { useFormContext } from '../context/FormContext'

export default function DetailsForm() {
  const router = useRouter()
  const { formData, updateFormData } = useFormContext()
  const maxLength = 1000

  const handleNext = () => {
    router.push('/requests/new/payment')
  }

  const handlePrev = () => {
    router.back()
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">추가로 알려주실 사항이 있나요?</h2>

      <div className="mt-4">
        <label htmlFor="details" className="block text-sm font-medium text-gray-700">
          상세 요청사항 <span className="text-gray-400">(선택)</span>
        </label>
        <textarea
          id="details"
          value={formData.details}
          onChange={(e) => updateFormData({ details: e.target.value.slice(0, maxLength) })}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          rows={5}
          maxLength={maxLength}
          placeholder="예: 병원 진료과, 휠체어 필요, 주차 가능 여부 등"
        />
        <p className="mt-1 text-right text-sm text-gray-500">
          <span>{formData.details.length}</span> / {maxLength}
        </p>
        <p className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-600">
          매니저에게 도움이 되는 정보를 자세히 적어주세요. 예: 환자 상태, 준비물, 특별한 요청사항 등
        </p>
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
