import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth/admin'
import { sendSMS } from '@/lib/services/sms-notification'

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
    const { status } = await request.json()

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, message: '유효하지 않은 상태값입니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('managers') as any)
      .update({ approval_status: status })
      .eq('id', id)

    if (error) {
      console.error('Manager approval update error:', error)
      return NextResponse.json(
        { success: false, message: '승인 상태 변경에 실패했습니다.' },
        { status: 500 }
      )
    }

    if (status === 'approved') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: manager } = await (supabase.from('managers') as any)
        .select('phone')
        .eq('id', id)
        .single()

      if (manager?.phone) {
        sendSMS(
          manager.phone,
          '[행복안심동행] 매니저 가입이 승인되었습니다. 앱에서 활동을 시작해주세요.'
        ).catch((err) => console.error('[SMS] 매니저 승인 알림 발송 실패:', err))
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Manager approval API error:', error)
    return NextResponse.json(
      { success: false, message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
