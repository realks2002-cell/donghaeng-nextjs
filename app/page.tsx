import Link from 'next/link'
import Image from 'next/image'
import { Star, ShieldCheck, Users, Clock, ClipboardCheck } from 'lucide-react'

const KAKAO_CHAT_URL = 'https://pf.kakao.com/_xnxaxkxj/chat'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-200/30 rounded-full blur-3xl translate-y-1/4 -translate-x-1/4 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-medium text-orange-600 border border-orange-100">
              <Star className="w-4 h-4 fill-orange-500 text-orange-500" />
              <span>고객 만족도 99.8% 달성</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.15] text-gray-900">
              당신의 일상에 <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">따뜻한 동행</span>을 선물<br />
              합니다.
            </h1>
            <p className="text-lg md:text-xl text-gray-800 leading-relaxed max-w-lg">
              병원 동행부터 가사, 육아, 일상 케어까지.<br className="hidden md:block" />
              전문 교육을 이수한 매니저가 가족의 마음으로 함께합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/requests/new" className="text-lg px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 rounded-full font-semibold transition-all duration-300 min-h-[44px] flex items-center justify-center">
                서비스 신청하기
              </Link>
              <Link href="/bookings" className="text-lg px-8 py-4 bg-[#ffc000] hover:bg-[#e6ad00] text-gray-900 rounded-full font-semibold transition-all duration-300 flex items-center justify-center gap-2 min-h-[44px] shadow-lg shadow-[#ffc000]/30">
                <ClipboardCheck className="w-5 h-5 flex-shrink-0" />
                내 서비스 확인하기
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-6 text-base text-gray-700 font-medium flex-wrap">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                신원 검증 완료
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                전문 교육 이수
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-600" />
                24시간 예약 가능
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="w-[85%] mx-auto bg-white p-4 pb-12 shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_30px_rgba(0,0,0,0.1)] rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
              <Image
                src="/images/hero.jpg"
                alt="행복안심동행 서비스"
                width={600}
                height={320}
                className="w-full h-[320px] object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-white rounded-[3rem] shadow-sm my-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-orange-600 font-semibold tracking-wide uppercase text-base">Our Services</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-6">어떤 도움이 필요하신가요?</h2>
          <p className="text-gray-800 text-xl">
            고객님의 상황에 딱 맞는 1:1 맞춤형 동행 서비스를 제공합니다.<br />
            전문 매니저가 세심하게 케어해드립니다.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Service 1 */}
          <div className="group">
            <div className="h-full bg-stone-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 hover:-translate-y-1">
              <div className="w-full h-56 overflow-hidden relative">
                <Image src="/images/seniorcare.jpg" alt="병원동행" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold mb-3">병원동행</h3>
                <p className="text-base text-gray-800 leading-relaxed mb-4">진료 접수부터 약국 처방까지, 병원 방문의 모든 과정을 가족처럼 든든하게 동행해드립니다.</p>
                <Link href="/service-guide" className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors">자세히 보기 →</Link>
              </div>
            </div>
          </div>

          {/* Service 2 */}
          <div className="group">
            <div className="h-full bg-stone-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 hover:-translate-y-1">
              <div className="w-full h-56 overflow-hidden relative">
                <Image src="/images/babycare.jpg" alt="아이돌봄" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold mb-3">아이돌봄</h3>
                <p className="text-base text-gray-800 leading-relaxed mb-4">등하원 도우미부터 긴급 돌봄까지, 사랑과 정성으로 우리 아이의 행복한 시간을 책임집니다.</p>
                <Link href="/service-guide" className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors">자세히 보기 →</Link>
              </div>
            </div>
          </div>

          {/* Service 3 */}
          <div className="group">
            <div className="h-full bg-stone-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 hover:-translate-y-1">
              <div className="w-full h-56 overflow-hidden relative">
                <Image src="/images/clean.jpg" alt="가사동행" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold mb-3">가사동행</h3>
                <p className="text-base text-gray-800 leading-relaxed mb-4">청소, 정리정돈, 반찬 만들기 등 쾌적한 주거 환경을 위해 세심한 가사 서비스를 제공합니다.</p>
                <Link href="/service-guide" className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors">자세히 보기 →</Link>
              </div>
            </div>
          </div>

          {/* Service 4 */}
          <div className="group">
            <div className="h-full bg-stone-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 hover:-translate-y-1">
              <div className="w-full h-56 overflow-hidden relative">
                <Image src="/images/cook.jpg" alt="생활동행" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold mb-3">생활동행</h3>
                <p className="text-base text-gray-800 leading-relaxed mb-4">관공서 방문, 은행 업무, 장보기 등 혼자하기 힘든 일상 생활의 불편함을 해소해드립니다.</p>
                <Link href="/service-guide" className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors">자세히 보기 →</Link>
              </div>
            </div>
          </div>

          {/* Service 5 */}
          <div className="group">
            <div className="h-full bg-stone-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-transparent hover:border-orange-100 hover:-translate-y-1">
              <div className="w-full h-56 overflow-hidden relative">
                <Image src="/images/hero.jpg" alt="일상동행" fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
              </div>
              <div className="p-6">
                <h3 className="text-3xl font-bold mb-3">일상동행</h3>
                <p className="text-base text-gray-800 leading-relaxed mb-4">산책, 말벗, 취미 활동 공유 등 외로움을 덜어드리고 활기찬 하루를 선물합니다.</p>
                <Link href="/service-guide" className="inline-flex items-center text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors">자세히 보기 →</Link>
              </div>
            </div>
          </div>

          {/* Custom Request */}
          <div className="group">
            <div className="h-full bg-orange-500 text-white rounded-2xl p-8 flex flex-col justify-center items-center text-center hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20">
              <h3 className="text-3xl font-bold mb-4">찾으시는 서비스가<br />없으신가요?</h3>
              <p className="text-base text-orange-100 mb-8">
                고객님의 상황에 맞는<br />맞춤형 서비스를 상담해드립니다.
              </p>
              <Link href="/faq" className="text-base bg-white text-orange-600 hover:bg-orange-50 w-full shadow-none border-0 px-6 py-3 rounded-full font-semibold transition-all min-h-[44px] flex items-center justify-center">
                1:1 맞춤 상담하기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-us" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 제목 */}
          <div className="lg:col-span-2">
            <span className="text-teal-600 font-semibold tracking-wide uppercase text-base">Why Choose Us</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
              믿을 수 있는 <span className="text-orange-500">행복안심동행</span>의 3가지 약속
            </h2>
          </div>

          {/* 3가지 약속 */}
          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-[50px] h-[50px] rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-2xl">1</div>
              <p className="text-xl text-gray-800 leading-relaxed"><span className="font-bold text-2xl text-gray-900">엄격한 신원 검증</span> 모든 매니저는 신원 조회, 건강 검진, 인성 면접 등 5단계 검증 시스템을 통과했습니다.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-[50px] h-[50px] rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-2xl">2</div>
              <p className="text-xl text-gray-800 leading-relaxed"><span className="font-bold text-2xl text-gray-900">전문 교육 이수</span> 병원 동행, 노인 케어, 아동 심리 등 분야별 100시간 이상의 전문 교육을 의무화합니다.</p>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-[50px] h-[50px] rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-2xl">3</div>
              <p className="text-xl text-gray-800 leading-relaxed"><span className="font-bold text-2xl text-gray-900">배상 책임 보험 가입</span> 만약의 상황에 대비하여 업계 최고 수준의 배상 책임 보험에 가입되어 있어 안심할 수 있습니다.</p>
            </div>
          </div>

          {/* 이미지 */}
          <div className="relative self-start">
            <div className="w-[70%] mx-auto bg-white p-4 pb-12 shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_30px_rgba(0,0,0,0.1)] rotate-[-2deg] hover:rotate-0 transition-transform duration-300">
              <Image
                src="https://images.unsplash.com/photo-1758273238564-806f750a2cce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                alt="서비스"
                width={600}
                height={333}
                className="object-cover w-full h-[333px]"
              />
            </div>
            <div className="absolute inset-0 bg-orange-500/5 -z-10 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Review Section */}
      <section id="reviews" className="py-20 px-4 md:px-8 max-w-7xl mx-auto bg-orange-50/50 rounded-[3rem] my-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">고객님의 행복한 이야기</h2>
          <p className="text-lg text-gray-800">서비스를 이용하신 고객님들의 생생한 후기를 만나보세요.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Review 1 */}
          <div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 h-full flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-gray-900 leading-relaxed mb-6 flex-grow">&ldquo;바쁜 업무 때문에 어머니 병원 가시는 길을 챙겨드리지 못해 늘 죄송했는데, 매니저님이 친딸처럼 챙겨주셔서 너무 안심이 됩니다. 진료 내용도 꼼꼼히 정리해서 보내주셔서 감동했어요.&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-base font-bold text-gray-900">이OO 고객님 (직장인)</span>
                <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">병원동행</span>
              </div>
            </div>
          </div>

          {/* Review 2 */}
          <div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 h-full flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-gray-900 leading-relaxed mb-6 flex-grow">&ldquo;갑자기 아이가 아파서 급하게 돌봄 서비스가 필요했는데, 2시간 만에 오셔서 정말 구세주 같았어요. 아이가 선생님을 너무 좋아해서 정기 이용하기로 했습니다.&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-base font-bold text-gray-900">김OO 고객님 (워킹맘)</span>
                <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">아이돌봄</span>
              </div>
            </div>
          </div>

          {/* Review 3 */}
          <div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 h-full flex flex-col">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-lg text-gray-900 leading-relaxed mb-6 flex-grow">&ldquo;혼자 사시는 아버지 반찬이 늘 걱정이었는데, 가사동행 서비스 덕분에 냉장고가 꽉 찼다고 좋아하시네요. 집안 분위기도 훨씬 밝아진 것 같아 감사합니다.&rdquo;</p>
              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-base font-bold text-gray-900">박OO 고객님</span>
                <span className="text-sm bg-orange-100 text-orange-700 px-2 py-1 rounded-full">가사동행</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-teal-800 to-teal-900 rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-teal-500 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-30"></div>

          <div className="relative z-10 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              사랑하는 가족을 위한<br />
              <span className="text-teal-200">따뜻한 동행</span>, 지금 시작하세요.
            </h2>
            <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto">
              상담은 언제나 무료입니다. 고객님의 상황에 맞는 최적의 서비스를 제안해드립니다.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <a href={KAKAO_CHAT_URL} target="_blank" rel="noopener noreferrer" className="bg-[#ffc000] hover:bg-[#e6ad00] text-gray-900 text-lg px-10 py-3 rounded-full font-bold shadow-lg transition-all min-h-[44px] flex items-center justify-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" /></svg>
                카톡 상담하기
              </a>
              <Link href="/service-guide" className="border border-teal-400 text-teal-100 hover:bg-teal-800 hover:text-white text-lg px-10 py-3 rounded-full font-bold transition-all min-h-[44px] flex items-center justify-center">
                서비스 요금 보기
              </Link>
            </div>
            <p className="text-xl text-teal-400 pt-6">
              * 평일 09:00 - 18:00 (점심시간 12:00 - 13:00)
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
