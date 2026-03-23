import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getItem, setItem, removeItem, getJSON, setJSON } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/config';
import { authApi } from '../api/client';
import type { User } from '../types';

interface AuthState {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  signup: (data: { name: string; phone: string; email: string; password: string; address?: string; addressDetail?: string }) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isLoggedIn: false,
    user: null,
  });

  // Check stored auth on mount
  useEffect(() => {
    checkStoredAuth();
  }, []);

  async function checkStoredAuth() {
    try {
      const token = await getItem(STORAGE_KEYS.AUTH_TOKEN);
      const userData = await getJSON<User>(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        setState({ isLoading: false, isLoggedIn: true, user: userData });
      } else {
        setState({ isLoading: false, isLoggedIn: false, user: null });
      }
    } catch {
      setState({ isLoading: false, isLoggedIn: false, user: null });
    }
  }

  const login = useCallback(async (phone: string, password: string) => {
    const result = await authApi.login(phone, password);
    const user: User = {
      id: result.user.id,
      auth_id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      phone: result.user.phone,
      address: null,
      address_detail: null,
      role: 'CUSTOMER',
      created_at: new Date().toISOString(),
    };

    await setItem(STORAGE_KEYS.AUTH_TOKEN, result.session.access_token);
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, result.session.refresh_token);
    await setJSON(STORAGE_KEYS.USER_DATA, user);

    setState({ isLoading: false, isLoggedIn: true, user });
  }, []);

  const signup = useCallback(async (data: { name: string; phone: string; email: string; password: string; address?: string; addressDetail?: string }) => {
    await authApi.signup(data);
    // After signup, login automatically
    await login(data.phone, data.password);
  }, [login]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout API errors
    }
    await removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await removeItem(STORAGE_KEYS.USER_DATA);
    setState({ isLoading: false, isLoggedIn: false, user: null });
  }, []);

  const deleteAccount = useCallback(async () => {
    await authApi.deleteAccount();
    await removeItem(STORAGE_KEYS.AUTH_TOKEN);
    await removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await removeItem(STORAGE_KEYS.USER_DATA);
    setState({ isLoading: false, isLoggedIn: false, user: null });
  }, []);

  const refreshUser = useCallback(async () => {
    await checkStoredAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, deleteAccount, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
