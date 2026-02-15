import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { adminId } = await request.json()

    if (!adminId) {
      return NextResponse.json(
        { success: false, message: '삭제할 관리자 ID가 없습니다.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 관리자 존재 확인
    const { data: existing } = await supabase
      .from('admins')
      .select('id')
      .eq('admin_id', adminId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { success: false, message: '존재하지 않는 관리자입니다.' },
        { status: 404 }
      )
    }

    // 관리자 삭제
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('admin_id', adminId)

    if (error) {
      console.error('Admin delete error:', error)
      return NextResponse.json(
        { success: false, message: '관리자 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin delete API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
