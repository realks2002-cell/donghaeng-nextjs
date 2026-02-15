'use client'

import { toast } from 'sonner'
import { ServiceRequestFormData } from './types'

interface Step1UserTypeProps {
  data: ServiceRequestFormData
  onUpdate: (data: Partial<ServiceRequestFormData>) => void
  onNext: () => void
}

export default function Step1UserType({ data, onUpdate, onNext }: Step1UserTypeProps) {
  const handleSelect = (userType: 'member' | 'non-member') => {
    onUpdate({ userType })
  }

  const handleNext = () => {
    if (!data.userType) {
      toast.error('회원 여부를 선택해주세요.')
      return
    }
    onNext()
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">회원이신가요?</h2>
      <p className="mt-2 text-sm text-gray-600">서비스 신청을 위해 회원 여부를 선택해주세요.</p>

      <div className="mt-6 space-y-3">
        <label className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
          data.userType === 'member'
            ? 'border-primary ring-2 ring-primary'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="radio"
            name="user_type"
            value="member"
            checked={data.userType === 'member'}
            onChange={() => handleSelect('member')}
            className="mt-1"
          />
          <div>
            <span className="text-lg font-medium">회원</span>
            <p className="mt-1 text-sm text-gray-600">
              이미 가입하신 회원이시면 로그인 후 서비스를 신청하실 수 있습니다.
            </p>
          </div>
        </label>

        <label className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
          data.userType === 'non-member'
            ? 'border-primary ring-2 ring-primary'
            : 'border-gray-200 hover:border-gray-300'
        }`}>
          <input
            type="radio"
            name="user_type"
            value="non-member"
            checked={data.userType === 'non-member'}
            onChange={() => handleSelect('non-member')}
            className="mt-1"
          />
          <div>
            <span className="text-lg font-medium">비회원</span>
            <p className="mt-1 text-sm text-gray-600">
              회원가입 후 서비스를 신청하실 수 있습니다.
            </p>
          </div>
        </label>
      </div>

      <div className="mt-6 flex justify-end">
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
