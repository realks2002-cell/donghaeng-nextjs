# 매니저 PWA 푸시 알림 수정 보고서

**작성일**: 2026-03-05
**상태**: 완료
**빌드**: 성공

---

## 1. 문제 요약

매니저 PWA 앱에서 푸시 알림이 수신되지 않는 버그가 발생했습니다.

### 근본 원인

`PushNotificationSetup.tsx`가 `useEffect` 내에서 `Notification.requestPermission()`을 호출했습니다.
iOS Safari/PWA는 **사용자 제스처(클릭/탭) 없이 호출된 권한 요청을 무시**하므로, 알림 권한 팝업이 표시되지 않았고, `push_subscriptions` 테이블이 비어 있어 알림 전송 자체가 불가능했습니다.

---

## 2. 수정 내역

### 핵심 변경

| Before | After |
|--------|-------|
| `useEffect` → `requestPermission()` → iOS에서 무시 | "알림 켜기" 버튼 `onClick` → `requestPermission()` → iOS에서 정상 팝업 |

### 신규 파일 (4개)

| 파일 | 역할 |
|------|------|
| `lib/push-utils.ts` | `subscribePush()` (제스처 필수), `resubscribeIfGranted()` (자동 재구독) |
| `components/hooks/useNotificationStatus.ts` | 5-상태 추적 훅 (`unsupported` / `default` / `denied` / `granted` / `subscribed`) |
| `components/NotificationBanner.tsx` | 알림 배너 UI — 파란색(미설정), 빨간색(차단), 자동숨김(구독완료) |
| `app/api/push/test/route.ts` | 테스트 푸시 발송 API (매니저 인증 필요) |

### 수정 파일 (2개)

| 파일 | 변경 내용 |
|------|-----------|
| `components/PushNotificationSetup.tsx` | `requestPermission()` 호출 제거 → `resubscribeIfGranted()`만 호출 (기존 허용된 경우만 재구독) |
| `app/manager/ManagerLayoutClient.tsx` | `<NotificationBanner />` 추가 + 사이드바/모바일 헤더에 알림 상태 아이콘 표시 |

---

## 3. 구현 상세

### 3.1 `lib/push-utils.ts`

두 가지 핵심 함수를 제공합니다:

- **`subscribePush()`**: 사용자 제스처(클릭) 핸들러에서만 호출. `requestPermission()` → `pushManager.subscribe()` → 서버 저장. 반환값: `'subscribed' | 'denied' | 'unsupported' | 'error'`
- **`resubscribeIfGranted()`**: `useEffect`에서 안전하게 호출 가능. 이미 `'granted'` 상태일 때만 구독 재생성. 권한 요청 없음.

### 3.2 `components/hooks/useNotificationStatus.ts`

5단계 상태를 추적하는 React 훅:

```
unsupported → 브라우저가 지원하지 않음
default     → 아직 권한 요청 안 함
denied      → 사용자가 차단함
granted     → 허용했으나 구독 미완료
subscribed  → 허용 + 구독 활성
```

`recheckStatus()` 함수로 상태 재확인 가능 (구독 후 즉시 UI 업데이트).

### 3.3 `components/NotificationBanner.tsx`

| 상태 | 배너 |
|------|------|
| `default` / `granted` | 파란색 배너 + "알림 켜기" 버튼 |
| `denied` | 빨간색 경고 배너 (브라우저 설정 안내) |
| `subscribed` | 자동 숨김 |
| `unsupported` | 자동 숨김 |

모든 배너에 닫기(X) 버튼 포함. 터치 접근성을 위해 `min-h-[44px]` 적용.

### 3.4 `ManagerLayoutClient.tsx` 알림 상태 표시

- **데스크탑 사이드바**: 하단에 알림 상태 텍스트 (녹색 "알림 켜짐" / 빨간색 "알림 차단됨" / 회색 "알림 꺼짐")
- **모바일 헤더**: 햄버거 메뉴 옆에 알림 상태 아이콘 (`BellRing` / `BellOff` / `Bell`)

### 3.5 테스트 API

`POST /api/push/test` — 매니저 세션 인증 후 `sendPushToAllManagers()`로 전체 매니저에게 테스트 푸시 발송.

---

## 4. iOS PWA 호환성 근거

- iOS Safari 16.4+ 에서 PWA 푸시 알림 지원 (Web Push API)
- **반드시 사용자 제스처(click/tap)에서 `requestPermission()` 호출** 필요
- `useEffect` 내 자동 호출은 iOS에서 무시됨 (Silent deny)
- 수정 후: "알림 켜기" 버튼의 `onClick` 핸들러에서 호출하여 정상 동작

---

## 5. 빌드 결과

`npm run build` 성공 — 에러 없음.

---

## 6. 테스트 체크리스트

- [ ] 매니저 로그인 후 파란색 "알림 켜주세요" 배너 표시 확인
- [ ] "알림 켜기" 버튼 클릭 시 브라우저 권한 팝업 표시 확인
- [ ] 권한 허용 후 배너 자동 숨김 + 사이드바 "알림 켜짐" 표시 확인
- [ ] 권한 차단 시 빨간색 경고 배너 표시 확인
- [ ] 페이지 새로고침 후 자동 재구독 (배너 미표시) 확인
- [ ] `POST /api/push/test` 호출 시 푸시 알림 수신 확인
- [ ] iOS PWA(홈 화면에 추가)에서 동일 동작 확인
