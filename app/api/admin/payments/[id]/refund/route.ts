import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
