# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

"행복안심동행"은 PHP 기반 돌봄 서비스 플랫폼을 Next.js로 재개발하는 프로젝트입니다. 고객과 돌봄 매니저를 연결하여 병원동행, 가사돌봄, 생활동행, 노인돌봄, 아이돌봄 등의 서비스를 제공합니다. 비회원(게스트) 결제를 지원합니다.

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000)
npm run build    # 프로덕션 빌드 + 타입 체크
npm run lint     # ESLint 검사
npm run start    # 프로덕션 서버 실행
```

## 아키텍처

### 기술 스택
- **프레임워크**: Next.js 14 App Router
- **데이터베이스**: Supabase (PostgreSQL)
- **인증**: Supabase Auth (고객) + 커스텀 JWT (매니저) + bcrypt (관리자)
- **결제**: 토스페이먼츠 SDK v2
- **SMS**: CoolSMS SDK (LMS/SMS 자동 감지)
- **푸시 알림**: web-push (VAPID 키 기반, 매니저 대상)
- **UI**: Tailwind CSS + shadcn/ui (new-york 스타일) + lucide-react 아이콘
- **폼**: React Hook Form + Zod 유효성 검사
- **주소 검색**: 브이월드 API (`/api/address/search` 프록시, `VWORLD_API_KEY` 환경변수)

### 3개의 독립된 인증 시스템

| 시스템 | 라우트 | 쿠키 | 미들웨어 보호 | 관련 파일 |
|--------|--------|------|-------------|----------|
| 고객 | `/auth/*` | Supabase 세션 | O (세션 갱신) | `lib/auth/customer.ts`, `lib/supabase/middleware.ts` |
| 매니저 | `/manager/*` | `manager_token` (JWT) | O (미인증→로그인) | `lib/auth/manager.ts` |
| 관리자 | `/admin/*` | `admin_session` | O (미인증→로그인) | `lib/auth/admin.ts` |

매니저 공개 경로(미들웨어 제외): `/manager/login`, `/manager/signup`, `/manager/signup-complete`, `/manager/recruit`

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

### 결제 흐름

1. `PaymentForm`에서 토스 SDK 초기화 (`widgets()` 또는 `payment()` 폴백)
2. 3가지 결제 수단: 카드결제, 토스 퀵계좌이체, 무통장입금
3. **카드/계좌이체**: 토스 결제 → `/payment/success`로 리다이렉트 → `sessionStorage`의 폼 데이터 + URL 파라미터로 `/api/payments/confirm` POST → 토스 승인 API 호출 → `service_requests` INSERT (CONFIRMED) + `payments` INSERT
4. **무통장입금**: `/api/requests/save-temp` POST → `service_requests` INSERT (PENDING_TRANSFER) + `payments` INSERT (PENDING) → `/payment/transfer-pending`으로 이동
5. 금액 검증: 백엔드에서 서비스 가격을 재계산하여 클라이언트 금액과 비교 (mismatch 방지)
6. 중복 방지: orderId로 기존 요청 존재 여부 확인

### 매니저 매칭 프로세스

- **자동 매칭**: 매니저가 대시보드에서 CONFIRMED 상태 요청에 지원 → `/api/manager/apply` → 선착순으로 즉시 MATCHED
- **수동 매칭**: 관리자가 `/api/admin/manual-match` → 매니저 검색 후 배정
- 매칭 완료 시 `sendMatchingSMS()`로 고객+매니저에게 SMS 발송, `sendPushToAllManagers()`로 푸시 알림
- 상태 전이: PENDING_TRANSFER → (입금확인) → CONFIRMED → (매칭) → MATCHED → (시간경과) → COMPLETED

### 서비스 가격

가격은 Supabase `service_prices` 테이블에서 `/api/service-prices`를 통해 동적 로드. 기본값(fallback)은 `lib/constants/pricing.ts`에 정의. `service_prices` 테이블은 한글 키(예: "병원 동행")로 저장되며, 코드에서 영문 enum 값으로 매핑. 차량지원 옵션은 `vehicle_support` 필드로 관리.

### 데이터베이스 스키마

Supabase 주요 테이블: `users`, `service_requests`, `managers`, `applications`, `payments`, `admins`, `service_prices`, `agency_applications`, `push_subscriptions`. 타입 정의는 `types/database.ts`. 마이그레이션은 `supabase/migrations/`.

`service_requests` 테이블은 `customer_id`가 nullable이며, 비회원은 `guest_email`/`guest_phone`/`guest_name` 필드를 사용.

### Supabase 클라이언트 사용법

- **서버 컴포넌트 / API 라우트**: `lib/supabase/server.ts`의 `createClient()` 사용 (RLS 적용)
- **RLS 우회가 필요한 관리 작업**: `lib/supabase/server.ts`의 `createServiceClient()` 사용 (서비스 롤 키)
- **클라이언트 컴포넌트**: `lib/supabase/client.ts`의 `createClient()` 사용

### 상태 관리 상수

- `lib/constants/status.ts`: 서비스 요청 상태 라벨(`STATUS_LABELS`), 스타일(`STATUS_STYLES`), 유효한 상태 전이 규칙 정의
- `lib/constants/pricing.ts`: 서비스 타입 enum, 영한/한영 매핑(`SERVICE_TYPE_LABELS`), 가격 계산(`calculatePrice`)
- `lib/constants/bank-account.ts`: 무통장입금 계좌 정보

### 유틸리티

- `lib/utils/validation.ts`: `validateKoreanPhone()` (010~019, 10~11자리), `formatKoreanPhone()` (하이픈 자동삽입)
- `lib/utils/format.ts`: `formatDate()` ("2026.12.02"), `formatDateTime()` ("2026.12.02 14:30")
- `lib/services/status-updater.ts`: MATCHED → COMPLETED 자동 전환 (서비스 종료 시간 경과 시, KST 기준)

## 환경 변수

필수 변수 (`.env.example` 참조):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`
- `VWORLD_API_KEY`
- `NEXT_PUBLIC_APP_URL`

선택 변수:
- `MANAGER_JWT_SECRET` (미설정 시 하드코딩된 기본값 사용)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (푸시 알림)
- `COOLSMS_API_KEY`, `COOLSMS_API_SECRET`, `COOLSMS_SENDER_NUMBER` (SMS 알림, 미설정 시 스킵)

### Capacitor 고객앱 (Android)

`capacitor-customer/` 디렉토리에 위치. 프로덕션 웹사이트(`https://donghaeng77.co.kr`)를 WebView로 감싼 네이티브 앱.

- **앱 ID**: `kr.co.donghaeng77.customer`
- **앱 이름**: 행복안심동행
- **Capacitor 버전**: 8.x
- **플러그인**: `@capacitor/app` (뒤로가기), `@capacitor/splash-screen`, `@capacitor/status-bar`

**개발/프로덕션 모드 전환**: `capacitor-customer/capacitor.config.ts`의 `DEV_MODE` 플래그
- `DEV_MODE = true`: 로컬 개발 서버(`DEV_SERVER_IP:3000`) 사용
- `DEV_MODE = false`: 프로덕션 URL(`https://donghaeng77.co.kr`) 사용

**네이티브 앱 감지**: `lib/capacitor.ts`의 `isNativeApp()` → `window.Capacitor` 존재 여부 확인
- 앱 모드에서 Header/Footer 숨김, BottomNavigation 표시 (`components/layout/PublicLayoutWrapper.tsx`)
- `document.documentElement`에 `native-app` CSS 클래스 추가 → `globals.css`에서 앱 전용 스타일 적용
- `AppHidden` 컴포넌트 (`components/home/AppHidden.tsx`): 앱에서 특정 섹션 숨김용 래퍼

**빌드 명령어**:
```bash
cd capacitor-customer
npx cap sync android          # 웹 자산 + 설정 동기화
# APK (테스터 직접 설치용)
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./android/gradlew -p android assembleDebug
# AAB (Google Play 제출용)
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" ./android/gradlew -p android bundleRelease
# 폰 설치 (USB 연결)
~/Library/Android/sdk/platform-tools/adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

**서명 키 (Google Play 배포용)**:
- Keystore 파일: `capacitor-customer/donghaeng-customer.keystore`
- Alias: `donghaeng-customer`
- 비밀번호: `donghaeng2026`
- ⚠️ keystore 분실 시 앱 업데이트 불가 — 반드시 백업 유지

**주의사항**:
- `tsconfig.json`의 `exclude`에 `capacitor-customer` 포함 필수 (Next.js 빌드에서 제외)
- 웹 코드 수정 시 앱에 영향이 가므로 `isNativeApp()` 또는 `.native-app` CSS로 분기

## 코딩 규칙

- 모든 UI는 한국어 (ko 로케일)
- 터치 접근성을 위해 인터랙티브 요소에 `min-h-[44px]` 사용
- shadcn/ui 컴포넌트는 CSS 변수로 테마 적용 (`globals.css`에 정의, `tailwind.config.ts`에서 설정)
- 경로 별칭 `@/`는 프로젝트 루트에 매핑
- Supabase 쿼리에서 타입 캐스팅 시 `as any` 사용 (RLS 타입 이슈 우회)
