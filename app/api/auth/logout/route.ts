import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Supabase Auth 세션 종료
 */
export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Logout] Supabase signOut error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    console.log('[Logout] Session cleared successfully')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Logout] Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

/**
 * GET /api/auth/logout
 * 로그아웃 후 로그인 페이지로 리다이렉트
 */
export async function GET() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  } catch (error) {
    console.error('[Logout] GET error:', error)
    return NextResponse.redirect(new URL('/auth/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
  }
}
