'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      await fetch('/api/admin/logout', { method: 'POST' })
      router.push('/admin/login')
    }
    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">로그아웃 중...</p>
    </div>
  )
}
