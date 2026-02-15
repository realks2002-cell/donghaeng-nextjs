import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export const metadata = {
  title: '내 예약 - 행복안심동행',
  description: '서비스 예약 내역을 확인하세요.',
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: '대기중', color: 'bg-gray-100 text-gray-800' },
  CONFIRMED: { label: '확정', color: 'bg-green-100 text-green-800' },
  MATCHING: { label: '매칭중', color: 'bg-blue-100 text-blue-800' },
  IN_PROGRESS: { label: '진행중', color: 'bg-yellow-100 text-yellow-800' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800' },
}

const SERVICE_LABELS: Record<string, string> = {
  hospital_companion: '병원 동행',
  daily_care: '가사돌봄',
  life_companion: '생활동행',
  elderly_care: '노인 돌봄',
  child_care: '아이 돌봄',
  other: '기타',
}

interface ServiceRequest {
  id: string
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  address: string
  status: string
  estimated_price: number
  created_at: string
  manager_id: string | null
}

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/auth/login?redirect=/bookings')
  }

  // 사용자 정보 가져오기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const usersTable = supabase.from('users') as any
  const { data: userData } = await usersTable
    .select('id')
    .eq('auth_id', authUser.id)
    .single()

  if (!userData) {
    redirect('/auth/login?redirect=/bookings')
  }

  // 서비스 요청 목록 가져오기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsTable = supabase.from('service_requests') as any
  const { data: requests } = await requestsTable
    .select(`
      id,
      service_type,
      service_date,
      start_time,
      duration_minutes,
      address,
      status,
      estimated_price,
      created_at,
      manager_id
    `)
    .eq('customer_id', userData.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <h1 className="text-2xl font-bold">내 예약</h1>
        <p className="mt-1 text-gray-600">서비스 예약 내역을 확인하세요.</p>

        {!requests || requests.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-white p-8 text-center">
            <p className="text-gray-600">예약 내역이 없습니다.</p>
            <Link
              href="/requests/new"
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90"
            >
              서비스 요청하기
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {(requests as ServiceRequest[]).map((request) => {
              const status = STATUS_LABELS[request.status] || STATUS_LABELS.PENDING
              const serviceLabel = SERVICE_LABELS[request.service_type] || request.service_type
              const formattedDate = format(new Date(request.service_date), 'yyyy년 M월 d일 (EEE)', { locale: ko })
              const durationHours = Math.floor(request.duration_minutes / 60)

              return (
                <Link
                  key={request.id}
                  href={`/requests/${request.id}`}
                  className="block rounded-lg border bg-white p-6 shadow-sm hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{serviceLabel}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {formattedDate} {request.start_time} · {durationHours}시간
                      </p>
                      <p className="mt-1 text-sm text-gray-500 truncate max-w-md">
                        {request.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {request.estimated_price?.toLocaleString()}원
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {format(new Date(request.created_at), 'M/d 요청')}
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
