import React, { useRef } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { API_BASE_URL, TOSS_CLIENT_KEY } from '../../constants/config';
import { Colors } from '../../constants/colors';
import { paymentApi } from '../../api/client';

type Props = NativeStackScreenProps<HomeStackParamList, 'PaymentWebView'>;

export function PaymentWebViewScreen({ navigation, route }: Props) {
  const { orderId, amount, orderName, requestId } = route.params;
  const webViewRef = useRef<WebView>(null);

  const paymentHTML = `
    <!DOCTYPE html>
    <html>
    <head>
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
      <div id="payment-widget"></div>
      <script>
        (async function() {
          try {
            const tossPayments = TossPayments('${TOSS_CLIENT_KEY}');
            const payment = tossPayments.payment({ customerKey: 'ANONYMOUS' });

            await payment.requestPayment({
              method: 'CARD',
              amount: { currency: 'KRW', value: ${amount} },
              orderId: '${orderId}',
              orderName: '${orderName}',
              successUrl: '${API_BASE_URL}/api/payments/confirm',
              failUrl: '${API_BASE_URL}/payment/fail',
            });
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'PAYMENT_ERROR',
              error: error.message || '결제 중 오류가 발생했습니다.'
            }));
          }
        })();
      </script>
    </body>
    </html>
  `;

  function handleMessage(event: { nativeEvent: { data: string } }) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PAYMENT_ERROR') {
        Alert.alert('결제 실패', data.error, [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } else if (data.type === 'PAYMENT_SUCCESS') {
        navigation.replace('Completion', {
          orderId: data.orderId,
          amount: data.amount,
        });
      }
    } catch {
      // ignore parse errors
    }
  }

  function handleNavigationStateChange(navState: { url: string }) {
    const url = navState.url;

    // Intercept success redirect
    if (url.includes('/api/payments/confirm') || url.includes('paymentKey=')) {
      const urlParams = new URL(url);
      const paymentKey = urlParams.searchParams.get('paymentKey');
      const returnedOrderId = urlParams.searchParams.get('orderId');
      const returnedAmount = urlParams.searchParams.get('amount');

      if (paymentKey && returnedOrderId && returnedAmount) {
        webViewRef.current?.stopLoading();
        confirmPayment(paymentKey, returnedOrderId, Number(returnedAmount));
      }
    }

    // Intercept failure redirect
    if (url.includes('/payment/fail')) {
      const urlParams = new URL(url);
      const errorMessage = urlParams.searchParams.get('message') || '결제에 실패했습니다.';
      Alert.alert('결제 실패', errorMessage, [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  }

  async function confirmPayment(paymentKey: string, confirmedOrderId: string, confirmedAmount: number) {
    try {
      await paymentApi.confirm({
        paymentKey,
        orderId: confirmedOrderId,
        amount: confirmedAmount,
      });
      navigation.replace('Completion', {
        orderId: confirmedOrderId,
        amount: confirmedAmount,
      });
    } catch {
      Alert.alert('결제 확인 실패', '결제 확인 중 오류가 발생했습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: paymentHTML }}
        style={styles.webview}
        onMessage={handleMessage}
        onNavigationStateChange={handleNavigationStateChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  webview: {
    flex: 1,
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
