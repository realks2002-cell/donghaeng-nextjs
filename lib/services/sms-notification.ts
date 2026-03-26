import CoolSMS from 'coolsms-node-sdk'
import { createServiceClient } from '@/lib/supabase/server'
import { SERVICE_TYPE_LABELS } from '@/lib/constants/pricing'
import type { ServiceType } from '@/lib/constants/pricing'

const COOLSMS_API_KEY = (process.env.COOLSMS_API_KEY || '').trim()
const COOLSMS_API_SECRET = (process.env.COOLSMS_API_SECRET || '').trim()
const COOLSMS_SENDER_NUMBER = (process.env.COOLSMS_SENDER_NUMBER || '').trim()

export async function sendSMS(to: string, text: string) {
  if (!COOLSMS_API_KEY || !COOLSMS_API_SECRET || !COOLSMS_SENDER_NUMBER) {
    console.warn('[SMS] CoolSMS 환경 변수가 설정되지 않아 SMS를 발송하지 않습니다.')
    return
  }

  const sms = new CoolSMS(COOLSMS_API_KEY, COOLSMS_API_SECRET)
  const senderNumber = COOLSMS_SENDER_NUMBER.replace(/-/g, '')

  await sms.sendOne({
    to: to.replace(/-/g, ''),
    from: senderNumber,
    text,
    type: text.length > 90 ? 'LMS' : 'SMS',
    autoTypeDetect: false,
  })
  console.log(`[SMS] 발송 완료 - 수신: ${to}`)
}

interface MatchingSMSParams {
  serviceRequestId: string
  managerId: string
}

/**
 * 매칭 완료 시 고객과 매니저에게 SMS 알림을 발송합니다.
 * 실패해도 매칭 프로세스를 중단하지 않습니다.
 */
export async function sendMatchingSMS({ serviceRequestId, managerId }: MatchingSMSParams) {
  try {
    console.log(`[SMS] 매칭 SMS 발송 시작 - 요청: ${serviceRequestId}, 매니저: ${managerId}`)

    if (!COOLSMS_API_KEY || !COOLSMS_API_SECRET || !COOLSMS_SENDER_NUMBER) {
      console.warn('[SMS] CoolSMS 환경 변수가 설정되지 않아 SMS를 발송하지 않습니다.')
      return
    }

    const supabase = createServiceClient()

    // 서비스 요청 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: request, error: reqError } = await (supabase.from('service_requests') as any)
      .select('service_type, service_date, start_time, customer_id, guest_phone, guest_name, vehicle_support, address, address_detail')
      .eq('id', serviceRequestId)
      .single()

    if (reqError || !request) {
      console.error('[SMS] 서비스 요청 조회 실패:', reqError)
      return
    }

    // 고객 정보 조회
    let customerPhone: string | null = null
    let customerName: string | null = null

    if (request.customer_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: user } = await (supabase.from('users') as any)
        .select('phone, name')
        .eq('id', request.customer_id)
        .single()
      customerPhone = user?.phone || null
      customerName = user?.name || null
    }

    if (!customerPhone) {
      customerPhone = request.guest_phone || null
    }
    if (!customerName) {
      customerName = request.guest_name || null
    }

    console.log(`[SMS] 고객 정보 - 이름: ${customerName || '없음'}, 전화번호: ${customerPhone ? '있음' : '없음'}`)

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

    console.log(`[SMS] 매니저 정보 - 이름: ${manager.name}, 전화번호: ${manager.phone ? '있음' : '없음'}`)

    // 공통 정보 구성
    const serviceDate = request.service_date
      ? request.service_date.replace(/-/g, '.')
      : '미정'
    const startTime = request.start_time
      ? request.start_time.slice(0, 5)
      : '미정'
    const managerPhone = manager.phone
      ? manager.phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
      : ''
    const customerPhoneFormatted = customerPhone
      ? customerPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3')
      : ''

    const serviceAddress = [request.address, request.address_detail].filter(Boolean).join(' ') || '미정'

    const sms = new CoolSMS(COOLSMS_API_KEY, COOLSMS_API_SECRET)
    const senderNumber = COOLSMS_SENDER_NUMBER.replace(/-/g, '')

    // 1. 고객에게 SMS 발송
    if (customerPhone) {
      const customerMessage = [
        '[행복안심동행] 매니저가 배정되었습니다.',
        `서비스: ${SERVICE_TYPE_LABELS[request.service_type as ServiceType] || request.service_type || '돌봄 서비스'}`,
        `일시: ${serviceDate} ${startTime}`,
        `장소: ${serviceAddress}`,
        `매니저: ${manager.name} (${managerPhone})`,
        `문의: ${COOLSMS_SENDER_NUMBER}`,
      ].join('\n')

      await sms.sendOne({
        to: customerPhone.replace(/-/g, ''),
        from: senderNumber,
        text: customerMessage,
        type: 'LMS',
        autoTypeDetect: false,
      })
      console.log(`[SMS] 고객 알림 발송 완료 - 요청: ${serviceRequestId}, 수신: ${customerPhone}`)
    } else {
      console.warn('[SMS] 고객 전화번호가 없어 고객 SMS를 발송하지 않습니다.')
    }

    // 2. 매니저에게 SMS 발송
    if (manager.phone) {
      const managerMessage = [
        '[행복안심동행] 서비스가 배정되었습니다.',
        `서비스: ${SERVICE_TYPE_LABELS[request.service_type as ServiceType] || request.service_type || '돌봄 서비스'}`,
        `일시: ${serviceDate} ${startTime}`,
        `장소: ${serviceAddress}`,
        `차량지원: ${request.vehicle_support ? 'O' : 'X'}`,
        `고객: ${customerName || '고객'} (${customerPhoneFormatted})`,
        `문의: ${COOLSMS_SENDER_NUMBER}`,
      ].join('\n')

      await sms.sendOne({
        to: manager.phone.replace(/-/g, ''),
        from: senderNumber,
        text: managerMessage,
        type: 'LMS',
        autoTypeDetect: false,
      })
      console.log(`[SMS] 매니저 알림 발송 완료 - 요청: ${serviceRequestId}, 수신: ${manager.phone}`)
    } else {
      console.warn('[SMS] 매니저 전화번호가 없어 매니저 SMS를 발송하지 않습니다.')
    }
    console.log(`[SMS] 매칭 SMS 발송 완료 - 요청: ${serviceRequestId}`)
  } catch (error) {
    console.error(`[SMS] 발송 실패 - 요청: ${serviceRequestId}, 매니저: ${managerId}:`, error)
  }
}
