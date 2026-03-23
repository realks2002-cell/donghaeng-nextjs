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
  vehicle_support: boolean
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

    // 수수료율 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: commissionData } = await (supabase.from('service_prices') as any)
      .select('price_per_hour')
      .eq('service_type', 'commission_rate')
      .single()
    const commissionRate = commissionData?.price_per_hour ?? 0

    // 오늘 날짜 (KST 기준)
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' })

    // Get service requests with CONFIRMED status (available for matching)
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
        vehicle_support,
        created_at
      `)
      .eq('status', 'CONFIRMED')
      .gte('service_date', today)
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

    // Format requests
    const formattedRequests = requests?.map((request) => {
      const customer = request.customer_id ? customerMap[request.customer_id] : null
      const managerAmount = Math.floor(request.estimated_price * (1 - commissionRate / 100))
      return {
        ...request,
        customer_name: customer?.name || request.guest_name || '비회원',
        customer_phone: customer?.phone || request.guest_phone || '',
        manager_amount: managerAmount,
      }
    }) || []

    return NextResponse.json({ requests: formattedRequests, commission_rate: commissionRate })
  } catch (error) {
    console.error('Requests error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
