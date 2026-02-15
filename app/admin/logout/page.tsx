'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // 로그아웃 처리 후 로그인 페이지로 리다이렉트
    // TODO: 실제 로그아웃 API 호출
    router.push('/admin/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">로그아웃 중...</p>
    </div>
  )
}
