import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCustomerFromRequest } from '@/lib/auth/customer'
import { v4 as uuidv4 } from 'uuid'
import { SERVICE_PRICES, ServiceType } from '@/lib/constants/pricing'

interface SaveTempRequest {
  service_type: string
  service_date: string
  start_time: string
  duration_hours: number
  address: string
  address_detail?: string
  phone: string
  lat?: number
  lng?: number
  details?: string
  designated_manager_id?: string
  guest_name?: string
  guest_phone?: string
  guest_address?: string
  guest_address_detail?: string
  payment_method?: string
  amount?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: SaveTempRequest = await request.json()

    // 필수 필드 검증
    if (!body.service_type) {
      return NextResponse.json({ ok: false, error: '서비스 타입을 선택해주세요.' }, { status: 400 })
    }
    if (!body.service_date) {
      return NextResponse.json({ ok: false, error: '서비스 날짜를 선택해주세요.' }, { status: 400 })
    }
    if (!body.start_time) {
      return NextResponse.json({ ok: false, error: '서비스 시간을 선택해주세요.' }, { status: 400 })
    }
    if (!body.duration_hours || body.duration_hours < 1) {
      return NextResponse.json({ ok: false, error: '예상 소요 시간을 선택해주세요.' }, { status: 400 })
    }

    // 현재 로그인한 사용자 확인
    const customer = await getCustomerFromRequest()

    // Service Client 사용 (RLS 우회)
    const serviceClient = createServiceClient()

    const customerId: string | null = customer?.userId || null

    // 서비스 가격 계산
    const serviceType = body.service_type as ServiceType
    const pricePerHour = SERVICE_PRICES[serviceType] ?? 20000
    const estimatedPrice = pricePerHour * body.duration_hours
    const durationMinutes = body.duration_hours * 60

    // 주소 결정 (입력된 주소 또는 비회원 주소)
    const address = body.address || body.guest_address || ''
    const addressDetail = body.address_detail || body.guest_address_detail || ''
    const phone = body.phone || body.guest_phone || ''

    if (!address) {
      return NextResponse.json({ ok: false, error: '주소를 입력해주세요.' }, { status: 400 })
    }
    if (!phone) {
      return NextResponse.json({ ok: false, error: '전화번호를 입력해주세요.' }, { status: 400 })
    }

    // 서비스 요청 ID 생성
    const requestId = uuidv4()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = serviceClient.from('service_requests') as any

    // 서비스 요청 저장
    const { error: insertError } = await requestsTable.insert({
      id: requestId,
      customer_id: customerId,
      guest_name: body.guest_name || null,
      guest_phone: body.guest_phone || null,
      service_type: body.service_type,
      service_date: body.service_date,
      start_time: body.start_time,
      duration_minutes: durationMinutes,
      address: address,
      address_detail: addressDetail || null,
      phone: phone,
      lat: body.lat || null,
      lng: body.lng || null,
      details: body.details || null,
      status: 'CONFIRMED',
      estimated_price: estimatedPrice,
      confirmed_at: new Date().toISOString(),
      manager_id: body.designated_manager_id || null,
    })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { ok: false, error: '서비스 요청 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 결제 정보 저장
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = serviceClient.from('payments') as any
    const { error: paymentError } = await paymentsTable.insert({
      order_id: requestId,
      service_request_id: requestId,
      amount: body.amount ?? estimatedPrice,
      status: 'PAID',
      method: body.payment_method || null,
    })

    if (paymentError) {
      console.error('Payment insert error:', paymentError)
    }

    return NextResponse.json({
      ok: true,
      request_id: requestId,
      estimated_price: estimatedPrice,
    })
  } catch (error) {
    console.error('Save temp error:', error)
    return NextResponse.json(
      { ok: false, error: '서비스 요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
