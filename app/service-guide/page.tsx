import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '서비스 이용 안내 - 행복안심동행',
  description: '행복안심동행 서비스 이용 방법과 절차를 안내합니다.',
}

const steps = [
  {
    number: 1,
    title: '서비스 요청',
    description: '원하는 서비스 유형, 일시, 위치를 선택하고 상세 정보를 입력합니다.',
  },
  {
    number: 2,
    title: '결제',
    description: '카드 등록 후 안전하게 결제를 진행합니다.',
  },
  {
    number: 3,
    title: '매니저 매칭',
    description: '결제 완료 후 매니저들이 지원하고, 고객이 매니저를 선택합니다.',
  },
  {
    number: 4,
    title: '서비스 제공',
    description: '약속한 일시에 매니저가 방문하여 서비스를 제공합니다.',
  },
  {
    number: 5,
    title: '후기 작성',
    description: '서비스 완료 후 후기를 작성하여 다른 고객들에게 도움을 줍니다.',
  },
]

export default function ServiceGuidePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-44 pb-16 sm:px-6 sm:pb-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">서비스 이용 안내</h1>

      <div className="prose prose-lg max-w-none">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">이용 절차</h2>
          <div className="space-y-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-gray-700">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-12 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">이용 안내</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">서비스 시간</h3>
              <p className="text-gray-700">24시간 서비스 요청이 가능하며, 매니저 매칭은 실시간으로 진행됩니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">결제 방법</h3>
              <p className="text-gray-700">카드 등록 후 자동 결제 방식으로 진행됩니다. 안전한 토스페이먼츠를 통해 결제가 처리됩니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">취소 및 환불</h3>
              <p className="text-gray-700">서비스 시작 전까지 취소 가능하며, 환불은 결제 수단으로 자동 처리됩니다.</p>
            </div>
          </div>
        </div>

        <div className="mb-8 border-t pt-8">
          <h2 className="text-2xl font-semibold mb-4">주의사항</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>서비스 요청 시 정확한 정보를 입력해주세요.</li>
            <li>서비스 일시 변경은 최소 24시간 전에 요청해주세요.</li>
            <li>매니저와의 약속 시간을 지켜주세요.</li>
            <li>서비스 중 문제가 발생하면 즉시 고객센터로 연락주세요.</li>
          </ul>
        </div>
      </div>
    </section>
  )
}
