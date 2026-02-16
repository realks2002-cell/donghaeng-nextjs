import { redirect } from 'next/navigation'
import { getCustomerFromRequest } from '@/lib/auth/customer'

export default async function RequestsNewPage() {
  const customer = await getCustomerFromRequest()

  // 로그인한 사용자 → Step 1.5로 바로 이동
  if (customer) {
    redirect('/requests/new/info')
  }

  // 비로그인 사용자 → Step 1 (회원/비회원 선택)
  redirect('/requests/new/user-type')
}
