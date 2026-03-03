import { ServiceType } from '../types';

export const DEFAULT_SERVICE_PRICES: Record<ServiceType, number> = {
  hospital_companion: 20000,
  daily_care: 18000,
  life_companion: 18000,
  elderly_care: 22000,
  child_care: 20000,
  other: 20000,
};

let dynamicPrices: Record<ServiceType, number> | null = null;

export function setDynamicPrices(prices: Record<ServiceType, number>) {
  dynamicPrices = prices;
}

export function getPricePerHour(serviceType: ServiceType): number {
  return dynamicPrices?.[serviceType] ?? DEFAULT_SERVICE_PRICES[serviceType];
}

export function calculatePrice(serviceType: ServiceType, durationHours: number): number {
  return getPricePerHour(serviceType) * durationHours;
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원';
}
