import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Supabase Auth 세션 확인
    const supabase = await createClient()
    const { data: authData } = await supabase.auth.getUser()
    const authUser = authData.user

    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // users 테이블에서 user_id와 phone 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = supabase.from('users') as any
    const { data: usersData } = await usersTable
      .select('id, phone')
      .eq('auth_id', authUser.id)
      .single()

    if (!usersData) {
      console.error('[API Bookings] User not found for auth_id:', authUser.id)
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }

    const userId = usersData.id as string
    const userPhone = usersData.phone as string

    console.log('[API Bookings] userId:', userId)
    console.log('[API Bookings] userPhone:', userPhone)

    // Service Role로 모든 예약 조회 (RLS 우회)
    const serviceClient = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reqTable = serviceClient.from('service_requests') as any

    // customer_id로 조회
    const { data: byCustomerId, error: customerIdError } = await reqTable
      .select(`
        id,
        service_type,
        service_date,
        start_time,
        duration_minutes,
        address,
        status,
        estimated_price,
        created_at,
        manager_id
      `)
      .eq('customer_id', userId)
      .order('created_at', { ascending: false })

    console.log('[API Bookings] byCustomerId count:', byCustomerId?.length || 0)
    if (customerIdError) console.error('[API Bookings] customerIdError:', customerIdError)

    // 전화번호로도 조회 (customer_id가 null인 기존 데이터)
    const raw = userPhone.replace(/[^0-9]/g, '')
    const formatted = raw.length === 11
      ? `${raw.slice(0,3)}-${raw.slice(3,7)}-${raw.slice(7)}`
      : raw
    const phoneVariants = Array.from(new Set([userPhone, raw, formatted]))

    const { data: byPhone, error: phoneError } = await reqTable
      .select(`
        id,
        service_type,
        service_date,
        start_time,
        duration_minutes,
        address,
        status,
        estimated_price,
        created_at,
        manager_id
      `)
      .is('customer_id', null)
      .in('phone', phoneVariants)
      .order('created_at', { ascending: false })

    console.log('[API Bookings] phoneVariants:', phoneVariants)
    console.log('[API Bookings] byPhone count:', byPhone?.length || 0)
    if (phoneError) console.error('[API Bookings] phoneError:', phoneError)

    // 중복 제거 후 합치기
    const idSet = new Set((byCustomerId || []).map((r: { id: string }) => r.id))
    const combined = [...(byCustomerId || [])]
    for (const r of byPhone || []) {
      if (!idSet.has(r.id)) combined.push(r)
    }
    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    console.log('[API Bookings] total combined count:', combined.length)

    return NextResponse.json({
      success: true,
      requests: combined,
    })
  } catch (error) {
    console.error('[API Bookings] error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
