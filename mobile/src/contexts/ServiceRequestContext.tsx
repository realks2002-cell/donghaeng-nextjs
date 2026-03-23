import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ServiceRequestFormData, ServiceType } from '../types';

const initialFormData: ServiceRequestFormData = {
  userType: null,
  guestName: '',
  guestPhone: '',
  guestAddress: '',
  guestAddressDetail: '',
  serviceType: null,
  serviceDate: '',
  startTime: '',
  durationHours: 3,
  designatedManagerId: null,
  designatedManager: null,
  details: '',
  privacyConsent: false,
  confirmTerms: false,
  cancelTerms: false,
};

interface ServiceRequestContextType {
  formData: ServiceRequestFormData;
  updateFormData: (updates: Partial<ServiceRequestFormData>) => void;
  clearFormData: () => void;
  setPreselectedService: (serviceType: ServiceType) => void;
}

const ServiceRequestContext = createContext<ServiceRequestContextType | null>(null);

export function ServiceRequestProvider({ children }: { children: React.ReactNode }) {
  const [formData, setFormData] = useState<ServiceRequestFormData>(initialFormData);

  const updateFormData = useCallback((updates: Partial<ServiceRequestFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFormData = useCallback(() => {
    setFormData(initialFormData);
  }, []);

  const setPreselectedService = useCallback((serviceType: ServiceType) => {
    setFormData(prev => ({ ...prev, serviceType }));
  }, []);

  return (
    <ServiceRequestContext.Provider value={{ formData, updateFormData, clearFormData, setPreselectedService }}>
      {children}
    </ServiceRequestContext.Provider>
  );
}

export function useServiceRequest() {
  const context = useContext(ServiceRequestContext);
  if (!context) {
    throw new Error('useServiceRequest must be used within ServiceRequestProvider');
  }
  return context;
}
