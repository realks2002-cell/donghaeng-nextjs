import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { ArrowLeft, MapPin, Clock, Calendar, Phone, User } from 'lucide-react'
import { formatKoreanPhone } from '@/lib/utils/validation'
import CancelRequestButton from '@/components/CancelRequestButton'

const STATUS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  PENDING: { label: '대기중', color: 'bg-gray-100 text-gray-800', description: '결제 대기 중입니다.' },
  CONFIRMED: { label: '확정', color: 'bg-green-100 text-green-800', description: '결제가 완료되었습니다. 매니저 매칭을 진행합니다.' },
  MATCHING: { label: '매칭중', color: 'bg-blue-100 text-blue-800', description: '매니저가 지원 중입니다.' },
  MATCHED: { label: '매칭완료', color: 'bg-indigo-100 text-indigo-800', description: '매니저가 배정되었습니다. 서비스 시작을 준비합니다.' },
  IN_PROGRESS: { label: '진행중', color: 'bg-yellow-100 text-yellow-800', description: '서비스가 진행 중입니다.' },
  COMPLETED: { label: '완료', color: 'bg-gray-100 text-gray-800', description: '서비스가 완료되었습니다.' },
  CANCELLED: { label: '취소', color: 'bg-red-100 text-red-800', description: '요청이 취소되었습니다.' },
}

const SERVICE_LABELS: Record<string, string> = {
  hospital_companion: '병원 동행',
  daily_care: '가사돌봄',
  life_companion: '생활동행',
  elderly_care: '노인 돌봄',
  child_care: '아이 돌봄',
  other: '기타',
}

interface PageProps {
  params: Promise<{ id: string }>
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function generateMetadata(_props: PageProps) {
  return {
    title: '요청 상세 - 행복안심동행',
    description: '서비스 요청 상세 정보를 확인하세요.',
  }
}

interface RequestData {
  id: string
  service_type: string
  service_date: string
  start_time: string
  duration_minutes: number
  address: string
  address_detail: string | null
  phone: string
  status: string
  estimated_price: number
  final_price: number | null
  details: string | null
  managers: {
    id: string
    name: string
    phone: string
    photo_url: string | null
  } | null
}

export default async function RequestDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = createServiceClient()

  // 서비스 요청 정보 가져오기
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestsTable = supabase.from('service_requests') as any
  const { data, error } = await requestsTable
    .select(`
      *,
      managers (
        id,
        name,
        phone,
        photo_url
      )
    `)
    .eq('id', id)
    .single()

  const request = data as RequestData | null

  if (error || !request) {
    notFound()
  }

  const status = STATUS_LABELS[request.status] || STATUS_LABELS.PENDING
  const serviceLabel = SERVICE_LABELS[request.service_type] || request.service_type
  const formattedDate = format(new Date(request.service_date), 'yyyy년 M월 d일 (EEEE)', { locale: ko })
  const durationHours = Math.floor(request.duration_minutes / 60)

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <Link
          href="/bookings"
          className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          내 예약으로 돌아가기
        </Link>

        {/* 상태 배너 */}
        <div className={`rounded-lg p-4 mb-6 ${status.color}`}>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{status.label}</span>
          </div>
          <p className="mt-1 text-sm opacity-80">{status.description}</p>
        </div>

        {/* 서비스 정보 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm mb-6">
          <h1 className="text-xl font-bold">{serviceLabel}</h1>

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{request.start_time} 시작 · {durationHours}시간</span>
            </div>
            <div className="flex items-start gap-3 text-gray-700">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <span>
                {request.address}
                {request.address_detail && ` ${request.address_detail}`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="w-5 h-5 text-gray-400" />
              <span>{formatKoreanPhone(request.phone)}</span>
            </div>
          </div>

          {request.details && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium text-gray-700 mb-2">상세 요청사항</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{request.details}</p>
            </div>
          )}
        </div>

        {/* 결제 정보 */}
        <div className="rounded-lg border bg-white p-6 shadow-sm mb-6">
          <h2 className="font-semibold mb-4">결제 정보</h2>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">예상 금액</span>
            <span className="text-xl font-bold text-primary">
              {request.estimated_price?.toLocaleString()}원
            </span>
          </div>
          {request.final_price && request.final_price !== request.estimated_price && (
            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-600">최종 금액</span>
              <span className="text-xl font-bold text-primary">
                {request.final_price.toLocaleString()}원
              </span>
            </div>
          )}
        </div>

        {/* 매니저 정보 */}
        {request.managers && (
          <div className="rounded-lg border bg-white p-6 shadow-sm mb-6">
            <h2 className="font-semibold mb-4">담당 매니저</h2>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {request.managers.photo_url ? (
                  <img
                    src={request.managers.photo_url}
                    alt={request.managers.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div>
                <p className="font-semibold">{request.managers.name}</p>
                <p className="text-sm text-gray-600">{formatKoreanPhone(request.managers.phone)}</p>
              </div>
            </div>
          </div>
        )}

        {/* 취소 버튼 */}
        {(['PENDING', 'CONFIRMED', 'MATCHING', 'MATCHED'].includes(request.status)) && (
          <div className="text-center">
            <CancelRequestButton requestId={request.id} />
          </div>
        )}
      </div>
    </div>
  )
}
