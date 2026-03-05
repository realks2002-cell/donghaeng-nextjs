import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCustomerFromRequest } from '@/lib/auth/customer'
import { sendPushToAllManagers } from '@/lib/services/push-notification'
import { SERVICE_PRICES, SERVICE_TYPE_LABELS, ServiceType } from '@/lib/constants/pricing'

interface TossPaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
  formData?: {
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
  }
}

interface TossPaymentResponse {
  paymentKey: string
  orderId: string
  status: string
  method: string
  totalAmount: number
  approvedAt: string
  card?: {
    number: string
    installmentPlanMonths: number
  }
  easyPay?: {
    provider: string
  }
  failure?: {
    code: string
    message: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TossPaymentConfirmRequest = await request.json()
    const { paymentKey, orderId, amount, formData } = body

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { ok: false, error: '필수 결제 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!formData || !formData.service_type || !formData.service_date || !formData.start_time || !formData.duration_hours) {
      return NextResponse.json(
        { ok: false, error: '서비스 요청 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { ok: false, error: '결제 시스템 설정 오류' },
        { status: 500 }
      )
    }

    // 서비스 가격 계산 및 금액 검증
    const serviceType = formData.service_type as ServiceType
    const pricePerHour = SERVICE_PRICES[serviceType] ?? 20000
    const estimatedPrice = pricePerHour * formData.duration_hours

    if (estimatedPrice !== amount) {
      console.error('Amount mismatch:', { expected: estimatedPrice, received: amount })
      return NextResponse.json(
        { ok: false, error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 중복 처리 방지: 같은 orderId로 이미 생성된 요청이 있는지 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = supabase.from('service_requests') as any
    const { data: existingRequest } = await requestsTable
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'CONFIRMED') {
        return NextResponse.json(
          { ok: false, error: '이미 결제가 완료된 주문입니다.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { ok: false, error: '이미 처리된 주문입니다.' },
        { status: 409 }
      )
    }

    // 토스페이먼츠 결제 승인 API 호출
    const authHeader = Buffer.from(`${secretKey}:`).toString('base64')

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const tossResult: TossPaymentResponse = await tossResponse.json()

    if (!tossResponse.ok || tossResult.failure) {
      const errorMessage = tossResult.failure?.message || '결제 승인에 실패했습니다.'
      console.error('Toss payment error:', tossResult)
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    // 현재 로그인한 사용자 확인
    const customer = await getCustomerFromRequest()
    const customerId: string | null = customer?.userId || null

    const address = formData.address || formData.guest_address || ''
    const addressDetail = formData.address_detail || formData.guest_address_detail || ''
    const phone = formData.phone || formData.guest_phone || ''
    const durationMinutes = formData.duration_hours * 60

    // 서비스 요청 INSERT (바로 CONFIRMED 상태)
    const { error: insertError } = await requestsTable.insert({
      id: orderId,
      customer_id: customerId,
      guest_name: formData.guest_name || null,
      guest_phone: formData.guest_phone || null,
      service_type: formData.service_type,
      service_date: formData.service_date,
      start_time: formData.start_time,
      duration_minutes: durationMinutes,
      address: address,
      address_detail: addressDetail || null,
      phone: phone,
      lat: formData.lat || null,
      lng: formData.lng || null,
      details: formData.details || null,
      status: 'CONFIRMED',
      estimated_price: estimatedPrice,
      manager_id: formData.designated_manager_id || null,
      confirmed_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Service request insert error:', insertError)
      return NextResponse.json(
        { ok: false, error: '서비스 요청 저장에 실패했습니다. 결제는 승인되었으니 고객센터에 문의해주세요.' },
        { status: 500 }
      )
    }

    // 결제 레코드 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = supabase.from('payments') as any
    const { error: paymentError } = await paymentsTable.insert({
      service_request_id: orderId,
      payment_key: paymentKey,
      order_id: orderId,
      amount: tossResult.totalAmount,
      status: 'PAID',
      method: tossResult.method,
      approved_at: tossResult.approvedAt,
    })

    if (paymentError) {
      console.error('Payment insert error:', paymentError)
    }

    // 푸시 알림 발송 (await 필수 - Vercel Serverless는 응답 후 즉시 종료됨)
    try {
      const serviceLabel = SERVICE_TYPE_LABELS[formData.service_type as ServiceType] || formData.service_type
      const priceText = estimatedPrice.toLocaleString('ko-KR')
      await sendPushToAllManagers({
        title: '새로운 서비스 요청이 접수되었습니다',
        body: `${serviceLabel} | ${priceText}원 | ${formData.service_date} ${formData.start_time}`,
        url: '/manager/dashboard',
      })
    } catch (err) {
      console.error('Push notification error:', err)
    }

    return NextResponse.json({
      ok: true,
      paymentKey: tossResult.paymentKey,
      orderId: tossResult.orderId,
      status: tossResult.status,
      method: tossResult.method,
      amount: tossResult.totalAmount,
    })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json(
      { ok: false, error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
