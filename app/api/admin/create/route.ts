import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { adminId, password } = await request.json()

    if (!adminId || !password) {
      return NextResponse.json(
        { success: false, message: '관리자 ID와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    if (adminId.length < 3 || adminId.length > 50) {
      return NextResponse.json(
        { success: false, message: '관리자 ID는 3자 이상 50자 이하여야 합니다.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // 중복 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('admins') as any)
      .select('id')
      .eq('admin_id', adminId)
      .single()

    if (existing) {
      return NextResponse.json(
        { success: false, message: '이미 존재하는 관리자 ID입니다.' },
        { status: 400 }
      )
    }

    // 비밀번호 해시 생성
    const passwordHash = await bcrypt.hash(password, 10)

    // 관리자 추가
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('admins') as any).insert({
      admin_id: adminId,
      password_hash: passwordHash,
    })

    if (error) {
      console.error('Admin create error:', error)
      return NextResponse.json(
        { success: false, message: '관리자 추가에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin create API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
