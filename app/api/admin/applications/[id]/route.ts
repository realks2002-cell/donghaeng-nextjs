import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { action } = await request.json()

    if (!action || !['accept', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 액션입니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 지원 내역 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicationsTable = supabase.from('manager_applications') as any
    const { data: application, error: fetchError } = await applicationsTable
      .select('id, manager_id, service_request_id, status')
      .eq('id', id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json(
        { success: false, message: '지원 내역을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (application.status !== 'PENDING') {
      return NextResponse.json(
        { success: false, message: '이미 처리된 지원입니다.' },
        { status: 400 }
      )
    }

    if (action === 'accept') {
      // 1. 해당 지원을 ACCEPTED로 변경
      const { error: acceptError } = await applicationsTable
        .update({ status: 'ACCEPTED' })
        .eq('id', id)

      if (acceptError) {
        console.error('Accept application error:', acceptError)
        return NextResponse.json(
          { success: false, message: '승인 처리에 실패했습니다.' },
          { status: 500 }
        )
      }

      // 2. 같은 요청의 다른 PENDING 지원들을 REJECTED로 변경
      await applicationsTable
        .update({ status: 'REJECTED' })
        .eq('service_request_id', application.service_request_id)
        .neq('id', id)
        .eq('status', 'PENDING')

      // 3. service_requests에 manager_id 할당 + 상태를 MATCHED로 변경
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('service_requests') as any)
        .update({
          manager_id: application.manager_id,
          status: 'MATCHED',
        })
        .eq('id', application.service_request_id)

    } else {
      // reject: 해당 지원만 REJECTED로 변경
      const { error: rejectError } = await applicationsTable
        .update({ status: 'REJECTED' })
        .eq('id', id)

      if (rejectError) {
        console.error('Reject application error:', rejectError)
        return NextResponse.json(
          { success: false, message: '거절 처리에 실패했습니다.' },
          { status: 500 }
        )
      }

      // 남은 PENDING 지원이 없으면 상태를 CONFIRMED로 되돌림
      const { data: remaining } = await applicationsTable
        .select('id')
        .eq('service_request_id', application.service_request_id)
        .eq('status', 'PENDING')

      if (!remaining || remaining.length === 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('service_requests') as any)
          .update({ status: 'CONFIRMED' })
          .eq('id', application.service_request_id)
          .eq('status', 'MATCHING')
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Application action error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
