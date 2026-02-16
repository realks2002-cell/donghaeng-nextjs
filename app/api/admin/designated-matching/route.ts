import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

// 지정 매니저가 있는 매칭 대기 요청 목록
export async function GET() {
  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsTable = supabase.from('service_requests') as any

  const { data, error } = await requestsTable
    .select(`
      id,
      created_at,
      guest_name,
      service_type,
      service_date,
      start_time,
      status,
      estimated_price,
      customer_id,
      manager_id
    `)
    .not('manager_id', 'is', null)
    .in('status', ['CONFIRMED', 'MATCHING'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 매니저, 고객 정보 별도 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const managerIds = [...Array.from(new Set((data || []).map((r: any) => r.manager_id).filter(Boolean)))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerIds = [...Array.from(new Set((data || []).map((r: any) => r.customer_id).filter(Boolean)))]

  const managersMap: Record<string, { name: string; phone: string }> = {}
  const customersMap: Record<string, { name: string; phone: string }> = {}

  if (managerIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: managers } = await (supabase.from('managers') as any)
      .select('id, name, phone')
      .in('id', managerIds)
    for (const m of managers || []) {
      managersMap[m.id] = { name: m.name, phone: m.phone }
    }
  }

  if (customerIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: customers } = await (supabase.from('users') as any)
      .select('id, name, phone')
      .in('id', customerIds)
    for (const c of customers || []) {
      customersMap[c.id] = { name: c.name, phone: c.phone || '-' }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests = (data || []).map((req: any) => ({
    id: req.id,
    created_at: req.created_at,
    customer_name: (req.customer_id && customersMap[req.customer_id]?.name) || req.guest_name || '비회원',
    customer_phone: (req.customer_id && customersMap[req.customer_id]?.phone) || '-',
    service_type: req.service_type,
    service_date: req.service_date,
    start_time: req.start_time?.slice(0, 5) || '',
    status: req.status,
    estimated_price: req.estimated_price || 0,
    manager_name: (req.manager_id && managersMap[req.manager_id]?.name) || '-',
    manager_phone: (req.manager_id && managersMap[req.manager_id]?.phone) || '-',
  }))

  return NextResponse.json({ requests })
}

// 승인/거절 처리
export async function POST(request: NextRequest) {
  try {
    const { requestId, action } = await request.json()

    if (!requestId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = supabase.from('service_requests') as any
    const { data: serviceRequest, error: fetchError } = await requestsTable
      .select('id, status, manager_id')
      .eq('id', requestId)
      .single()

    if (fetchError || !serviceRequest) {
      console.error('Fetch service request error:', fetchError)
      return NextResponse.json({ error: '서비스 요청을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!['CONFIRMED', 'MATCHING'].includes(serviceRequest.status)) {
      return NextResponse.json({ error: '처리 가능한 상태가 아닙니다.' }, { status: 400 })
    }

    if (action === 'approve') {
      // 승인: 상태를 MATCHED로 변경
      const { error: updateError } = await requestsTable
        .update({ status: 'MATCHED' })
        .eq('id', requestId)

      if (updateError) {
        console.error('Approve update error:', updateError)
        return NextResponse.json({ error: '승인 처리에 실패했습니다.' }, { status: 500 })
      }

      // 기존 PENDING 지원 모두 거절
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const applicationsTable = supabase.from('manager_applications') as any
      await applicationsTable
        .update({ status: 'REJECTED' })
        .eq('service_request_id', requestId)
        .eq('status', 'PENDING')

    } else {
      // 거절: manager_id 제거
      const { error: updateError } = await requestsTable
        .update({ manager_id: null })
        .eq('id', requestId)

      if (updateError) {
        console.error('Reject update error:', updateError)
        return NextResponse.json({ error: '거절 처리에 실패했습니다.' }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Designated matching action error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
