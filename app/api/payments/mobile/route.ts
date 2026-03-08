import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const orderId = searchParams.get('orderId')
  const amount = searchParams.get('amount')
  const orderName = searchParams.get('orderName') || '돌봄 서비스'
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || ''

  if (!orderId || !amount || !clientKey) {
    return new NextResponse('결제 정보가 올바르지 않습니다.', { status: 400 })
  }

  const origin = request.nextUrl.origin

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://js.tosspayments.com/v2/standard"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: #fff;
      padding: 20px;
    }
    #payment-loading {
      text-align: center;
      color: #64748b;
      font-size: 16px;
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid #e2e8f0;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div id="payment-loading">
    <div class="spinner"></div>
    <p>결제 화면을 불러오는 중...</p>
  </div>
  <script>
    (async function() {
      try {
        var tossPayments = TossPayments('${clientKey}');
        var payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
        await payment.requestPayment({
          method: 'CARD',
          amount: { currency: 'KRW', value: ${parseInt(amount, 10)} },
          orderId: '${orderId}',
          orderName: '${orderName.replace(/'/g, "\\'")}',
          successUrl: '${origin}/payment/success',
          failUrl: '${origin}/payment/fail',
        });
      } catch (error) {
        document.getElementById('payment-loading').innerHTML =
          '<p style="color:#ef4444">결제를 불러올 수 없습니다.</p>' +
          '<p style="color:#94a3b8;font-size:14px;margin-top:8px">' + (error.message || '') + '</p>';
      }
    })();
  </script>
</body>
</html>`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
