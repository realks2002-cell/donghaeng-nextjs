import { createServiceClient } from '@/lib/supabase/server'

/**
 * 서비스 시간 기반 자동 상태 전환
 * - MATCHED → IN_PROGRESS: 서비스 시작 시간이 지난 경우
 * - IN_PROGRESS → COMPLETED: 서비스 종료 시간(시작 + duration)이 지난 경우
 */
export async function updateServiceStatuses(): Promise<{ matched: number; completed: number }> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsTable = supabase.from('service_requests') as any

  // 현재 KST 시간
  const now = new Date()
  const kstOffset = 9 * 60 * 60 * 1000
  const kstNow = new Date(now.getTime() + kstOffset)
  const kstDateStr = kstNow.toISOString().slice(0, 10) // YYYY-MM-DD
  const kstTimeStr = kstNow.toISOString().slice(11, 16) // HH:MM

  // 1. MATCHED → IN_PROGRESS: 서비스 시작 시간이 현재 이전인 경우
  const { data: matchedRequests } = await requestsTable
    .select('id, service_date, start_time')
    .eq('status', 'MATCHED')
    .or(`service_date.lt.${kstDateStr},and(service_date.eq.${kstDateStr},start_time.lte.${kstTimeStr})`)

  let matchedCount = 0
  for (const req of matchedRequests || []) {
    const { error } = await requestsTable
      .update({ status: 'IN_PROGRESS' })
      .eq('id', req.id)
      .eq('status', 'MATCHED') // 레이스 컨디션 방지
    if (!error) matchedCount++
  }

  // 2. IN_PROGRESS → COMPLETED: 서비스 종료 시간이 현재 이전인 경우
  const { data: inProgressRequests } = await requestsTable
    .select('id, service_date, start_time, duration_minutes')
    .eq('status', 'IN_PROGRESS')

  let completedCount = 0
  for (const req of inProgressRequests || []) {
    // 서비스 종료 시간 계산 (KST 기준)
    const [hours, minutes] = (req.start_time as string).split(':').map(Number)
    const serviceStart = new Date(`${req.service_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+09:00`)
    const serviceEnd = new Date(serviceStart.getTime() + (req.duration_minutes as number) * 60 * 1000)

    if (now >= serviceEnd) {
      const { error } = await requestsTable
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('id', req.id)
        .eq('status', 'IN_PROGRESS') // 레이스 컨디션 방지
      if (!error) completedCount++
    }
  }

  return { matched: matchedCount, completed: completedCount }
}
