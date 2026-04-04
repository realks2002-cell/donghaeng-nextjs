import { PushNotifications } from '@capacitor/push-notifications';

const API_BASE = 'https://donghaeng77.co.kr';

export async function initPushNotifications() {
  const permStatus = await PushNotifications.checkPermissions();

  if (permStatus.receive === 'prompt') {
    const result = await PushNotifications.requestPermissions();
    if (result.receive !== 'granted') {
      console.warn('Push notification permission denied');
      return;
    }
  } else if (permStatus.receive !== 'granted') {
    console.warn('Push notification permission not granted');
    return;
  }

  PushNotifications.addListener('registration', async (token) => {
    console.log('FCM Token:', token.value);
    localStorage.setItem('manager_fcm_token', token.value);
    await sendTokenToServer(token.value);
  });

  PushNotifications.addListener('registrationError', (err) => {
    console.error('FCM registration error:', err.error);
  });

  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push received:', notification);
  });

  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    const url = action.notification.data?.url;
    if (url) {
      window.location.href = url.startsWith('http')
        ? url
        : `${API_BASE}${url}`;
    }
  });

  await PushNotifications.register();
}

async function sendTokenToServer(fcmToken: string) {
  const managerToken = localStorage.getItem('manager_token');
  if (!managerToken) {
    console.warn('No manager token, skipping FCM registration');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/push/fcm-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ fcm_token: fcmToken }),
    });

    if (!res.ok) {
      console.error('FCM subscribe failed:', res.status);
    }
  } catch (error) {
    console.error('FCM subscribe error:', error);
  }
}
