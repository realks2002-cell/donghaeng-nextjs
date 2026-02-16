import { test, expect, Page } from '@playwright/test'

async function mockNonPaymentAPIs(page: Page) {
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
}

function getTomorrowDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

async function navigateToStep5(page: Page) {
  await page.goto('/requests/new')
  await expect(page.getByText('서비스 요청')).toBeVisible({ timeout: 15000 })

  // Step 1
  await page.getByLabel('비회원').check()
  await page.getByRole('button', { name: '다음' }).click()

  // Step 1.5
  await page.fill('#guest_name', '테스트 사용자')
  await page.fill('#guest_phone', '010-1234-5678')
  await page.fill('#guest_address', '서울 강남구')
  await page.getByRole('button', { name: '주소 검색' }).click()
  await expect(page.getByText('주소가 선택되었습니다')).toBeVisible()
  // 개인정보 수집동의 체크
  await page.getByLabel('개인정보 수집 및 이용에 동의합니다').check()
  await page.getByRole('button', { name: '다음' }).click()

  // Step 2
  await page.getByLabel('병원 동행').check()
  await page.getByRole('button', { name: '다음' }).click()

  // Step 3
  await page.fill('#service_date', getTomorrowDate())
  await page.selectOption('#start_time', '10:00')
  await page.getByText('3시간', { exact: true }).click()
  await page.getByRole('button', { name: '다음' }).click()

  // Step 3.5
  await page.getByRole('button', { name: '다음' }).click()

  // Step 4
  await page.fill('#details', '결제 테스트')
  await page.getByRole('button', { name: '다음' }).click()

  await expect(page.getByRole('heading', { name: '결제하기' })).toBeVisible()
}

test.describe('결제 위젯 실제 로딩 테스트', () => {
  test('토스페이먼츠 위젯 로딩 및 상태 진단', async ({ page }) => {
    const consoleLogs: string[] = []
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      consoleLogs.push(`[${msg.type()}] ${text}`)
      if (msg.type() === 'error') consoleErrors.push(text)
    })

    await mockNonPaymentAPIs(page)
    await navigateToStep5(page)

    // 토스 SDK v2 로딩 + 위젯 렌더링 대기
    await page.waitForTimeout(10000)

    // 스크린샷 저장
    await page.screenshot({ path: 'e2e/screenshots/payment-step5.png', fullPage: true })

    // 진단 정보 출력
    console.log('\n=== 결제 위젯 진단 ===')

    // 1. 에러 메시지 확인
    const hasWidgetError = await page.getByText('결제 시스템 초기화 실패').isVisible().catch(() => false)
    console.log('초기화 에러 UI:', hasWidgetError ? 'YES' : 'NO')

    if (hasWidgetError) {
      const errorText = await page.locator('.text-red-700').innerText().catch(() => 'N/A')
      console.log('에러 메시지:', errorText)
    }

    // 2. 로딩 스피너 상태
    const isLoading = await page.getByText('결제 시스템 로딩 중...').isVisible().catch(() => false)
    console.log('로딩 스피너 표시:', isLoading)

    // 3. #payment-widget 상태 (에러 아닌 경우에만)
    if (!hasWidgetError) {
      const paymentWidget = page.locator('#payment-widget')
      const isVisible = await paymentWidget.isVisible().catch(() => false)
      console.log('#payment-widget visible:', isVisible)
      if (isVisible) {
        const widgetHTML = await paymentWidget.innerHTML()
        console.log('#payment-widget HTML 길이:', widgetHTML.length)
        const iframes = await page.locator('#payment-widget iframe').count()
        console.log('위젯 내 iframe 수:', iframes)
      }
    }

    // 4. 콘솔 로그 중 관련 항목
    const tossLogs = consoleLogs.filter(l =>
      l.includes('Toss') || l.includes('Payment') || l.includes('payment') ||
      l.includes('widget') || l.includes('error') || l.includes('Error')
    )
    console.log('\n--- 관련 콘솔 로그 ---')
    tossLogs.forEach(l => console.log(l))

    console.log('\n--- 콘솔 에러 ---')
    consoleErrors.forEach(e => console.log(e))

    // 위젯 에러가 없어야 함
    expect(hasWidgetError).toBe(false)
  })
})
