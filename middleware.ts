import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const pathname = request.nextUrl.pathname

  // 현재 경로를 헤더에 추가
  response.headers.set('x-pathname', pathname)

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
