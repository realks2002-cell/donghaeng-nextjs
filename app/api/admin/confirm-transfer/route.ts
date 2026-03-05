import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()

    const { service_request_id } = await request.json()

    if (!service_request_id) {
      return NextResponse.json(
        { success: false, message: '서비스 요청 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const serviceClient = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = serviceClient.from('service_requests') as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = serviceClient.from('payments') as any

    // 서비스 요청 확인
    const { data: request_data, error: fetchError } = await requestsTable
      .select('id, status, service_type, service_date, start_time, estimated_price')
      .eq('id', service_request_id)
      .single()

    if (fetchError || !request_data) {
      return NextResponse.json(
        { success: false, message: '서비스 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (request_data.status !== 'PENDING_TRANSFER') {
      return NextResponse.json(
        { success: false, message: '입금대기 상태의 요청만 확인할 수 있습니다.' },
        { status: 400 }
      )
    }

    // 서비스 요청 상태 업데이트
    const { error: updateError } = await requestsTable
      .update({ status: 'CONFIRMED', confirmed_at: new Date().toISOString() })
      .eq('id', service_request_id)

    if (updateError) {
      console.error('Update request error:', updateError)
      return NextResponse.json(
        { success: false, message: '상태 업데이트에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 결제 레코드 업데이트
    await paymentsTable
      .update({ status: 'PAID', approved_at: new Date().toISOString() })
      .eq('service_request_id', service_request_id)
      .eq('status', 'PENDING')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Confirm transfer error:', error)
    return NextResponse.json(
      { success: false, message: '처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
