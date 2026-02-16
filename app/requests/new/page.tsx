'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RequestsNewPage() {
  const router = useRouter()

  useEffect(() => {
    async function checkAuthAndRedirect() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 로그인한 사용자 → Step 1.5로 바로 이동
        router.replace('/requests/new/info')
      } else {
        // 비로그인 사용자 → Step 1 (회원/비회원 선택)
        router.replace('/requests/new/user-type')
      }
    }

    checkAuthAndRedirect()
  }, [router])

  // 로딩 중 표시
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
    </div>
  )
}
