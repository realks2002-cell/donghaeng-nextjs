'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ServiceRequestFormData, initialFormData } from '../types'

const STORAGE_KEY = 'service_request_form_data'

interface FormContextType {
  formData: ServiceRequestFormData
  updateFormData: (data: Partial<ServiceRequestFormData>) => void
  clearFormData: () => void
  isLoading: boolean
}

const FormContext = createContext<FormContextType | undefined>(undefined)

interface FormProviderProps {
  children: ReactNode
  initialUser?: {
    id: string
    name: string
    phone: string
    email: string
    address?: string
  } | null
}

export function FormProvider({ children, initialUser }: FormProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<ServiceRequestFormData>(initialFormData)

  // 1. 초기 로드: sessionStorage에서 데이터 복원
  useEffect(() => {
    if (typeof window === 'undefined') return

    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsedData = JSON.parse(stored)
        setFormData(parsedData)
      } catch (e) {
        console.error('Failed to parse form data:', e)
      }
    } else if (initialUser) {
      // 2. 로그인 사용자는 정보 자동 채우기 (저장된 데이터가 없을 때만)
      setFormData(prev => ({
        ...prev,
        userType: 'member',
        guestName: initialUser.name,
        guestPhone: initialUser.phone,
        guestAddress: initialUser.address || '',
      }))
    }

    setIsLoading(false)
  }, [initialUser])

  // 3. 자동 저장: 데이터 변경 시 sessionStorage 동기화
  useEffect(() => {
    if (typeof window === 'undefined' || isLoading) return
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
  }, [formData, isLoading])

  const updateFormData = (data: Partial<ServiceRequestFormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY)
    }
    setFormData(initialFormData)
  }

  return (
    <FormContext.Provider value={{ formData, updateFormData, clearFormData, isLoading }}>
      {children}
    </FormContext.Provider>
  )
}

export function useFormContext() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider')
  }
  return context
}
