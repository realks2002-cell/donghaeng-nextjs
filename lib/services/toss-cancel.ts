export async function cancelTossPayment(
  paymentKey: string,
  cancelReason: string,
  cancelAmount?: number
) {
  const secretKey = process.env.TOSS_SECRET_KEY
  if (!secretKey) {
    throw new Error('TOSS_SECRET_KEY가 설정되지 않았습니다.')
  }

  const authHeader = Buffer.from(`${secretKey}:`).toString('base64')

  const body: { cancelReason: string; cancelAmount?: number } = { cancelReason }
  if (cancelAmount !== undefined && cancelAmount > 0) {
    body.cancelAmount = cancelAmount
  }

  const response = await fetch(
    `https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    console.error('토스 결제 취소 실패:', data)
    throw new Error(data.message || '토스페이먼츠 결제 취소에 실패했습니다.')
  }

  return data
}
