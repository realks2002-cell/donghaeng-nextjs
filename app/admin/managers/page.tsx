'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search } from 'lucide-react'

interface Manager {
  id: string
  name: string
  ssn: string
  phone: string
  address1: string
  address2: string | null
  bank: string | null
  account_number: string
  specialty: string | null
  created_at: string
}

export default function AdminManagersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = 20

  const [managers, setManagers] = useState<Manager[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)

  const totalPages = Math.ceil(total / perPage)
  const offset = (page - 1) * perPage

  useEffect(() => {
    const fetchManagers = async () => {
      setIsLoading(true)
      const supabase = createClient()

      let query = supabase.from('managers').select('*', { count: 'exact' })

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,phone.ilike.%${search}%,address1.ilike.%${search}%,specialty.ilike.%${search}%`
        )
      }

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + perPage - 1)

      if (error) {
        console.error('Error fetching managers:', error)
      } else {
        setManagers(data || [])
        setTotal(count || 0)
      }

      setIsLoading(false)
    }

    fetchManagers()
  }, [search, page, offset])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput) params.set('search', searchInput)
    router.push(`/admin/managers?${params.toString()}`)
  }

  const handleReset = () => {
    setSearchInput('')
    router.push('/admin/managers')
  }

  const maskSsn = (ssn: string) => {
    if (!ssn || ssn.length < 6) return ssn
    return ssn.slice(0, 6) + '-*******'
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">매니저 관리</h1>
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
              placeholder="이름, 전화번호, 주소, 특기로 검색"
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

      {/* 매니저 목록 */}
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      주민번호
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      전화번호
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      주소
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      은행
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      계좌번호
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      특기
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      등록일
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.length > 0 ? (
                    managers.map((manager) => (
                      <tr key={manager.id}>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {manager.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{maskSsn(manager.ssn)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {manager.address1}
                          {manager.address2 && (
                            <>
                              <br />
                              <span className="text-gray-500 text-xs">{manager.address2}</span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.bank || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.account_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {manager.specialty || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(manager.created_at).toLocaleDateString('ko-KR')}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                        매니저가 없습니다.
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
                        router.push(`/admin/managers?${params.toString()}`)
                      }}
                      className="min-h-[44px] px-4 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center"
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
                        router.push(`/admin/managers?${params.toString()}`)
                      }}
                      className="min-h-[44px] px-4 border border-gray-300 rounded-lg hover:bg-gray-50 inline-flex items-center"
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
