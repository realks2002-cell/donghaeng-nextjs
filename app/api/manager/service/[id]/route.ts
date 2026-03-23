import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireManagerAuth } from '@/lib/auth/manager'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let session
  try {
    session = await requireManagerAuth()
  } catch {
    return NextResponse.json(
      { success: false, message: '로그인이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const { action } = await request.json()

    if (action !== 'complete') {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 액션입니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 서비스 요청 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: serviceRequest, error: fetchError } = await (supabase.from('service_requests') as any)
      .select('id, status, manager_id')
      .eq('id', id)
      .single()

    if (fetchError || !serviceRequest) {
      return NextResponse.json(
        { success: false, message: '서비스 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인의 서비스인지 확인
    if (serviceRequest.manager_id !== session.managerId) {
      return NextResponse.json(
        { success: false, message: '본인에게 배정된 서비스만 변경할 수 있습니다.' },
        { status: 403 }
      )
    }

    if (serviceRequest.status !== 'MATCHED') {
      return NextResponse.json(
        { success: false, message: `현재 상태(${serviceRequest.status})에서는 이 작업을 수행할 수 없습니다.` },
        { status: 400 }
      )
    }

    // 상태 업데이트: MATCHED → COMPLETED
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase.from('service_requests') as any)
      .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('Service status update error:', updateError)
      return NextResponse.json(
        { success: false, message: '상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manager service update error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
