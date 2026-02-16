'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import BookingsContent from './BookingsContent'

export const dynamic = 'force-dynamic'

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

export default function BookingsPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [memberRequests, setMemberRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuthAndFetchBookings() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        // 비회원 - 로그인 페이지로 리다이렉트하지 않고 비회원 UI 표시
        setLoading(false)
        return
      }

      // 로그인된 사용자 - API에서 예약 목록 가져오기
      try {
        const res = await fetch('/api/bookings')
        const data = await res.json()

        if (data.success) {
          setIsLoggedIn(true)
          setMemberRequests(data.requests || [])
        } else {
          console.error('[Bookings] API error:', data.error)
        }
      } catch (err) {
        console.error('[Bookings] fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchBookings()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return <BookingsContent isLoggedIn={isLoggedIn} memberRequests={memberRequests} />
}
