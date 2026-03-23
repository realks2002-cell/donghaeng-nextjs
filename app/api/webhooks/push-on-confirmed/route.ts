import { NextRequest, NextResponse } from 'next/server'
import { sendPushToAllManagers } from '@/lib/services/push-notification'
import { SERVICE_TYPE_LABELS, type ServiceType } from '@/lib/constants/pricing'

export async function POST(request: NextRequest) {
  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    console.error('[WEBHOOK] Invalid or missing webhook secret')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, service_type, estimated_price, service_date, start_time } = body

    console.log('[WEBHOOK] push-on-confirmed received:', { id, service_type, service_date })

    const serviceLabel = SERVICE_TYPE_LABELS[service_type as ServiceType] || service_type
    const priceText = estimated_price
      ? Number(estimated_price).toLocaleString('ko-KR')
      : '미정'

    const pushResult = await sendPushToAllManagers({
      title: '새로운 서비스 요청이 접수되었습니다',
      body: `${serviceLabel} | ${priceText}원 | ${service_date} ${start_time}`,
      url: '/manager/dashboard',
    })

    console.log('[WEBHOOK] Push result:', JSON.stringify(pushResult))

    // Always return 200 to prevent trigger retries
    return NextResponse.json({ ok: true, pushResult })
  } catch (error) {
    console.error('[WEBHOOK] push-on-confirmed error:', error)
    // Return 200 even on error to prevent pg_net retries
    return NextResponse.json({ ok: true, error: 'Internal error logged' })
  }
}
