import { createServiceClient } from '@/lib/supabase/server'

/**
 * 서비스 시간 기반 자동 상태 전환
 * - MATCHED → COMPLETED: 서비스 종료 시간(시작 + duration)이 지난 경우
 */
export async function updateServiceStatuses(): Promise<{ completed: number }> {
  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsTable = supabase.from('service_requests') as any

  // 현재 시간
  const now = new Date()

  // MATCHED → COMPLETED: 서비스 종료 시간이 현재 이전인 경우
  const { data: matchedRequests } = await requestsTable
    .select('id, service_date, start_time, duration_minutes')
    .eq('status', 'MATCHED')

  let completedCount = 0
  for (const req of matchedRequests || []) {
    // 서비스 종료 시간 계산 (KST 기준)
    const [hours, minutes] = (req.start_time as string).split(':').map(Number)
    const serviceStart = new Date(`${req.service_date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+09:00`)
    const serviceEnd = new Date(serviceStart.getTime() + (req.duration_minutes as number) * 60 * 1000)

    if (now >= serviceEnd) {
      const { error } = await requestsTable
        .update({ status: 'COMPLETED', completed_at: new Date().toISOString() })
        .eq('id', req.id)
        .eq('status', 'MATCHED') // 레이스 컨디션 방지
      if (!error) completedCount++
    }
  }

  return { completed: completedCount }
}
