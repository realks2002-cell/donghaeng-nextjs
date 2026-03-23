import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth()
  } catch {
    return NextResponse.json(
      { error: '관리자 인증이 필요합니다.' },
      { status: 401 }
    )
  }

  try {
    const { id } = await params
    const { branch } = await request.json()

    if (!branch || typeof branch !== 'string') {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 지점입니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Validate branch exists in branches table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: branchData } = await (supabase.from('branches') as any)
      .select('name')
      .eq('name', branch)
      .single()

    if (!branchData) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 지점입니다.' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('managers') as any)
      .update({ branch })
      .eq('id', id)

    if (error) {
      console.error('Manager branch update error:', error)
      return NextResponse.json(
        { success: false, message: '지점 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manager branch API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
