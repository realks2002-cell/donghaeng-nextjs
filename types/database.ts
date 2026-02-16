export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string | null
          email: string | null
          name: string
          phone: string | null
          address: string | null
          address_detail: string | null
          role: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          auth_id?: string | null
          email?: string | null
          name: string
          phone?: string | null
          address?: string | null
          address_detail?: string | null
          role?: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          auth_id?: string | null
          email?: string | null
          name?: string
          phone?: string | null
          address?: string | null
          address_detail?: string | null
          role?: 'CUSTOMER' | 'MANAGER' | 'ADMIN'
          is_active?: boolean
          created_at?: string
        }
      }
      service_requests: {
        Row: {
          id: string
          customer_id: string | null
          guest_email: string | null
          guest_phone: string | null
          guest_name: string | null
          service_type: string
          service_date: string
          start_time: string
          duration_minutes: number
          address: string
          address_detail: string | null
          phone: string
          lat: number | null
          lng: number | null
          details: string | null
          status: string
          estimated_price: number | null
          final_price: number | null
          manager_id: string | null
          created_at: string
          confirmed_at: string | null
          completed_at: string | null
        }
        Insert: {
          id?: string
          customer_id?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guest_name?: string | null
          service_type: string
          service_date: string
          start_time: string
          duration_minutes: number
          address: string
          address_detail?: string | null
          phone: string
          lat?: number | null
          lng?: number | null
          details?: string | null
          status?: string
          estimated_price?: number | null
          final_price?: number | null
          manager_id?: string | null
          created_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
        }
        Update: {
          id?: string
          customer_id?: string | null
          guest_email?: string | null
          guest_phone?: string | null
          guest_name?: string | null
          service_type?: string
          service_date?: string
          start_time?: string
          duration_minutes?: number
          address?: string
          address_detail?: string | null
          phone?: string
          lat?: number | null
          lng?: number | null
          details?: string | null
          status?: string
          estimated_price?: number | null
          final_price?: number | null
          manager_id?: string | null
          created_at?: string
          confirmed_at?: string | null
          completed_at?: string | null
        }
      }
      managers: {
        Row: {
          id: string
          name: string
          phone: string
          password_hash: string
          email: string | null
          photo_url: string | null
          gender: string | null
          ssn: string | null
          address1: string | null
          address2: string | null
          bank_name: string | null
          bank_account: string | null
          bank_holder: string | null
          specialty: string[] | null
          approval_status: 'pending' | 'approved' | 'rejected' | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          phone: string
          password_hash: string
          email?: string | null
          photo_url?: string | null
          gender?: string | null
          ssn?: string | null
          address1?: string | null
          address2?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_holder?: string | null
          specialty?: string[] | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          phone?: string
          password_hash?: string
          email?: string | null
          photo_url?: string | null
          gender?: string | null
          ssn?: string | null
          address1?: string | null
          address2?: string | null
          bank_name?: string | null
          bank_account?: string | null
          bank_holder?: string | null
          specialty?: string[] | null
          approval_status?: 'pending' | 'approved' | 'rejected'
          is_active?: boolean
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          manager_id: string
          request_id: string
          status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          manager_id: string
          request_id: string
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          manager_id?: string
          request_id?: string
          status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
          message?: string | null
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          service_request_id: string | null
          payment_key: string | null
          order_id: string
          amount: number
          refund_amount: number
          status: string
          method: string | null
          approved_at: string | null
          refunded_at: string | null
          partial_refunded: boolean
          created_at: string
        }
        Insert: {
          id?: string
          service_request_id?: string | null
          payment_key?: string | null
          order_id: string
          amount: number
          refund_amount?: number
          status?: string
          method?: string | null
          approved_at?: string | null
          refunded_at?: string | null
          partial_refunded?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          service_request_id?: string | null
          payment_key?: string | null
          order_id?: string
          amount?: number
          refund_amount?: number
          status?: string
          method?: string | null
          approved_at?: string | null
          refunded_at?: string | null
          partial_refunded?: boolean
          created_at?: string
        }
      }
      admins: {
        Row: {
          id: string
          admin_id: string
          password_hash: string
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          password_hash: string
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          password_hash?: string
          created_at?: string
        }
      }
      service_prices: {
        Row: {
          service_type: string
          price_per_hour: number
          is_active: boolean
          updated_at: string | null
        }
        Insert: {
          service_type: string
          price_per_hour: number
          is_active?: boolean
          updated_at?: string | null
        }
        Update: {
          service_type?: string
          price_per_hour?: number
          is_active?: boolean
          updated_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
