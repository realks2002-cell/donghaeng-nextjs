import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { adminId, password } = await request.json()

    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, message: '관리자 ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: admin, error } = await (supabase.from('admins') as any)
      .select('id, admin_id, password_hash')
      .eq('admin_id', adminId)
      .single()

    if (error || !admin) {
      return NextResponse.json(
        { success: false, message: '관리자 ID 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, admin.password_hash)
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: '관리자 ID 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // 세션 쿠키 설정
    const cookieStore = await cookies()
    cookieStore.set('admin_session', admin.admin_id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24시간
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
