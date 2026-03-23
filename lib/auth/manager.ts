import { cookies, headers } from 'next/headers'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.MANAGER_JWT_SECRET || 'manager-jwt-secret-key'

interface ManagerPayload {
  managerId: string
  managerName: string
  managerPhone: string
}

export async function getManagerSession(): Promise<ManagerPayload | null> {
  try {
    const cookieStore = await cookies()
    let token = cookieStore.get('manager_token')?.value

    // 앱에서 Authorization Bearer 헤더로 토큰 전송 지원
    if (!token) {
      const headersList = await headers()
      const authHeader = headersList.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7)
      }
    }

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, JWT_SECRET) as ManagerPayload
    return payload
  } catch (error) {
    console.error('Manager session error:', error)
    return null
  }
}

export async function requireManagerAuth(): Promise<ManagerPayload> {
  const session = await getManagerSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}
