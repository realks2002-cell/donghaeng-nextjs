import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '환불정책 - 행복안심동행',
  description: '행복안심동행 서비스 환불정책입니다.',
}

export default function RefundPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-44 pb-16 sm:px-6 sm:pb-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">환불정책</h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <p className="text-sm text-gray-500">시행일: 2026년 3월 8일</p>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제1조 (목적)</h2>
          <p className="leading-relaxed">
            본 환불정책은 행복안심동행(이하 &quot;회사&quot;)이 제공하는 돌봄 서비스의 취소 및 환불에 관한
            기준과 절차를 규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제2조 (환불 기준)</h2>
          <p className="leading-relaxed mb-4">
            서비스 취소 시점에 따라 다음과 같이 환불이 적용됩니다.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left">취소 시점</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">환불 금액</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">서비스 시작 2일 전까지</td>
                  <td className="border border-gray-200 px-4 py-2">결제 금액 전액 환불</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">서비스 시작 1일 전까지</td>
                  <td className="border border-gray-200 px-4 py-2">결제 금액의 50% 환불 (위약금 50%)</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">서비스 당일 취소</td>
                  <td className="border border-gray-200 px-4 py-2">취소 불가 (위약금 100%)</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">서비스 시작 이후 또는 No-show</td>
                  <td className="border border-gray-200 px-4 py-2">환불 불가</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제3조 (회사 귀책 사유에 의한 취소)</h2>
          <p className="leading-relaxed">
            매니저 배정 불가, 회사 측 사정 등 회사의 귀책 사유로 서비스가 제공되지 못하는 경우에는
            취소 시점과 관계없이 결제 금액 전액을 환불합니다.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제4조 (환불 절차)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>이용자는 전화(1668-5535) 또는 이메일(support@donghaeng77.co.kr)을 통해 취소 및 환불을 요청할 수 있습니다.</li>
            <li>회사는 환불 요청을 접수한 후, 환불 사유 및 취소 시점을 확인합니다.</li>
            <li>환불 기준에 따라 환불 금액을 산정하여 이용자에게 안내합니다.</li>
            <li>환불이 확정되면 원래 결제 수단으로 환불을 진행합니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제5조 (환불 소요기간)</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>카드 결제: 환불 확정일로부터 3~7 영업일 이내 (카드사에 따라 상이)</li>
            <li>계좌이체: 환불 확정일로부터 3~5 영업일 이내</li>
            <li>간편결제(카카오페이, 네이버페이 등): 환불 확정일로부터 3~5 영업일 이내</li>
          </ul>
          <p className="leading-relaxed mt-4">
            환불 소요기간은 결제 수단 및 금융기관 사정에 따라 달라질 수 있습니다.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제6조 (환불 제한)</h2>
          <p className="leading-relaxed mb-4">
            다음의 경우에는 환불이 제한될 수 있습니다.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>이용자의 단순 변심으로 서비스 시작 이후 취소를 요청하는 경우</li>
            <li>이용자의 귀책 사유(허위 정보 제공, 연락 두절 등)로 서비스가 정상 제공되지 못한 경우</li>
            <li>서비스가 정상적으로 완료된 후 환불을 요청하는 경우</li>
          </ul>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="font-semibold text-gray-900 mb-2">환불 관련 문의</p>
          <ul className="space-y-1">
            <li>회사명: 행복안심동행</li>
            <li>이메일: support@donghaeng77.co.kr</li>
            <li>전화: 1668-5535</li>
            <li>운영시간: 평일 09:00 ~ 18:00 (공휴일 제외)</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500">
          본 환불정책은 2026년 3월 8일부터 시행됩니다.
        </p>
      </div>
    </section>
  )
}
