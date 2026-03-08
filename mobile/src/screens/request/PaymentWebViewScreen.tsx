import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { API_BASE_URL } from '../../constants/config';
import { Colors } from '../../constants/colors';
import { paymentApi } from '../../api/client';

type Props = NativeStackScreenProps<HomeStackParamList, 'PaymentWebView'>;

export function PaymentWebViewScreen({ navigation, route }: Props) {
  const { orderId, amount, orderName, requestData } = route.params;
  const webViewRef = useRef<WebView>(null);
  const isConfirmingRef = useRef(false);

  // 서버의 결제 confirm API (GET → 모바일 결제 HTML 반환)
  const paymentUrl = `${API_BASE_URL}/api/payments/confirm?orderId=${orderId}&amount=${amount}&orderName=${encodeURIComponent(orderName)}`;

  function handleMessage(event: { nativeEvent: { data: string } }) {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'PAYMENT_ERROR') {
        Alert.alert('결제 실패', data.error, [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      }
    } catch {
      // ignore parse errors
    }
  }

  function handleShouldStartLoad(event: { url: string }) {
    const url = event.url;

    // 결제 성공 URL 인터셉트
    if (url.includes('/payment/success') && url.includes('paymentKey=')) {
      try {
        const urlParams = new URL(url);
        const paymentKey = urlParams.searchParams.get('paymentKey');
        const returnedOrderId = urlParams.searchParams.get('orderId');
        const returnedAmount = urlParams.searchParams.get('amount');

        if (paymentKey && returnedOrderId && returnedAmount) {
          confirmPayment(paymentKey, returnedOrderId, Number(returnedAmount));
          return false;
        }
      } catch {}
    }

    // 결제 실패 URL 인터셉트
    if (url.includes('/payment/fail')) {
      try {
        const urlParams = new URL(url);
        const errorMessage = urlParams.searchParams.get('message') || '결제에 실패했습니다.';
        Alert.alert('결제 실패', errorMessage, [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } catch {}
      return false;
    }

    // 그 외 모든 URL은 WebView 내에서 처리
    return true;
  }

  async function confirmPayment(paymentKey: string, confirmedOrderId: string, confirmedAmount: number) {
    if (isConfirmingRef.current) return;
    isConfirmingRef.current = true;

    try {
      await paymentApi.confirm({
        paymentKey,
        orderId: confirmedOrderId,
        amount: confirmedAmount,
        formData: requestData,
      });
      navigation.replace('Completion', {
        orderId: confirmedOrderId,
        amount: confirmedAmount,
      });
    } catch {
      isConfirmingRef.current = false;
      Alert.alert('결제 확인 실패', '결제 확인 중 오류가 발생했습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  }

  // onShouldStartLoadWithRequest가 리다이렉트를 못 잡는 경우 백업
  const handleNavigationStateChange = useCallback((navState: { url: string }) => {
    const url = navState.url;
    if (url.includes('/payment/success') && url.includes('paymentKey=')) {
      try {
        const urlParams = new URL(url);
        const paymentKey = urlParams.searchParams.get('paymentKey');
        const returnedOrderId = urlParams.searchParams.get('orderId');
        const returnedAmount = urlParams.searchParams.get('amount');

        if (paymentKey && returnedOrderId && returnedAmount) {
          confirmPayment(paymentKey, returnedOrderId, Number(returnedAmount));
        }
      } catch {}
    }

    if (url.includes('/payment/fail') && !isConfirmingRef.current) {
      try {
        const urlParams = new URL(url);
        const errorMessage = urlParams.searchParams.get('message') || '결제에 실패했습니다.';
        Alert.alert('결제 실패', errorMessage, [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } catch {}
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: paymentUrl }}
        style={styles.webview}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        onNavigationStateChange={handleNavigationStateChange}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        thirdPartyCookiesEnabled
        sharedCookiesEnabled
        mixedContentMode="compatibility"
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
