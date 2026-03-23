export type ServiceType =
  | 'hospital_companion'
  | 'daily_care'
  | 'life_companion'
  | 'elderly_care'
  | 'child_care';

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  hospital_companion: '병원동행',
  daily_care: '가사돌봄',
  life_companion: '생활동행',
  elderly_care: '노인돌봄',
  child_care: '아이돌봄',
  '병원 동행': '병원동행',
  '가사돌봄': '가사돌봄',
  '생활동행': '생활동행',
  '노인 돌봄': '노인돌봄',
  '아이 돌봄': '아이돌봄',
};

export type RequestStatus =
  | 'PENDING_TRANSFER'
  | 'CONFIRMED'
  | 'MATCHED'
  | 'COMPLETED'
  | 'CANCELLED';

export const STATUS_LABELS: Record<RequestStatus, string> = {
  PENDING_TRANSFER: '입금대기',
  CONFIRMED: '매칭대기',
  MATCHED: '매칭완료',
  COMPLETED: '서비스완료',
  CANCELLED: '취소',
};

export interface Manager {
  id: string;
  name: string;
  phone: string;
  photo_url: string | null;
  specialty: string[];
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface ServiceRequest {
  id: string;
  service_type: string;
  service_date: string;
  start_time: string;
  duration_minutes: number;
  address: string;
  address_detail?: string;
  details?: string;
  status: RequestStatus;
  estimated_price: number;
  final_price?: number;
  customer_name: string;
  customer_phone: string;
  vehicle_support?: boolean;
  vehicle_support_price?: number;
  manager_amount?: number;
  created_at: string;
}

export interface ScheduleRecord {
  id: string;
  service_type: string;
  service_date: string;
  start_time: string;
  duration_minutes: number;
  customer_name: string;
  address: string;
  status: string;
  final_price: number;
}

export interface Application {
  id: string;
  manager_id: string;
  service_request_id: string;
  status: 'ACCEPTED' | 'REJECTED' | 'PENDING';
  created_at: string;
  service_requests?: ServiceRequest;
}

// Navigation types
export type RootStackParamList = {
  Auth: { screen?: 'Login' | 'Signup' };
  MainTabs: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  PendingApproval: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  ScheduleTab: undefined;
  ProfileTab: undefined;
};

export type DashboardStackParamList = {
  ServiceList: undefined;
};

export type ScheduleStackParamList = {
  WorkRecords: undefined;
  ServiceDetail: { id: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ProfileEdit: undefined;
};
