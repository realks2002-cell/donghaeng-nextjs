import { NextRequest, NextResponse } from 'next/server'
import { getManagerSession } from '@/lib/auth/manager'
import { sendPushToAllManagers } from '@/lib/services/push-notification'

export async function POST(request: NextRequest) {
  try {
    const session = await getManagerSession()
    if (!session) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const title = body.title || '테스트 알림'
    const message = body.body || '푸시 알림이 정상적으로 동작합니다.'

    await sendPushToAllManagers({
      title,
      body: message,
      url: '/manager/dashboard',
    })

    return NextResponse.json({ ok: true, message: '테스트 푸시 전송 완료' })
  } catch (error) {
    console.error('Test push error:', error)
    return NextResponse.json({ error: '푸시 전송에 실패했습니다.' }, { status: 500 })
  }
}
