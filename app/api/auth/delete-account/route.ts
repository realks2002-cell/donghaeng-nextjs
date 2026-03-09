import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const serviceClient = createServiceClient()

    // users 테이블에서 사용자 정보 삭제 (soft delete 또는 hard delete)
    const { error: deleteUserError } = await serviceClient
      .from('users')
      .delete()
      .eq('auth_id', user.id)

    if (deleteUserError) {
      console.error('[DeleteAccount] users 삭제 실패:', deleteUserError)
      return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // Supabase Auth에서 사용자 삭제
    const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(user.id)

    if (deleteAuthError) {
      console.error('[DeleteAccount] auth 사용자 삭제 실패:', deleteAuthError)
      return NextResponse.json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 })
    }

    // 현재 세션 종료
    await supabase.auth.signOut()

    console.log(`[DeleteAccount] 계정 삭제 완료: ${user.id}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[DeleteAccount] 오류:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
