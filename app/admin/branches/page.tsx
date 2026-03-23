'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MapPin, Plus, Trash2 } from 'lucide-react'

interface BranchInfo {
  name: string
  count: number
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<BranchInfo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newBranch, setNewBranch] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchBranches = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Fetch branch names from branches table
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: branchRows, error: branchError } = await (supabase.from('branches') as any)
      .select('name')
      .order('created_at', { ascending: true })

    if (branchError) {
      console.error('Error fetching branches:', branchError)
      setIsLoading(false)
      return
    }

    const branchNames: string[] = (branchRows || []).map((b: { name: string }) => b.name)

    // Fetch manager branch assignments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: managerData } = await (supabase.from('managers') as any)
      .select('branch')
      .not('branch', 'is', null)

    // Count managers per branch
    const countMap: Record<string, number> = {}
    branchNames.forEach((b) => { countMap[b] = 0 })

    if (managerData) {
      managerData.forEach((row: { branch: string }) => {
        if (row.branch && countMap[row.branch] !== undefined) {
          countMap[row.branch] = countMap[row.branch] + 1
        }
      })
    }

    const branchList = branchNames.map((name) => ({ name, count: countMap[name] || 0 }))
    setBranches(branchList)
    setIsLoading(false)
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  const handleAddBranch = async () => {
    const trimmed = newBranch.trim()
    if (!trimmed) return

    if (branches.some((b) => b.name === trimmed)) {
      setMessage({ type: 'error', text: '이미 존재하는 지점입니다.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/branches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: trimmed }),
      })

      if (res.ok) {
        setNewBranch('')
        setMessage({ type: 'success', text: `'${trimmed}' 지점이 추가되었습니다.` })
        await fetchBranches()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.message || '지점 추가에 실패했습니다.' })
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteBranch = async (branchName: string) => {
    const branch = branches.find((b) => b.name === branchName)
    if (branch && branch.count > 0) {
      setMessage({ type: 'error', text: `'${branchName}' 지점에 배정된 매니저가 있어 삭제할 수 없습니다.` })
      return
    }

    if (!confirm(`'${branchName}' 지점을 삭제하시겠습니까?`)) return

    setMessage(null)
    try {
      const res = await fetch('/api/admin/branches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: branchName }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: `'${branchName}' 지점이 삭제되었습니다.` })
        await fetchBranches()
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.message || '지점 삭제에 실패했습니다.' })
      }
    } catch {
      setMessage({ type: 'error', text: '서버 오류가 발생했습니다.' })
    }
  }

  // Count unassigned managers
  const [unassignedCount, setUnassignedCount] = useState(0)
  useEffect(() => {
    const fetchUnassigned = async () => {
      const supabase = createClient()
      const { count } = await supabase
        .from('managers')
        .select('*', { count: 'exact', head: true })
        .is('branch', null)
      setUnassignedCount(count || 0)
    }
    fetchUnassigned()
  }, [branches])

  return (
    <div className="max-w-[1408px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">지점 관리</h1>
      </div>

      {/* 메시지 */}
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

      {/* 지점 추가 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h2 className="text-sm font-medium text-gray-700 mb-3">새 지점 추가</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newBranch}
            onChange={(e) => setNewBranch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBranch()}
            placeholder="지점명 입력 (예: 용인)"
            className="flex-1 min-h-[44px] px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <button
            onClick={handleAddBranch}
            disabled={saving || !newBranch.trim()}
            className="min-h-[44px] px-6 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            추가
          </button>
        </div>
      </div>

      {/* 지점 목록 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-gray-500">로딩 중...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  지점명
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  배정 매니저 수
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branches.map((branch) => (
                <tr key={branch.name}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      {branch.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {branch.count}명
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteBranch(branch.name)}
                      disabled={branch.count > 0}
                      className="min-h-[32px] px-3 py-1 text-xs text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center gap-1"
                      title={branch.count > 0 ? '배정된 매니저가 있어 삭제 불가' : '지점 삭제'}
                    >
                      <Trash2 className="w-3 h-3" />
                      삭제
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    등록된 지점이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* 미배정 매니저 안내 */}
      {unassignedCount > 0 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>미배정 매니저 {unassignedCount}명</strong>이 있습니다.
            <a href="/admin/managers" className="ml-1 underline hover:text-yellow-900">
              매니저 관리
            </a>
            에서 지점을 배정해주세요.
          </p>
        </div>
      )}
    </div>
  )
}
