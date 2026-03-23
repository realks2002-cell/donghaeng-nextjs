import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getManagerSession } from '@/lib/auth/manager'

export async function POST(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { expo_push_token } = await request.json()

    if (!expo_push_token || !/^Expo(nent)?PushToken\[.+\]$/.test(expo_push_token)) {
      return NextResponse.json({ error: '유효한 Expo Push Token이 필요합니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { error } = await table.upsert(
      {
        manager_id: session.managerId,
        endpoint: expo_push_token,
        p256dh: 'expo',
        auth: 'expo',
      },
      { onConflict: 'manager_id,endpoint' }
    )

    if (error) {
      console.error('Expo push token save error:', error)
      return NextResponse.json({ error: '토큰 저장에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Expo push subscribe error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { expo_push_token } = await request.json()

    if (!expo_push_token || !/^Expo(nent)?PushToken\[.+\]$/.test(expo_push_token)) {
      return NextResponse.json({ error: '유효한 Expo Push Token이 필요합니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { error } = await table
      .delete()
      .eq('manager_id', session.managerId)
      .eq('endpoint', expo_push_token)

    if (error) {
      console.error('Expo push unsubscribe error:', error)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Expo push unsubscribe error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
