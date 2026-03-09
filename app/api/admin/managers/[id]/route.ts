import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'

export async function DELETE(
  _request: NextRequest,
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
    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: manager, error: fetchError } = await (supabase.from('managers') as any)
      .select('id, photo_url')
      .eq('id', id)
      .single()

    if (fetchError || !manager) {
      return NextResponse.json(
        { success: false, message: '매니저를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (manager.photo_url) {
      try {
        const url = new URL(manager.photo_url)
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/)
        if (pathMatch) {
          const [, bucket, filePath] = pathMatch
          await supabase.storage.from(bucket).remove([filePath])
        }
      } catch {
        // 사진 삭제 실패는 무시 (매니저 삭제는 진행)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: deleteError } = await (supabase.from('managers') as any)
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Manager delete error:', deleteError)
      return NextResponse.json(
        { success: false, message: '매니저 삭제에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manager delete API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
