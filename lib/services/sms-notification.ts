import CoolSMS from 'coolsms-node-sdk'
import { createServiceClient } from '@/lib/supabase/server'

const COOLSMS_API_KEY = process.env.COOLSMS_API_KEY || ''
const COOLSMS_API_SECRET = process.env.COOLSMS_API_SECRET || ''
const COOLSMS_SENDER_NUMBER = process.env.COOLSMS_SENDER_NUMBER || ''

interface MatchingSMSParams {
  serviceRequestId: string
  managerId: string
}

/**
 * 매칭 완료 시 고객에게 SMS 알림을 발송합니다.
 * 실패해도 매칭 프로세스를 중단하지 않습니다.
 */
export async function sendMatchingSMS({ serviceRequestId, managerId }: MatchingSMSParams) {
  try {
    if (!COOLSMS_API_KEY || !COOLSMS_API_SECRET || !COOLSMS_SENDER_NUMBER) {
      console.warn('[SMS] CoolSMS 환경 변수가 설정되지 않아 SMS를 발송하지 않습니다.')
      return
    }

    const supabase = createServiceClient()

    // 서비스 요청 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: request, error: reqError } = await (supabase.from('service_requests') as any)
      .select('service_type, service_date, start_time, customer_id, guest_phone')
      .eq('id', serviceRequestId)
      .single()

    if (reqError || !request) {
      console.error('[SMS] 서비스 요청 조회 실패:', reqError)
      return
    }

    // 고객 전화번호 조회
    let customerPhone: string | null = null

    if (request.customer_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: user } = await (supabase.from('users') as any)
        .select('phone')
        .eq('id', request.customer_id)
        .single()
      customerPhone = user?.phone || null
    }

    if (!customerPhone) {
      customerPhone = request.guest_phone || null
    }

    if (!customerPhone) {
      console.warn('[SMS] 고객 전화번호가 없어 SMS를 발송하지 않습니다.')
      return
    }

    // 매니저 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: manager, error: mgrError } = await (supabase.from('managers') as any)
      .select('name, phone')
      .eq('id', managerId)
      .single()

    if (mgrError || !manager) {
      console.error('[SMS] 매니저 조회 실패:', mgrError)
      return
    }

    // SMS 내용 구성
    const serviceDate = request.service_date
      ? request.service_date.replace(/-/g, '.')
      : '미정'
    const startTime = request.start_time
      ? request.start_time.slice(0, 5)
      : '미정'
    const managerPhone = manager.phone
      ? manager.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
      : ''

    const message = [
      '[행복안심동행] 매니저가 배정되었습니다.',
      `서비스: ${request.service_type || '돌봄 서비스'}`,
      `일시: ${serviceDate} ${startTime}`,
      `매니저: ${manager.name} (${managerPhone})`,
      `문의: ${COOLSMS_SENDER_NUMBER}`,
    ].join('\n')

    // CoolSMS 발송
    const sms = new CoolSMS(COOLSMS_API_KEY, COOLSMS_API_SECRET)
    await sms.sendOne({
      to: customerPhone.replace(/-/g, ''),
      from: COOLSMS_SENDER_NUMBER.replace(/-/g, ''),
      text: message,
      type: 'LMS',
      autoTypeDetect: false,
    })

    console.log(`[SMS] 매칭 알림 발송 완료 - 요청: ${serviceRequestId}, 수신: ${customerPhone}`)
  } catch (error) {
    console.error('[SMS] 발송 실패:', error)
  }
}
