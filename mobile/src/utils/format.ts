import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function formatDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'yyyy.MM.dd (EEE)', { locale: ko });
}

export function formatDateTime(dateStr: string, timeStr: string): string {
  return `${formatDate(dateStr)} ${timeStr}`;
}

export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
}

export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  return `${hours}시간`;
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}

export function getServiceTypeLabel(serviceType: string): string {
  const labels: Record<string, string> = {
    hospital_companion: '병원동행',
    daily_care: '가사돌봄',
    life_companion: '생활동행',
    elderly_care: '노인돌봄',
    child_care: '아이돌봄',
  };
  return labels[serviceType] || serviceType;
}

export function getServiceTypeEmoji(serviceType: string): string {
  const emojis: Record<string, string> = {
    hospital_companion: '🏥',
    daily_care: '🏠',
    life_companion: '🚶',
    elderly_care: '👴',
    child_care: '👶',
  };
  return emojis[serviceType] || '📋';
}
