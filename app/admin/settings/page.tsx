'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff, Trash2, UserPlus } from 'lucide-react'

interface Admin {
  id: string
  admin_id: string
  created_at: string
}

export default function AdminSettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // 추가 폼 상태
  const [newAdminId, setNewAdminId] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

  // 삭제 중인 관리자 ID
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const res = await fetch('/api/admin/list', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setAdmins(data.admins || [])
      } else {
        setMessage({ type: 'error', text: '관리자 목록을 불러오는데 실패했습니다.' })
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      setMessage({ type: 'error', text: '관리자 목록을 불러오는데 실패했습니다.' })
    }
    setIsLoading(false)
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!newAdminId.trim() || !newPassword.trim()) {
      setMessage({ type: 'error', text: '관리자 ID와 비밀번호를 모두 입력해주세요.' })
      return
    }

    if (newAdminId.length < 3 || newAdminId.length > 50) {
      setMessage({ type: 'error', text: '관리자 ID는 3자 이상 50자 이하여야 합니다.' })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 6자 이상이어야 합니다.' })
      return
    }

    setIsAdding(true)

    try {
      // 비밀번호 해시 생성을 위한 API 호출
      const response = await fetch('/api/admin/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: newAdminId, password: newPassword }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessage({ type: 'error', text: result.message || '관리자 추가에 실패했습니다.' })
      } else {
        setMessage({ type: 'success', text: '관리자가 추가되었습니다.' })
        setNewAdminId('')
        setNewPassword('')
        await fetchAdmins()
      }
    } catch (error) {
      console.error('Add admin error:', error)
      setMessage({ type: 'error', text: '관리자 추가 중 오류가 발생했습니다.' })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (adminId: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    setDeletingId(adminId)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        setMessage({ type: 'error', text: result.message || '관리자 삭제에 실패했습니다.' })
      } else {
        setMessage({ type: 'success', text: '관리자가 삭제되었습니다.' })
        await fetchAdmins()
      }
    } catch (error) {
      console.error('Delete admin error:', error)
      setMessage({ type: 'error', text: '관리자 삭제 중 오류가 발생했습니다.' })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">관리자 설정</h1>
      </div>

      {/* 메시지 표시 */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 관리자 추가 폼 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">관리자 추가</h2>
        <form onSubmit={handleAdd} className="space-y-4" autoComplete="off">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="admin_id" className="block text-sm font-medium text-gray-700 mb-2">
                관리자 ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="admin_id"
                value={newAdminId}
                onChange={(e) => setNewAdminId(e.target.value)}
                required
                minLength={3}
                maxLength={50}
                autoComplete="off"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="관리자 ID 입력"
              />
              <p className="text-xs text-gray-500 mt-1">3자 이상 50자 이하</p>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="비밀번호 입력"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">6자 이상</p>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isAdding}
                className="min-h-[44px] w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                {isAdding ? '추가 중...' : '관리자 추가'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 관리자 목록 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">관리자 목록</h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    관리자 ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    생성일시
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <tr key={admin.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{admin.admin_id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(admin.created_at).toLocaleString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 text-sm text-center">
                        <button
                          type="button"
                          onClick={() => handleDelete(admin.admin_id)}
                          disabled={deletingId === admin.admin_id}
                          className="min-h-[44px] px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          {deletingId === admin.admin_id ? '삭제 중...' : '삭제'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      관리자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
