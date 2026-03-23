import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, password, address, addressDetail } = body

    if (!name?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: '필수 정보를 입력해주세요.' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: '비밀번호는 6자 이상이어야 합니다.' }, { status: 400 })
    }

    const normalizedPhone = phone.replace(/[^0-9]/g, '')

    // Service Role 클라이언트 (admin API 사용 가능)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 전화번호 중복 체크
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', normalizedPhone)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json({ error: '이미 가입된 전화번호입니다.' }, { status: 409 })
    }

    // 더미 이메일 (Supabase Auth 내부용)
    const dummyEmail = `u${normalizedPhone}@donghaeng.co.kr`

    // Admin API로 유저 생성 - rate limit 우회, 확인 메일 발송 안 함
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: dummyEmail,
      password,
      email_confirm: true,
      user_metadata: { name, phone: normalizedPhone },
    })

    if (authError) {
      console.error('Auth create error:', authError)
      if (authError.message.includes('already been registered')) {
        return NextResponse.json({ error: '이미 가입된 전화번호입니다.' }, { status: 409 })
      }
      return NextResponse.json({ error: `회원가입 실패: ${authError.message}` }, { status: 500 })
    }

    // users 테이블에 저장
    const { error: insertError } = await supabase.from('users').insert({
      auth_id: authData.user.id,
      email: dummyEmail,
      name,
      phone: normalizedPhone,
      address: address || null,
      address_detail: addressDetail || null,
      role: 'CUSTOMER',
    })

    if (insertError) {
      console.error('User insert error:', insertError)
      // Auth 유저는 생성됐으므로 삭제 롤백
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json({ error: `사용자 정보 저장 실패: ${insertError.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Signup error:', err)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
