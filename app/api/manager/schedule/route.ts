import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

interface ScheduleRecord {
  id: string
  customer_id: string | null
  guest_name: string | null
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  address: string
  status: string
  final_price: number | null
  estimated_price: number | null
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

    // Get service requests assigned to this manager
    const { data: requests, error } = await supabase
      .from('service_requests')
      .select(`
        id,
        customer_id,
        guest_name,
        service_type,
        service_date,
        start_time,
        duration_minutes,
        address,
        status,
        final_price,
        estimated_price
      `)
      .eq('manager_id', session.managerId)
      .order('service_date', { ascending: false })
      .order('start_time', { ascending: false }) as { data: ScheduleRecord[] | null; error: unknown }

    if (error) {
      console.error('Fetch schedule error:', error)
      return NextResponse.json(
        { error: '근무 기록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Get customer names
    const customerIds = requests
      ?.filter((r) => r.customer_id)
      .map((r) => r.customer_id) || []

    let customerMap: Record<string, string> = {}
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('users')
        .select('id, name')
        .in('id', customerIds)

      if (customers) {
        customerMap = customers.reduce((acc, c: { id: string; name: string }) => {
          acc[c.id] = c.name
          return acc
        }, {} as Record<string, string>)
      }
    }

    // Format records
    const records = requests?.map((request) => {
      const customerName = request.customer_id
        ? customerMap[request.customer_id] || '비회원'
        : request.guest_name || '비회원'

      return {
        id: request.id,
        service_type: request.service_type,
        service_date: request.service_date,
        start_time: request.start_time,
        duration_minutes: request.duration_minutes,
        customer_name: customerName,
        address: request.address,
        status: request.status,
        final_price: request.final_price || request.estimated_price || 0,
      }
    }) || []

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Schedule error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
