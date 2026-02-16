import { getCustomerFromRequest } from '@/lib/auth/customer'
import { FormProvider } from '@/components/forms/ServiceRequestForm/context/FormContext'
import ClientProgressBar from '@/components/forms/ServiceRequestForm/ClientProgressBar'
import { ReactNode } from 'react'

export default async function RequestsNewLayout({
  children,
}: {
  children: ReactNode
}) {
  // 서버에서 로그인 사용자 정보 가져오기
  const customer = await getCustomerFromRequest()
  const user = customer
    ? {
        id: customer.userId,
        name: customer.userName,
        phone: customer.userPhone,
        email: customer.userEmail,
        address: customer.address || undefined,
      }
    : null

  return (
    <FormProvider initialUser={user}>
      <div className="min-h-screen bg-gray-50 py-8 pt-24">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <h1 className="text-2xl font-bold">서비스 요청</h1>
          <p className="mt-1 text-gray-600">
            원하는 서비스와 일시를 선택해주세요.
          </p>

          <ClientProgressBar />

          <div className="mt-6">{children}</div>
        </div>
      </div>
    </FormProvider>
  )
}
