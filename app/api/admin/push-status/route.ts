import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/auth/admin'
import { sendPushToAllManagers, checkPushHealth } from '@/lib/services/push-notification'

// GET: 푸시 구독 현황 조회
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

  // 1. 테이블 존재 여부 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const table = supabase.from('push_subscriptions') as any
  const { data: subscriptions, error } = await table.select(
    'id, manager_id, endpoint, created_at'
  )

  if (error) {
    // 테이블이 없는 경우 (42P01: undefined_table)
    if (error.code === '42P01' || error.message?.includes('does not exist')) {
      return NextResponse.json({
        status: 'table_missing',
        message: 'push_subscriptions 테이블이 존재하지 않습니다. 마이그레이션을 적용해주세요.',
        migration_file: 'supabase/migrations/010_push_subscriptions.sql',
        subscriptionCount: 0,
        subscriptions: [],
      })
    }

    return NextResponse.json(
      { error: '구독 조회 실패', details: error.message },
      { status: 500 }
    )
  }

  // 2. 매니저 정보 조회하여 매핑
  const managerIdSet: string[] = Array.from(
    new Set((subscriptions || []).map((s: { manager_id: string }) => s.manager_id))
  )

  let managersMap: Record<string, string> = {}
  if (managerIdSet.length > 0) {
    const { data: managers } = await supabase
      .from('managers')
      .select('id, name')
      .in('id', managerIdSet)

    if (managers) {
      managersMap = Object.fromEntries(
        managers.map((m: { id: string; name: string }) => [m.id, m.name])
      )
    }
  }

  const enriched = (subscriptions || []).map((s: { id: string; manager_id: string; endpoint: string; created_at: string }) => ({
    id: s.id,
    manager_id: s.manager_id,
    manager_name: managersMap[s.manager_id] || '(알 수 없음)',
    endpoint_preview: s.endpoint.substring(0, 80) + '...',
    created_at: s.created_at,
  }))

  // 3. VAPID 키 설정 여부 확인
  const hasVapidPublic = !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const hasVapidPrivate = !!process.env.VAPID_PRIVATE_KEY

  // 4. 푸시 시스템 상태 진단
  const health = await checkPushHealth()

  return NextResponse.json({
    status: 'ok',
    subscriptionCount: enriched.length,
    subscriptions: enriched,
    config: {
      vapidPublicKey: hasVapidPublic,
      vapidPrivateKey: hasVapidPrivate,
      vapidConfigured: hasVapidPublic && hasVapidPrivate,
    },
    health,
  })
}

// POST: 테스트 푸시 발송
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  const body = await request.json().catch(() => ({}))
  const title = body.title || '[테스트] 관리자 테스트 알림'
  const message = body.body || '푸시 알림 테스트입니다. 이 알림이 보이면 정상 동작 중입니다.'

  const pushResult = await sendPushToAllManagers({
    title,
    body: message,
    url: '/manager/dashboard',
  })

  return NextResponse.json({
    ok: pushResult.success,
    message: pushResult.success ? '테스트 푸시 전송 완료' : '푸시 전송 실패',
    pushResult,
  })
}
