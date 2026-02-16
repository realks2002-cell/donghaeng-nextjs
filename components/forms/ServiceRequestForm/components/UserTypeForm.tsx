'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFormContext } from '../context/FormContext'

export default function UserTypeForm() {
  const router = useRouter()
  const { formData, updateFormData } = useFormContext()

  const handleSelect = (userType: 'member' | 'non-member') => {
    updateFormData({ userType })
  }

  const handleNext = () => {
    if (!formData.userType) {
      toast.error('회원 여부를 선택해주세요.')
      return
    }

    // 회원 선택 시 로그인 페이지로 리다이렉트
    if (formData.userType === 'member') {
      router.push('/auth/login?redirect=/requests/new')
      return
    }

    // 비회원 선택 시 정보 입력 페이지로 이동
    router.push('/requests/new/info')
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">회원이신가요?</h2>
      <p className="mt-2 text-sm text-gray-600">서비스 신청을 위해 회원 여부를 선택해주세요.</p>

      <div className="mt-6 space-y-3">
        <label
          className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
            formData.userType === 'member'
              ? 'border-primary ring-2 ring-primary'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="user_type"
            value="member"
            checked={formData.userType === 'member'}
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

        <label
          className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
            formData.userType === 'non-member'
              ? 'border-primary ring-2 ring-primary'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="user_type"
            value="non-member"
            checked={formData.userType === 'non-member'}
            onChange={() => handleSelect('non-member')}
            className="mt-1"
          />
          <div>
            <span className="text-lg font-medium">비회원</span>
            <p className="mt-1 text-sm text-gray-600">
              회원가입 없이 바로 서비스를 신청하실 수 있습니다.
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
