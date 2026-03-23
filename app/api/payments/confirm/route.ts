import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getCustomerFromRequest } from '@/lib/auth/customer'
import { DEFAULT_SERVICE_PRICES, SERVICE_TYPE_LABELS, ServiceType, VEHICLE_SUPPORT_DEFAULT_PRICE } from '@/lib/constants/pricing'

interface TossPaymentConfirmRequest {
  paymentKey: string
  orderId: string
  amount: number
  formData?: {
    service_type: string
    service_date: string
    start_time: string
    duration_hours: number
    address: string
    address_detail?: string
    phone: string
    lat?: number
    lng?: number
    details?: string
    designated_manager_id?: string
    guest_name?: string
    guest_phone?: string
    guest_address?: string
    guest_address_detail?: string
    vehicle_support?: boolean
  }
}

interface TossPaymentResponse {
  paymentKey: string
  orderId: string
  status: string
  method: string
  totalAmount: number
  approvedAt: string
  card?: {
    number: string
    installmentPlanMonths: number
  }
  easyPay?: {
    provider: string
  }
  failure?: {
    code: string
    message: string
  }
}

// 모바일 결제 HTML 반환 (토스 결제위젯 v2)
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
      background: #fff;
      padding: 16px;
    }
    #payment-loading {
      text-align: center;
      color: #64748b;
      font-size: 16px;
      padding: 40px 20px;
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
    #payment-button {
      display: none;
      width: 100%;
      padding: 16px;
      margin-top: 16px;
      background: #3182f6;
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      min-height: 44px;
    }
    #payment-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .method-selector {
      display: none;
      gap: 12px;
      margin-bottom: 12px;
    }
    .method-btn {
      flex: 1;
      padding: 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: #fff;
      font-size: 14px;
      font-weight: 600;
      color: #64748b;
      cursor: pointer;
      min-height: 44px;
    }
    .method-btn.active {
      border-color: #3182f6;
      background: rgba(49,130,246,0.05);
      color: #3182f6;
    }
  </style>
</head>
<body>
  <div id="payment-loading">
    <div class="spinner"></div>
    <p>결제 화면을 불러오는 중...</p>
  </div>
  <div id="method-selector" class="method-selector">
    <button class="method-btn active" id="btn-card" onclick="selectMethod('CARD')">카드결제</button>
    <button class="method-btn" id="btn-transfer" onclick="selectMethod('TRANSFER')">계좌이체</button>
  </div>
  <div id="payment-method"></div>
  <div id="agreement"></div>
  <button id="payment-button">${parseInt(amount, 10).toLocaleString()}원 결제하기</button>
  <script>
    (async function() {
      try {
        var tossPayments = TossPayments('${clientKey}');
        var sdkMode = 'widget';
        var widgets, payment;

        try {
          widgets = tossPayments.widgets({ customerKey: TossPayments.ANONYMOUS });
        } catch (e) {
          console.warn('widgets() 실패, payment() 폴백 전환:', e.message);
          sdkMode = 'payment';
          payment = tossPayments.payment({ customerKey: TossPayments.ANONYMOUS });
        }

        if (sdkMode === 'widget') {
          await widgets.setAmount({
            currency: 'KRW',
            value: ${parseInt(amount, 10)},
          });

          await Promise.all([
            widgets.renderPaymentMethods({ selector: '#payment-method' }),
            widgets.renderAgreement({ selector: '#agreement', variantKey: 'AGREEMENT' }),
          ]);

          document.getElementById('payment-loading').style.display = 'none';
          var btn = document.getElementById('payment-button');
          btn.style.display = 'block';

          btn.addEventListener('click', async function() {
            btn.disabled = true;
            btn.textContent = '처리 중...';
            try {
              await widgets.requestPayment({
                orderId: '${orderId}',
                orderName: '${orderName.replace(/'/g, "\\'")}',
                successUrl: '${origin}/payment/success',
                failUrl: '${origin}/payment/fail',
              });
            } catch (err) {
              btn.disabled = false;
              btn.textContent = '${parseInt(amount, 10).toLocaleString()}원 결제하기';
              if (err.message && err.message.includes('USER_CANCEL')) return;
              alert(err.message || '결제 중 오류가 발생했습니다.');
            }
          });
        } else {
          var selectedMethod = 'CARD';
          var methodMessages = {
            CARD: '결제하기 버튼을 누르면 카드 결제창이 열립니다.',
            TRANSFER: '결제하기 버튼을 누르면 계좌이체 결제창이 열립니다.',
          };

          document.getElementById('payment-loading').innerHTML =
            '<p id="method-msg" style="color:#3b82f6;font-size:14px">' + methodMessages.CARD + '</p>';

          document.getElementById('method-selector').style.display = 'flex';
          var btn = document.getElementById('payment-button');
          btn.style.display = 'block';

          window.selectMethod = function(method) {
            selectedMethod = method;
            document.getElementById('btn-card').className = 'method-btn' + (method === 'CARD' ? ' active' : '');
            document.getElementById('btn-transfer').className = 'method-btn' + (method === 'TRANSFER' ? ' active' : '');
            document.getElementById('method-msg').textContent = methodMessages[method];
          };

          btn.addEventListener('click', async function() {
            btn.disabled = true;
            btn.textContent = '처리 중...';
            try {
              var params = {
                method: selectedMethod,
                amount: { currency: 'KRW', value: ${parseInt(amount, 10)} },
                orderId: '${orderId}',
                orderName: '${orderName.replace(/'/g, "\\'")}',
                successUrl: '${origin}/payment/success',
                failUrl: '${origin}/payment/fail',
              };
              if (selectedMethod === 'TRANSFER') {
                params.transfer = { cashReceipt: { type: '소득공제' }, useEscrow: false };
              }
              await payment.requestPayment(params);
            } catch (err) {
              btn.disabled = false;
              btn.textContent = '${parseInt(amount, 10).toLocaleString()}원 결제하기';
              if (err.message && err.message.includes('USER_CANCEL')) return;
              alert(err.message || '결제 중 오류가 발생했습니다.');
            }
          });
        }
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

// 결제 승인 처리
export async function POST(request: NextRequest) {
  try {
    const body: TossPaymentConfirmRequest = await request.json()
    const { paymentKey, orderId, amount, formData } = body

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json(
        { ok: false, error: '필수 결제 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    if (!formData || !formData.service_type || !formData.service_date || !formData.start_time || !formData.duration_hours) {
      return NextResponse.json(
        { ok: false, error: '서비스 요청 정보가 누락되었습니다.' },
        { status: 400 }
      )
    }

    const secretKey = process.env.TOSS_SECRET_KEY
    if (!secretKey) {
      return NextResponse.json(
        { ok: false, error: '결제 시스템 설정 오류' },
        { status: 500 }
      )
    }

    const supabase = createServiceClient()

    // 서비스 가격 계산 및 금액 검증 (Supabase에서 동적 가격 로드)
    const serviceType = formData.service_type as ServiceType
    const koreanLabel = SERVICE_TYPE_LABELS[serviceType]
    let pricePerHour = DEFAULT_SERVICE_PRICES[serviceType] ?? 20000
    if (koreanLabel) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: priceData } = await (supabase.from('service_prices') as any)
        .select('price_per_hour')
        .eq('service_type', koreanLabel)
        .eq('is_active', true)
        .single()
      if (priceData?.price_per_hour) {
        pricePerHour = priceData.price_per_hour
      }
    }
    let vehicleSupportPrice = 0
    if (formData.vehicle_support) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: vehicleData } = await (supabase.from('service_prices') as any)
        .select('price_per_hour')
        .eq('service_type', '차량지원')
        .eq('is_active', true)
        .single()
      vehicleSupportPrice = vehicleData?.price_per_hour ?? VEHICLE_SUPPORT_DEFAULT_PRICE
    }
    const estimatedPrice = pricePerHour * formData.duration_hours + vehicleSupportPrice

    if (estimatedPrice !== amount) {
      console.error('Amount mismatch:', { expected: estimatedPrice, received: amount })
      return NextResponse.json(
        { ok: false, error: '결제 금액이 일치하지 않습니다.' },
        { status: 400 }
      )
    }

    // 중복 처리 방지: 같은 orderId로 이미 생성된 요청이 있는지 확인
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const requestsTable = supabase.from('service_requests') as any
    const { data: existingRequest } = await requestsTable
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'CONFIRMED') {
        return NextResponse.json(
          { ok: false, error: '이미 결제가 완료된 주문입니다.' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { ok: false, error: '이미 처리된 주문입니다.' },
        { status: 409 }
      )
    }

    // 토스페이먼츠 결제 승인 API 호출
    const authHeader = Buffer.from(`${secretKey}:`).toString('base64')

    const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentKey,
        orderId,
        amount,
      }),
    })

    const tossResult: TossPaymentResponse = await tossResponse.json()

    if (!tossResponse.ok || tossResult.failure) {
      const errorMessage = tossResult.failure?.message || '결제 승인에 실패했습니다.'
      console.error('Toss payment error:', tossResult)
      return NextResponse.json(
        { ok: false, error: errorMessage },
        { status: 400 }
      )
    }

    // 현재 로그인한 사용자 확인
    const customer = await getCustomerFromRequest()
    const customerId: string | null = customer?.userId || null

    const address = formData.address || formData.guest_address || ''
    const addressDetail = formData.address_detail || formData.guest_address_detail || ''
    const phone = formData.phone || formData.guest_phone || ''
    const durationMinutes = formData.duration_hours * 60

    // 서비스 요청 INSERT (바로 CONFIRMED 상태)
    const { error: insertError } = await requestsTable.insert({
      id: orderId,
      customer_id: customerId,
      guest_name: formData.guest_name || null,
      guest_phone: formData.guest_phone || null,
      service_type: formData.service_type,
      service_date: formData.service_date,
      start_time: formData.start_time,
      duration_minutes: durationMinutes,
      address: address,
      address_detail: addressDetail || null,
      phone: phone,
      lat: formData.lat || null,
      lng: formData.lng || null,
      details: formData.details || null,
      status: 'CONFIRMED',
      estimated_price: estimatedPrice,
      manager_id: formData.designated_manager_id || null,
      vehicle_support: formData.vehicle_support || false,
      confirmed_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error('Service request insert error:', insertError)
      return NextResponse.json(
        { ok: false, error: '서비스 요청 저장에 실패했습니다. 결제는 승인되었으니 고객센터에 문의해주세요.' },
        { status: 500 }
      )
    }

    // 결제 레코드 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const paymentsTable = supabase.from('payments') as any
    const { error: paymentError } = await paymentsTable.insert({
      service_request_id: orderId,
      payment_key: paymentKey,
      order_id: orderId,
      amount: tossResult.totalAmount,
      status: 'PAID',
      method: tossResult.method,
      approved_at: tossResult.approvedAt,
    })

    if (paymentError) {
      console.error('Payment insert error:', paymentError)
    }

    return NextResponse.json({
      ok: true,
      paymentKey: tossResult.paymentKey,
      orderId: tossResult.orderId,
      status: tossResult.status,
      method: tossResult.method,
      amount: tossResult.totalAmount,
    })
  } catch (error) {
    console.error('Payment confirm error:', error)
    return NextResponse.json(
      { ok: false, error: '결제 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
