import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = createServiceClient()

    // 서비스 요청 상태 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = supabase.from('service_requests') as any
    const { data: serviceRequest, error: fetchError } = await requestsTable
      .select('id, status')
      .eq('id', id)
      .single()

    if (fetchError || !serviceRequest) {
      return NextResponse.json(
        { success: false, message: '서비스 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (serviceRequest.status === 'CANCELLED') {
      return NextResponse.json(
        { success: false, message: '이미 취소된 요청입니다.' },
        { status: 400 }
      )
    }

    if (serviceRequest.status === 'IN_PROGRESS' || serviceRequest.status === 'COMPLETED') {
      return NextResponse.json(
        { success: false, message: '진행 중이거나 완료된 요청은 취소할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 서비스 요청 취소 (manager_id도 초기화)
    const { error: updateError } = await requestsTable
      .update({ status: 'CANCELLED', manager_id: null })
      .eq('id', id)

    if (updateError) {
      console.error('Request cancel error:', updateError)
      return NextResponse.json(
        { success: false, message: '요청 취소에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 관련 매니저 지원내역을 REJECTED로 변경
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicationsTable = supabase.from('manager_applications') as any
    const { error: appUpdateError } = await applicationsTable
      .update({ status: 'REJECTED' })
      .eq('service_request_id', id)
      .in('status', ['PENDING', 'ACCEPTED'])

    if (appUpdateError) {
      console.error('Applications cleanup error:', appUpdateError)
      // 요청 취소는 성공했지만 지원내역 정리 실패 - 로깅만
    }

    // 연결된 결제 자동 환불
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = supabase.from('payments') as any
    const { data: payment } = await paymentsTable
      .select('id, amount, status')
      .eq('service_request_id', id)
      .in('status', ['PAID', 'PARTIAL_REFUNDED'])
      .single()

    if (payment) {
      const { error: refundError } = await paymentsTable
        .update({
          status: 'REFUNDED',
          refund_amount: payment.amount,
          refunded_at: new Date().toISOString(),
          partial_refunded: false,
        })
        .eq('id', payment.id)

      if (refundError) {
        console.error('Auto refund error:', refundError)
        // 요청 취소는 성공했지만 환불 실패 - 로깅만
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
