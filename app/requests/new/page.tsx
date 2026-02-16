'use client'

import { useEffect, useState } from 'react'
import ServiceRequestForm from '@/components/forms/ServiceRequestForm'

export default function ServiceRequestPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{
    id: string
    name: string
    phone: string
    email: string
    address: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('customer_token')

    if (token) {
      // JWT 디코드해서 사용자 정보 추출
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsLoggedIn(true)
        setUser({
          id: payload.userId,
          name: payload.userName,
          phone: payload.userPhone,
          email: payload.userEmail,
          address: null // 주소는 Step 1.5에서 입력받음
        })
      } catch (err) {
        console.error('Token decode error:', err)
        localStorage.removeItem('customer_token')
      }
    }

    setLoading(false)
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
