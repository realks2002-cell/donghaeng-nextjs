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

  // 하이픈 제거
  const cleanPhone = phone.replace(/[^0-9]/g, '')

  // 010-1234-5678 또는 010-123-4567 형식으로 변환
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
  } else if (cleanPhone.length === 10) {
    return cleanPhone.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3')
  }

  return phone
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
