import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';

let notificationsInitialized = false;

async function initNotifications() {
  if (notificationsInitialized) return;
  try {
    const Notifications = await import('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationsInitialized = true;
  } catch (e) {
    console.warn('[PUSH] expo-notifications not available:', e);
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  try {
    const Notifications = await import('expo-notifications');
    const Constants = await import('expo-constants');
    await initNotifications();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[PUSH] Permission not granted');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: '서비스 알림',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    const projectId = Constants.default?.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const token = tokenData.data;
    console.log('[PUSH] Expo Push Token:', token);

    return token;
  } catch (error) {
    console.error('[PUSH] Registration error:', error);
    return null;
  }
}

export async function sendTokenToServer(expoPushToken: string): Promise<boolean> {
  try {
    const managerToken = await AsyncStorage.getItem(STORAGE_KEYS.MANAGER_TOKEN);
    if (!managerToken) return false;

    const res = await fetch(`${API_BASE_URL}/api/push/expo-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ expo_push_token: expoPushToken }),
    });

    return res.ok;
  } catch (error) {
    console.error('[PUSH] Send token error:', error);
    return false;
  }
}

export async function unregisterPushToken(): Promise<void> {
  try {
    const managerToken = await AsyncStorage.getItem(STORAGE_KEYS.MANAGER_TOKEN);
    const pushToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
    if (!managerToken || !pushToken) return;

    await fetch(`${API_BASE_URL}/api/push/expo-subscribe`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${managerToken}`,
      },
      body: JSON.stringify({ expo_push_token: pushToken }),
    });

    await AsyncStorage.removeItem(STORAGE_KEYS.PUSH_TOKEN);
  } catch (error) {
    console.error('[PUSH] Unregister error:', error);
  }
}
