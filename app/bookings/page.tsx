import { createClient } from '@/lib/supabase/server'
import BookingsContent from './BookingsContent'

export const metadata = {
  title: '예약 조회 - 행복안심동행',
  description: '서비스 예약 내역을 확인하세요.',
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

  let memberRequests: ServiceRequest[] = []
  let isLoggedIn = false

  if (authUser) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = supabase.from('users') as any
    const { data: userData } = await usersTable
      .select('id')
      .eq('auth_id', authUser.id)
      .single()

    if (userData) {
      isLoggedIn = true
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

      memberRequests = requests || []
    }
  }

  return <BookingsContent isLoggedIn={isLoggedIn} memberRequests={memberRequests} />
}
