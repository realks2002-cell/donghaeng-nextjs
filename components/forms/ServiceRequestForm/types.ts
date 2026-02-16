// 서비스 타입과 가격 정보는 lib/constants/pricing.ts에서 가져옴
import type { ServiceType as ServiceTypeImport } from '@/lib/constants/pricing'
export type ServiceType = ServiceTypeImport
export { SERVICE_TYPES, SERVICE_PRICES } from '@/lib/constants/pricing'

// 폼 데이터 타입
export interface ServiceRequestFormData {
  // Step 1: 회원/비회원
  userType: 'member' | 'non-member' | null

  // Step 1.5: 신청자 정보
  guestName: string
  guestPhone: string
  guestAddress: string
  guestAddressDetail: string
  guestLat?: number
  guestLng?: number

  // Step 2: 서비스 선택
  serviceType: ServiceType | null

  // Step 3: 일시 선택
  serviceDate: string
  startTime: string
  durationHours: number

  // Step 3.5: 매니저 지정 (선택)
  designatedManagerId: string | null
  designatedManager?: {
    id: string
    name: string
    phone: string
    photo?: string
    address?: string
    specialty?: string
  } | null

  // Step 4: 상세 요청사항
  details: string

  // Step 1.5: 개인정보 수집동의 (비회원)
  privacyConsent: boolean

  // Step 5: 결제
  confirmTerms: boolean
}

// 초기 폼 데이터
export const initialFormData: ServiceRequestFormData = {
  userType: null,
  guestName: '',
  guestPhone: '',
  guestAddress: '',
  guestAddressDetail: '',
  privacyConsent: false,
  serviceType: null,
  serviceDate: '',
  startTime: '',
  durationHours: 0,
  designatedManagerId: null,
  designatedManager: null,
  details: '',
  confirmTerms: false,
}

// 시간 옵션
export const TIME_OPTIONS: string[] = []
for (let h = 0; h < 24; h++) {
  for (const m of [0, 30]) {
    TIME_OPTIONS.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)
  }
}

// 시간 옵션 (1시간 ~ 9시간)
export const DURATION_OPTIONS = Array.from({ length: 9 }, (_, i) => i + 1)

// 가격 계산 함수는 lib/constants/pricing.ts에서 가져옴
export { calculatePrice } from '@/lib/constants/pricing'

// 스텝 타입
export type Step = 1 | 1.5 | 2 | 3 | 3.5 | 4 | 5
