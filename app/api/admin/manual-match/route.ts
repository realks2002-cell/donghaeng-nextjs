import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'
import { sendMatchingSMS } from '@/lib/services/sms-notification'

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { success: false, message: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const { service_request_id, manager_id } = await request.json()

    if (!service_request_id || !manager_id) {
      return NextResponse.json(
        { success: false, message: '서비스 요청 ID와 매니저 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 서비스 요청 상태 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: serviceRequest, error: srError } = await (supabase.from('service_requests') as any)
      .select('id, status')
      .eq('id', service_request_id)
      .single()

    if (srError || !serviceRequest) {
      return NextResponse.json(
        { success: false, message: '서비스 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (serviceRequest.status !== 'CONFIRMED') {
      return NextResponse.json(
        { success: false, message: `현재 상태(${serviceRequest.status})에서는 수동 매칭이 불가합니다.` },
        { status: 400 }
      )
    }

    // 매니저 상태 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: manager, error: mgrError } = await (supabase.from('managers') as any)
      .select('id, name, is_active, approval_status')
      .eq('id', manager_id)
      .single()

    if (mgrError || !manager) {
      return NextResponse.json(
        { success: false, message: '매니저를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!manager.is_active || manager.approval_status !== 'approved') {
      return NextResponse.json(
        { success: false, message: '활성화되지 않았거나 승인되지 않은 매니저입니다.' },
        { status: 400 }
      )
    }

    // service_requests에 manager_id 할당 + 상태를 MATCHED로 변경
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('service_requests') as any)
      .update({
        manager_id: manager_id,
        status: 'MATCHED',
      })
      .eq('id', service_request_id)

    if (updateError) {
      console.error('Manual match update error:', updateError)
      return NextResponse.json(
        { success: false, message: '매칭 처리에 실패했습니다.' },
        { status: 500 }
      )
    }

    // 고객에게 매칭 완료 SMS 발송 (실패해도 매칭은 유지)
    await sendMatchingSMS({
      serviceRequestId: service_request_id,
      managerId: manager_id,
    })

    // 해당 요청의 모든 PENDING 지원을 REJECTED로 변경
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('manager_applications') as any)
      .update({ status: 'REJECTED' })
      .eq('service_request_id', service_request_id)
      .eq('status', 'PENDING')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manual match error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
