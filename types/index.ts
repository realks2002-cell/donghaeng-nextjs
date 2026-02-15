// 서비스 타입
export type ServiceType =
  | 'hospital_companion'      // 병원동행
  | 'daily_care'              // 일상돌봄
  | 'hospital_waiting'        // 진료대기
  | 'medication_management'   // 투약관리
  | 'rehabilitation_support'  // 재활지원
  | 'mental_health'           // 정서지원

export const SERVICE_TYPES: Record<ServiceType, { label: string; description: string }> = {
  hospital_companion: {
    label: '병원동행',
    description: '병원 방문 시 함께 동행하며 진료, 검사, 수납 등을 도와드립니다.',
  },
  daily_care: {
    label: '일상돌봄',
    description: '일상생활 전반에 걸친 돌봄 서비스를 제공합니다.',
  },
  hospital_waiting: {
    label: '진료대기',
    description: '진료 대기 시간 동안 함께 대기하며 필요한 도움을 드립니다.',
  },
  medication_management: {
    label: '투약관리',
    description: '복약 시간과 용량을 관리하고 도와드립니다.',
  },
  rehabilitation_support: {
    label: '재활지원',
    description: '재활 운동 및 일상 회복을 지원합니다.',
  },
  mental_health: {
    label: '정서지원',
    description: '대화와 정서적 교감을 통해 심리적 안정을 도와드립니다.',
  },
}

// 서비스 요청 상태
export type RequestStatus =
  | 'PENDING'      // 대기중
  | 'MATCHING'     // 매칭중
  | 'CONFIRMED'    // 확정
  | 'IN_PROGRESS'  // 진행중
  | 'COMPLETED'    // 완료
  | 'CANCELLED'    // 취소

export const REQUEST_STATUS: Record<RequestStatus, { label: string; color: string }> = {
  PENDING: { label: '대기중', color: 'bg-gray-100 text-gray-800' },
  MATCHING: { label: '매칭중', color: 'bg-blue-100 text-blue-800' },
  CONFIRMED: { label: '확정', color: 'bg-green-100 text-green-800' },
  IN_PROGRESS: { label: '진행중', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
}

// 서비스 요청 폼 데이터
export interface ServiceRequestFormData {
  // Step 1: 서비스 선택
  serviceType: ServiceType

  // Step 2: 일시 선택
  serviceDate: string
  startTime: string
  durationHours: number

  // Step 3: 위치/연락처
  address: string
  addressDetail: string
  phone: string
  lat?: number
  lng?: number

  // Step 4: 상세 요청
  details: string

  // Step 5: 결제 (비회원)
  guestEmail?: string
  guestName?: string
}

// 가격 계산
export const HOURLY_RATE = 25000 // 시간당 요금

export function calculatePrice(durationHours: number): number {
  return durationHours * HOURLY_RATE
}

// 시간 옵션
export const TIME_OPTIONS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00',
]

export const DURATION_OPTIONS = [
  { value: 1, label: '1시간' },
  { value: 2, label: '2시간' },
  { value: 3, label: '3시간' },
  { value: 4, label: '4시간' },
  { value: 5, label: '5시간' },
  { value: 6, label: '6시간' },
  { value: 8, label: '8시간' },
]
