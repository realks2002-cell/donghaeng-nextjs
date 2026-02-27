import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get('start')
  const endDate = searchParams.get('end')

  const supabase = createServiceClient()

  // 수수료율 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: commissionData } = await (supabase.from('service_prices') as any)
    .select('price_per_hour')
    .eq('service_type', 'commission_rate')
    .single()
  const commissionRate = commissionData?.price_per_hour ?? 0

  // 완료된 서비스 요청 + 결제 정보 조회 (매니저 배정된 건만)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsTable = supabase.from('service_requests') as any
  const { data: requests, error: reqError } = await requestsTable
    .select(`
      id,
      manager_id,
      service_date,
      payments (
        id,
        amount,
        refund_amount,
        status,
        created_at
      )
    `)
    .eq('status', 'COMPLETED')
    .not('manager_id', 'is', null)

  if (reqError) {
    console.error('Error fetching service requests:', reqError)
    return NextResponse.json({ error: reqError.message }, { status: 500 })
  }

  // 매니저 ID 수집
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const managerIds = [...Array.from(new Set((requests || []).map((r: any) => r.manager_id).filter(Boolean)))]

  if (managerIds.length === 0) {
    return NextResponse.json({ settlements: [] })
  }

  // 매니저 정보 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: managers, error: mgrError } = await (supabase.from('managers') as any)
    .select('id, name, phone, bank_name, bank_account, bank_holder')
    .in('id', managerIds)

  if (mgrError) {
    console.error('Error fetching managers:', mgrError)
    return NextResponse.json({ error: mgrError.message }, { status: 500 })
  }

  const managersMap: Record<string, {
    name: string
    phone: string
    bank_name: string | null
    bank_account: string | null
    bank_holder: string | null
  }> = {}
  for (const m of managers || []) {
    managersMap[m.id] = {
      name: m.name,
      phone: m.phone,
      bank_name: m.bank_name,
      bank_account: m.bank_account,
      bank_holder: m.bank_holder,
    }
  }

  // 매니저별 집계
  const settlementMap = new Map<string, {
    manager_id: string
    service_count: number
    total_amount: number
    refund_amount: number
  }>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const req of (requests || []) as any[]) {
    const managerId = req.manager_id
    const payments = Array.isArray(req.payments) ? req.payments : req.payments ? [req.payments] : []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const payment of payments as any[]) {
      if (!['PAID', 'REFUNDED', 'PARTIAL_REFUNDED'].includes(payment.status)) continue

      const paymentDate = (payment.created_at as string).slice(0, 10)
      if (startDate && paymentDate < startDate) continue
      if (endDate && paymentDate > endDate) continue

      const key = managerId

      const existing = settlementMap.get(key) || {
        manager_id: managerId,
        service_count: 0,
        total_amount: 0,
        refund_amount: 0,
      }

      existing.service_count += 1
      existing.total_amount += payment.amount || 0
      existing.refund_amount += payment.refund_amount || 0
      settlementMap.set(key, existing)
    }
  }

  // 응답 데이터 구성
  const settlements = Array.from(settlementMap.values()).map((s) => {
    const mgr = managersMap[s.manager_id]
    const beforeCommission = s.total_amount - s.refund_amount
    const commissionAmount = Math.ceil(beforeCommission * commissionRate / 100)
    const netAmount = beforeCommission - commissionAmount
    return {
      manager_id: s.manager_id,
      manager_name: mgr?.name || '알 수 없음',
      manager_phone: mgr?.phone || '',
      bank_name: mgr?.bank_name || null,
      bank_account: mgr?.bank_account || null,
      bank_holder: mgr?.bank_holder || null,
      service_count: s.service_count,
      total_amount: s.total_amount,
      refund_amount: s.refund_amount,
      commission_amount: commissionAmount,
      net_amount: netAmount,
    }
  })

  // 정산액 내림차순
  settlements.sort((a, b) => b.net_amount - a.net_amount)

  return NextResponse.json({ settlements, commission_rate: commissionRate })
}
