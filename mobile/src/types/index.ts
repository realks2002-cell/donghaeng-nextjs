// Service types matching the web app
export type ServiceType =
  | 'hospital_companion'
  | 'daily_care'
  | 'life_companion'
  | 'elderly_care'
  | 'child_care';

export type RequestStatus =
  | 'PENDING_TRANSFER'
  | 'CONFIRMED'
  | 'MATCHED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface ServiceTypeInfo {
  label: string;
  description: string;
  emoji: string;
}

export const SERVICE_TYPES: Record<ServiceType, ServiceTypeInfo> = {
  hospital_companion: { label: '병원동행', description: '병원 진료 동행 서비스', emoji: '🏥' },
  daily_care: { label: '가사돌봄', description: '가사 도우미 서비스', emoji: '🏠' },
  life_companion: { label: '생활동행', description: '외출 및 생활 동행 서비스', emoji: '🚶' },
  elderly_care: { label: '노인돌봄', description: '어르신 돌봄 서비스', emoji: '👴' },
  child_care: { label: '아이돌봄', description: '아이 돌봄 서비스', emoji: '👶' },
};

export const SERVICE_TYPE_KEYS: Record<string, ServiceType> = {
  '병원 동행': 'hospital_companion',
  '가사 돌봄': 'daily_care',
  '생활 동행': 'life_companion',
  '노인 돌봄': 'elderly_care',
  '아이 돌봄': 'child_care',
};

export const STATUS_DISPLAY: Record<RequestStatus, { label: string; color: string; emoji: string }> = {
  PENDING_TRANSFER: { label: '입금대기', color: '#D97706', emoji: '🏦' },
  CONFIRMED: { label: '매칭중', color: '#3B82F6', emoji: '✅' },
  MATCHED: { label: '매칭완료', color: '#10B981', emoji: '✅' },
  COMPLETED: { label: '서비스 완료', color: '#059669', emoji: '✅' },
  CANCELLED: { label: '취소', color: '#EF4444', emoji: '❌' },
};

export interface ServiceRequestFormData {
  userType: 'member' | 'non-member' | null;
  guestName: string;
  guestPhone: string;
  guestAddress: string;
  guestAddressDetail: string;
  serviceType: ServiceType | null;
  serviceDate: string;
  startTime: string;
  durationHours: number;
  designatedManagerId: string | null;
  designatedManager?: {
    id: string;
    name: string;
    phone: string;
    photo_url?: string;
  } | null;
  details: string;
  privacyConsent: boolean;
  confirmTerms: boolean;
  cancelTerms: boolean;
}

export interface ServiceRequest {
  id: string;
  customer_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  service_type: string;
  service_date: string;
  start_time: string;
  duration_minutes: number;
  address: string;
  address_detail?: string;
  phone: string;
  details: string | null;
  status: RequestStatus;
  estimated_price: number;
  final_price: number | null;
  manager_id: string | null;
  created_at: string;
  managers?: {
    name: string;
    phone: string;
    photo_url: string | null;
  } | null;
  payments?: {
    payment_key: string;
    order_id: string;
    amount: number;
    status: string;
    method: string | null;
  }[];
}

export interface User {
  id: string;
  auth_id: string;
  email: string;
  name: string;
  phone: string;
  address: string | null;
  address_detail: string | null;
  role: string;
  created_at: string;
}

export interface Manager {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  specialty: string[];
  branch: string | null;
}

// Navigation types
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: undefined;
  Auth: { screen?: 'Login' | 'Signup' };
};

export type MainTabParamList = {
  HomeTab: undefined;
  BookingTab: undefined;
  MoreTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  UserTypeSelect: { preselectedService?: ServiceType };
  GuestInfo: undefined;
  ServiceSelect: undefined;
  DateTime: undefined;
  ManagerSelect: undefined;
  Details: undefined;
  Confirm: undefined;
  PaymentWebView: { orderId: string; amount: number; orderName: string; customerName?: string; customerPhone?: string; requestData?: Record<string, unknown> };
  Completion: { orderId: string; amount: number };
  BankTransferCompletion: { orderId: string; amount: number };
  WebViewPage: { url: string; title: string };
};

export type BookingStackParamList = {
  GuestLookup: undefined;
  BookingList: undefined;
  BookingDetail: { id: string };
};

export type MoreStackParamList = {
  More: undefined;
  MyPage: undefined;
  ProfileEdit: undefined;
  NotificationSettings: undefined;
  NotificationList: undefined;
  WebViewPage: { url: string; title: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};
