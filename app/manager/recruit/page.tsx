import Link from 'next/link'
import { CheckCircle, Users, Clock, Heart } from 'lucide-react'

export default function RecruitPage() {
  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '200px' }}>
      {/* 히어로 섹션 */}
      <section className="bg-primary text-white pb-16 px-4 pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">행복안심동행 매니저 모집</h1>
          <p className="text-xl opacity-90 mb-8">
            고객에게 따뜻한 돌봄을 전하는 매니저가 되어주세요
          </p>
          <Link
            href="/manager/signup"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            매니저 지원하기
          </Link>
        </div>
      </section>

      {/* 매니저란? */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">행복안심동행 매니저란?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">병원 동행 서비스</h3>
              <p className="text-gray-600">
                병원 방문이 어려운 고객분들의 진료 동행, 수속 지원, 이동 보조 등을 도와드립니다.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">돌봄 서비스</h3>
              <p className="text-gray-600">
                가사, 육아, 노인 돌봄 등 일상생활에서 필요한 다양한 돌봄 서비스를 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 혜택 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">매니저 혜택</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg">자유로운 시간 선택</h3>
                <p className="text-gray-600">원하는 시간에 원하는 서비스를 선택하여 근무할 수 있습니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg">정당한 보수</h3>
                <p className="text-gray-600">서비스 종류와 시간에 따른 합리적인 보수를 제공합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg">전문 교육 지원</h3>
                <p className="text-gray-600">서비스 품질 향상을 위한 전문 교육을 무료로 제공합니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-lg">안전한 근무 환경</h3>
                <p className="text-gray-600">보험 가입 및 안전 시스템으로 안심하고 근무할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 지원 자격 */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">지원 자격</h2>
          <div className="bg-white rounded-lg p-8 border border-gray-200">
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-700">만 18세 이상 누구나</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-700">건강하고 성실하게 근무 가능한 분</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-700">고객을 배려하고 친절하게 대할 수 있는 분</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                <span className="text-gray-700">스마트폰 사용이 가능한 분</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-primary">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">지금 바로 지원하세요!</h2>
          <p className="text-xl opacity-90 mb-8">
            함께 따뜻한 돌봄을 전하는 매니저가 되어주세요
          </p>
          <Link
            href="/manager/signup"
            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            매니저 지원하기
          </Link>
        </div>
      </section>
    </div>
  )
}
