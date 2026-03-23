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
    const { action } = await request.json()

    if (!action || action !== 'reject') {
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

    if (!['PENDING', 'ACCEPTED'].includes(application.status)) {
      return NextResponse.json(
        { success: false, message: '이미 처리된 지원입니다.' },
        { status: 400 }
      )
    }

    const wasAccepted = application.status === 'ACCEPTED'

    // 해당 지원을 REJECTED로 변경
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

    // ACCEPTED 상태였다면 매칭 해제: manager_id 제거 + CONFIRMED으로 복원
    if (wasAccepted) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('service_requests') as any)
        .update({
          manager_id: null,
          status: 'CONFIRMED',
        })
        .eq('id', application.service_request_id)
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
