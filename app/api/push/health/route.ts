import { NextResponse } from 'next/server'
import { checkPushHealth } from '@/lib/services/push-notification'

export async function GET() {
  const health = await checkPushHealth()

  return NextResponse.json({
    ok: health.webPushImportable && health.vapidConfigured,
    ...health,
  })
}
