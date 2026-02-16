'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useFormContext } from '../context/FormContext'
import { X } from 'lucide-react'
import { formatKoreanPhone } from '@/lib/utils/validation'

interface Manager {
  id: string
  name: string
  phone: string
  photo?: string
  address?: string
  specialty?: string
}

export default function ManagerForm() {
  const router = useRouter()
  const { formData, updateFormData } = useFormContext()
  const [searchPhone, setSearchPhone] = useState('')
  const [searchName, setSearchName] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [searchResults, setSearchResults] = useState<Manager[]>([])

  const handleSearch = async () => {
    if (!searchPhone.trim() && !searchName.trim()) {
      toast.error('전화번호 또는 이름을 입력해주세요.')
      return
    }

    setIsSearching(true)
    setSearchMessage('')
    setSearchResults([])

    try {
      const res = await fetch('/api/managers/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: searchPhone, name: searchName }),
      })
      const result = await res.json()

      if (result.ok && result.managers?.length > 0) {
        setSearchResults(result.managers)
        setSearchMessage(`${result.count}명의 매니저를 찾았습니다.`)
      } else {
        setSearchMessage('검색 결과가 없습니다. 전화번호나 이름을 다시 확인해주세요.')
      }
    } catch (error) {
      console.error('Manager search error:', error)
      setSearchMessage('검색 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectManager = (manager: Manager) => {
    updateFormData({
      designatedManagerId: manager.id,
      designatedManager: manager,
    })
    setSearchResults([])
    setSearchMessage('매니저가 선택되었습니다.')
  }

  const clearManager = () => {
    updateFormData({
      designatedManagerId: null,
      designatedManager: null,
    })
    setSearchMessage('')
  }

  const handleNext = () => {
    router.push('/requests/new/details')
  }

  const handlePrev = () => {
    router.back()
  }

  const defaultAvatar =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E"

  return (
    <div className="rounded-lg border bg-white p-6">
      <h2 className="text-lg font-semibold">원하는 매니저가 있으신가요?</h2>
      <p className="mt-2 text-sm text-gray-600">
        원하는 매니저가 있으시면 전화번호나 이름으로 검색해주세요. 매니저를 지정하시면 관리자 확인 후
        매칭됩니다.
      </p>

      <div className="mt-6 space-y-4">
        {/* 검색 입력 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="manager_search_phone" className="block text-sm font-medium text-gray-700">
              전화번호
            </label>
            <input
              type="tel"
              id="manager_search_phone"
              value={searchPhone}
              onChange={(e) => setSearchPhone(formatKoreanPhone(e.target.value))}
              maxLength={13}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <label htmlFor="manager_search_name" className="block text-sm font-medium text-gray-700">
              이름
            </label>
            <input
              type="text"
              id="manager_search_name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="매니저 이름"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={isSearching}
          className="w-full min-h-[44px] rounded-lg bg-primary px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSearching ? '검색 중...' : '매니저 찾기'}
        </button>

        {/* 검색 메시지 */}
        {searchMessage && (
          <p
            className={`text-sm ${
              searchMessage.includes('선택되었습니다') || searchMessage.includes('찾았습니다')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {searchMessage}
          </p>
        )}

        {/* 검색 결과 */}
        {searchResults.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">검색 결과</p>
            {searchResults.map((manager) => (
              <div
                key={manager.id}
                onClick={() => selectManager(manager)}
                className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
              >
                <img
                  src={manager.photo || defaultAvatar}
                  alt={manager.name}
                  className="w-16 h-16 rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    ;(e.target as HTMLImageElement).src = defaultAvatar
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{manager.name}</p>
                  <p className="text-sm text-gray-600">{manager.phone}</p>
                  <p className="text-sm text-gray-600">{manager.address}</p>
                  <p className="text-sm text-primary mt-1">{manager.specialty}</p>
                </div>
                <button
                  type="button"
                  className="min-h-[44px] rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  선택
                </button>
              </div>
            ))}
          </div>
        )}

        {/* 선택된 매니저 */}
        {formData.designatedManager && (
          <div className="rounded-lg border-2 border-primary bg-blue-50 p-4">
            <div className="flex items-start gap-4">
              <img
                src={formData.designatedManager.photo || defaultAvatar}
                alt={formData.designatedManager.name}
                className="w-16 h-16 rounded-full object-cover bg-gray-200"
                onError={(e) => {
                  ;(e.target as HTMLImageElement).src = defaultAvatar
                }}
              />
              <div className="flex-1">
                <p className="font-semibold text-lg">{formData.designatedManager.name}</p>
                <p className="text-sm text-gray-600">{formData.designatedManager.phone}</p>
                <p className="text-sm text-gray-600">{formData.designatedManager.address}</p>
                <p className="text-sm text-primary mt-1">{formData.designatedManager.specialty}</p>
              </div>
              <button
                type="button"
                onClick={clearManager}
                className="min-h-[44px] min-w-[44px] text-gray-500 hover:text-gray-700"
                aria-label="선택 취소"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* 안내 메시지 */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <svg className="inline w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            매니저를 지정하지 않으시면 여러 매니저가 지원할 수 있으며, 더 빠르게 매칭될 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={handlePrev}
          className="min-h-[44px] rounded-lg border border-gray-300 bg-white px-6 font-medium text-gray-700 hover:bg-gray-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="min-h-[44px] rounded-lg bg-primary px-6 font-medium text-white hover:opacity-90"
        >
          다음
        </button>
      </div>
    </div>
  )
}
