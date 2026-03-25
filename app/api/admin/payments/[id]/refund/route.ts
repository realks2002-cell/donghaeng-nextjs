import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'
import { cancelTossPayment } from '@/lib/services/toss-cancel'

const REFUNDABLE_STATUSES = ['PAID', 'PARTIAL_REFUNDED']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { success: false, message: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { type, cancelReason } = body

    if (!type || !['full', 'partial'].includes(type)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 환불 타입입니다.' },
        { status: 400 }
      )
    }

    const refundAmount = type === 'partial' ? Number(body.refundAmount) : undefined
    if (type === 'partial' && (!Number.isFinite(refundAmount) || !refundAmount || refundAmount <= 0)) {
      return NextResponse.json(
        { success: false, message: '유효한 환불 금액을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = supabase.from('payments') as any
    const { data: payment, error: fetchError } = await paymentsTable
      .select('*')
      .eq('id', id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json(
        { success: false, message: '결제 정보를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 환불 가능 상태 화이트리스트 검증
    if (!REFUNDABLE_STATUSES.includes(payment.status)) {
      return NextResponse.json(
        { success: false, message: '환불 가능한 상태가 아닙니다.' },
        { status: 400 }
      )
    }

    const reason = cancelReason || '관리자 환불 처리'
    const previousRefund = payment.refund_amount || 0
    const cancelAmount = type === 'full' ? payment.amount - previousRefund : refundAmount!
    const totalRefund = previousRefund + cancelAmount

    if (totalRefund > payment.amount) {
      return NextResponse.json(
        { success: false, message: `환불 가능 금액은 ${(payment.amount - previousRefund).toLocaleString()}원입니다.` },
        { status: 400 }
      )
    }

    // 토스페이먼츠 결제 취소 API 호출 (무통장입금은 payment_key 없음)
    if (payment.payment_key) {
      await cancelTossPayment(payment.payment_key, reason, cancelAmount)
    }

    // 토스 API 성공 후 DB 업데이트 (낙관적 잠금: 현재 상태 조건 포함)
    const isFullyRefunded = totalRefund === payment.amount
    const now = new Date().toISOString()

    const { data: updated, error: updateError } = await paymentsTable
      .update({
        status: isFullyRefunded ? 'REFUNDED' : 'PARTIAL_REFUNDED',
        refund_amount: totalRefund,
        refunded_at: now,
        partial_refunded: !isFullyRefunded,
      })
      .eq('id', id)
      .in('status', REFUNDABLE_STATUSES)
      .select('id')

    if (updateError) {
      console.error('환불 DB 업데이트 실패 (토스 취소는 완료됨):', {
        paymentId: id,
        paymentKey: payment.payment_key,
        cancelAmount,
        error: updateError,
      })
      return NextResponse.json(
        { success: false, message: '환불 DB 업데이트에 실패했습니다. 토스 결제는 취소되었으니 관리자에게 문의하세요.' },
        { status: 500 }
      )
    }

    if (!updated || updated.length === 0) {
      return NextResponse.json(
        { success: false, message: '이미 다른 관리자에 의해 처리되었습니다.' },
        { status: 409 }
      )
    }

    // 전액 환불 시 서비스 요청 취소
    if (isFullyRefunded && payment.service_request_id) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requestsTable = supabase.from('service_requests') as any
      const { error: reqError } = await requestsTable
        .update({ status: 'CANCELLED' })
        .eq('id', payment.service_request_id)
        .not('status', 'in', '("COMPLETED","CANCELLED")')

      if (reqError) {
        console.error('Service request cancel after refund error:', reqError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refund API error:', error)
    const message = error instanceof Error ? error.message : '서버 오류가 발생했습니다.'
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }
}
