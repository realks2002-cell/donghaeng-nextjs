import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const ALLOWED_ORIGINS = ['https://localhost', 'capacitor://localhost', 'http://localhost']

function setCorsHeaders(response: NextResponse, origin: string | null) {
  if (origin && ALLOWED_ORIGINS.some(o => origin.startsWith(o))) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  return response
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const origin = request.headers.get('origin')

  // Capacitor 앱에서 API 호출 시 CORS preflight 처리
  if ((pathname.startsWith('/api/manager') || pathname.startsWith('/api/address') || pathname.startsWith('/api/push')) && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 })
    return setCorsHeaders(response, origin)
  }

  // Supabase 세션 갱신
  const response = await updateSession(request)

  // 관리자 페이지 인증 체크
  const adminPublicPaths = ['/admin/login']
  const isAdminPath = pathname.startsWith('/admin')
  const isAdminPublicPath = adminPublicPaths.includes(pathname)
  const isAdminApiPath = pathname.startsWith('/api/admin')

  if (isAdminPath && !isAdminPublicPath && !isAdminApiPath) {
    const adminSession = request.cookies.get('admin_session')?.value

    if (!adminSession) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  // 매니저 페이지 인증 체크
  const managerPublicPaths = ['/manager/login', '/manager/signup', '/manager/signup-complete', '/manager/recruit']
  const isManagerPath = pathname.startsWith('/manager')
  const isManagerPublicPath = managerPublicPaths.includes(pathname)
  const isManagerApiPath = pathname.startsWith('/api/manager')

  if (isManagerPath && !isManagerPublicPath && !isManagerApiPath) {
    const managerToken = request.cookies.get('manager_token')?.value

    if (!managerToken) {
      return NextResponse.redirect(new URL('/manager/login', request.url))
    }
  }

  // 매니저/주소 API 응답에 CORS 헤더 추가 (Capacitor 앱 크로스 오리진 지원)
  if (pathname.startsWith('/api/manager') || pathname.startsWith('/api/address') || pathname.startsWith('/api/push')) {
    setCorsHeaders(response, origin)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청에 적용:
     * - _next/static (정적 파일)
     * - _next/image (이미지 최적화 파일)
     * - favicon.ico (파비콘)
     * - 이미지 파일들
     */
    '/((?!_next/static|_next/image|favicon.ico|manual/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|html)$).*)',
  ],
}
