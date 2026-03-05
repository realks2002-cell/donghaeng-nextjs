import { createServiceClient } from '@/lib/supabase/server'

interface PushPayload {
  title: string
  body: string
  url?: string
}

export interface PushResult {
  success: boolean
  sent: number
  failed: number
  removed: number
  errors: string[]
  skippedReason?: string
}

export interface PushHealthStatus {
  webPushImportable: boolean
  webPushError?: string
  vapidPublicKey: boolean
  vapidPrivateKey: boolean
  vapidConfigured: boolean
  subscriptionCount: number
  subscriptionError?: string
}

let vapidInitialized = false

async function getWebPush() {
  const webpush = (await import('web-push')).default
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  const privateKey = process.env.VAPID_PRIVATE_KEY || ''

  const missing: string[] = []
  if (!publicKey) missing.push('NEXT_PUBLIC_VAPID_PUBLIC_KEY')
  if (!privateKey) missing.push('VAPID_PRIVATE_KEY')

  if (missing.length > 0) {
    throw new Error(`[PUSH] VAPID keys missing: ${missing.join(', ')}`)
  }

  if (!vapidInitialized) {
    webpush.setVapidDetails('mailto:admin@donghaeng.com', publicKey, privateKey)
    vapidInitialized = true
  }

  return webpush
}

export async function sendPushToAllManagers(payload: PushPayload): Promise<PushResult> {
  let webpush
  try {
    webpush = await getWebPush()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.warn(`[PUSH] ${msg}`)
    return { success: false, sent: 0, failed: 0, removed: 0, errors: [], skippedReason: msg }
  }

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionsTable = supabase.from('push_subscriptions') as any
  const { data: subscriptions, error } = await subscriptionsTable.select('*')

  if (error) {
    const msg = `[PUSH] Failed to fetch subscriptions: ${error.message}`
    console.error(msg)
    return { success: false, sent: 0, failed: 0, removed: 0, errors: [msg], skippedReason: msg }
  }

  if (!subscriptions || subscriptions.length === 0) {
    console.log('[PUSH] No subscriptions found')
    return { success: true, sent: 0, failed: 0, removed: 0, errors: [], skippedReason: 'no subscriptions' }
  }

  console.log(`[PUSH] Sending to ${subscriptions.length} subscription(s)`)

  const notificationPayload = JSON.stringify(payload)
  let sent = 0
  let failed = 0
  let removed = 0
  const errors: string[] = []

  const results = await Promise.allSettled(
    subscriptions.map(async (sub: { id: string; endpoint: string; p256dh: string; auth: string }) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        )
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number }).statusCode
        // 410 Gone or 404 Not Found = subscription expired
        if (statusCode === 410 || statusCode === 404) {
          await subscriptionsTable.delete().eq('id', sub.id)
          console.log(`[PUSH] Removed expired subscription: ${sub.id}`)
          removed++
        }
        const errMsg = `sub=${sub.id} status=${statusCode || 'unknown'} ${err instanceof Error ? err.message : String(err)}`
        errors.push(errMsg)
        throw err
      }
    })
  )

  sent = results.filter((r) => r.status === 'fulfilled').length
  failed = results.filter((r) => r.status === 'rejected').length
  const success = sent > 0 || (sent === 0 && failed === 0)

  console.log(`[PUSH] Results: sent=${sent} failed=${failed} removed=${removed}`)
  if (errors.length > 0) {
    console.error(`[PUSH] Errors: ${errors.join('; ')}`)
  }

  return { success, sent, failed, removed, errors }
}

export async function checkPushHealth(): Promise<PushHealthStatus> {
  const status: PushHealthStatus = {
    webPushImportable: false,
    vapidPublicKey: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    vapidPrivateKey: !!process.env.VAPID_PRIVATE_KEY,
    vapidConfigured: false,
    subscriptionCount: 0,
  }

  status.vapidConfigured = status.vapidPublicKey && status.vapidPrivateKey

  // Test web-push import
  try {
    await import('web-push')
    status.webPushImportable = true
  } catch (err) {
    status.webPushError = err instanceof Error ? err.message : String(err)
  }

  // Count subscriptions
  try {
    const supabase = createServiceClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('push_subscriptions') as any
    const { count, error } = await table.select('*', { count: 'exact', head: true })
    if (error) {
      status.subscriptionError = error.message
    } else {
      status.subscriptionCount = count ?? 0
    }
  } catch (err) {
    status.subscriptionError = err instanceof Error ? err.message : String(err)
  }

  return status
}
