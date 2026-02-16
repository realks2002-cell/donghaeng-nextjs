import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const name = formData.get('name') as string
    const gender = formData.get('gender') as string
    const ssn = formData.get('ssn') as string
    const phone = formData.get('phone') as string
    const address1 = formData.get('address1') as string
    const address2 = formData.get('address2') as string || null
    const bank = formData.get('bank') as string
    const accountNumber = formData.get('accountNumber') as string
    const specialty = formData.get('specialty') as string || null
    const password = formData.get('password') as string
    const photo = formData.get('photo') as File | null

    // Validation
    if (!name || !gender || !ssn || !phone || !address1 || !bank || !accountNumber || !password) {
      return NextResponse.json(
        { error: '필수 필드를 모두 입력해주세요.' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '비밀번호는 6자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const supabase = createServiceClient()

    // Check for duplicate phone
    const { data: existingManager } = await supabase
      .from('managers')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingManager) {
      return NextResponse.json(
        { error: '이미 등록된 전화번호입니다.' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Handle photo upload
    let photoUrl: string | null = null
    if (photo && photo.size > 0) {
      const fileExt = photo.name.split('.').pop() || 'jpg'
      const fileName = `mgr_${Date.now()}_${uuidv4().slice(0, 12)}.${fileExt}`
      const filePath = `managers/${fileName}`

      const arrayBuffer = await photo.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, buffer, {
          contentType: photo.type,
          upsert: false,
        })

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('uploads')
          .getPublicUrl(filePath)
        photoUrl = publicUrl
      }
    }

    // Create manager record
    const managerId = uuidv4()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const insertData: Record<string, any> = {
      id: managerId,
      name,
      gender,
      ssn,
      phone,
      address1,
      address2,
      bank_name: bank,
      bank_account: accountNumber,
      specialty: specialty ? [specialty] : [],
      password_hash: passwordHash,
      photo_url: photoUrl,
      approval_status: 'pending',
      is_active: true,
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insertError } = await (supabase.from('managers') as any)
      .insert(insertData)

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: '회원가입 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
