import { getCustomerFromRequest } from '@/lib/auth/customer'
import PaymentForm from '@/components/forms/ServiceRequestForm/components/PaymentForm'

export default async function PaymentPage() {
  const customer = await getCustomerFromRequest()
  const user = customer
    ? {
        id: customer.userId,
        name: customer.userName,
        email: customer.userEmail,
      }
    : null

  return <PaymentForm user={user} />
}
