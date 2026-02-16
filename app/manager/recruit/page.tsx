import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '매니저 모집 - 행복안심동행',
  description: '행복안심동행 매니저를 모집합니다. 지원 자격과 혜택을 확인하세요.',
}

export default function RecruitPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-44 pb-16 sm:px-6 sm:pb-24">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-2">매니저 모집</h1>
          <p className="text-gray-600">고객에게 따뜻한 돌봄을 전하는 매니저가 되어주세요.</p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          <Link
            href="/manager/login"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-primary px-6 py-3 text-base font-medium text-primary hover:bg-primary/5"
          >
            매니저 로그인
          </Link>
          <Link
            href="/manager/signup"
            className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:opacity-90"
          >
            매니저 지원하기
          </Link>
        </div>
      </div>

      <div className="prose prose-lg max-w-none">
        {/* 활동 서비스 영역 */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">활동 서비스 영역</h2>
          <p className="text-gray-700 mb-6">
            행복안심동행 매니저는 고객의 일상에 따뜻한 동행을 전하는 전문 케어 파트너입니다.
            다음과 같은 서비스 영역에서 활동할 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">병원동행</h3>
              <p className="text-gray-600 text-base">진료 접수부터 약국 처방까지, 병원 방문의 모든 과정을 함께합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">가사돌봄</h3>
              <p className="text-gray-600 text-base">청소, 정리정돈, 식사 준비 등 쾌적한 생활 환경을 돕습니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">생활동행</h3>
              <p className="text-gray-600 text-base">관공서, 은행, 장보기 등 일상의 외출을 든든히 동행합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">노인돌봄</h3>
              <p className="text-gray-600 text-base">말벗, 산책, 건강 관리 등 어르신의 활기찬 일상을 지원합니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">아이돌봄</h3>
              <p className="text-gray-600 text-base">등하원 매니저부터 긴급 돌봄까지, 아이의 안전을 책임집니다.</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-lg mb-1">기타</h3>
              <p className="text-gray-600 text-base">고객의 필요에 따라 맞춤형 돌봄 서비스 영역이 확대되고 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 매니저 혜택 */}
        <div className="mb-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">매니저 혜택</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">자유로운 시간 선택</h3>
              <p className="text-gray-700">원하는 시간에 원하는 서비스를 선택하여 근무할 수 있습니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">정당한 보수</h3>
              <p className="text-gray-700">서비스 종류와 시간에 따른 합리적인 보수와 투명한 정산 시스템을 제공합니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">전문 교육 지원</h3>
              <p className="text-gray-700">서비스 품질 향상을 위한 체계적인 전문 교육을 무료로 제공합니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">안전한 근무 환경</h3>
              <p className="text-gray-700">배상 책임 보험 가입 및 안전 시스템으로 안심하고 근무할 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 지원 자격 */}
        <div className="mb-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">지원 자격</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>만 18세 이상 누구나 (성별, 학력 제한 없음)</li>
            <li>건강하고 성실하게 근무 가능한 분</li>
            <li>고객을 배려하고 친절하게 대할 수 있는 분</li>
            <li>스마트폰 사용이 가능한 분</li>
          </ul>
        </div>

        {/* 지원 방법 */}
        <div className="mb-8 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">지원 방법</h2>
          <p className="text-gray-700">
            상단의 &quot;매니저 지원하기&quot; 버튼을 눌러 회원가입을 진행해주세요.
            신분증, 계좌 정보 등을 입력하시면 심사 후 활동이 가능합니다.
          </p>
        </div>
      </div>
    </section>
  )
}
