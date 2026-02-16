'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

interface User {
  id: string
  name: string
  phone: string
  address: string | null
  address_detail: string | null
  role: string
  is_active: boolean
  created_at: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = 20

  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)

  const totalPages = Math.ceil(total / perPage)
  const offset = (page - 1) * perPage

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams()
        if (search) params.set('search', search)
        params.set('page', String(page))

        const res = await fetch(`/api/admin/users?${params.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setUsers(data.users || [])
          setTotal(data.total || 0)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
      }
      setIsLoading(false)
    }

    fetchUsers()
  }, [search, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)
    router.push(`/admin/users?${params.toString()}`)
  }

  const handleReset = () => {
    setSearchInput('')
    router.push('/admin/users')
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">회원 관리</h1>
      </div>

      {/* 검색 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="이름, 전화번호, 이메일로 검색"
              className="w-full min-h-[44px] pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            className="min-h-[44px] px-6 bg-primary text-white rounded-lg hover:opacity-90"
          >
            검색
          </button>
          {search && (
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-6 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              초기화
            </button>
          )}
        </form>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">전화번호</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">주소</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">가입일</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{user.phone || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.address ? (
                            <div>
                              <div>{user.address}</div>
                              {user.address_detail && <div className="text-xs text-gray-500">{user.address_detail}</div>}
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? '활성' : '비활성'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(user.created_at).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                        회원이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  총 {total.toLocaleString()}명 중 {(offset + 1).toLocaleString()}-
                  {Math.min(offset + perPage, total).toLocaleString()}명 표시
                </div>
                <div className="flex gap-2">
                  {page > 1 && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams()
                        params.set('page', String(page - 1))
                        if (search) params.set('search', search)
                        router.push(`/admin/users?${params.toString()}`)
                      }}
                      className="min-h-[44px] px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      이전
                    </button>
                  )}
                  {page < totalPages && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams()
                        params.set('page', String(page + 1))
                        if (search) params.set('search', search)
                        router.push(`/admin/users?${params.toString()}`)
                      }}
                      className="min-h-[44px] px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      다음
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
