'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Header from './Header'

export default function HeaderWrapper() {
  const [user, setUser] = useState<{ name: string; role: 'CUSTOMER' } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // 초기 세션 확인
    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (authUser) {
        // users 테이블에서 이름 조회
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersTable = supabase.from('users') as any
        usersTable
          .select('name')
          .eq('auth_id', authUser.id)
          .single()
          .then(({ data }: { data: { name: string } | null }) => {
            if (data) {
              setUser({
                name: data.name || '사용자',
                role: 'CUSTOMER'
              })
            }
          })
      }
    })

    // 실시간 세션 변경 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[HeaderWrapper] Auth state changed:', event, 'session:', !!session)

      if (session) {
        // 로그인됨
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersTable = supabase.from('users') as any
        usersTable
          .select('name')
          .eq('auth_id', session.user.id)
          .single()
          .then(({ data }: { data: { name: string } | null }) => {
            if (data) {
              setUser({
                name: data.name || '사용자',
                role: 'CUSTOMER'
              })
            }
          })
      } else {
        // 로그아웃됨
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return <Header user={user} />
}
