import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

interface ManagerSearchRequest {
  phone?: string
  name?: string
}

interface ManagerRow {
  id: string
  name: string
  phone: string
  photo_url: string | null
  specialty: string[] | null
}

export async function POST(request: NextRequest) {
  try {
    const body: ManagerSearchRequest = await request.json()
    const { phone, name } = body

    if (!phone?.trim() && !name?.trim()) {
      return NextResponse.json(
        { ok: false, message: '전화번호 또는 이름을 입력해주세요.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    let query = supabase
      .from('managers')
      .select('id, name, phone, photo_url, specialty')
      .eq('is_active', true)

    // 검색 조건 추가
    if (phone?.trim()) {
      // 전화번호에서 하이픈 제거 후 검색
      const cleanPhone = phone.replace(/-/g, '')
      query = query.or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    }

    if (name?.trim()) {
      query = query.ilike('name', `%${name}%`)
    }

    const { data, error } = await query.limit(10)
    const managers = data as ManagerRow[] | null

    if (error) {
      console.error('Manager search error:', error)
      return NextResponse.json(
        { ok: false, message: '검색 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    if (!managers || managers.length === 0) {
      return NextResponse.json({
        ok: true,
        managers: [],
        count: 0,
        message: '검색 결과가 없습니다.',
      })
    }

    // 응답 형식 변환
    const formattedManagers = managers.map((m: ManagerRow) => ({
      id: m.id,
      name: m.name,
      phone: m.phone,
      photo: m.photo_url,
      specialty: Array.isArray(m.specialty) ? m.specialty.join(', ') : m.specialty || '',
    }))

    return NextResponse.json({
      ok: true,
      managers: formattedManagers,
      count: formattedManagers.length,
    })
  } catch (error) {
    console.error('Manager search error:', error)
    return NextResponse.json(
      { ok: false, message: '검색 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
