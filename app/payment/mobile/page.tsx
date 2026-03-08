import Script from 'next/script'

export default function MobilePaymentPage({ searchParams }: { searchParams: { orderId?: string; amount?: string; orderName?: string } }) {
  const { orderId, amount, orderName } = searchParams
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''

  if (!orderId || !amount || !clientKey) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: '-apple-system, sans-serif' }}>
        <p>결제 정보가 올바르지 않습니다.</p>
      </div>
    )
  }

  return (
    <>
      <Script src="https://js.tosspayments.com/v2/standard" strategy="afterInteractive" />
      <div
        id="payment-loading"
        style={{
          display: 'flex',
          flexDirection: 'column' as const,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: '-apple-system, sans-serif',
          color: '#64748b',
          fontSize: '16px',
        }}
      >
        <p>결제 화면을 불러오는 중...</p>
      </div>
      <Script
        id="toss-payment-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            function initPayment() {
              if (typeof TossPayments === 'undefined') {
                setTimeout(initPayment, 100);
                return;
              }
              (async function() {
                try {
                  var tossPayments = TossPayments('${clientKey}');
                  var payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
                  await payment.requestPayment({
                    method: 'CARD',
                    amount: { currency: 'KRW', value: ${parseInt(amount, 10)} },
                    orderId: '${orderId}',
                    orderName: '${(orderName || '돌봄 서비스').replace(/'/g, "\\'")}',
                    successUrl: window.location.origin + '/payment/success',
                    failUrl: window.location.origin + '/payment/fail',
                  });
                } catch (error) {
                  document.getElementById('payment-loading').innerHTML =
                    '<p style="color:#ef4444">결제를 불러올 수 없습니다.</p>' +
                    '<p style="color:#94a3b8;font-size:14px;margin-top:8px">' + (error.message || '') + '</p>';
                }
              })();
            }
            initPayment();
          `,
        }}
      />
    </>
  )
}
