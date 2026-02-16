/**
 * 유효성 검사 유틸리티 함수
 */

/**
 * 한국 전화번호 형식 검증
 *
 * 허용 형식:
 * - 010-1234-5678
 * - 010-123-4567
 * - 01012345678
 * - 0101234567
 *
 * @param phone 검증할 전화번호
 * @returns 유효하면 true, 아니면 false
 */
export function validateKoreanPhone(phone: string): boolean {
  if (!phone) return false

  // 하이픈 제거
  const cleanPhone = phone.replace(/-/g, '')

  // 010, 011, 016, 017, 018, 019로 시작하는 10~11자리 숫자
  const phoneRegex = /^01[0-9]{8,9}$/

  return phoneRegex.test(cleanPhone)
}

/**
 * 전화번호를 표준 형식으로 포맷팅
 *
 * @param phone 포맷팅할 전화번호
 * @returns 010-1234-5678 형식의 전화번호
 */
export function formatKoreanPhone(phone: string): string {
  if (!phone) return ''

  // 숫자만 추출
  const digits = phone.replace(/[^0-9]/g, '').slice(0, 11)

  // 입력 중에도 자동 하이픈 삽입
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 7) {
    return `${digits.slice(0, 3)}-${digits.slice(3)}`
  } else {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
}

/**
 * 이메일 주소 검증
 *
 * @param email 검증할 이메일 주소
 * @returns 유효하면 true, 아니면 false
 */
export function validateEmail(email: string): boolean {
  if (!email) return false

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
