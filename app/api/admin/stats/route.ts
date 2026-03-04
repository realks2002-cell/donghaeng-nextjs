import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth/admin'

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

  const [usersRes, managersRes, requestsRes, paymentsRes, recentRes] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER'),
    supabase.from('managers').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).in('status', ['CONFIRMED', 'PENDING_TRANSFER']),
    supabase.from('payments').select('amount, refund_amount').in('status', ['PAID', 'PARTIAL_REFUNDED']),
    supabase
      .from('service_requests')
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
        users!service_requests_customer_id_fkey (name)
      `)
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const totalRevenue = paymentsRes.data?.reduce(
    (sum: number, p: { amount?: number; refund_amount?: number }) => sum + (p.amount || 0) - (p.refund_amount || 0),
    0
  ) || 0

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentRequests = (recentRes.data || []).map((req: any) => ({
    id: req.id,
    created_at: req.created_at,
    customer_name: req.users?.name || req.guest_name || '비회원',
    service_type: req.service_type,
    service_date: req.service_date,
    start_time: req.start_time?.slice(0, 5) || '',
    status: req.status,
    estimated_price: req.estimated_price || 0,
  }))

  return NextResponse.json({
    stats: {
      total_users: usersRes.count || 0,
      total_managers: managersRes.count || 0,
      pending_requests: requestsRes.count || 0,
      total_revenue: totalRevenue,
    },
    recentRequests,
  })
}
