import { test, expect, Page } from '@playwright/test'

// ─── API Mock 헬퍼 ─────────────────────────────────────────────

async function mockAPIs(page: Page) {
  // 서비스 가격 API
  await page.route('**/api/service-prices', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        prices: {
          '병원 동행': 20000,
          '가사돌봄': 18000,
          '생활동행': 18000,
          '노인 돌봄': 22000,
          '아이 돌봄': 20000,
          '기타': 20000,
        },
      }),
    }),
  )

  // 주소 검색 API
  await page.route('**/api/address/search*', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        items: [
          { address: '서울특별시 강남구 테헤란로 123', x: 127.028, y: 37.498 },
        ],
      }),
    }),
  )

  // 매니저 검색 API
  await page.route('**/api/managers/search', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        count: 1,
        managers: [
          {
            id: 'mgr-001',
            name: '김매니저',
            phone: '010-9999-8888',
            address: '서울특별시 강남구',
            specialty: '병원동행 전문',
          },
        ],
      }),
    }),
  )

  // 임시 저장 API
  await page.route('**/api/requests/save-temp', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: true,
        request_id: 'test-order-001',
        estimated_price: 60000,
      }),
    }),
  )

  // TossPayments SDK v2 스크립트 로드 mock
  // loadTossPayments()는 스크립트 로드 후 window.TossPayments(clientKey)를 호출
  await page.route('**/js.tosspayments.com/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: `
        window.TossPayments = function(clientKey) {
          return {
            widgets: function(options) {
              return {
                setAmount: function() { return Promise.resolve(); },
                renderPaymentMethods: function(opts) {
                  document.querySelector(opts.selector).innerHTML = '<div data-testid="mock-payment-widget">결제 위젯 (테스트)</div>';
                  return Promise.resolve();
                },
                renderAgreement: function(opts) {
                  document.querySelector(opts.selector).innerHTML = '<div data-testid="mock-agreement">약관 (테스트)</div>';
                  return Promise.resolve();
                },
                requestPayment: function(opts) {
                  return Promise.resolve();
                }
              };
            },
            payment: function() { return {}; }
          };
        };
      `,
    }),
  )
}

// 내일 날짜 (YYYY-MM-DD)
function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

// ─── Step 1 → Step 1.5: 비회원 선택 후 신청자 정보 입력까지 이동 ──

async function completeStep1AsGuest(page: Page) {
  await page.getByLabel('비회원').check()
  await page.getByRole('button', { name: '다음' }).click()
}

async function completeStep1_5(page: Page) {
  await page.fill('#guest_name', '테스트 사용자')
  await page.fill('#guest_phone', '010-1234-5678')
  await page.fill('#guest_address', '서울 강남구')
  await page.getByRole('button', { name: '주소 검색' }).click()
  // 주소 자동 선택 (mock은 1건 반환 → 자동 선택)
  await expect(page.getByText('주소가 선택되었습니다')).toBeVisible()
  await page.fill('#guest_address_detail', '101동 202호')
  // 개인정보 수집동의 체크
  await page.getByLabel('개인정보 수집 및 이용에 동의합니다').check()
  await page.getByRole('button', { name: '다음' }).click()
}

async function completeStep2(page: Page) {
  await page.getByLabel('병원 동행').check()
  await page.getByRole('button', { name: '다음' }).click()
}

async function completeStep3(page: Page) {
  const tomorrow = getTomorrowDate()
  await page.fill('#service_date', tomorrow)
  await page.selectOption('#start_time', '10:00')
  await page.getByText('3시간', { exact: true }).click()
  await page.getByRole('button', { name: '다음' }).click()
}

async function skipStep3_5(page: Page) {
  await page.getByRole('button', { name: '다음' }).click()
}

async function completeStep4(page: Page) {
  await page.fill('#details', '테스트 요청사항입니다. 휠체어가 필요합니다.')
  await page.getByRole('button', { name: '다음' }).click()
}

// ─── 테스트 ────────────────────────────────────────────────────

test.describe('서비스 신청 폼 E2E', () => {
  test.beforeEach(async ({ page }) => {
    await mockAPIs(page)
    await page.goto('/requests/new')
    // 폼 로딩 대기
    await expect(page.getByText('서비스 요청')).toBeVisible({ timeout: 15000 })
  })

  // ═══════════════════════════════════════════════════════
  // Step 1: 회원/비회원 선택
  // ═══════════════════════════════════════════════════════

  test.describe('Step 1 - 회원/비회원 선택', () => {
    test('비회원 선택 시 Step 1.5로 이동', async ({ page }) => {
      await expect(page.getByText('회원이신가요?')).toBeVisible()
      await page.getByLabel('비회원').check()
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('신청자 정보를 입력해주세요')).toBeVisible()
    })

    test('아무것도 선택하지 않고 다음 클릭 시 에러 토스트', async ({ page }) => {
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('회원 여부를 선택해주세요.', { exact: true })).toBeVisible()
    })

    test('회원 선택 시 로그인 페이지로 리다이렉트', async ({ page }) => {
      await page.locator('input[name="user_type"][value="member"]').check()
      await page.getByRole('button', { name: '다음' }).click()
      await page.waitForURL('**/auth/login**')
      expect(page.url()).toContain('/auth/login')
      expect(page.url()).toContain('redirect')
    })
  })

  // ═══════════════════════════════════════════════════════
  // Step 1.5: 신청자 정보
  // ═══════════════════════════════════════════════════════

  test.describe('Step 1.5 - 신청자 정보', () => {
    test.beforeEach(async ({ page }) => {
      await completeStep1AsGuest(page)
    })

    test('필수 필드 미입력 시 에러 토스트', async ({ page }) => {
      // 이름 없이 다음
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('이름을 입력해주세요')).toBeVisible()
    })

    test('전화번호 형식 오류 시 에러 토스트', async ({ page }) => {
      await page.fill('#guest_name', '테스트')
      await page.fill('#guest_phone', '12345')
      await page.fill('#guest_address', '서울')
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('올바른 전화번호 형식을 입력해주세요')).toBeVisible()
    })

    test('주소 검색 후 자동 선택', async ({ page }) => {
      await page.fill('#guest_address', '서울 강남구')
      await page.getByRole('button', { name: '주소 검색' }).click()
      await expect(page.getByText('주소가 선택되었습니다')).toBeVisible()
      // 주소 필드가 검색 결과로 업데이트
      await expect(page.locator('#guest_address')).toHaveValue('서울특별시 강남구 테헤란로 123')
    })

    test('정보 입력 완료 후 Step 2로 이동', async ({ page }) => {
      await completeStep1_5(page)
      await expect(page.getByText('어떤 서비스가 필요하신가요?')).toBeVisible()
    })

    test('이전 버튼 클릭 시 Step 1로 복귀', async ({ page }) => {
      await page.getByRole('button', { name: '이전' }).click()
      await expect(page.getByText('회원이신가요?')).toBeVisible()
    })
  })

  // ═══════════════════════════════════════════════════════
  // Step 2: 서비스 선택
  // ═══════════════════════════════════════════════════════

  test.describe('Step 2 - 서비스 선택', () => {
    test.beforeEach(async ({ page }) => {
      await completeStep1AsGuest(page)
      await completeStep1_5(page)
    })

    test('6개 서비스 옵션 표시', async ({ page }) => {
      const serviceRadios = page.locator('input[name="service_type"]')
      await expect(serviceRadios).toHaveCount(6)
      await expect(page.locator('input[value="hospital_companion"]')).toBeVisible()
      await expect(page.locator('input[value="daily_care"]')).toBeVisible()
      await expect(page.locator('input[value="life_companion"]')).toBeVisible()
      await expect(page.locator('input[value="elderly_care"]')).toBeVisible()
      await expect(page.locator('input[value="child_care"]')).toBeVisible()
      await expect(page.locator('input[value="other"]')).toBeVisible()
    })

    test('서비스 미선택 시 에러 토스트', async ({ page }) => {
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('서비스를 선택해주세요')).toBeVisible()
    })

    test('서비스 선택 후 Step 3으로 이동', async ({ page }) => {
      await completeStep2(page)
      await expect(page.getByText('언제 서비스가 필요하신가요?')).toBeVisible()
    })

    test('가격 표시 확인 (병원 동행: 20,000원/시간)', async ({ page }) => {
      await expect(page.getByText('20,000원/시간').first()).toBeVisible()
    })

    test('이전 버튼 클릭 시 Step 1.5로 복귀', async ({ page }) => {
      await page.getByRole('button', { name: '이전' }).click()
      await expect(page.getByText('신청자 정보를 입력해주세요')).toBeVisible()
    })
  })

  // ═══════════════════════════════════════════════════════
  // Step 3: 날짜/시간 선택
  // ═══════════════════════════════════════════════════════

  test.describe('Step 3 - 날짜/시간 선택', () => {
    test.beforeEach(async ({ page }) => {
      await completeStep1AsGuest(page)
      await completeStep1_5(page)
      await completeStep2(page)
    })

    test('날짜 미선택 시 에러 토스트', async ({ page }) => {
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('서비스 날짜를 선택해주세요')).toBeVisible()
    })

    test('시간 미선택 시 에러 토스트', async ({ page }) => {
      await page.fill('#service_date', getTomorrowDate())
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('서비스 시간을 선택해주세요')).toBeVisible()
    })

    test('소요시간 미선택 시 에러 토스트', async ({ page }) => {
      await page.fill('#service_date', getTomorrowDate())
      await page.selectOption('#start_time', '10:00')
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByText('예상 소요 시간을 선택해주세요')).toBeVisible()
    })

    test('예상 금액 계산 표시 (20,000 × 3시간 = 60,000원)', async ({ page }) => {
      await page.fill('#service_date', getTomorrowDate())
      await page.selectOption('#start_time', '10:00')
      await page.getByText('3시간', { exact: true }).click()
      await expect(page.getByText('60,000원')).toBeVisible()
    })

    test('소요시간 변경 시 예상 금액 업데이트', async ({ page }) => {
      await page.fill('#service_date', getTomorrowDate())
      await page.selectOption('#start_time', '10:00')
      await page.getByText('2시간', { exact: true }).click()
      await expect(page.getByText('40,000원')).toBeVisible()
      await page.getByText('5시간', { exact: true }).click()
      await expect(page.getByText('100,000원')).toBeVisible()
    })

    test('모든 필드 선택 후 Step 3.5로 이동', async ({ page }) => {
      await completeStep3(page)
      await expect(page.getByText('원하는 매니저가 있으신가요?')).toBeVisible()
    })

    test('이전 버튼 클릭 시 Step 2로 복귀', async ({ page }) => {
      await page.getByRole('button', { name: '이전' }).click()
      await expect(page.getByText('어떤 서비스가 필요하신가요?')).toBeVisible()
    })
  })

  // ═══════════════════════════════════════════════════════
  // Step 3.5: 매니저 지정
  // ═══════════════════════════════════════════════════════

  test.describe('Step 3.5 - 매니저 지정', () => {
    test.beforeEach(async ({ page }) => {
      await completeStep1AsGuest(page)
      await completeStep1_5(page)
      await completeStep2(page)
      await completeStep3(page)
    })

    test('건너뛰기 (매니저 미지정) 시 Step 4로 이동', async ({ page }) => {
      await skipStep3_5(page)
      await expect(page.getByText('추가로 알려주실 사항이 있나요?')).toBeVisible()
    })

    test('매니저 검색 및 선택', async ({ page }) => {
      await page.fill('#manager_search_name', '김매니저')
      await page.getByRole('button', { name: '매니저 찾기' }).click()
      await expect(page.getByText('1명의 매니저를 찾았습니다')).toBeVisible()
      await expect(page.getByText('김매니저')).toBeVisible()
      await expect(page.getByText('010-9999-8888')).toBeVisible()
      await expect(page.getByText('병원동행 전문')).toBeVisible()

      // 매니저 선택
      await page.getByText('김매니저').click()
      await expect(page.getByText('매니저가 선택되었습니다')).toBeVisible()
    })

    test('선택된 매니저 취소', async ({ page }) => {
      await page.fill('#manager_search_name', '김매니저')
      await page.getByRole('button', { name: '매니저 찾기' }).click()
      await page.getByText('김매니저').click()
      await expect(page.getByText('매니저가 선택되었습니다')).toBeVisible()

      // 취소 버튼 클릭
      await page.getByRole('button', { name: '선택 취소' }).click()
      await expect(page.getByText('매니저가 선택되었습니다')).not.toBeVisible()
    })

    test('검색 조건 없이 검색 시 에러 토스트', async ({ page }) => {
      await page.getByRole('button', { name: '매니저 찾기' }).click()
      await expect(page.getByText('전화번호 또는 이름을 입력해주세요')).toBeVisible()
    })

    test('이전 버튼 클릭 시 Step 3으로 복귀', async ({ page }) => {
      await page.getByRole('button', { name: '이전' }).click()
      await expect(page.getByText('언제 서비스가 필요하신가요?')).toBeVisible()
    })
  })

  // ═══════════════════════════════════════════════════════
  // Step 4: 상세 요청사항
  // ═══════════════════════════════════════════════════════

  test.describe('Step 4 - 상세 요청사항', () => {
    test.beforeEach(async ({ page }) => {
      await completeStep1AsGuest(page)
      await completeStep1_5(page)
      await completeStep2(page)
      await completeStep3(page)
      await skipStep3_5(page)
    })

    test('상세사항 입력 후 Step 5로 이동', async ({ page }) => {
      await completeStep4(page)
      await expect(page.getByRole('heading', { name: '결제하기' })).toBeVisible()
    })

    test('상세사항 없이도 Step 5로 이동 가능 (선택 필드)', async ({ page }) => {
      await page.getByRole('button', { name: '다음' }).click()
      await expect(page.getByRole('heading', { name: '결제하기' })).toBeVisible()
    })

    test('글자수 카운터 표시', async ({ page }) => {
      await expect(page.getByText('0 / 1000')).toBeVisible()
      await page.fill('#details', '테스트')
      await expect(page.getByText('3 / 1000')).toBeVisible()
    })

    test('이전 버튼 클릭 시 Step 3.5로 복귀', async ({ page }) => {
      await page.getByRole('button', { name: '이전' }).click()
      await expect(page.getByText('원하는 매니저가 있으신가요?')).toBeVisible()
    })
  })

  // ═══════════════════════════════════════════════════════
  // Step 5: 결제
  // ═══════════════════════════════════════════════════════

  test.describe('Step 5 - 결제', () => {
    test.beforeEach(async ({ page }) => {
      await completeStep1AsGuest(page)
      await completeStep1_5(page)
      await completeStep2(page)
      await completeStep3(page)
      await skipStep3_5(page)
      await completeStep4(page)
    })

    test('주문 요약 정보 표시', async ({ page }) => {
      await expect(page.getByText('주문 정보')).toBeVisible()
      await expect(page.getByText('병원 동행')).toBeVisible()
      await expect(page.getByText('3시간')).toBeVisible()
      await expect(page.getByText('60,000원')).toBeVisible()
      await expect(page.getByText('서울특별시 강남구 테헤란로 123')).toBeVisible()
    })

    test('약관 동의 체크박스 표시', async ({ page }) => {
      await expect(
        page.getByText('위 내용을 확인했으며 서비스 이용약관에 동의합니다'),
      ).toBeVisible()
    })

    test('결제 수단 선택 UI 표시', async ({ page }) => {
      await expect(page.getByText('결제 수단')).toBeVisible()
      await expect(page.getByText('카드 결제')).toBeVisible()
      await expect(page.getByText('계좌이체')).toBeVisible()
    })

    test('이전 버튼 클릭 시 Step 4로 복귀', async ({ page }) => {
      await page.getByRole('button', { name: '이전' }).click()
      await expect(page.getByText('추가로 알려주실 사항이 있나요?')).toBeVisible()
    })
  })

  // ═══════════════════════════════════════════════════════
  // 전체 흐름 (비회원 Happy Path)
  // ═══════════════════════════════════════════════════════

  test('비회원 전체 신청 흐름 완료', async ({ page }) => {
    // Step 1: 비회원 선택
    await expect(page.getByText('회원이신가요?')).toBeVisible()
    await page.getByLabel('비회원').check()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 1.5: 신청자 정보
    await expect(page.getByText('신청자 정보를 입력해주세요')).toBeVisible()
    await page.fill('#guest_name', '홍길동')
    await page.fill('#guest_phone', '010-5555-6666')
    await page.fill('#guest_address', '서울 강남구')
    await page.getByRole('button', { name: '주소 검색' }).click()
    await expect(page.getByText('주소가 선택되었습니다')).toBeVisible()
    await page.fill('#guest_address_detail', '5층')
    // 개인정보 수집동의 체크
    await page.getByLabel('개인정보 수집 및 이용에 동의합니다').check()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 2: 서비스 선택
    await expect(page.getByText('어떤 서비스가 필요하신가요?')).toBeVisible()
    await page.getByLabel('노인 돌봄').check()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 3: 날짜/시간 선택
    await expect(page.getByText('언제 서비스가 필요하신가요?')).toBeVisible()
    await page.fill('#service_date', getTomorrowDate())
    await page.selectOption('#start_time', '14:00')
    await page.getByText('2시간', { exact: true }).click()
    // 노인 돌봄 22,000 × 2시간 = 44,000원
    await expect(page.getByText('44,000원')).toBeVisible()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 3.5: 매니저 지정 건너뛰기
    await expect(page.getByText('원하는 매니저가 있으신가요?')).toBeVisible()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 4: 상세 요청사항
    await expect(page.getByText('추가로 알려주실 사항이 있나요?')).toBeVisible()
    await page.fill('#details', '어르신 거동이 불편하십니다. 휠체어 필요.')
    await page.getByRole('button', { name: '다음' }).click()

    // Step 5: 결제 확인
    await expect(page.getByRole('heading', { name: '결제하기' })).toBeVisible()
    await expect(page.getByText('주문 정보')).toBeVisible()
    await expect(page.getByText('노인 돌봄').first()).toBeVisible()
    await expect(page.getByText('44,000원').first()).toBeVisible()
  })

  // ═══════════════════════════════════════════════════════
  // 뒤로 가기 → 다시 앞으로 (데이터 유지)
  // ═══════════════════════════════════════════════════════

  test('이전/다음 이동 시 입력 데이터 유지', async ({ page }) => {
    // Step 1 완료
    await completeStep1AsGuest(page)

    // Step 1.5 입력
    await page.fill('#guest_name', '김유지')
    await page.fill('#guest_phone', '010-1111-2222')
    await page.fill('#guest_address', '서울 강남구')
    await page.getByRole('button', { name: '주소 검색' }).click()
    await expect(page.getByText('주소가 선택되었습니다')).toBeVisible()
    // 개인정보 수집동의 체크
    await page.getByLabel('개인정보 수집 및 이용에 동의합니다').check()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 2에서 서비스 선택
    await page.getByLabel('가사돌봄').check()
    await page.getByRole('button', { name: '다음' }).click()

    // Step 3에서 이전으로 돌아가기
    await page.getByRole('button', { name: '이전' }).click()
    // Step 2: 가사돌봄이 여전히 선택되어 있는지 확인
    await expect(page.locator('input[name="service_type"][value="daily_care"]')).toBeChecked()

    // Step 2에서 다시 이전
    await page.getByRole('button', { name: '이전' }).click()
    // Step 1.5: 이름 유지 확인
    await expect(page.locator('#guest_name')).toHaveValue('김유지')
    await expect(page.locator('#guest_phone')).toHaveValue('010-1111-2222')
  })
})
