import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone?.trim() || !password) {
      return NextResponse.json({ error: '전화번호와 비밀번호를 입력해주세요.' }, { status: 400 })
    }

    const normalizedPhone = phone.replace(/[^0-9]/g, '')

    // Service Role로 users 테이블에서 이메일 조회
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: userData, error: lookupError } = await serviceClient
      .from('users')
      .select('id, email, name, phone, address, auth_id')
      .eq('phone', normalizedPhone)
      .single()

    if (lookupError || !userData?.email) {
      return NextResponse.json({ error: '전화번호 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 })
    }

    // 이메일 정보 반환 (클라이언트에서 실제 로그인 수행)
    console.log('[Login] Phone lookup successful, userId:', userData.id)

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        email: userData.email,
        address: userData.address,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
