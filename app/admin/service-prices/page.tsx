'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ServicePrice {
  service_type: string
  price_per_hour: number
  is_active: boolean
  updated_at: string | null
}

const serviceDescriptions: Record<string, string> = {
  '병원 동행': '진료 예약부터 귀가까지 함께합니다',
  '가사돌봄': '가사 활동을 도와드립니다',
  '생활동행': '일상 생활 동행을 도와드립니다',
  '노인 돌봄': '어르신의 일상을 도와드립니다',
  '아이 돌봄': '안전하게 아이를 돌봐드립니다',
  '기타': '기타 동행 및 돌봄 서비스',
}

const defaultPrices: Record<string, number> = {
  '병원 동행': 20000,
  '가사돌봄': 18000,
  '생활동행': 18000,
  '노인 돌봄': 22000,
  '아이 돌봄': 20000,
  '기타': 20000,
}

export default function AdminServicePricesPage() {
  const [prices, setPrices] = useState<Record<string, ServicePrice>>({})
  const [editingPrices, setEditingPrices] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('service_prices')
      .select('*')
      .order('price_per_hour', { ascending: false })

    if (error) {
      console.error('Error fetching prices:', error)
      // 테이블이 없으면 기본값 사용
      const defaultData: Record<string, ServicePrice> = {}
      Object.keys(serviceDescriptions).forEach((type) => {
        defaultData[type] = {
          service_type: type,
          price_per_hour: defaultPrices[type],
          is_active: true,
          updated_at: null,
        }
      })
      setPrices(defaultData)
      setEditingPrices(defaultPrices)
    } else if (data) {
      const priceMap: Record<string, ServicePrice> = {}
      const editMap: Record<string, number> = {}

      // 기존 데이터 설정
      data.forEach((item: ServicePrice) => {
        priceMap[item.service_type] = item
        editMap[item.service_type] = item.price_per_hour
      })

      // 누락된 서비스 타입에 기본값 설정
      Object.keys(serviceDescriptions).forEach((type) => {
        if (!priceMap[type]) {
          priceMap[type] = {
            service_type: type,
            price_per_hour: defaultPrices[type],
            is_active: true,
            updated_at: null,
          }
          editMap[type] = defaultPrices[type]
        }
      })

      setPrices(priceMap)
      setEditingPrices(editMap)
    }
    setIsLoading(false)
  }

  const handlePriceChange = (serviceType: string, value: string) => {
    const numValue = parseInt(value, 10) || 0
    setEditingPrices((prev) => ({ ...prev, [serviceType]: numValue }))
  }

  const handleSave = async (serviceType: string) => {
    const pricePerHour = editingPrices[serviceType]

    if (pricePerHour < 1000 || pricePerHour > 100000) {
      setMessage({ type: 'error', text: '가격은 1,000원 이상 100,000원 이하로 설정해주세요.' })
      return
    }

    setSaving(serviceType)
    setMessage(null)

    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('service_prices') as any)
      .upsert({
        service_type: serviceType,
        price_per_hour: pricePerHour,
        is_active: true,
      })

    if (error) {
      console.error('Error saving price:', error)
      setMessage({ type: 'error', text: '가격 저장에 실패했습니다.' })
    } else {
      setMessage({ type: 'success', text: `${serviceType} 가격이 ${pricePerHour.toLocaleString()}원으로 변경되었습니다.` })
      // 데이터 새로고침
      await fetchPrices()
    }

    setSaving(null)
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-48"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">서비스 가격 관리</h1>
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

      {/* 안내 문구 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>서비스별 시간당 가격을 설정합니다.</strong>
          <br />
          설정된 가격은 서비스 신청 시 자동으로 적용되며, 결제 금액에 반영됩니다.
        </p>
      </div>

      {/* 가격 설정 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.keys(serviceDescriptions).map((type) => {
          const priceData = prices[type]
          const currentPrice = priceData?.price_per_hour || defaultPrices[type]
          const isActive = priceData?.is_active ?? true
          const updatedAt = priceData?.updated_at

          return (
            <div
              key={type}
              className={`bg-white rounded-lg border border-gray-200 p-6 ${!isActive ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{type}</h3>
                  <p className="text-sm text-gray-500 mt-1">{serviceDescriptions[type]}</p>
                </div>
                {!isActive && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                    비활성
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    시간당 가격 (원)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={editingPrices[type] || ''}
                      onChange={(e) => handlePriceChange(type, e.target.value)}
                      min="1000"
                      max="100000"
                      step="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      원
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    현재: <strong>{currentPrice.toLocaleString()}원</strong>/시간
                  </p>
                </div>

                {updatedAt && (
                  <p className="text-xs text-gray-400">
                    최종 수정: {new Date(updatedAt).toLocaleString('ko-KR')}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => handleSave(type)}
                  disabled={saving === type}
                  className="min-h-[44px] w-full px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving === type ? '저장 중...' : '가격 저장'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 가격 요약 테이블 */}
      <div className="mt-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">가격 요약</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  서비스 유형
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  시간당 가격
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  3시간 기준
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  5시간 기준
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.keys(serviceDescriptions).map((type) => {
                const price = prices[type]?.price_per_hour || defaultPrices[type]
                return (
                  <tr key={type}>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{type}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {price.toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {(price * 3).toLocaleString()}원
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {(price * 5).toLocaleString()}원
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
