export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || ''

export function managerFetchOptions(options?: RequestInit): RequestInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('manager_token') : null
  if (!token || !API_BASE) return options || {}

  const headers = new Headers(options?.headers)
  headers.set('Authorization', `Bearer ${token}`)
  return { ...options, headers }
}

export function managerFetch(path: string, options?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE}${path}`, managerFetchOptions(options))
}
