# Next.js + Vercel 재개발 계획

## 프로젝트 개요

현재 PHP 기반 돌봄 서비스 플랫폼을 Next.js + Vercel로 재개발
반응형 고려해서 개발

### 핵심 요구사항

1. **새 폴더 구조** - `/mnt/c/xampp/htdocs/dolbom_php/donghaeng-nextjs/` 폴더에 새 프로젝트
   - ⚠️ **기존 PHP 파일 절대 수정 금지** - 새 폴더에서만 작업
2. **⚠️ IMPORTANT: 동일한 프론트엔드 디자인** - 현재 PHP의 HTML/CSS/JS를 그대로 복사하여 사용
   - 모든 Tailwind CSS 클래스 동일하게 유지
   - 색상, 간격, 폰트 크기 등 디자인 토큰 동일
   - 컴포넌트 구조 (Header, Footer, Nav, Form 등) 동일
   - 반응형 breakpoint 동일 (sm, md, lg)
3. **비회원 결제 가능** - 로그인 없이 서비스 신청/결제 가능
4. **동일한 워크플로우** - 5단계 서비스 요청 플로우 유지

---

## ⚠️ IMPORTANT: 프론트엔드 디자인 소스 복사

### 현재 PHP 디자인 그대로 사용

Next.js로 변환할 때 **현재 PHP 파일의 HTML/CSS를 그대로 복사**하여 JSX로 변환합니다.
새로운 디자인을 만들지 않습니다.

### 변환 예시

**PHP (현재)**:
```php
<section class="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
    <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">믿을 수 있는 병원동행과 돌봄 서비스</h1>
    <p class="mt-4 text-lg text-gray-600">필요한 순간, 신뢰할 수 있는 매니저와 함께</p>
    <div class="mt-8">
        <a href="<?= $ctaHref ?>" class="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:opacity-90">지금 서비스 요청하기</a>
    </div>
</section>
```

**Next.js (변환 후)**:
```tsx
<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">믿을 수 있는 병원동행과 돌봄 서비스</h1>
    <p className="mt-4 text-lg text-gray-600">필요한 순간, 신뢰할 수 있는 매니저와 함께</p>
    <div className="mt-8">
        <Link href={ctaHref} className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-white hover:opacity-90">지금 서비스 요청하기</Link>
    </div>
</section>
```

### 복사할 주요 디자인 요소

| 요소 | PHP 소스 | Next.js 컴포넌트 |
|------|----------|------------------|
| 헤더 | `components/header.php` | `components/layout/Header.tsx` |
| 푸터 | `components/footer.php` | `components/layout/Footer.tsx` |
| 네비게이션 | `components/nav.php` | `components/layout/Nav.tsx` |
| 레이아웃 | `components/layout.php` | `app/layout.tsx` |
| 랜딩 페이지 | `pages/index.php` | `app/page.tsx` |
| 서비스 요청 폼 | `pages/requests/new.php` | `components/forms/ServiceRequestForm/` |
| 로그인 폼 | `pages/auth/login.php` | `app/auth/login/page.tsx` |

### Tailwind 설정 동일하게 유지

```js
// tailwind.config.ts - PHP의 tailwind.config.js와 동일하게
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#...', // 현재 PHP와 동일한 색상
      },
    },
  },
}
```

---

## Phase 1: 프로젝트 설정

### 1.1 폴더 구조

```
dolbom-nextjs/
├── app/
│   ├── layout.tsx              # 전역 레이아웃
│   ├── page.tsx                # 랜딩 페이지
│   ├── about/page.tsx          # 소개
│   ├── faq/page.tsx            # FAQ
│   ├── service-guide/page.tsx  # 서비스 안내
│   │
│   ├── requests/
│   │   ├── new/page.tsx        # 서비스 요청 (5단계 폼)
│   │   └── [id]/page.tsx       # 요청 상세
│   │
│   ├── auth/
│   │   ├── login/page.tsx      # 로그인
│   │   ├── signup/page.tsx     # 회원가입
│   │   └── logout/route.ts     # 로그아웃 API
│   │
│   ├── bookings/
│   │   └── page.tsx            # 내 예약 (회원 전용)
│   │
│   ├── payment/
│   │   ├── success/page.tsx    # 결제 성공
│   │   └── fail/page.tsx       # 결제 실패
│   │
│   ├── manager/                # 매니저 영역
│   │   ├── login/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── requests/page.tsx
│   │   ├── applications/page.tsx
│   │   ├── schedule/page.tsx
│   │   └── profile/page.tsx
│   │
│   ├── admin/                  # 관리자 영역
│   │   ├── page.tsx            # 대시보드
│   │   ├── requests/page.tsx
│   │   ├── managers/page.tsx
│   │   ├── users/page.tsx
│   │   ├── payments/page.tsx
│   │   └── revenue/page.tsx
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── signup/route.ts
│       │   └── me/route.ts
│       ├── requests/
│       │   ├── route.ts        # GET/POST
│       │   ├── [id]/route.ts
│       │   └── save-temp/route.ts
│       ├── payments/
│       │   ├── confirm/route.ts
│       │   └── refund/route.ts
│       ├── manager/
│       │   ├── login/route.ts
│       │   ├── applications/route.ts
│       │   └── schedule/route.ts
│       └── address/
│           └── search/route.ts  # VWorld API 프록시
│
├── components/
│   ├── ui/                     # shadcn/ui 컴포넌트
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Nav.tsx
│   ├── forms/
│   │   └── ServiceRequestForm/ # 5단계 폼 컴포넌트
│   │       ├── index.tsx
│   │       ├── Step1Service.tsx
│   │       ├── Step2DateTime.tsx
│   │       ├── Step3Location.tsx
│   │       ├── Step4Details.tsx
│   │       └── Step5Payment.tsx
│   └── payment/
│       └── TossPaymentWidget.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # 브라우저 클라이언트
│   │   ├── server.ts           # 서버 클라이언트
│   │   └── middleware.ts       # 인증 미들웨어
│   ├── toss/
│   │   └── payment.ts          # 토스페이먼츠 유틸
│   └── utils.ts
│
├── types/
│   └── index.ts                # TypeScript 타입 정의
│
├── public/
│   ├── icons/
│   └── images/
│
├── middleware.ts               # Next.js 미들웨어
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### 1.2 기술 스택

| 영역 | 현재 (PHP) | 신규 (Next.js) |
|------|-----------|----------------|
| 프론트엔드 | PHP + Tailwind CSS | Next.js 14 App Router + Tailwind CSS |
| 백엔드 | PHP | Next.js API Routes |
| 데이터베이스 | MySQL/MariaDB | Supabase (PostgreSQL) |
| 인증 | 세션 기반 | Supabase Auth |
| 결제 | 토스페이먼츠 SDK v1 | 토스페이먼츠 SDK v1 (동일) |
| 호스팅 | Cafe24 | Vercel |
| 주소 검색 | VWorld API | VWorld API (동일) |

---

## Phase 2: 데이터베이스 설계 (Supabase)

### 2.1 테이블 구조

```sql
-- 사용자 (Supabase Auth 연동)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id),  -- Supabase Auth 연결
  email TEXT UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'CUSTOMER',  -- CUSTOMER, MANAGER, ADMIN
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 서비스 요청 (비회원 지원)
CREATE TABLE service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES users(id),  -- NULL 허용 (비회원)
  guest_email TEXT,                        -- 비회원 이메일
  guest_phone TEXT,                        -- 비회원 전화번호
  guest_name TEXT,                         -- 비회원 이름
  service_type TEXT NOT NULL,
  service_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  address TEXT NOT NULL,
  address_detail TEXT,
  phone TEXT NOT NULL,
  lat DECIMAL(10,8),
  lng DECIMAL(11,8),
  details TEXT,
  status TEXT DEFAULT 'PENDING',
  estimated_price INTEGER,
  final_price INTEGER,
  manager_id UUID REFERENCES managers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- 매니저
CREATE TABLE managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT,
  photo_url TEXT,
  gender TEXT,
  specialty TEXT[],
  bank_name TEXT,
  bank_account TEXT,
  bank_holder TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 매니저 신청
CREATE TABLE manager_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id UUID REFERENCES managers(id),
  service_request_id UUID REFERENCES service_requests(id),
  status TEXT DEFAULT 'PENDING',
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID REFERENCES service_requests(id),
  payment_key TEXT UNIQUE,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING',
  method TEXT,
  approved_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  partial_refunded BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 관리자
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Row Level Security (RLS)

```sql
-- 서비스 요청: 본인 또는 비회원 조회
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON service_requests
  FOR SELECT USING (
    auth.uid() = customer_id OR
    customer_id IS NULL  -- 비회원 요청은 공개
  );

CREATE POLICY "Anyone can create requests" ON service_requests
  FOR INSERT WITH CHECK (true);  -- 비회원도 생성 가능
```

---

## Phase 3: 5단계 서비스 요청 워크플로우

### 3.1 현재 PHP 워크플로우 (유지)

| 단계 | 내용 | 필드 |
|------|------|------|
| Step 1 | 서비스 선택 | service_type (6가지) |
| Step 2 | 일시 선택 | service_date, start_time, duration_hours |
| Step 3 | 위치/연락처 | address, address_detail, phone, lat/lng |
| Step 4 | 상세 요청 | details (선택, 최대 1000자) |
| Step 5 | 결제 | 토스페이먼츠 위젯 + 약관 동의 |

### 3.2 비회원 결제 플로우 (신규)

```
[Step 1-4: 동일]
     ↓
[Step 5: 결제 정보 입력]
  - 이메일 (필수) ← 비회원 추가 필드
  - 이름 (필수) ← 비회원 추가 필드
  - 토스페이먼츠 결제
     ↓
[결제 성공]
  - 이메일로 확인 메일 발송
  - 요청 상세 페이지로 이동 (URL에 토큰 포함)
```

### 3.3 컴포넌트 구조

```tsx
// app/requests/new/page.tsx
export default function NewRequestPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<ServiceRequestForm>({});

  return (
    <div>
      <ProgressBar current={step} total={5} />

      {step === 1 && <Step1Service data={formData} onNext={...} />}
      {step === 2 && <Step2DateTime data={formData} onNext={...} onPrev={...} />}
      {step === 3 && <Step3Location data={formData} onNext={...} onPrev={...} />}
      {step === 4 && <Step4Details data={formData} onNext={...} onPrev={...} />}
      {step === 5 && <Step5Payment data={formData} onPrev={...} />}
    </div>
  );
}
```

---

## Phase 4: 개발 순서

### 4.1 1주차: 프로젝트 설정 + 인프라

- [ ] Next.js 14 프로젝트 생성
- [ ] Supabase 프로젝트 생성 + 테이블 생성
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] 환경변수 설정 (SUPABASE_URL, TOSS_CLIENT_KEY 등)
- [ ] Vercel 배포 설정

### 4.2 2주차: 공통 레이아웃 + 랜딩

- [ ] Header, Footer, Nav 컴포넌트
- [ ] 랜딩 페이지 (pages/index.php → app/page.tsx)
- [ ] 소개, FAQ, 서비스 안내 페이지

### 4.3 3주차: 서비스 요청 폼 (핵심)

- [ ] Step 1-4 컴포넌트 구현
- [ ] VWorld 주소 검색 API 연동
- [ ] 폼 상태 관리 (React Hook Form + Zod)

### 4.4 4주차: 결제 + 비회원 처리

- [ ] Step 5 토스페이먼츠 위젯
- [ ] 비회원 이메일/이름 입력 추가
- [ ] 결제 성공/실패 페이지
- [ ] 결제 확인 API (서버 → 토스 검증)

### 4.5 5주차: 인증 + 마이페이지

- [ ] Supabase Auth 연동 (로그인/회원가입)
- [ ] 내 예약 조회 페이지
- [ ] 요청 상세 페이지

### 4.6 6주차: 매니저/관리자

- [ ] 매니저 로그인 (별도 인증)
- [ ] 매니저 대시보드, 요청 목록, 신청 관리
- [ ] 관리자 페이지 (요청/매니저/결제 관리)

### 4.7 7주차: 테스트 + 배포

- [ ] E2E 테스트 (Playwright)
- [ ] Vercel 프로덕션 배포
- [ ] 도메인 연결

---

## Phase 5: 파일 마이그레이션 매핑

| PHP 파일 | Next.js 파일 |
|----------|--------------|
| pages/index.php | app/page.tsx |
| pages/about.php | app/about/page.tsx |
| pages/faq.php | app/faq/page.tsx |
| pages/requests/new.php | app/requests/new/page.tsx |
| pages/requests/detail.php | app/requests/[id]/page.tsx |
| pages/auth/login.php | app/auth/login/page.tsx |
| pages/auth/signup.php | app/auth/signup/page.tsx |
| pages/bookings/index.php | app/bookings/page.tsx |
| pages/payment/success.php | app/payment/success/page.tsx |
| pages/payment/fail.php | app/payment/fail/page.tsx |
| pages/manager/*.php | app/manager/*/page.tsx |
| pages/admin/*.php | app/admin/*/page.tsx |
| api/*.php | app/api/*/route.ts |

---

## 검증 방법

1. **로컬 개발**: `npm run dev` → http://localhost:3000
2. **비회원 신청 테스트**: 로그인 없이 서비스 요청 → 결제 완료 확인
3. **회원 로그인 테스트**: Supabase Auth 로그인 → 내 예약 조회
4. **E2E 테스트**: `npx playwright test`
5. **Vercel 배포**: PR 생성 → Preview 배포 → 프로덕션

---

## 예상 일정

| 주차 | 작업 | 산출물 |
|------|------|--------|
| 1주 | 설정 + 인프라 | 빈 Next.js + Supabase |
| 2주 | 레이아웃 + 랜딩 | 공통 UI + 홈 |
| 3주 | 서비스 요청 폼 | Step 1-4 |
| 4주 | 결제 + 비회원 | Step 5 + 비회원 결제 |
| 5주 | 인증 + 마이페이지 | 로그인/회원가입/내예약 |
| 6주 | 매니저/관리자 | 관리 기능 |
| 7주 | 테스트 + 배포 | 프로덕션 |

**총 예상 기간: 7주**
