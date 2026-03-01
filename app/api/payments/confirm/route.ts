import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendPushToAllManagers } from '@/lib/services/push-notification'

interface TossPaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
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
    const { paymentKey, orderId, amount } = body

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { ok: false, error: '필수 결제 정보가 누락되었습니다.' },
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

    // DB에서 서비스 요청 조회하여 금액 검증 및 상태 확인
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = supabase.from('service_requests') as any
    const { data: serviceRequest, error: fetchError } = await requestsTable
      .select('status, estimated_price')
      .eq('id', orderId)
      .single()

    if (fetchError || !serviceRequest) {
      return NextResponse.json(
        { ok: false, error: '서비스 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 이미 결제된 주문 중복 처리 방지
    if (serviceRequest.status === 'CONFIRMED') {
      return NextResponse.json(
        { ok: false, error: '이미 결제가 완료된 주문입니다.' },
        { status: 409 }
      )
    }

    // 결제 대기 상태인지 확인
    if (serviceRequest.status !== 'PENDING_PAYMENT') {
      return NextResponse.json(
        { ok: false, error: `결제할 수 없는 상태입니다. (현재: ${serviceRequest.status})` },
        { status: 400 }
      )
    }

    // 결제 금액과 DB 예상 금액 일치 확인
    if (serviceRequest.estimated_price !== amount) {
      console.error('Amount mismatch:', { expected: serviceRequest.estimated_price, received: amount })
      return NextResponse.json(
        { ok: false, error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
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
      // 결제는 성공했지만 DB 저장 실패 - 로깅만 하고 진행
    }

    // 서비스 요청 상태 업데이트
    const { error: updateError } = await requestsTable
      .update({
        status: 'CONFIRMED',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      console.error('Request update error:', updateError)
    }

    // 푸시 알림 발송 (await 필수 - Vercel Serverless는 응답 후 즉시 종료됨)
    try {
      await sendPushToAllManagers({
        title: '새 서비스 요청',
        body: '새로운 서비스 요청이 결제 완료되었습니다.',
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
