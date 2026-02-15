/**
 * 서비스 가격 정보
 *
 * 모든 서비스 타입의 시간당 가격을 정의합니다.
 * components/forms/ServiceRequestForm/types.ts와 동기화됨
 *
 * 가격은 Supabase의 service_prices 테이블에서 동적으로 로드됩니다.
 * 여기의 값은 기본값(fallback)으로 사용됩니다.
 */

export type ServiceType =
  | 'hospital_companion'      // 병원 동행
  | 'daily_care'              // 가사돌봄
  | 'life_companion'          // 생활동행
  | 'elderly_care'            // 노인 돌봄
  | 'child_care'              // 아이 돌봄
  | 'other'                   // 기타

// 서비스 타입 영어 -> 한글 매핑
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  hospital_companion: '병원 동행',
  daily_care: '가사돌봄',
  life_companion: '생활동행',
  elderly_care: '노인 돌봄',
  child_care: '아이 돌봄',
  other: '기타',
}

// 서비스 타입 한글 -> 영어 매핑
export const SERVICE_TYPE_KEYS: Record<string, ServiceType> = {
  '병원 동행': 'hospital_companion',
  '가사돌봄': 'daily_care',
  '생활동행': 'life_companion',
  '노인 돌봄': 'elderly_care',
  '아이 돌봄': 'child_care',
  '기타': 'other',
}

/**
 * 서비스 타입별 기본 시간당 가격 (원)
 * Supabase에서 가격을 가져올 수 없을 때 사용
 */
export const DEFAULT_SERVICE_PRICES: Record<ServiceType, number> = {
  hospital_companion: 20000,
  daily_care: 18000,
  life_companion: 18000,
  elderly_care: 22000,
  child_care: 20000,
  other: 20000,
}

// 동적 가격을 저장할 변수
let dynamicPrices: Record<ServiceType, number> | null = null

/**
 * 현재 서비스 가격 (동적 가격이 로드되면 사용, 아니면 기본값)
 */
export const SERVICE_PRICES: Record<ServiceType, number> = new Proxy(DEFAULT_SERVICE_PRICES, {
  get(target, prop: ServiceType) {
    if (dynamicPrices && prop in dynamicPrices) {
      return dynamicPrices[prop]
    }
    return target[prop]
  },
})

/**
 * 동적 가격 설정 (API에서 가져온 가격 적용)
 */
export function setDynamicPrices(prices: Record<string, number>) {
  const mapped: Record<ServiceType, number> = { ...DEFAULT_SERVICE_PRICES }

  Object.entries(prices).forEach(([koreanLabel, price]) => {
    const serviceType = SERVICE_TYPE_KEYS[koreanLabel]
    if (serviceType) {
      mapped[serviceType] = price
    }
  })

  dynamicPrices = mapped
}

/**
 * 동적 가격 가져오기
 */
export function getDynamicPrices(): Record<ServiceType, number> {
  return dynamicPrices || DEFAULT_SERVICE_PRICES
}

/**
 * 서비스 타입별 메타데이터
 */
export const SERVICE_TYPES: Record<ServiceType, { label: string; description: string; pricePerHour: number }> = {
  hospital_companion: {
    label: '병원 동행',
    description: '진료 예약부터 귀가까지 함께합니다',
    pricePerHour: DEFAULT_SERVICE_PRICES.hospital_companion,
  },
  daily_care: {
    label: '가사돌봄',
    description: '가사 활동을 도와드립니다',
    pricePerHour: DEFAULT_SERVICE_PRICES.daily_care,
  },
  life_companion: {
    label: '생활동행',
    description: '일상 생활 동행을 도와드립니다',
    pricePerHour: DEFAULT_SERVICE_PRICES.life_companion,
  },
  elderly_care: {
    label: '노인 돌봄',
    description: '어르신의 일상을 도와드립니다',
    pricePerHour: DEFAULT_SERVICE_PRICES.elderly_care,
  },
  child_care: {
    label: '아이 돌봄',
    description: '안전하게 아이를 돌봐드립니다',
    pricePerHour: DEFAULT_SERVICE_PRICES.child_care,
  },
  other: {
    label: '기타',
    description: '기타 동행 및 돌봄 서비스',
    pricePerHour: DEFAULT_SERVICE_PRICES.other,
  },
}

/**
 * 동적 가격을 사용한 서비스 메타데이터 가져오기
 */
export function getServiceTypeWithPrice(serviceType: ServiceType): { label: string; description: string; pricePerHour: number } {
  const base = SERVICE_TYPES[serviceType]
  const prices = getDynamicPrices()
  return {
    ...base,
    pricePerHour: prices[serviceType],
  }
}

/**
 * 서비스 가격 계산
 * @param serviceType 서비스 타입
 * @param durationHours 예상 소요 시간 (시간 단위)
 * @param customPrices 커스텀 가격 (옵션)
 * @returns 총 예상 가격 (원)
 */
export function calculatePrice(
  serviceType: ServiceType | null,
  durationHours: number,
  customPrices?: Record<ServiceType, number>
): number {
  if (!serviceType || !durationHours) return 0
  const prices = customPrices || getDynamicPrices()
  return prices[serviceType] * durationHours
}

/**
 * API에서 서비스 가격 로드
 */
export async function loadServicePrices(): Promise<Record<ServiceType, number>> {
  try {
    const response = await fetch('/api/service-prices')
    if (response.ok) {
      const data = await response.json()
      if (data.prices) {
        setDynamicPrices(data.prices)
        return getDynamicPrices()
      }
    }
  } catch (error) {
    console.error('Failed to load service prices:', error)
  }
  return DEFAULT_SERVICE_PRICES
}
