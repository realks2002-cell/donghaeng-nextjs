import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const { type, refundAmount } = await request.json()

    if (!type || !['full', 'partial'].includes(type)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 환불 타입입니다.' },
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

    if (payment.status === 'REFUNDED') {
      return NextResponse.json(
        { success: false, message: '이미 전액 환불된 결제입니다.' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = supabase.from('service_requests') as any

    if (type === 'full') {
      const { error } = await paymentsTable
        .update({
          status: 'REFUNDED',
          refund_amount: payment.amount,
          refunded_at: now,
          partial_refunded: false,
        })
        .eq('id', id)

      if (error) {
        console.error('Full refund error:', error)
        return NextResponse.json(
          { success: false, message: '환불 처리에 실패했습니다.' },
          { status: 500 }
        )
      }

      // 전액 환불 시 연관된 서비스 요청을 CANCELLED로 변경
      if (payment.service_request_id) {
        const { error: reqError } = await requestsTable
          .update({ status: 'CANCELLED' })
          .eq('id', payment.service_request_id)
          .not('status', 'in', '("COMPLETED","CANCELLED")')

        if (reqError) {
          console.error('Service request cancel after refund error:', reqError)
        }
      }
    } else {
      if (!refundAmount || refundAmount <= 0) {
        return NextResponse.json(
          { success: false, message: '환불 금액을 입력해주세요.' },
          { status: 400 }
        )
      }

      const previousRefund = payment.refund_amount || 0
      const totalRefund = previousRefund + refundAmount

      if (totalRefund > payment.amount) {
        return NextResponse.json(
          { success: false, message: `환불 가능 금액은 ${(payment.amount - previousRefund).toLocaleString()}원입니다.` },
          { status: 400 }
        )
      }

      const isFullyRefunded = totalRefund === payment.amount

      const { error } = await paymentsTable
        .update({
          status: isFullyRefunded ? 'REFUNDED' : 'PARTIAL_REFUNDED',
          refund_amount: totalRefund,
          refunded_at: now,
          partial_refunded: !isFullyRefunded,
        })
        .eq('id', id)

      if (error) {
        console.error('Partial refund error:', error)
        return NextResponse.json(
          { success: false, message: '부분 환불 처리에 실패했습니다.' },
          { status: 500 }
        )
      }

      // 부분 환불 누적으로 전액 환불이 된 경우에도 서비스 요청 취소
      if (isFullyRefunded && payment.service_request_id) {
        const { error: reqError } = await requestsTable
          .update({ status: 'CANCELLED' })
          .eq('id', payment.service_request_id)
          .not('status', 'in', '("COMPLETED","CANCELLED")')

        if (reqError) {
          console.error('Service request cancel after full refund error:', reqError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Refund API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
