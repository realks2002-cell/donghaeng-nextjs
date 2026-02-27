// 서비스 요청 상태 라벨 (관리자 페이지용)
export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'New',
  PENDING_PAYMENT: '결제대기',
  CONFIRMED: 'New',
  MATCHING: '매칭중',
  MATCHED: '매칭완료',
  IN_PROGRESS: '서비스 중',
  COMPLETED: '서비스 완료',
  CANCELLED: '취소됨',
}

// 관리자 페이지용 상태 스타일
export const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PENDING_PAYMENT: 'bg-gray-100 text-gray-800',
  CONFIRMED: 'bg-yellow-100 text-yellow-800',
  MATCHING: 'bg-purple-100 text-purple-800',
  MATCHED: 'bg-indigo-100 text-indigo-800',
  IN_PROGRESS: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

// 고객 페이지용 상태 표시 (라벨 + 색상 + 설명)
export const STATUS_DISPLAY: Record<string, { label: string; color: string; description: string }> = {
  PENDING: { label: 'New', color: 'bg-yellow-100 text-yellow-800', description: '결제 대기 중입니다.' },
  PENDING_PAYMENT: { label: '결제대기', color: 'bg-gray-100 text-gray-800', description: '결제 진행 중입니다.' },
  CONFIRMED: { label: 'New', color: 'bg-yellow-100 text-yellow-800', description: '결제가 완료되었습니다. 매니저 매칭을 진행합니다.' },
  MATCHING: { label: '매칭중', color: 'bg-purple-100 text-purple-800', description: '매니저가 지원 중입니다.' },
  MATCHED: { label: '매칭완료', color: 'bg-indigo-100 text-indigo-800', description: '매니저가 배정되었습니다. 서비스 시작을 준비합니다.' },
  IN_PROGRESS: { label: '서비스 중', color: 'bg-orange-100 text-orange-800', description: '서비스가 진행 중입니다.' },
  COMPLETED: { label: '서비스 완료', color: 'bg-green-100 text-green-800', description: '서비스가 완료되었습니다.' },
  CANCELLED: { label: '취소됨', color: 'bg-red-100 text-red-800', description: '요청이 취소되었습니다.' },
}

// 허용되는 상태 전이 규칙
export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['MATCHED', 'IN_PROGRESS', 'CANCELLED'],
  MATCHING: ['CONFIRMED', 'MATCHED', 'CANCELLED'],
  MATCHED: ['CONFIRMED', 'IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  // COMPLETED, CANCELLED은 최종 상태
}
