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
            <div className="flex items-center gap-2 mb-4 text-white">
              <HeartHandshake className="text-orange-500 w-6 h-6" />
              <span className="text-2xl font-bold">{APP_NAME}</span>
            </div>
            <p className="text-lg leading-relaxed max-w-sm text-white">
              우리는 고객의 삶에 따뜻한 온기를 전하는 동반자입니다.<br />
              신뢰와 정성으로 가장 가까운 곳에서 함께하겠습니다.
            </p>
          </div>
          <div>
            <h4 className="text-lg text-white font-bold mb-4">서비스</h4>
            <ul className="space-y-2 text-lg">
              <li>
                <Link href="/service-guide" className="text-white hover:text-orange-400 transition-colors">
                  병원동행
                </Link>
              </li>
              <li>
                <Link href="/service-guide" className="text-white hover:text-orange-400 transition-colors">
                  아이돌봄
                </Link>
              </li>
              <li>
                <Link href="/service-guide" className="text-white hover:text-orange-400 transition-colors">
                  가사동행
                </Link>
              </li>
              <li>
                <Link href="/service-guide" className="text-white hover:text-orange-400 transition-colors">
                  일상/생활동행
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg text-white font-bold mb-4">고객지원</h4>
            <ul className="space-y-2 text-lg">
              <li>
                <Link href="/faq" className="text-white hover:text-orange-400 transition-colors">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-white hover:text-orange-400 transition-colors">
                  회사소개
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-base">
          <p className="text-white">&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-white hover:text-orange-400 transition-colors">
              개인정보처리방침
            </Link>
            <Link href="#" className="text-white hover:text-orange-400 transition-colors">
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
