'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { managerFetch } from '@/lib/api-base'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        await managerFetch('/api/manager/logout', { method: 'POST' })
      } catch (error) {
        console.error('Logout error:', error)
      }
      router.push('/manager/login')
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-500">로그아웃 중...</div>
    </div>
  )
}
