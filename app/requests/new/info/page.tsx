import { getCustomerFromRequest } from '@/lib/auth/customer'
import GuestInfoForm from '@/components/forms/ServiceRequestForm/components/GuestInfoForm'

export default async function InfoPage() {
  const customer = await getCustomerFromRequest()
  const isLoggedIn = !!customer

  return <GuestInfoForm isLoggedIn={isLoggedIn} />
}
