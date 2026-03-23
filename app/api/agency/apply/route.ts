import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, email, region, memo } = body

    if (!name || !phone || !email || !region) {
      return NextResponse.json(
        { success: false, message: '필수 항목을 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: '올바른 이메일 형식을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('agency_applications') as any).insert({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      region: region.trim(),
      memo: memo?.trim() || null,
    })

    if (error) {
      console.error('Agency application insert error:', error)
      return NextResponse.json(
        { success: false, message: '신청 접수에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Agency apply API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
