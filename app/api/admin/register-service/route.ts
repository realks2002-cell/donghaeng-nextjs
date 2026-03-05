import { NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPushToAllManagers } from '@/lib/services/push-notification'
import {
  DEFAULT_SERVICE_PRICES,
  SERVICE_TYPE_LABELS,
  SERVICE_TYPE_KEYS,
  type ServiceType,
} from '@/lib/constants/pricing'

const VALID_SERVICE_TYPES: ServiceType[] = [
  'hospital_companion',
  'daily_care',
  'life_companion',
  'elderly_care',
  'child_care',
  'other',
]

export async function POST(request: Request) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const {
      guest_name,
      guest_phone,
      service_type,
      service_date,
      start_time,
      duration_hours,
      address,
      address_detail,
      details,
    } = body

    // Validation
    const errors: string[] = []

    if (!guest_name?.trim()) {
      errors.push('고객 이름을 입력해주세요')
    }

    const cleanPhone = (guest_phone || '').replace(/-/g, '')
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
      errors.push('올바른 전화번호를 입력해주세요')
    }

    if (!service_type || !VALID_SERVICE_TYPES.includes(service_type)) {
      errors.push('서비스 종류를 선택해주세요')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dateValue = new Date(service_date)
    if (!service_date || dateValue < today) {
      errors.push('서비스 날짜를 확인해주세요')
    }

    if (!start_time || !/^\d{2}:\d{2}$/.test(start_time)) {
      errors.push('시작 시간을 선택해주세요')
    }

    const hours = Number(duration_hours)
    if (!Number.isInteger(hours) || hours < 2 || hours > 9) {
      errors.push('소요 시간을 선택해주세요')
    }

    if (!address?.trim()) {
      errors.push('주소를 입력해주세요')
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 })
    }

    // Load prices from DB
    const supabase = createServiceClient()
    let pricePerHour = DEFAULT_SERVICE_PRICES[service_type as ServiceType]

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: priceRows } = await (supabase.from('service_prices') as any)
      .select('service_type, price_per_hour')

    if (priceRows) {
      const matched = priceRows.find((row: { service_type: string }) => {
        const key = SERVICE_TYPE_KEYS[row.service_type]
        return key === service_type
      })
      if (matched) {
        pricePerHour = (matched as { price_per_hour: number }).price_per_hour
      }
    }

    const estimated_price = pricePerHour * hours

    // Insert service request
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertError } = await (supabase.from('service_requests') as any)
      .insert({
        customer_id: null,
        guest_name: guest_name.trim(),
        guest_phone: cleanPhone,
        phone: cleanPhone,
        service_type,
        service_date,
        start_time,
        duration_minutes: hours * 60,
        address: address.trim(),
        address_detail: address_detail?.trim() || null,
        details: details?.trim() || null,
        status: 'CONFIRMED',
        estimated_price,
        confirmed_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Failed to insert service request:', insertError)
      return NextResponse.json(
        { error: '서비스 등록에 실패했습니다.' },
        { status: 500 }
      )
    }

    // Send push notification to managers
    try {
      const serviceLabel = SERVICE_TYPE_LABELS[service_type as ServiceType] || service_type
      const priceText = estimated_price.toLocaleString('ko-KR')
      await sendPushToAllManagers({
        title: '새로운 서비스 요청이 접수되었습니다',
        body: `${serviceLabel} | ${priceText}원 | ${service_date} ${start_time}`,
      })
    } catch (err) {
      console.error('Push notification failed:', err)
    }

    return NextResponse.json({
      success: true,
      request_id: inserted.id,
      estimated_price,
    })
  } catch (error) {
    console.error('Register service error:', error)
    return NextResponse.json(
      { error: '서비스 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
