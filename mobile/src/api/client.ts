import { API_BASE_URL } from '../constants/config';
import { getItem } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers = {}, skipAuth = false } = options;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (!skipAuth) {
      const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, errorData.error || response.statusText, errorData);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(endpoint: string, body?: unknown, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export const api = new ApiClient(API_BASE_URL);

// Specific API methods
export const authApi = {
  login: (phone: string, password: string) =>
    api.post<{ user: { id: string; name: string; phone: string; email: string }; session: { access_token: string; refresh_token: string } }>(
      '/api/auth/login',
      { phone, password },
      { skipAuth: true }
    ),

  signup: (data: { name: string; phone: string; email: string; password: string; address?: string; addressDetail?: string }) =>
    api.post('/api/auth/signup', data, { skipAuth: true }),

  logout: () => api.post('/api/auth/logout'),
};

export const bookingApi = {
  getMyBookings: () =>
    api.get<{ requests: unknown[] }>('/api/bookings'),

  guestLookup: (name: string, phone: string) =>
    api.post<{ requests: unknown[] }>('/api/requests/guest-lookup', { name, phone }, { skipAuth: true }),

  getDetail: (id: string) =>
    api.get<{ request: unknown }>(`/api/admin/requests/${id}`),

  cancel: (id: string) =>
    api.post(`/api/requests/${id}/cancel`),
};

export const serviceApi = {
  getPrices: () =>
    api.get<{ prices: Record<string, number> }>('/api/service-prices', { skipAuth: true }),

  saveTempRequest: (data: unknown) =>
    api.post<{ id: string; orderId: string }>('/api/requests/save-temp', data),

  searchManagers: (query: string) =>
    api.post<{ managers: unknown[] }>('/api/managers/search', { query }, { skipAuth: true }),
};

export const paymentApi = {
  confirm: (data: { paymentKey: string; orderId: string; amount: number }) =>
    api.post('/api/payments/confirm', data),
};

export const pushApi = {
  subscribe: (token: string, userId?: string) =>
    api.post('/api/push/subscribe', { token, userId }),
};
