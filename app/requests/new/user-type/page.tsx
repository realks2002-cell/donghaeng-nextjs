import { redirect } from 'next/navigation'
import { getCustomerFromRequest } from '@/lib/auth/customer'
import UserTypeForm from '@/components/forms/ServiceRequestForm/components/UserTypeForm'

export default async function UserTypePage() {
  const customer = await getCustomerFromRequest()

  // 로그인 사용자는 이 페이지 볼 필요 없음
  if (customer) {
    redirect('/requests/new/info')
  }

  return <UserTypeForm />
}
