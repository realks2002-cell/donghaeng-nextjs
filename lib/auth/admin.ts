import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase/server'

export interface AdminPayload {
  adminId: string
}

export async function getAdminSession(): Promise<AdminPayload | null> {
  try {
    const cookieStore = await cookies()
    const adminId = cookieStore.get('admin_session')?.value

    if (!adminId) {
      return null
    }

    // DB에서 관리자 존재 확인 (쿠키 조작 방지)
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: admin, error } = await (supabase.from('admins') as any)
      .select('id, admin_id')
      .eq('admin_id', adminId)
      .single()

    if (error || !admin) {
      console.error('Admin session validation error:', error)
      return null
    }

    return { adminId: admin.admin_id }
  } catch (error) {
    console.error('Get admin session error:', error)
    return null
  }
}

export async function requireAdminAuth(): Promise<AdminPayload> {
  const session = await getAdminSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
