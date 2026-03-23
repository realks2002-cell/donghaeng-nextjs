# recruit (매니저 모집 페이지) Analysis Report

> **Analysis Type**: Gap Analysis (Code-based, no design document)
>
> **Project**: 행복안심동행
> **Analyst**: gap-detector
> **Date**: 2026-03-05
> **Design Doc**: N/A (기능 요건 기반 분석)

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

설계 문서가 존재하지 않으므로, 기대 기능 요건 10개 항목을 기준으로 실제 구현 코드를 분석한다.
라우팅/레이아웃 통합, SEO, 접근성, 반응형 디자인, 코드 품질을 종합 평가한다.

### 1.2 Analysis Scope

- **기능 요건**: 10개 항목 (아래 상세)
- **Implementation Files**:
  - `app/manager/recruit/page.tsx` -- 메인 페이지
  - `components/layout/Header.tsx` -- 네비게이션 링크
  - `components/layout/PublicLayoutWrapper.tsx` -- 레이아웃 제어
  - `app/manager/ManagerLayoutClient.tsx` -- 매니저 레이아웃 예외처리
  - `middleware.ts` -- 라우트 보호 제외
  - `app/manager/layout.tsx` -- 매니저 레이아웃 진입점
- **Analysis Date**: 2026-03-05

---

## 2. Overall Scores

| Category | Score | Status |
|----------|:-----:|:------:|
| Design Match (기능 요건 일치) | 95% | ✅ |
| Architecture Compliance | 100% | ✅ |
| Convention Compliance | 88% | ✅ |
| Code Quality | 90% | ✅ |
| **Overall** | **93%** | **✅** |

---

## 3. Feature Requirement Gap Analysis

### 3.1 Requirement Checklist

| # | Requirement | Status | Implementation Location | Notes |
|:-:|-------------|:------:|-------------------------|-------|
| 1 | `/manager/recruit` 공개 접근 가능 | ✅ | `middleware.ts:25` | `managerPublicPaths`에 포함 |
| 2 | 서비스 영역 소개 (6종) | ✅ | `page.tsx:35-67` | 병원동행, 가사돌봄, 생활동행, 노인돌봄, 아이돌봄, 기타 모두 포함 |
| 3 | 매니저 혜택 안내 | ✅ | `page.tsx:69-90` | 4개 혜택 항목 (자유로운 시간 선택, 정당한 보수, 전문 교육 지원, 안전한 근무 환경) |
| 4 | 지원 자격 안내 | ✅ | `page.tsx:92-101` | 4개 자격 요건 리스트 |
| 5 | 지원 방법 안내 + signup 링크 | ✅ | `page.tsx:103-110`, `page.tsx:22-27` | 텍스트 안내 + 상단 "매니저 지원하기" 버튼 (`/manager/signup`) |
| 6 | 매니저 로그인 링크 | ✅ | `page.tsx:16-21` | 상단 "매니저 로그인" 버튼 (`/manager/login`) |
| 7 | 헤더 네비게이션 "매니저 지원" 링크 | ✅ | `Header.tsx:84-86` (desktop), `Header.tsx:153-155` (mobile) | 비로그인 상태에서만 표시 |
| 8 | 매니저 레이아웃에서 사이드바 없이 렌더링 | ✅ | `ManagerLayoutClient.tsx:37` | pathname 체크로 `children`만 반환 |
| 9 | SEO 메타데이터 | ✅ | `page.tsx:4-7` | `title`과 `description` 설정 완료 |
| 10 | 모바일 반응형 디자인 | ⚠️ | `page.tsx:11-14`, `page.tsx:41` | 반응형 grid 적용되었으나 접근성 이슈 존재 |

### 3.2 Match Rate Summary

```
+---------------------------------------------+
|  Feature Requirement Match Rate: 95%         |
+---------------------------------------------+
|  ✅ Full Match:      9 items (90%)            |
|  ⚠️ Partial Match:   1 item  (10%)            |
|  ❌ Not Implemented:  0 items (0%)             |
+---------------------------------------------+
```

---

## 4. Detailed Analysis

### 4.1 Routing & Layout Integration

**Status: ✅ Correct**

recruit 페이지는 3개 레이어에서 정확히 처리되고 있다.

| Layer | File | Logic | Status |
|-------|------|-------|:------:|
| Middleware | `middleware.ts:25` | `managerPublicPaths`에 `/manager/recruit` 포함하여 인증 우회 | ✅ |
| Public Layout | `PublicLayoutWrapper.tsx:10` | `/manager/recruit`를 매니저 페이지 제외 조건에서 빼서 Header/Footer 포함 | ✅ |
| Manager Layout | `ManagerLayoutClient.tsx:37` | pathname 체크로 사이드바 없이 `children`만 반환 | ✅ |

**흐름 정리:**
1. 사용자가 `/manager/recruit` 접근
2. `middleware.ts`: `managerPublicPaths`에 포함 -> 인증 불필요
3. `PublicLayoutWrapper.tsx`: `!pathname.startsWith('/manager/recruit')` 조건으로 공개 레이아웃(Header/Footer) 적용
4. `app/manager/layout.tsx`: `ManagerLayoutClient`로 감싸짐
5. `ManagerLayoutClient.tsx`: recruit 경로 감지 -> 사이드바 없이 `children`만 반환

결과적으로 recruit 페이지는 **공개 Header + 페이지 콘텐츠 + Footer** 구조로 렌더링된다.

### 4.2 SEO Metadata

**Status: ✅ Implemented**

```typescript
// app/manager/recruit/page.tsx:4-7
export const metadata: Metadata = {
  title: '매니저 모집 - 행복안심동행',
  description: '행복안심동행 매니저를 모집합니다. 지원 자격과 혜택을 확인하세요.',
}
```

| SEO Item | Status | Notes |
|----------|:------:|-------|
| `title` | ✅ | 브랜드명 포함 |
| `description` | ✅ | 적절한 설명 |
| `og:title` | ⚠️ | 미설정 (루트 layout 기본값 사용) |
| `og:description` | ⚠️ | 미설정 (루트 layout 기본값 사용) |
| `keywords` | - | 미설정 (선택사항) |

### 4.3 Mobile Responsive Design

**Status: ⚠️ Partial**

| 항목 | Status | 상세 |
|------|:------:|------|
| Responsive Grid | ✅ | `grid-cols-1 md:grid-cols-2` 적용 (서비스 영역) |
| Responsive Padding | ✅ | `px-4 sm:px-6`, `pt-24 sm:pt-44` 적용 |
| Responsive Typography | ✅ | `text-3xl sm:text-4xl` (제목) |
| Responsive Button Layout | ✅ | `flex-col sm:flex-row` (CTA 버튼) |
| Header Mobile Menu | ✅ | `Header.tsx`에서 모바일 메뉴에 "매니저 지원" 링크 포함 |

### 4.4 Accessibility (접근성)

**Status: ⚠️ Issues Found**

| 항목 | Status | 상세 |
|------|:------:|------|
| 터치 타겟 크기 (CTA 버튼) | ⚠️ | `min-h-[36px]` 사용 -- CLAUDE.md 기준 `min-h-[44px]` 필요 |
| 시맨틱 HTML | ✅ | `<section>`, `<h1>`, `<h2>`, `<h3>`, `<ul>`, `<li>` 적절히 사용 |
| 헤딩 계층 | ✅ | h1 -> h2 -> h3 순서 올바름 |
| 링크 구분 | ✅ | 버튼 스타일로 명확히 구분 |
| 색상 대비 | ✅ | `text-gray-600`/`text-gray-700` on white 배경 -- 충분한 대비 |

---

## 5. Code Quality Analysis

### 5.1 Component Structure

| 항목 | Status | 상세 |
|------|:------:|------|
| 서버 컴포넌트 사용 | ✅ | `'use client'` 없음 -- SEO에 유리한 서버 컴포넌트 |
| 파일 크기 | ✅ | 114줄 -- 적절한 크기 |
| 단일 책임 원칙 | ✅ | 하나의 페이지, 하나의 역할 |
| 외부 의존성 | ✅ | `next/link`, `next` 타입만 사용 -- 최소 의존성 |

### 5.2 Code Smells

| Type | File | Location | Description | Severity |
|------|------|----------|-------------|----------|
| 반복 패턴 | page.tsx | L42-66 | 서비스 카드 6개가 동일 구조로 반복 -- 배열 + map으로 추출 가능 | Info |
| 반복 패턴 | page.tsx | L72-89 | 혜택 항목 4개 동일 구조 반복 | Info |
| 하드코딩 텍스트 | page.tsx | 전체 | 모든 콘텐츠가 하드코딩 -- 정적 페이지이므로 허용 가능 | Info |

### 5.3 Security Issues

| Severity | Issue | Status |
|----------|-------|:------:|
| 보안 이슈 없음 | 정적 콘텐츠 페이지, 사용자 입력 없음, API 호출 없음 | ✅ |

---

## 6. Convention Compliance

### 6.1 Naming Convention Check

| Category | Convention | Actual | Status |
|----------|-----------|--------|:------:|
| Page Component | PascalCase | `RecruitPage` | ✅ |
| File Name | page.tsx (Next.js convention) | `page.tsx` | ✅ |
| Folder Name | kebab-case | `recruit` | ✅ |

### 6.2 Import Order Check

```typescript
// page.tsx 실제 import 순서
import Link from 'next/link'           // 1. External library ✅
import { Metadata } from 'next'        // 2. External library ✅
```

| Rule | Status |
|------|:------:|
| External libraries first | ✅ |
| No internal imports needed | ✅ (정적 페이지) |

### 6.3 Architecture Compliance

| 항목 | Status | 상세 |
|------|:------:|------|
| Layer 배치 | ✅ | `app/manager/recruit/page.tsx` -- Presentation layer에 적절히 위치 |
| 의존성 방향 | ✅ | 외부 의존성만 사용 (next/link, next) |
| 직접 Infrastructure 접근 | ✅ | 없음 (정적 페이지) |

### 6.4 CLAUDE.md Convention Check

| Rule | Status | Detail |
|------|:------:|--------|
| UI 한국어 | ✅ | 모든 텍스트 한국어 |
| 터치 접근성 min-h-[44px] | ❌ | CTA 버튼에 `min-h-[36px]` 사용 |
| shadcn/ui 컴포넌트 사용 | - | 해당 없음 (커스텀 스타일) |
| `@/` 경로 별칭 | - | 내부 import 없음 |

### 6.5 Convention Score

```
+---------------------------------------------+
|  Convention Compliance: 88%                  |
+---------------------------------------------+
|  Naming:            100%                     |
|  Import Order:      100%                     |
|  Architecture:      100%                     |
|  CLAUDE.md Rules:    50% (1/2 applicable)    |
+---------------------------------------------+
```

---

## 7. Differences Found

### 7.1 ⚠️ Issues (Minor)

| # | Item | Location | Description | Impact |
|:-:|------|----------|-------------|--------|
| 1 | 터치 타겟 크기 | `page.tsx:18,24` | CTA 버튼 `min-h-[36px]` -> `min-h-[44px]` 필요 | Low |
| 2 | OG 메타데이터 미설정 | `page.tsx:4-7` | `openGraph` 속성 미설정 (SNS 공유 시 루트 메타데이터 사용됨) | Low |
| 3 | 서비스 카드 반복 코드 | `page.tsx:42-66` | 6개 카드 동일 구조 반복 -- 데이터 배열로 리팩토링 권장 | Info |
| 4 | 혜택 항목 반복 코드 | `page.tsx:72-89` | 4개 항목 동일 구조 반복 -- 데이터 배열로 리팩토링 권장 | Info |

### 7.2 ❌ Missing Features (Design O, Implementation X)

없음.

### 7.3 ✅ Added Features (Design X, Implementation O)

| Item | Implementation Location | Description |
|------|------------------------|-------------|
| 모바일 앱 연동 | `mobile/src/screens/more/MoreScreen.tsx:51`, `MyPageScreen.tsx:77` | WebView로 recruit 페이지 연결 (기대 요건에 없었으나 구현됨) |

---

## 8. Architecture Verification

### 8.1 Rendering Flow Diagram

```
[User Request: /manager/recruit]
         |
         v
[middleware.ts]
  managerPublicPaths includes '/manager/recruit'
  -> No auth required, pass through
         |
         v
[app/layout.tsx]
  RootLayout -> PublicLayoutWrapper
         |
         v
[PublicLayoutWrapper.tsx]
  pathname.startsWith('/manager') && !pathname.startsWith('/manager/recruit')
  -> recruit is NOT excluded -> Header + Footer rendered
         |
         v
[app/manager/layout.tsx]
  ManagerLayout -> ManagerLayoutClient
         |
         v
[ManagerLayoutClient.tsx]
  pathname === '/manager/recruit'
  -> Sidebar excluded, children only
         |
         v
[app/manager/recruit/page.tsx]
  RecruitPage (Server Component)
  -> Static content rendered
```

### 8.2 Layout Nesting Verification

recruit 페이지가 `PublicLayoutWrapper`(Header/Footer 포함)와 `ManagerLayoutClient`(사이드바 제외) 양쪽에서 올바르게 처리되는 것을 확인함. 두 레이아웃이 충돌 없이 동작한다.

---

## 9. Recommended Actions

### 9.1 Immediate (권장 수정)

| Priority | Item | File | Description |
|----------|------|------|-------------|
| ⚠️ 1 | 터치 타겟 크기 수정 | `app/manager/recruit/page.tsx:18,24` | `min-h-[36px]` -> `min-h-[44px]`로 변경 (CLAUDE.md 규칙 준수) |

### 9.2 Short-term (개선 권장)

| Priority | Item | File | Expected Impact |
|----------|------|------|-----------------|
| Info 1 | OG 메타데이터 추가 | `page.tsx:4-7` | SNS 공유 시 전용 제목/설명 표시 |
| Info 2 | 서비스 카드 리팩토링 | `page.tsx:42-66` | 코드 중복 제거, 유지보수성 향상 |
| Info 3 | 혜택 항목 리팩토링 | `page.tsx:72-89` | 코드 중복 제거, 유지보수성 향상 |

### 9.3 Long-term (선택사항)

| Item | Notes |
|------|-------|
| 콘텐츠 CMS 연동 | 현재 하드코딩된 콘텐츠를 관리 시스템에서 편집 가능하도록 변경 |
| 지원 현황 표시 | "현재 N명의 매니저가 활동 중" 등 동적 정보 추가 |

---

## 10. Design Document Updates Needed

설계 문서가 존재하지 않으므로, 구현 기반으로 설계 문서 작성이 필요할 경우 다음 항목을 포함해야 한다:

- [ ] recruit 페이지 기능 요건 명세
- [ ] 라우팅/레이아웃 통합 규칙 명시
- [ ] SEO 메타데이터 스펙
- [ ] 모바일 앱 WebView 연동 명세

---

## 11. Next Steps

- [ ] 터치 타겟 크기 `min-h-[44px]` 수정 (유일한 실질적 이슈)
- [ ] 필요 시 리팩토링 적용 (우선순위 낮음)
- [ ] 완료 보고서 작성 (`recruit.report.md`)

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-03-05 | Initial analysis | gap-detector |
