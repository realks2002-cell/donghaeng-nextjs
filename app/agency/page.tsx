'use client'

import { useState } from 'react'
import { HeartHandshake, CheckCircle } from 'lucide-react'

export default function AgencyPage() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    region: '',
    memo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/agency/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = await res.json()

      if (!res.ok || !result.success) {
        setError(result.message || '신청에 실패했습니다.')
        return
      }

      setIsSubmitted(true)
    } catch {
      setError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <section className="mx-auto max-w-2xl px-4 pt-24 pb-16 sm:pt-44 sm:px-6 sm:pb-24 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">신청이 완료되었습니다</h1>
        <p className="text-gray-600 mb-6">
          대리점 신청이 접수되었습니다.<br />
          담당자가 검토 후 연락드리겠습니다.
        </p>
        <a
          href="/"
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white hover:opacity-90"
        >
          홈으로 돌아가기
        </a>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:pt-44 sm:px-6 sm:pb-24">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">대리점 모집</h1>
        <p className="text-gray-600">행복안심동행과 함께 성장할 대리점 파트너를 모집합니다.</p>
      </div>

      {/* 안내 섹션 */}
      <div className="prose prose-lg max-w-none mb-12">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">대리점 안내</h2>
          <p className="text-gray-700 mb-6">
            행복안심동행 대리점은 지역 기반으로 돌봄 서비스를 운영하며,
            본사의 체계적인 지원을 받아 안정적인 사업을 시작할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">지역 독점 운영</h3>
              <p className="text-gray-600 text-base">담당 지역 내 독점적인 서비스 운영 권한을 부여합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">본사 지원</h3>
              <p className="text-gray-600 text-base">교육, 마케팅, 시스템 등 본사의 전방위 지원을 받습니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">매니저 관리</h3>
              <p className="text-gray-600 text-base">지역 매니저 모집과 관리를 직접 운영할 수 있습니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">수익 모델</h3>
              <p className="text-gray-600 text-base">서비스 매출에 따른 안정적인 수익 구조를 제공합니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-10 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">모집 조건</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>사업자 등록이 가능한 개인 또는 법인</li>
            <li>돌봄 서비스 또는 관련 분야 경험 우대</li>
            <li>해당 지역 거주자 또는 사업장 보유자</li>
            <li>성실하고 책임감 있는 운영이 가능한 분</li>
          </ul>
        </div>
      </div>

      {/* 신청 폼 */}
      <div className="border-t pt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-orange-500 text-white p-2 rounded-xl">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-semibold">대리점 신청</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="홍길동"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              전화번호 <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={form.phone}
              onChange={handleChange}
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="010-1234-5678"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일 <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-1">
              희망 지역 <span className="text-red-500">*</span>
            </label>
            <input
              id="region"
              name="region"
              type="text"
              required
              value={form.region}
              onChange={handleChange}
              className="w-full min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="예: 서울 강남구, 경기 성남시"
            />
          </div>

          <div>
            <label htmlFor="memo" className="block text-sm font-medium text-gray-700 mb-1">
              문의사항
            </label>
            <textarea
              id="memo"
              name="memo"
              rows={4}
              value={form.memo}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="궁금한 점이 있으시면 자유롭게 작성해주세요."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full min-h-[48px] rounded-lg bg-primary text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? '신청 중...' : '대리점 신청하기'}
          </button>
        </form>
      </div>
    </section>
  )
}
