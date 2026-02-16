import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

// 허용되는 상태 전이 정의
const VALID_TRANSITIONS: Record<string, string[]> = {
  CONFIRMED: ['MATCHING', 'IN_PROGRESS', 'CANCELLED'],
  MATCHING: ['CONFIRMED', 'MATCHED', 'CANCELLED'],
  MATCHED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED'],
  // COMPLETED, CANCELLED은 최종 상태
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { success: false, message: '변경할 상태값이 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 현재 상태 조회
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

    // 상태 전이 유효성 검증
    const allowedNext = VALID_TRANSITIONS[serviceRequest.status]
    if (!allowedNext || !allowedNext.includes(status)) {
      return NextResponse.json(
        { success: false, message: `${serviceRequest.status}에서 ${status}로 변경할 수 없습니다.` },
        { status: 400 }
      )
    }

    // 상태 업데이트
    const updateData: Record<string, string> = { status }

    if (status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error: updateError } = await requestsTable
      .update(updateData)
      .eq('id', id)

    if (updateError) {
      console.error('Status update error:', updateError)
      return NextResponse.json(
        { success: false, message: '상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Request status update error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
