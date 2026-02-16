import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

interface ServiceRequestRecord {
  id: string
  customer_id: string | null
  guest_name: string | null
  guest_phone: string | null
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  address: string
  address_detail: string | null
  details: string | null
  status: string
  estimated_price: number
  created_at: string
}

export async function GET() {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const supabase = createServiceClient()

    // Get service requests with CONFIRMED or MATCHING status
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        customer_id,
        guest_name,
        guest_phone,
        service_type,
        service_date,
        start_time,
        duration_minutes,
        address,
        address_detail,
        details,
        status,
        estimated_price,
        created_at
      `)
      .in('status', ['CONFIRMED', 'MATCHING'])
      .order('service_date', { ascending: true })
      .order('start_time', { ascending: true }) as { data: ServiceRequestRecord[] | null; error: unknown }

    if (error) {
      console.error('Fetch requests error:', error)
      return NextResponse.json(
        { error: '요청 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Get customer names for requests with customer_id
    const customerIds = requests
      ?.filter((r) => r.customer_id)
      .map((r) => r.customer_id) || []

    let customerMap: Record<string, { name: string; phone: string }> = {}
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('users')
        .select('id, name, phone')
        .in('id', customerIds)

      if (customers) {
        customerMap = customers.reduce((acc, c: { id: string; name: string; phone: string | null }) => {
          acc[c.id] = { name: c.name, phone: c.phone || '' }
          return acc
        }, {} as Record<string, { name: string; phone: string }>)
      }
    }

    // Get applications by this manager
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: applications } = await (supabase.from('manager_applications') as any)
      .select('service_request_id')
      .eq('manager_id', session.managerId) as { data: { service_request_id: string }[] | null }

    const appliedRequestIds = new Set(applications?.map((a) => a.service_request_id) || [])

    // Format requests
    const formattedRequests = requests?.map((request) => {
      const customer = request.customer_id ? customerMap[request.customer_id] : null
      return {
        ...request,
        customer_name: customer?.name || request.guest_name || '비회원',
        customer_phone: customer?.phone || request.guest_phone || '',
        is_applied: appliedRequestIds.has(request.id),
      }
    }) || []

    return NextResponse.json({ requests: formattedRequests })
  } catch (error) {
    console.error('Requests error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
