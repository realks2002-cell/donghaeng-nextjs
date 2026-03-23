import { cookies } from 'next/headers'
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
    const token = cookieStore.get('manager_token')?.value

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
