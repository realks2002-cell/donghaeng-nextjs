import Link from 'next/link'
import { HeartHandshake } from 'lucide-react'

const APP_NAME = '행복안심동행'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer id="footer" className="bg-gray-900 text-white py-12 border-t border-gray-800" role="contentinfo">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3 text-white">
              <HeartHandshake className="text-orange-500 w-5 h-5" />
              <span className="text-xl font-bold">{APP_NAME}</span>
            </div>
            <p className="text-xl leading-relaxed text-white whitespace-nowrap">
              우리는 고객의 삶에 따뜻한 온기를 전하는 동반자입니다.<br />
              신뢰와 정성으로 가장 가까운 곳에서 함께하겠습니다.
            </p>
          </div>
          <div className="col-span-1 md:col-span-2">
            <div className="text-base text-white space-y-1.5">
              <p><span className="text-gray-300">상호 :</span> 한국직업능력평생교육원</p>
              <p><span className="text-gray-300">대표자명 :</span> 임체계</p>
              <p><span className="text-gray-300">사업자등록번호 :</span> 289-05-03250 | <span className="text-gray-300">전화번호 :</span> 1668-5535</p>
              <p><span className="text-gray-300">주소 :</span> 경기도 화성시 동탄대로5길 21, B동 2층 W243호(송동)</p>
              <p><span className="text-gray-300">통신판매업 신고번호 :</span> 제 2026-화성동탄-0213 호</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-lg">
          <p className="text-white">&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-white hover:text-orange-400 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="/terms" className="text-white hover:text-orange-400 transition-colors">
              이용약관
            </Link>
            <Link href="/refund" className="text-white hover:text-orange-400 transition-colors">
              환불정책
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
