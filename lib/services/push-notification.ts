import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:admin@donghaeng.com',
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  )
}

interface PushPayload {
  title: string
  body: string
  url?: string
}

export async function sendPushToAllManagers(payload: PushPayload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys not configured, skipping push notification')
    return
  }

  const supabase = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const subscriptionsTable = supabase.from('push_subscriptions') as any
  const { data: subscriptions, error } = await subscriptionsTable.select('*')

  if (error) {
    console.error('Failed to fetch push subscriptions:', error)
    return
  }

  if (!subscriptions || subscriptions.length === 0) {
    return
  }

  const notificationPayload = JSON.stringify(payload)

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
          console.log(`Removed expired subscription: ${sub.id}`)
        } else {
          console.error(`Push failed for ${sub.id}:`, err)
        }
        throw err
      }
    })
  )

  const succeeded = results.filter((r) => r.status === 'fulfilled').length
  const failed = results.filter((r) => r.status === 'rejected').length
  console.log(`Push notifications sent: ${succeeded} succeeded, ${failed} failed`)
}
