// 서비스 요청 상태 라벨 (관리자 페이지용)
export const STATUS_LABELS: Record<string, string> = {
  PENDING_TRANSFER: '입금대기',
  CONFIRMED: '매칭중',
  MATCHED: '매칭완료',
  COMPLETED: '서비스 완료',
  CANCELLED: '취소',
}

// 관리자 페이지용 상태 스타일
export const STATUS_STYLES: Record<string, string> = {
  PENDING_TRANSFER: 'bg-amber-100 text-amber-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  MATCHED: 'bg-indigo-100 text-indigo-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

// 고객 페이지용 상태 표시 (라벨 + 색상 + 설명)
export const STATUS_DISPLAY: Record<string, { label: string; color: string; description: string }> = {
  PENDING_TRANSFER: { label: '입금대기', color: 'bg-amber-100 text-amber-800', description: '계좌이체 입금 확인 대기 중입니다.' },
  CONFIRMED: { label: '매칭중', color: 'bg-blue-100 text-blue-800', description: '결제가 완료되었습니다. 매니저 매칭을 진행합니다.' },
  MATCHED: { label: '매칭완료', color: 'bg-indigo-100 text-indigo-800', description: '매니저가 배정되었습니다. 서비스 시작을 준비합니다.' },
  COMPLETED: { label: '서비스 완료', color: 'bg-green-100 text-green-800', description: '서비스가 완료되었습니다.' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800', description: '요청이 취소되었습니다.' },
}

// 허용되는 상태 전이 규칙
export const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING_TRANSFER: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['MATCHED', 'CANCELLED'],
  MATCHED: ['CONFIRMED', 'COMPLETED', 'CANCELLED'],
  // COMPLETED, CANCELLED은 최종 상태
}
