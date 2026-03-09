import { chromium, type Browser, type BrowserContext } from 'playwright'
import path from 'path'
import fs from 'fs'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'manual', 'screenshots')
const PUBLIC_SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'manual', 'screenshots')

const DESKTOP_VIEWPORT = { width: 1280, height: 800 }
const MOBILE_VIEWPORT = { width: 390, height: 844 }

interface PageConfig {
  section: string
  name: string
  url: string
  auth?: 'admin' | 'manager'
  waitFor?: string
}

const pages: PageConfig[] = [
  // 1. 공개 페이지
  { section: 's1', name: 'homepage', url: '/' },
  { section: 's1', name: 'about', url: '/about' },
  { section: 's1', name: 'service-guide', url: '/service-guide' },
  { section: 's1', name: 'faq', url: '/faq' },

  // 2. 서비스 신청
  { section: 's2', name: 'user-type', url: '/requests/new/user-type' },
  { section: 's2', name: 'info', url: '/requests/new/info' },
  { section: 's2', name: 'service', url: '/requests/new/service' },
  { section: 's2', name: 'datetime', url: '/requests/new/datetime' },
  { section: 's2', name: 'manager', url: '/requests/new/manager' },
  { section: 's2', name: 'details', url: '/requests/new/details' },
  { section: 's2', name: 'payment', url: '/requests/new/payment' },

  // 3. 매니저
  { section: 's3', name: 'recruit', url: '/manager/recruit' },
  { section: 's3', name: 'login', url: '/manager/login' },
  { section: 's3', name: 'signup', url: '/manager/signup' },
  { section: 's3', name: 'dashboard', url: '/manager/dashboard', auth: 'manager' },
  { section: 's3', name: 'schedule', url: '/manager/schedule', auth: 'manager' },

  // 4. 관리자
  { section: 's4', name: 'admin-login', url: '/admin/login' },
  { section: 's4', name: 'admin-dashboard', url: '/admin', auth: 'admin' },
  { section: 's4', name: 'admin-users', url: '/admin/users', auth: 'admin' },
  { section: 's4', name: 'admin-managers', url: '/admin/managers', auth: 'admin' },
  { section: 's4', name: 'admin-manager-applications', url: '/admin/manager-applications', auth: 'admin' },
  { section: 's4', name: 'admin-requests', url: '/admin/requests', auth: 'admin' },
  { section: 's4', name: 'admin-register-service', url: '/admin/register-service', auth: 'admin' },
  { section: 's4', name: 'admin-designated-matching', url: '/admin/designated-matching', auth: 'admin' },
  { section: 's4', name: 'admin-payments', url: '/admin/payments', auth: 'admin' },
  { section: 's4', name: 'admin-refund-info', url: '/admin/refund-info', auth: 'admin' },
  { section: 's4', name: 'admin-revenue', url: '/admin/revenue', auth: 'admin' },
  { section: 's4', name: 'admin-manager-settlement', url: '/admin/manager-settlement', auth: 'admin' },
  { section: 's4', name: 'admin-service-prices', url: '/admin/service-prices', auth: 'admin' },
  { section: 's4', name: 'admin-branches', url: '/admin/branches', auth: 'admin' },
  { section: 's4', name: 'admin-agency-applications', url: '/admin/agency-applications', auth: 'admin' },
  { section: 's4', name: 'admin-notifications', url: '/admin/notifications', auth: 'admin' },
  { section: 's4', name: 'admin-settings', url: '/admin/settings', auth: 'admin' },
]

async function loginAdmin(context: BrowserContext): Promise<void> {
  const page = await context.newPage()
  try {
    const response = await page.request.post(`${BASE_URL}/api/admin/login`, {
      data: { adminId: 'admin', password: 'admin123' },
    })
    if (!response.ok()) {
      console.warn(`  [WARN] Admin login failed (${response.status()}). Admin pages may redirect to login.`)
    } else {
      console.log('  [OK] Admin login successful')
    }
  } catch (e) {
    console.warn('  [WARN] Admin login request failed:', e)
  } finally {
    await page.close()
  }
}

async function loginManager(context: BrowserContext): Promise<void> {
  const page = await context.newPage()
  try {
    const response = await page.request.post(`${BASE_URL}/api/manager/login`, {
      data: { phone: '010-1234-5678', password: 'test123' },
    })
    if (!response.ok()) {
      console.warn(`  [WARN] Manager login failed (${response.status()}). Manager pages may redirect to login.`)
    } else {
      console.log('  [OK] Manager login successful')
    }
  } catch (e) {
    console.warn('  [WARN] Manager login request failed:', e)
  } finally {
    await page.close()
  }
}

async function takeScreenshot(
  context: BrowserContext,
  config: PageConfig,
  viewport: { width: number; height: number },
  suffix: string
): Promise<void> {
  const page = await context.newPage()
  await page.setViewportSize(viewport)

  const filename = `${config.section}-${config.name}-${suffix}.png`
  const filepath = path.join(SCREENSHOT_DIR, filename)

  try {
    await page.goto(`${BASE_URL}${config.url}`, {
      waitUntil: 'load',
      timeout: 30000,
    })
    await page.waitForTimeout(1500)

    await page.screenshot({
      path: filepath,
      fullPage: true,
    })
    console.log(`  [OK] ${filename}`)
  } catch (e) {
    console.error(`  [FAIL] ${filename}: ${e}`)
  } finally {
    await page.close()
  }
}

async function main() {
  // Ensure output directories exist
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true })
  fs.mkdirSync(PUBLIC_SCREENSHOT_DIR, { recursive: true })

  console.log(`\nBase URL: ${BASE_URL}`)
  console.log(`Output: ${SCREENSHOT_DIR}\n`)

  const browser: Browser = await chromium.launch({ headless: true })

  // Create contexts with auth
  console.log('--- Authenticating ---')
  const adminContext = await browser.newContext()
  await loginAdmin(adminContext)

  const managerContext = await browser.newContext()
  await loginManager(managerContext)

  const publicContext = await browser.newContext()

  console.log('\n--- Taking Screenshots ---')
  for (const config of pages) {
    let context: BrowserContext
    if (config.auth === 'admin') context = adminContext
    else if (config.auth === 'manager') context = managerContext
    else context = publicContext

    console.log(`\n[${config.section}] ${config.name} (${config.url})`)
    await takeScreenshot(context, config, DESKTOP_VIEWPORT, 'desktop')
    await takeScreenshot(context, config, MOBILE_VIEWPORT, 'mobile')
  }

  await adminContext.close()
  await managerContext.close()
  await publicContext.close()
  await browser.close()

  // Copy screenshots to public directory
  console.log('\n--- Copying to public/manual/screenshots/ ---')
  const files = fs.readdirSync(SCREENSHOT_DIR).filter((f) => f.endsWith('.png'))
  for (const file of files) {
    fs.copyFileSync(
      path.join(SCREENSHOT_DIR, file),
      path.join(PUBLIC_SCREENSHOT_DIR, file)
    )
  }
  console.log(`  Copied ${files.length} files`)

  console.log('\nDone!')
}

main().catch(console.error)
