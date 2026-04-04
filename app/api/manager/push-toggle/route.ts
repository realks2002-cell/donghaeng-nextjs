import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

// GET: 현재 푸시 구독 상태 확인
export async function GET() {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { count, error } = await table
      .select('*', { count: 'exact', head: true })
      .eq('manager_id', session.managerId)

    if (error) {
      return NextResponse.json({ error: '상태 확인 실패' }, { status: 500 })
    }

    return NextResponse.json({ enabled: (count ?? 0) > 0 })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

// DELETE: 푸시 구독 해제 (알림 끄기)
export async function DELETE() {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { error } = await table
      .delete()
      .eq('manager_id', session.managerId)

    if (error) {
      return NextResponse.json({ error: '구독 해제 실패' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, enabled: false })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}

// POST: 푸시 재구독 (알림 켜기) - FCM 토큰으로 재등록
export async function POST(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { fcm_token } = await request.json().catch(() => ({ fcm_token: null }))

    if (!fcm_token) {
      return NextResponse.json({ error: 'FCM 토큰이 필요합니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { error } = await table.upsert(
      {
        manager_id: session.managerId,
        endpoint: `fcm:${fcm_token}`,
        p256dh: 'fcm',
        auth: 'fcm',
        fcm_token: fcm_token,
      },
      { onConflict: 'manager_id,endpoint' }
    )

    if (error) {
      return NextResponse.json({ error: '구독 등록 실패' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, enabled: true })
  } catch {
    return NextResponse.json({ error: '서버 오류' }, { status: 500 })
  }
}
