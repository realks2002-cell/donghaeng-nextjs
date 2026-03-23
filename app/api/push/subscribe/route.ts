import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

export async function POST(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { endpoint, p256dh, auth } = await request.json()

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: '구독 정보가 누락되었습니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { error } = await table.upsert(
      {
        manager_id: session.managerId,
        endpoint,
        p256dh,
        auth,
      },
      { onConflict: 'manager_id,endpoint' }
    )

    if (error) {
      console.error('Push subscription save error:', error)
      return NextResponse.json({ error: '구독 저장에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: '엔드포인트가 누락되었습니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { error } = await table
      .delete()
      .eq('manager_id', session.managerId)
      .eq('endpoint', endpoint)

    if (error) {
      console.error('Push unsubscribe error:', error)
      return NextResponse.json({ error: '구독 해제에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Push unsubscribe error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
