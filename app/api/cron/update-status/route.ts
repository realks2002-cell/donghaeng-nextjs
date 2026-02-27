import { NextRequest, NextResponse } from 'next/server'
import { updateServiceStatuses } from '@/lib/services/status-updater'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Vercel Cron 또는 수동 호출 시 CRON_SECRET으로 인증
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await updateServiceStatuses()
    return NextResponse.json({
      ok: true,
      updated: result,
    })
  } catch (error) {
    console.error('Cron update-status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
