'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Trash2, User, X } from 'lucide-react'
import { formatKoreanPhone } from '@/lib/utils/validation'
import { formatDate } from '@/lib/utils/format'
import Image from 'next/image'

interface Manager {
  id: string
  name: string
  photo_url: string | null
  ssn: string | null
  phone: string
  address1: string | null
  address2: string | null
  bank_name: string | null
  bank_account: string | null
  specialty: string[] | null
  branch: string | null
  password_plain: string | null
  approval_status: string | null
  created_at: string
}

export default function AdminManagersPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div></div>}>
      <AdminManagersContent />
    </Suspense>
  )
}

function AdminManagersContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const perPage = 20

  const [managers, setManagers] = useState<Manager[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [searchInput, setSearchInput] = useState(search)
  const [branchOptions, setBranchOptions] = useState<string[]>([])

  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [updatingBranchId, setUpdatingBranchId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; name: string } | null>(null)


  const totalPages = Math.ceil(total / perPage)
  const offset = (page - 1) * perPage

  const fetchManagers = async () => {
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase.from('managers').select('*', { count: 'exact' })

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,phone.ilike.%${search}%,address1.ilike.%${search}%`
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

  useEffect(() => {
    fetchManagers()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, page, offset])

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/admin/branches')
        if (res.ok) {
          const data = await res.json()
          setBranchOptions(data.branches || [])
        }
      } catch {
        // fallback silent
      }
    }
    fetchBranches()
  }, [])

  const handleApproval = async (managerId: string, status: 'approved' | 'rejected') => {
    setUpdatingId(managerId)
    try {
      const res = await fetch(`/api/admin/managers/${managerId}/approval`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        await fetchManagers()
      } else {
        alert('상태 변경에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleBranchChange = async (managerId: string, branch: string) => {
    if (!branch) return
    setUpdatingBranchId(managerId)
    try {
      const res = await fetch(`/api/admin/managers/${managerId}/branch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch }),
      })
      if (res.ok) {
        await fetchManagers()
      } else {
        alert('지점 변경에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setUpdatingBranchId(null)
    }
  }

  const handleDelete = async (manager: Manager) => {
    if (!window.confirm(`"${manager.name}" 매니저를 삭제하시겠습니까?`)) {
      return
    }
    setDeletingId(manager.id)
    try {
      const res = await fetch(`/api/admin/managers/${manager.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        await fetchManagers()
      } else {
        alert('매니저 삭제에 실패했습니다.')
      }
    } catch {
      alert('서버 오류가 발생했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

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

  const formatSsn = (ssn: string) => {
    if (!ssn) return ssn
    const digits = ssn.replace(/[^0-9]/g, '')
    if (digits.length <= 6) return digits
    return digits.slice(0, 6) + '-' + digits.slice(6)
  }

  return (
    <div className="max-w-[1408px]">
      <div className="mb-6">
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
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      사진
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      이름
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      주민번호
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      전화번호
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase max-w-[150px]">
                      주소
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      은행
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      계좌번호
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      비밀번호
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      특기
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      지점
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      승인상태
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                      등록일
                    </th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {managers.length > 0 ? (
                    managers.map((manager) => (
                      <tr key={manager.id}>
                        <td className="px-4 py-3">
                          {manager.photo_url ? (
                            <Image
                              src={manager.photo_url}
                              alt={manager.name}
                              width={40}
                              height={40}
                              className="w-10 h-10 rounded-full object-cover cursor-pointer"
                              onClick={() => setPreviewPhoto({ url: manager.photo_url!, name: manager.name })}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {manager.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.ssn ? formatSsn(manager.ssn) : '-'}</td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">{formatKoreanPhone(manager.phone)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 max-w-[150px] truncate" title={[manager.address1, manager.address2].filter(Boolean).join(' ')}>
                          {manager.address1}
                          {manager.address2 && (
                            <>
                              <br />
                              <span className="text-gray-500 text-xs">{manager.address2}</span>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.bank_name || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{manager.bank_account || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {manager.password_plain || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {manager.specialty?.join(', ') || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {manager.branch ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {manager.branch}
                            </span>
                          ) : (
                            <select
                              className="min-h-[32px] px-2 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                              defaultValue=""
                              disabled={updatingBranchId === manager.id}
                              onChange={(e) => handleBranchChange(manager.id, e.target.value)}
                            >
                              <option value="" disabled>선택</option>
                              {branchOptions.map((b) => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {manager.approval_status === 'approved' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              승인
                            </span>
                          ) : manager.approval_status === 'rejected' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              거절
                            </span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                대기중
                              </span>
                              <button
                                onClick={() => handleApproval(manager.id, 'approved')}
                                disabled={updatingId === manager.id}
                                className="min-h-[26px] px-2 text-xs font-bold bg-green-400 text-white rounded-md hover:bg-green-500 disabled:opacity-50"
                              >
                                승인
                              </button>
                              <button
                                onClick={() => handleApproval(manager.id, 'rejected')}
                                disabled={updatingId === manager.id}
                                className="min-h-[26px] px-2 text-xs font-bold bg-red-400 text-white rounded-md hover:bg-red-500 disabled:opacity-50"
                              >
                                거절
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-900 whitespace-nowrap">
                          {formatDate(manager.created_at)}
                        </td>
                        <td className="px-3 py-3 text-sm text-center">
                          <button
                            onClick={() => handleDelete(manager)}
                            disabled={deletingId === manager.id}
                            className="min-h-[30px] p-1.5 text-red-600 border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50 inline-flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-gray-500">
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

      {/* 사진 확대 모달 */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setPreviewPhoto(null)}
        >
          <div
            className="relative bg-white rounded-lg p-4 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
            <p className="text-center font-medium mb-3">{previewPhoto.name}</p>
            <div className="relative w-full aspect-square">
              <Image
                src={previewPhoto.url}
                alt={previewPhoto.name}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
