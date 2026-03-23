import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관 - 행복안심동행',
  description: '행복안심동행 서비스 이용약관입니다.',
}

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-44 pb-16 sm:px-6 sm:pb-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">이용약관</h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <p className="text-sm text-gray-500">시행일: 2026년 3월 8일</p>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제1조 (목적)</h2>
          <p className="leading-relaxed">
            이 약관은 행복안심동행(이하 &quot;회사&quot;)이 제공하는 돌봄 서비스 플랫폼(이하 &quot;서비스&quot;)의
            이용 조건 및 절차, 회사와 이용자의 권리, 의무 및 책임 사항, 기타 필요한 사항을
            규정함을 목적으로 합니다.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제2조 (정의)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>&quot;서비스&quot;란 회사가 제공하는 병원동행, 가사돌봄, 생활동행, 노인돌봄, 아이돌봄 등의 돌봄 서비스 중개 플랫폼을 말합니다.</li>
            <li>&quot;이용자&quot;란 회사의 서비스에 접속하여 이 약관에 따라 서비스를 이용하는 회원 및 비회원을 말합니다.</li>
            <li>&quot;회원&quot;이란 회사에 개인정보를 제공하여 회원등록을 한 자를 말합니다.</li>
            <li>&quot;비회원&quot;이란 회원에 가입하지 않고 서비스를 이용하는 자를 말합니다.</li>
            <li>&quot;매니저&quot;란 회사에 등록하여 돌봄 서비스를 제공하는 자를 말합니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제3조 (약관의 효력 및 변경)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에게 적용됩니다.</li>
            <li>회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 변경할 수 있습니다.</li>
            <li>약관이 변경되는 경우 회사는 변경 사항을 서비스 내 공지하며, 변경된 약관은 공지한 날로부터 7일 후부터 효력이 발생합니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제4조 (서비스의 제공)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 이용자에게 돌봄 서비스 매니저와의 연결 서비스를 제공합니다.</li>
            <li>서비스의 구체적인 내용은 병원동행, 가사돌봄, 생활동행, 노인돌봄, 아이돌봄 등이며, 추가 또는 변경될 수 있습니다.</li>
            <li>회사는 서비스 중개 플랫폼으로서, 돌봄 서비스의 직접적인 제공자가 아닙니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제5조 (이용 계약의 성립)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회원가입은 이용자가 약관에 동의하고 가입 양식에 필요한 정보를 기입한 후 회사가 이를 승인함으로써 성립합니다.</li>
            <li>비회원의 경우 서비스 요청 시 필수 정보(이름, 전화번호, 주소)를 제공하고 결제를 완료함으로써 이용 계약이 성립합니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제6조 (결제 및 환불)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>서비스 이용 요금은 서비스 유형 및 이용 시간에 따라 결정되며, 서비스 요청 시 안내됩니다.</li>
            <li>결제는 토스페이먼츠를 통해 처리됩니다.</li>
            <li>서비스 시작 1일 전까지 취소 시 전액 환불이 가능합니다.</li>
            <li>서비스 시작 당일 취소 또는 no-show의 경우 환불 규정에 따라 위약금이 발생할 수 있습니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제7조 (이용자의 의무)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>이용자는 서비스 이용 시 정확한 정보를 제공해야 합니다.</li>
            <li>이용자는 서비스를 부정한 목적으로 이용해서는 안 됩니다.</li>
            <li>이용자는 매니저에게 서비스 범위를 벗어나는 요구를 해서는 안 됩니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제8조 (회사의 의무)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 안정적인 서비스 제공을 위해 최선을 다합니다.</li>
            <li>회사는 이용자의 개인정보를 보호하기 위해 개인정보 처리방침에 따라 노력합니다.</li>
            <li>회사는 서비스 이용과 관련하여 이용자로부터 제기되는 의견이나 불만에 대해 성실하게 처리합니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제9조 (회원 탈퇴 및 자격 상실)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회원은 언제든지 회원 탈퇴를 요청할 수 있으며, 회사는 즉시 탈퇴 처리합니다.</li>
            <li>회원 탈퇴 시 회원의 개인정보는 관련 법령에 따라 일정 기간 보관 후 파기됩니다.</li>
            <li>진행 중인 서비스가 있는 경우 해당 서비스 완료 후 탈퇴가 처리될 수 있습니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제10조 (면책)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>회사는 천재지변 또는 이에 준하는 불가항력으로 인해 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
            <li>회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대해 책임을 지지 않습니다.</li>
          </ol>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">제11조 (분쟁 해결)</h2>
          <p className="leading-relaxed">
            서비스 이용과 관련하여 분쟁이 발생한 경우, 회사와 이용자는 분쟁의 해결을 위해
            성실히 협의합니다. 협의가 이루어지지 않을 경우, 관할 법원에 소를 제기할 수 있습니다.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <p className="font-semibold text-gray-900 mb-2">문의처</p>
          <ul className="space-y-1">
            <li>회사명: 행복안심동행</li>
            <li>전화: 1668-5535</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500">
          본 약관은 2026년 3월 8일부터 시행됩니다.
        </p>
      </div>
    </section>
  )
}
