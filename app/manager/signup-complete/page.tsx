import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function SignupCompletePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
          {/* 시계 아이콘 (대기 중) */}
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            매니저 지원이 접수되었습니다
          </h1>

          <p className="text-gray-600 mb-4">지원해 주셔서 감사합니다.</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>승인 대기 중</strong>
              <br />
              관리자가 지원 내용을 검토 중입니다.
              <br />
              승인 후 로그인이 가능합니다.
            </p>
          </div>

          <Link
            href="/"
            className="inline-block w-full min-h-[44px] bg-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity py-3"
          >
            홈으로 이동
          </Link>
        </div>
      </div>
    </div>
  )
}
