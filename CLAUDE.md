# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

"행복안심동행"은 PHP 기반 돌봄 서비스 플랫폼을 Next.js로 재개발하는 프로젝트입니다. 고객과 돌봄 매니저를 연결하여 병원동행, 가사돌봄, 생활동행, 노인돌봄, 아이돌봄 등의 서비스를 제공합니다. 비회원(게스트) 결제를 지원합니다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
npm run start    # 프로덕션 서버 실행
```

## 아키텍처

### 기술 스택
- **프레임워크**: Next.js 14 App Router
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (고객) + 커스텀 JWT (매니저) + bcrypt (관리자)
- **결제**: 토스페이먼츠 SDK v1
- **UI**: Tailwind CSS + shadcn/ui (new-york 스타일) + lucide-react 아이콘
- **폼**: React Hook Form + Zod 유효성 검사
- **주소 검색**: VWorld API (`/api/address/search`를 통해 프록시)

### 3개의 독립된 인증 시스템

1. **고객** (`/auth/*`): Supabase Auth 사용. 세션 쿠키는 `lib/supabase/middleware.ts`에서 관리. 서버 클라이언트는 `lib/supabase/server.ts`, 브라우저 클라이언트는 `lib/supabase/client.ts`.
2. **매니저** (`/manager/*`): 커스텀 JWT 인증. `manager_token` 쿠키 사용. 세션 검증은 `lib/auth/manager.ts`. 미들웨어가 미인증 매니저 페이지를 `/manager/login`으로 리다이렉트.
3. **관리자** (`/admin/*`): 쿠키 기반 세션 + bcrypt 비밀번호 해싱. 미들웨어 보호 없음 - 페이지/API 레벨에서 인증 확인.

### 라우트 그룹과 레이아웃

- **공개 페이지** (`/`, `/about`, `/faq`, `/service-guide`): 루트 레이아웃(Header/Footer 포함) 사용
- **서비스 요청 흐름** (`/requests/new`): 다단계 폼, 로그인 없이 접근 가능
- **관리자** (`/admin/*`): 사이드바 네비게이션 포함 자체 레이아웃. 루트 `layout.tsx`에서 pathname 체크로 Header/Footer 제외
- **매니저** (`/manager/*`): 사이드바 네비게이션 포함 자체 레이아웃. 로그인/회원가입 페이지는 사이드바 없이 렌더링

### 서비스 요청 폼 (핵심 기능)

`components/forms/ServiceRequestForm/`에 위치. 7단계 위자드 흐름:

| 단계 | 컴포넌트 | 설명 |
|------|----------|------|
| 1 | Step1UserType | 회원/비회원 선택 |
| 1.5 | Step1_5GuestInfo | 신청자 정보 (이름, 전화번호, 주소) |
| 2 | Step2Service | 서비스 타입 선택 |
| 3 | Step3DateTime | 날짜/시간/소요시간 선택 |
| 3.5 | Step3_5ManagerSelect | 지정 매니저 선택 (선택사항) |
| 4 | Step4Details | 상세 요청사항 |
| 5 | Step5Payment | 토스페이먼츠 결제 |

단계 이동은 소수점 숫자(1, 1.5, 2, 3, 3.5, 4, 5)를 사용. 로그인 회원은 Step 1을 건너뛰고 1.5부터 시작. 폼 상태는 `useState`로 관리하며 타입은 `components/forms/ServiceRequestForm/types.ts`의 `ServiceRequestFormData`에 정의.

### 서비스 가격

가격은 Supabase `service_prices` 테이블에서 `/api/service-prices`를 통해 동적 로드. 기본값(fallback)은 `lib/constants/pricing.ts`에 정의. `service_prices` 테이블은 한글 키(예: "병원 동행")로 저장되며, 코드에서 영문 enum 값으로 매핑.

### 데이터베이스 스키마

Supabase 주요 테이블: `users`, `service_requests`, `managers`, `applications`, `payments`, `admins`, `service_prices`. 타입 정의는 `types/database.ts`. 마이그레이션은 `supabase/migrations/`.

`service_requests` 테이블은 `customer_id`가 nullable이며, 비회원은 `guest_email`/`guest_phone`/`guest_name` 필드를 사용.

### Supabase 클라이언트 사용법

- **서버 컴포넌트 / API 라우트**: `lib/supabase/server.ts`의 `createClient()` 사용 (RLS 적용)
- **RLS 우회가 필요한 관리 작업**: `lib/supabase/server.ts`의 `createServiceClient()` 사용 (서비스 롤 키)
- **클라이언트 컴포넌트**: `lib/supabase/client.ts`의 `createClient()` 사용

## 환경 변수

필수 변수 (`.env.example` 참조):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`
- `VWORLD_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `MANAGER_JWT_SECRET` (미설정 시 하드코딩된 기본값 사용)

## 코딩 규칙

- 모든 UI는 한국어 (ko 로케일)
- 터치 접근성을 위해 인터랙티브 요소에 `min-h-[44px]` 사용
- shadcn/ui 컴포넌트는 CSS 변수로 테마 적용 (`globals.css`에 정의, `tailwind.config.ts`에서 설정)
- 경로 별칭 `@/`는 프로젝트 루트에 매핑
