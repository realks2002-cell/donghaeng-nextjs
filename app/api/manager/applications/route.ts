import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

interface ApplicationWithRequest {
  id: string
  service_request_id: string
  status: string
  message: string | null
  created_at: string
  service_requests: {
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
    status: string
    estimated_price: number
    vehicle_support: boolean
  } | null
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

    // Get applications by this manager with service request details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applicationsTable = supabase.from('manager_applications') as any
    const { data: applications, error } = await applicationsTable
      .select(`
        id,
        service_request_id,
        status,
        message,
        created_at,
        service_requests (
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
          status,
          estimated_price,
          vehicle_support
        )
      `)
      .eq('manager_id', session.managerId)
      .order('created_at', { ascending: false }) as { data: ApplicationWithRequest[] | null; error: unknown }

    if (error) {
      console.error('Fetch applications error:', error)
      return NextResponse.json(
        { error: '지원 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // Get customer names
    const customerIds = applications
      ?.map((a) => a.service_requests?.customer_id)
      .filter((id): id is string => id !== null && id !== undefined) || []

    let customerMap: Record<string, { name: string; phone: string }> = {}
    if (customerIds.length > 0) {
      const { data: customers } = await supabase
        .from('users')
        .select('id, name, phone')
        .in('id', customerIds)

      if (customers) {
        customerMap = customers.reduce((acc, c: { id: string; name: string; phone: string }) => {
          acc[c.id] = { name: c.name, phone: c.phone }
          return acc
        }, {} as Record<string, { name: string; phone: string }>)
      }
    }

    // Format applications
    const formattedApplications = applications?.map((app) => {
      const sr = app.service_requests

      const customer = sr?.customer_id ? customerMap[sr.customer_id] : null
      const customerName = customer?.name || sr?.guest_name || '비회원'
      const customerPhone = customer?.phone || sr?.guest_phone || ''

      return {
        id: app.id,
        request_id: app.service_request_id,
        status: app.status,
        created_at: app.created_at,
        service_type: sr?.service_type || '',
        service_date: sr?.service_date || '',
        start_time: sr?.start_time || '',
        duration_minutes: sr?.duration_minutes || 0,
        customer_name: customerName,
        customer_phone: customerPhone,
        address: sr?.address || '',
        address_detail: sr?.address_detail || '',
        request_status: sr?.status || '',
        estimated_price: sr?.estimated_price || 0,
        vehicle_support: sr?.vehicle_support || false,
      }
    }) || []

    return NextResponse.json({ applications: formattedApplications })
  } catch (error) {
    console.error('Applications error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
