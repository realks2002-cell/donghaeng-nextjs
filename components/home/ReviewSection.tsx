'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'
import { isNativeApp } from '@/lib/capacitor'

const reviews = [
  {
    text: '\u201C바쁜 업무 때문에 어머니 병원 가시는 길을 챙겨드리지 못해 늘 죄송했는데, 매니저님이 친딸처럼 챙겨주셔서 너무 안심이 됩니다. 진료 내용도 꼼꼼히 정리해서 보내주셔서 감동했어요.\u201D',
    name: '이OO 고객님 (직장인)',
    service: '병원동행',
  },
  {
    text: '\u201C갑자기 아이가 아파서 급하게 돌봄 서비스가 필요했는데, 2시간 만에 오셔서 정말 구세주 같았어요. 아이가 선생님을 너무 좋아해서 정기 이용하기로 했습니다.\u201D',
    name: '김OO 고객님 (워킹맘)',
    service: '아이돌봄',
  },
  {
    text: '\u201C혼자 사시는 아버지 반찬이 늘 걱정이었는데, 가사동행 서비스 덕분에 냉장고가 꽉 찼다고 좋아하시네요. 집안 분위기도 훨씬 밝아진 것 같아 감사합니다.\u201D',
    name: '박OO 고객님',
    service: '가사동행',
  },
]

export default function ReviewSection() {
  const [isApp, setIsApp] = useState(false)

  useEffect(() => {
    setIsApp(isNativeApp())
  }, [])

  if (isApp) return null

  return (
    <section id="reviews" className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-orange-50/50 rounded-[3rem] my-10">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">고객님의 행복한 이야기</h2>
        <p className="text-lg text-gray-800">서비스를 이용하신 고객님들의 생생한 후기를 만나보세요.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((review, idx) => (
          <div key={idx}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 h-full flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-gray-900 leading-relaxed mb-6 flex-grow">{review.text}</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-base font-bold text-gray-900">{review.name}</span>
                <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{review.service}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
