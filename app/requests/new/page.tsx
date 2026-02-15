import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import ServiceRequestForm from '@/components/forms/ServiceRequestForm'

export const metadata = {
  title: '서비스 요청 - 행복안심동행',
  description: '병원동행, 돌봄 서비스를 요청하세요.',
}

async function ServiceRequestPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  let user = null
  let isLoggedIn = false

  if (authUser) {
    // 사용자 정보 가져오기
    const { data: userData } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('auth_id', authUser.id)
      .single()

    if (userData) {
      user = userData
      isLoggedIn = true
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <Suspense fallback={
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      }>
        <ServiceRequestForm isLoggedIn={isLoggedIn} user={user} />
      </Suspense>
    </div>
  )
}

export default ServiceRequestPage
