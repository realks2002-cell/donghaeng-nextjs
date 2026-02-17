import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

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
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // 매니저 정보, 고객 정보 별도 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const managerIds = [...Array.from(new Set((data || []).map((r: any) => r.manager_id).filter(Boolean)))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customerIds = [...Array.from(new Set((data || []).map((r: any) => r.customer_id).filter(Boolean)))]

  const managersMap: Record<string, { name: string; phone: string }> = {}
  const customersMap: Record<string, { name: string }> = {}

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
      .select('id, name')
      .in('id', customerIds)
    for (const c of customers || []) {
      customersMap[c.id] = { name: c.name }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requests = (data || []).map((req: any) => ({
    id: req.id,
    created_at: req.created_at,
    customer_name: (req.customer_id && customersMap[req.customer_id]?.name) || req.guest_name || '비회원',
    service_type: req.service_type,
    service_date: req.service_date,
    start_time: req.start_time?.slice(0, 5) || '',
    status: req.status,
    estimated_price: req.estimated_price || 0,
    manager_name: (req.manager_id && managersMap[req.manager_id]?.name) || null,
    manager_phone: (req.manager_id && managersMap[req.manager_id]?.phone) || null,
    is_designated: !!req.manager_id,
  }))

  return NextResponse.json({ requests })
}
