// API base URL - 항상 프로덕션 서버 사용 (로컬 개발 서버는 실기기에서 접근 불가)
export const API_BASE_URL = 'https://donghaeng77.co.kr';

// Supabase config
export const SUPABASE_URL = 'https://trzxogqtxruhvsxcvpsu.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyenhvZ3F0eHJ1aHZzeGN2cHN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwNzI5OTIsImV4cCI6MjA4NjY0ODk5Mn0.UyuGvUcN2ysGETlnHxBLVkJPrgQZdKHjmr-W2AHf04Y';

// Toss Payments
export const TOSS_CLIENT_KEY = 'test_ck_6bJXmgo28e2l9KMJAPLw3LAnGKWx';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  PUSH_TOKEN: 'push_token',
} as const;
