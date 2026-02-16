'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import ServiceRequestForm from '@/components/forms/ServiceRequestForm'

export default function ServiceRequestPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{
    id: string
    name: string
    phone: string
    email: string
    address?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      console.log('[ServiceRequest] Checking authentication...')
      const supabase = createClient()

      // Supabase Auth 세션 확인
      const { data: { user: authUser } } = await supabase.auth.getUser()
      console.log('[ServiceRequest] Supabase user:', authUser ? 'Found' : 'Not found')

      if (authUser) {
        setIsLoggedIn(true)

        // users 테이블에서 추가 정보 조회
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersTable = supabase.from('users') as any
        const { data: userData } = await usersTable
          .select('name, phone, address')
          .eq('auth_id', authUser.id)
          .single()

        setUser({
          id: authUser.id,
          name: userData?.name || '',
          phone: userData?.phone || '',
          email: authUser.email || '',
          address: userData?.address || undefined
        })

        console.log('[ServiceRequest] User logged in:', userData?.name)
      } else {
        console.log('[ServiceRequest] No user session found')
      }

      setLoading(false)
    }

    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <ServiceRequestForm isLoggedIn={isLoggedIn} user={user} />
    </div>
  )
}
