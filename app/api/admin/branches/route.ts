import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'

export async function GET() {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  const supabase = createServiceClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('branches') as any)
    .select('name')
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: '지점 목록 조회 실패' }, { status: 500 })
  }

  return NextResponse.json({ branches: data.map((b: { name: string }) => b.name) })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const { branch } = await request.json()

    if (!branch || typeof branch !== 'string' || branch.trim().length === 0) {
      return NextResponse.json({ success: false, message: '지점명을 입력해주세요.' }, { status: 400 })
    }

    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('branches') as any)
      .insert({ name: branch.trim() })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ success: false, message: '이미 존재하는 지점입니다.' }, { status: 400 })
      }
      console.error('Branch insert error:', error)
      return NextResponse.json({ success: false, message: '지점 추가에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Branch API error:', error)
    return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json({ error: '관리자 인증이 필요합니다.' }, { status: 401 })
  }

  try {
    const { branch } = await request.json()

    if (!branch || typeof branch !== 'string') {
      return NextResponse.json({ success: false, message: '지점명이 필요합니다.' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Check if any managers are assigned to this branch
    const { count } = await supabase
      .from('managers')
      .select('*', { count: 'exact', head: true })
      .eq('branch', branch)

    if (count && count > 0) {
      return NextResponse.json(
        { success: false, message: '배정된 매니저가 있어 삭제할 수 없습니다.' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('branches') as any)
      .delete()
      .eq('name', branch)

    if (error) {
      console.error('Branch delete error:', error)
      return NextResponse.json({ success: false, message: '지점 삭제에 실패했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Branch API error:', error)
    return NextResponse.json({ success: false, message: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
