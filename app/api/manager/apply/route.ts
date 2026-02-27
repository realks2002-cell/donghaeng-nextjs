import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'
import { v4 as uuidv4 } from 'uuid'
import { sendMatchingSMS } from '@/lib/services/sms-notification'

export async function POST(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { request_id, message } = body

    if (!request_id) {
      return NextResponse.json(
        { error: '요청 ID가 필요합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check if request exists and is available
    const { data: serviceRequest, error: requestError } = await supabase
      .from('service_requests')
      .select('id, status')
      .eq('id', request_id)
      .single() as { data: { id: string; status: string } | null; error: unknown }

    if (requestError || !serviceRequest) {
      return NextResponse.json(
        { error: '해당 서비스 요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (!['CONFIRMED', 'MATCHING'].includes(serviceRequest.status)) {
      return NextResponse.json(
        { error: '이 요청은 더 이상 지원할 수 없습니다.' },
        { status: 400 }
      )
    }

    // 🆕 이미 다른 매니저의 지원이 있는지 체크 (선착순 제한)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicationsTable = supabase.from('manager_applications') as any
    const { data: existingApplications, error: checkError } = await applicationsTable
      .select('id, manager_id')
      .eq('service_request_id', request_id)
      .in('status', ['PENDING', 'ACCEPTED'])
      .limit(1)

    if (checkError) {
      console.error('Check existing applications error:', checkError)
      return NextResponse.json(
        { error: '지원 가능 여부 확인 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (existingApplications && existingApplications.length > 0) {
      // 이미 다른 매니저가 지원했으면 거부
      const isMyApplication = existingApplications[0].manager_id === session.managerId

      if (isMyApplication) {
        return NextResponse.json(
          { error: '이미 이 요청에 지원하셨습니다.' },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { error: '이미 지원자가 있어 지원이 불가합니다.' },
          { status: 409 } // 409 Conflict
        )
      }
    }

    // Create application
    const applicationId = uuidv4()
    const { error: insertError } = await applicationsTable.insert({
      id: applicationId,
      manager_id: session.managerId,
      service_request_id: request_id,
      status: 'ACCEPTED',
      message: message || null,
    })

    if (insertError) {
      console.error('Insert application error:', insertError)
      return NextResponse.json(
        { error: '지원 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 즉시 자동매칭: service_request에 매니저 배정 + MATCHED 상태로 변경
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('service_requests') as any)
      .update({
        manager_id: session.managerId,
        status: 'MATCHED',
      })
      .eq('id', request_id)

    // 고객에게 매칭 완료 SMS 발송 (실패해도 매칭은 유지)
    sendMatchingSMS({
      serviceRequestId: request_id,
      managerId: session.managerId,
    }).catch((err) => console.error('[SMS] 비동기 발송 실패:', err))

    return NextResponse.json({
      success: true,
      message: '매칭이 완료되었습니다.',
    })
  } catch (error) {
    console.error('Apply error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
