import { createClient } from '@/lib/supabase/server'

export interface CustomerPayload {
  userId: string
  authId: string
  userName: string
  userPhone: string
  userEmail: string
  address?: string | null
}

/**
 * Supabase Auth 세션에서 고객 정보 가져오기
 * JWT 토큰 없이 Supabase 세션만 사용
 */
export async function getCustomerFromRequest(): Promise<CustomerPayload | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // users 테이블에서 추가 정보 조회
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const usersTable = supabase.from('users') as any
    const { data: userData, error } = await usersTable
      .select('id, name, phone, email, address, auth_id')
      .eq('auth_id', user.id)
      .single()

    if (error || !userData) {
      console.error('[CustomerAuth] Failed to fetch user data:', error)
      return null
    }

    return {
      userId: userData.id as string,
      authId: userData.auth_id as string,
      userName: (userData.name as string) || '',
      userPhone: (userData.phone as string) || '',
      userEmail: (userData.email as string) || '',
      address: userData.address as string | undefined
    }
  } catch (err) {
    console.error('[CustomerAuth] Session verification error:', err)
    return null
  }
}

/**
 * 인증이 필요한 API에서 사용
 * 인증되지 않은 경우 에러 throw
 */
export async function requireCustomerAuth(): Promise<CustomerPayload> {
  const customer = await getCustomerFromRequest()
  if (!customer) {
    throw new Error('Unauthorized')
  }
  return customer
}
