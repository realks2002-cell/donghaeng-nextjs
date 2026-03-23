import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/config';
import { managerApi } from '../api/client';
import { setAuthExpiredHandler } from '../api/client';
import { registerForPushNotifications, sendTokenToServer, unregisterPushToken } from '../services/pushNotification';
import type { Manager } from '../types';

interface ManagerAuthState {
  isLoggedIn: boolean;
  manager: Manager | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const ManagerAuthContext = createContext<ManagerAuthState>({
  isLoggedIn: false,
  manager: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function ManagerAuthProvider({ children }: { children: React.ReactNode }) {
  const [manager, setManager] = useState<Manager | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    setAuthExpiredHandler(() => {
      logout();
    });
  }, []);

  async function checkAuth() {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.MANAGER_TOKEN);
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MANAGER_DATA);
      if (token && data) {
        setManager(JSON.parse(data));
        // 앱 재시작 시 푸시 토큰 갱신 (변경된 경우만)
        registerForPushNotifications().then(async (pushToken) => {
          if (pushToken) {
            const lastToken = await AsyncStorage.getItem(STORAGE_KEYS.PUSH_TOKEN);
            if (pushToken !== lastToken) {
              await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, pushToken);
              await sendTokenToServer(pushToken);
            }
          }
        }).catch(console.error);
      }
    } catch {
      // not logged in
    } finally {
      setIsLoading(false);
    }
  }

  async function login(phone: string, password: string) {
    const data = await managerApi.login(phone, password);
    const managerData: Manager = {
      id: data.manager.id,
      name: data.manager.name,
      phone: data.manager.phone,
      photo_url: null,
      specialty: [],
      approval_status: 'approved',
    };
    await AsyncStorage.setItem(STORAGE_KEYS.MANAGER_TOKEN, data.token);
    await AsyncStorage.setItem(STORAGE_KEYS.MANAGER_DATA, JSON.stringify(managerData));
    setManager(managerData);

    // 푸시 알림 등록 (비블로킹)
    registerForPushNotifications().then(async (pushToken) => {
      if (pushToken) {
        await AsyncStorage.setItem(STORAGE_KEYS.PUSH_TOKEN, pushToken);
        await sendTokenToServer(pushToken);
      }
    }).catch(console.error);
  }

  async function logout() {
    await unregisterPushToken();
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.MANAGER_TOKEN,
      STORAGE_KEYS.MANAGER_DATA,
      STORAGE_KEYS.PUSH_TOKEN,
    ]);
    setManager(null);
  }

  return (
    <ManagerAuthContext.Provider
      value={{
        isLoggedIn: !!manager,
        manager,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </ManagerAuthContext.Provider>
  );
}

export function useManagerAuth() {
  return useContext(ManagerAuthContext);
}
