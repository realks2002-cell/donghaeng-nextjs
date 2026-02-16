import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone } = body

    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: '이름과 전화번호를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    // 하이픈 제거하여 비교용 전화번호 생성
    const cleanPhone = phone.replace(/-/g, '')

    const serviceClient = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = serviceClient.from('service_requests') as any

    const { data: requests, error } = await requestsTable
      .select(`
        id,
        service_type,
        service_date,
        start_time,
        duration_minutes,
        address,
        status,
        estimated_price,
        created_at
      `)
      .eq('guest_name', name.trim())
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Guest lookup error:', error)
      return NextResponse.json(
        { ok: false, error: '조회 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 전화번호 매칭 필터 (DB에 하이픈 유무가 다를 수 있으므로 하이픈 제거 후 비교)
    const filtered = (requests || []).filter((r: { guest_phone?: string }) => {
      if (!r.guest_phone) return false
      return r.guest_phone.replace(/-/g, '') === cleanPhone
    })

    return NextResponse.json({ ok: true, requests: filtered })
  } catch (error) {
    console.error('Guest lookup error:', error)
    return NextResponse.json(
      { ok: false, error: '조회 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
