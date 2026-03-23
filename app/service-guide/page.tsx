import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: '서비스 이용 안내 - 행복안심동행',
  description: '행복안심동행 서비스 이용 방법과 절차를 안내합니다.',
}

const defaultPrices: Record<string, number> = {
  '병원 동행': 20000,
  '가사돌봄': 18000,
  '생활동행': 18000,
  '노인 돌봄': 22000,
  '아이 돌봄': 20000,
}

async function getServicePrices(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('service_prices')
      .select('service_type, price_per_hour')
      .eq('is_active', true)

    if (error) {
      return defaultPrices
    }

    const prices: Record<string, number> = { ...defaultPrices }
    if (data) {
      data.forEach((item: { service_type: string; price_per_hour: number }) => {
        if (item.service_type !== '기타' && item.service_type !== 'commission_rate') {
          prices[item.service_type] = item.price_per_hour
        }
      })
    }

    return prices
  } catch {
    return defaultPrices
  }
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
    description: '서비스 신청 단계에서 안전한 토스페이먼츠를 통해 결제가 처리됩니다.',
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

export default async function ServiceGuidePage() {
  const prices = await getServicePrices()
  const priceEntries = Object.entries(prices).filter(([name]) => name !== '기타' && name !== 'commission_rate')

  return (
    <section className="mx-auto max-w-4xl px-4 pt-44 pb-16 sm:px-6 sm:pb-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">서비스 이용 안내</h1>

      <div className="mb-12 not-prose">
        <h2 className="text-2xl font-semibold mb-6">서비스 요금표</h2>
        <div className="overflow-x-auto rounded-lg border max-w-[80%]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-6 py-3 text-sm font-semibold">서비스명</th>
                <th className="px-6 py-3 text-sm font-semibold text-right">시간당 요금</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {priceEntries.map(([name, price]) => (
                <tr key={name} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">{name}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {price.toLocaleString('ko-KR')}원
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
              <p className="text-gray-700">서비스 신청 단계에서 안전한 토스페이먼츠를 통해 결제가 처리됩니다.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">취소 및 환불</h3>
              <p className="text-gray-700">서비스 시작 전까지 취소 가능하며, 서비스 임박한 취소는 내부규정에 따라 위약금이 발생할 수 있습니다.</p>
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
