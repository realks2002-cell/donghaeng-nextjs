import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보 처리방침 - 행복안심동행',
  description: '행복안심동행의 개인정보 처리방침입니다.',
}

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 pt-44 pb-16 sm:px-6 sm:pb-24">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-8">개인정보 처리방침</h1>

      <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
        <p className="text-sm text-gray-500">시행일: 2026년 3월 8일</p>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">1. 개인정보의 수집 및 이용 목적</h2>
          <p className="leading-relaxed">
            행복안심동행(이하 &quot;회사&quot;)은 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="list-disc list-inside space-y-2 mt-4">
            <li>서비스 제공: 돌봄 서비스 요청 처리, 매니저 매칭, 서비스 이행</li>
            <li>회원 관리: 회원가입, 본인 확인, 서비스 이용 기록 관리</li>
            <li>결제 처리: 서비스 요금 결제, 환불 처리</li>
            <li>고객 지원: 문의 응대, 서비스 관련 공지 및 알림</li>
            <li>서비스 개선: 서비스 품질 향상 및 통계 분석</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">2. 수집하는 개인정보 항목</h2>
          <p className="leading-relaxed mb-4">회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.</p>

          <h3 className="text-lg font-semibold mb-2 text-gray-900">회원 가입 시</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>필수: 이름, 이메일, 전화번호, 비밀번호</li>
            <li>선택: 주소</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 text-gray-900">비회원 서비스 요청 시</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>필수: 이름, 전화번호, 주소</li>
            <li>선택: 이메일</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 text-gray-900">결제 시</h3>
          <ul className="list-disc list-inside space-y-1 mb-4">
            <li>결제 수단 정보 (토스페이먼츠를 통해 처리되며, 회사는 카드번호 등 민감 결제정보를 직접 저장하지 않습니다)</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 text-gray-900">서비스 이용 중 자동 수집</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>서비스 이용 기록, 접속 로그, 기기 정보 (앱 이용 시)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
          <p className="leading-relaxed mb-4">
            회사는 개인정보 수집 및 이용 목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다.
            단, 관계 법령에 따라 보존할 필요가 있는 경우 아래와 같이 보관합니다.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자의 불만 또는 분쟁 처리에 관한 기록: 3년 (전자상거래법)</li>
            <li>접속에 관한 기록: 3개월 (통신비밀보호법)</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">4. 개인정보의 제3자 제공</h2>
          <p className="leading-relaxed mb-4">
            회사는 원칙적으로 이용자의 개인정보를 제3자에게 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">5. 개인정보 처리 위탁</h2>
          <p className="leading-relaxed mb-4">
            회사는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
          </p>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border border-gray-200 px-4 py-2 text-left">위탁업체</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">위탁 업무</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">토스페이먼츠</td>
                  <td className="border border-gray-200 px-4 py-2">결제 처리</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">Supabase Inc.</td>
                  <td className="border border-gray-200 px-4 py-2">데이터 저장 및 인증 서비스</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-2">CoolSMS</td>
                  <td className="border border-gray-200 px-4 py-2">SMS 알림 발송</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">6. 개인정보의 파기</h2>
          <p className="leading-relaxed">
            회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는
            지체 없이 해당 개인정보를 파기합니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는
            기술적 방법을 사용하여 삭제하며, 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">7. 이용자의 권리 및 행사 방법</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
            <li>이용자는 개인정보의 처리 정지 및 삭제를 요청할 수 있습니다.</li>
            <li>회원 탈퇴를 통해 개인정보의 수집 및 이용 동의를 철회할 수 있습니다.</li>
            <li>앱 내 &quot;마이페이지 &gt; 회원 탈퇴&quot; 또는 아래 연락처를 통해 삭제를 요청할 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">8. 개인정보의 안전성 확보 조치</h2>
          <p className="leading-relaxed mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>비밀번호의 암호화 저장 및 관리</li>
            <li>SSL/TLS를 통한 데이터 전송 암호화</li>
            <li>접근 권한의 제한 및 관리</li>
            <li>개인정보 취급 직원의 최소화</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">9. 개인정보 보호책임자</h2>
          <p className="leading-relaxed mb-4">
            회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
            이용자의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="font-semibold text-gray-900 mb-2">개인정보 보호책임자</p>
            <ul className="space-y-1">
              <li>회사명: 행복안심동행</li>
              <li>이메일: privacy@donghaeng77.co.kr</li>
              <li>전화: 1668-5535</li>
            </ul>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">10. 개인정보 처리방침의 변경</h2>
          <p className="leading-relaxed">
            이 개인정보 처리방침은 2026년 3월 8일부터 적용됩니다.
            개인정보 처리방침이 변경되는 경우 변경 사항을 웹사이트 및 앱을 통해 공지합니다.
          </p>
        </div>
      </div>
    </section>
  )
}
