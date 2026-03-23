import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.MANAGER_JWT_SECRET || 'manager-jwt-secret-key'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ error: '토큰이 없습니다.' }, { status: 400 })
    }

    // JWT 유효성 검증
    const decoded = jwt.verify(token, JWT_SECRET)
    if (!decoded || typeof decoded !== 'object' || !decoded.managerId) {
      return NextResponse.json({ error: '유효하지 않은 토큰입니다.' }, { status: 401 })
    }

    // 쿠키 재설정
    const cookieStore = await cookies()
    cookieStore.set('manager_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 365 * 24 * 60 * 60, // 10 years
      path: '/',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: '토큰 검증 실패' }, { status: 401 })
  }
}
