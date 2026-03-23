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

  try {
    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('admins') as any)
      .select('id, admin_id, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching admins:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ admins: data || [] })
  } catch (error) {
    console.error('Admin list API error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
