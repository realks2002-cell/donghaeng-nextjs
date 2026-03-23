import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants/config';
import type { ServiceRequest, ScheduleRecord } from '../types';

let onAuthExpired: (() => void) | null = null;

export function setAuthExpiredHandler(handler: () => void) {
  onAuthExpired = handler;
}

async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.MANAGER_TOKEN);
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    if (res.status === 401) {
      onAuthExpired?.();
      throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || body.message || `HTTP ${res.status}`);
    }
    return res.json();
  } finally {
    clearTimeout(timeout);
  }
}

export const managerApi = {
  // Auth
  async login(phone: string, password: string) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '로그인 실패');
      return data;
    } finally {
      clearTimeout(timeout);
    }
  },

  // Service requests (available for matching)
  async getRequests(): Promise<{ requests: ServiceRequest[] }> {
    return request('/api/manager/requests');
  },

  // Apply for a service (server expects request_id)
  async apply(requestId: string, message?: string): Promise<{ success: boolean }> {
    return request('/api/manager/apply', {
      method: 'POST',
      body: JSON.stringify({ request_id: requestId, message }),
    });
  },

  // Work schedule (returns { records })
  async getSchedule(): Promise<{ records: ScheduleRecord[] }> {
    return request('/api/manager/schedule');
  },

  // Complete a service (action: 'complete')
  async completeService(id: string): Promise<{ success: boolean }> {
    return request(`/api/manager/service/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'complete' }),
    });
  },

  // Signup (FormData - no auth required)
  async signup(formData: FormData): Promise<{ success: boolean }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
      const res = await fetch(`${API_BASE_URL}/api/manager/signup`, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '회원가입 실패');
      return data;
    } finally {
      clearTimeout(timeout);
    }
  },
};
