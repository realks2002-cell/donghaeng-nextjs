import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // 클라이언트에서 localStorage.removeItem('customer_token')로 처리
  return NextResponse.redirect(new URL('/', request.url))
}

export async function POST() {
  // 클라이언트에서 localStorage.removeItem('customer_token')로 처리
  return NextResponse.json({ ok: true })
}
