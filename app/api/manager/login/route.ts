import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.MANAGER_JWT_SECRET || 'manager-jwt-secret-key'

interface ManagerRecord {
  id: string
  name: string
  phone: string
  password_hash: string
  approval_status?: string | null
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json(
        { error: '전화번호와 비밀번호를 입력해주세요.' },
        { status: 400 }
      )
    }

    const normalizedPhone = normalizePhone(phone)
    const supabase = createServiceClient()

    // Find manager by phone
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: managers } = await (supabase.from('managers') as any)
      .select('*') as { data: ManagerRecord[] | null }

    if (!managers || managers.length === 0) {
      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // Find matching manager (compare normalized phone numbers)
    const manager = managers.find(
      (m) => normalizePhone(m.phone) === normalizedPhone
    )

    if (!manager) {
      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    if (!manager.password_hash) {
      return NextResponse.json(
        { error: '비밀번호가 설정되지 않은 계정입니다. 관리자에게 문의하세요.' },
        { status: 401 }
      )
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, manager.password_hash)
    if (!passwordMatch) {
      return NextResponse.json(
        { error: '전화번호 또는 비밀번호가 올바르지 않습니다.' },
        { status: 401 }
      )
    }

    // Check approval status
    if (manager.approval_status === 'pending') {
      return NextResponse.json(
        { error: '승인 대기 중입니다. 관리자 승인 후 로그인 가능합니다.' },
        { status: 401 }
      )
    }

    if (manager.approval_status === 'rejected') {
      return NextResponse.json(
        { error: '가입이 거절되었습니다. 관리자에게 문의하세요.' },
        { status: 401 }
      )
    }

    // Create JWT token
    const token = jwt.sign(
      {
        managerId: manager.id,
        managerName: manager.name,
        managerPhone: manager.phone,
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    )

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set('manager_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return NextResponse.json({
      success: true,
      manager: {
        id: manager.id,
        name: manager.name,
        phone: manager.phone,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
