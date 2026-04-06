import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

export async function POST(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { fcm_token } = await request.json()

    if (!fcm_token) {
      return NextResponse.json({ error: 'FCM 토큰이 누락되었습니다.' }, { status: 400 })
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
      console.error('FCM subscription save error:', error)
      return NextResponse.json({ error: 'FCM 구독 저장에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('FCM subscribe error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
