import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'
import { v4 as uuidv4 } from 'uuid'

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

    // Check if already applied
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicationsTable = supabase.from('manager_applications') as any
    const { data: existingApplication } = await applicationsTable
      .select('id')
      .eq('manager_id', session.managerId)
      .eq('service_request_id', request_id)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { error: '이미 이 요청에 지원하셨습니다.' },
        { status: 400 }
      )
    }

    // Create application
    const applicationId = uuidv4()
    const { error: insertError } = await applicationsTable.insert({
      id: applicationId,
      manager_id: session.managerId,
      service_request_id: request_id,
      status: 'PENDING',
      message: message || null,
    })

    if (insertError) {
      console.error('Insert application error:', insertError)
      return NextResponse.json(
        { error: '지원 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Update request status to MATCHING if it was CONFIRMED
    if (serviceRequest.status === 'CONFIRMED') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('service_requests') as any)
        .update({ status: 'MATCHING' })
        .eq('id', request_id)
    }

    return NextResponse.json({
      success: true,
      message: '지원이 완료되었습니다.',
    })
  } catch (error) {
    console.error('Apply error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
