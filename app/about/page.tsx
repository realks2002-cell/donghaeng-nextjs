import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '회사소개 - 행복안심동행',
  description: '믿을 수 있는 병원동행과 돌봄 서비스를 제공하는 행복안심동행입니다.',
}

export default function AboutPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-[220px] pb-16 sm:px-6 sm:pb-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">회사소개</h1>

      <div className="prose prose-lg max-w-none">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">행복안심동행은</h2>
          <p className="text-gray-700 leading-relaxed">
            믿을 수 있는 병원동행과 돌봄 서비스를 제공하는 플랫폼입니다.
            필요한 순간, 신뢰할 수 있는 매니저와 함께하는 서비스를 제공합니다.
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">서비스 철학</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>고객 중심의 서비스 제공</li>
            <li>신뢰할 수 있는 매니저 관리</li>
            <li>안전하고 편리한 서비스 환경</li>
            <li>투명한 가격 정책</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">주요 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">병원 동행</h3>
              <p className="text-gray-600">병원 방문 시 필요한 도움을 제공합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">가사돌봄</h3>
              <p className="text-gray-600">일상적인 가사 활동을 지원합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">생활동행</h3>
              <p className="text-gray-600">외출 및 일상 활동을 함께합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-2">노인 돌봄</h3>
              <p className="text-gray-600">어르신을 위한 전문 돌봄 서비스를 제공합니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">연락처</h2>
          <p className="text-gray-700">
            문의사항이 있으시면 언제든지 연락주세요.<br />
            이메일: support@hangbok77.com<br />
            전화: 1588-0000
          </p>
        </div>
      </div>
    </section>
  )
}
