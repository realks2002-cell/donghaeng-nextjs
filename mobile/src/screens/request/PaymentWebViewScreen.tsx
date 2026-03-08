import React, { useRef } from 'react';
import { StyleSheet, SafeAreaView, Alert, Platform, Linking, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import type { ShouldStartLoadRequest } from 'react-native-webview/lib/WebViewTypes';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types';
import { API_BASE_URL } from '../../constants/config';
import { Colors } from '../../constants/colors';
import { paymentApi } from '../../api/client';

type Props = NativeStackScreenProps<HomeStackParamList, 'PaymentWebView'>;

function parseIntentUrl(url: string): { launchUrl: string; packageName: string | null } | null {
  if (!url.startsWith('intent://')) return null;

  const hashIndex = url.indexOf('#Intent;');
  if (hashIndex === -1) return null;

  const pathAndQuery = url.substring('intent://'.length, hashIndex);
  const fragment = url.substring(hashIndex + '#Intent;'.length);

  const params: Record<string, string> = {};
  fragment.replace(/;?end;?$/, '').split(';').forEach(part => {
    const eq = part.indexOf('=');
    if (eq > 0) params[part.slice(0, eq)] = part.slice(eq + 1);
  });

  const scheme = params.scheme;
  if (!scheme) return null;

  return {
    launchUrl: `${scheme}://${pathAndQuery}`,
    packageName: params.package || null,
  };
}

const CARD_APP_SCHEMES = [
  'kftc-bankpay', 'ispmobile', 'shinhan-sr-ansimclick', 'smshinhanansimclick',
  'kb-acp', 'hdcardappcardansimclick', 'smhyundaiansimclick', 'mpocket.online.ansimclick',
  'ansimclickscard', 'ansimclickipcollect', 'vguardstart', 'samsungpay', 'scardcertiapp',
  'lottesmartpay', 'lotteappcard', 'cloudpay', 'nhappcardansimclick', 'nonghyupcardansimclick',
  'citispay', 'citicardappkr', 'citimobileapp', 'kakaotalk', 'payco', 'lpayapp',
  'hanamopmoasign', 'wooripay', 'nhallonepayansimclick', 'hanawalletmembers', 'supertoss',
];

export function PaymentWebViewScreen({ navigation, route }: Props) {
  const { orderId, amount, orderName, customerName, customerPhone, requestData } = route.params;
  const isConfirmingRef = useRef(false);

  const paymentUrl = `${API_BASE_URL}/api/payments/confirm?orderId=${encodeURIComponent(orderId)}&amount=${amount}&orderName=${encodeURIComponent(orderName)}${customerName ? `&customerName=${encodeURIComponent(customerName)}` : ''}`;

  async function handlePaymentSuccess(paymentKey: string, pOrderId: string, pAmount: number) {
    if (isConfirmingRef.current) return;
    isConfirmingRef.current = true;

    try {
      await paymentApi.confirm({
        paymentKey,
        orderId: pOrderId,
        amount: pAmount,
        formData: requestData,
      });
      navigation.replace('Completion', {
        orderId: pOrderId,
        amount: pAmount,
      });
    } catch {
      isConfirmingRef.current = false;
      Alert.alert('결제 확인 실패', '결제 확인 중 오류가 발생했습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  }

  function handlePaymentFail(code: string | null, message: string | null) {
    if (code === 'PAY_PROCESS_CANCELED' || code === 'USER_CANCEL') {
      navigation.goBack();
      return;
    }
    Alert.alert('결제 실패', message || '결제 중 오류가 발생했습니다.', [
      { text: '확인', onPress: () => navigation.goBack() },
    ]);
  }

  function onShouldStartLoadWithRequest(request: ShouldStartLoadRequest): boolean {
    const { url } = request;

    // 결제 성공 리다이렉트 감지
    if (url.includes('/payment/success')) {
      const urlObj = new URL(url);
      const paymentKey = urlObj.searchParams.get('paymentKey');
      const pOrderId = urlObj.searchParams.get('orderId');
      const pAmount = urlObj.searchParams.get('amount');

      if (paymentKey && pOrderId && pAmount) {
        handlePaymentSuccess(paymentKey, pOrderId, parseInt(pAmount, 10));
      }
      return false;
    }

    // 결제 실패 리다이렉트 감지
    if (url.includes('/payment/fail')) {
      const urlObj = new URL(url);
      handlePaymentFail(urlObj.searchParams.get('code'), urlObj.searchParams.get('message'));
      return false;
    }

    // Android intent:// URL 처리
    if (Platform.OS === 'android' && url.startsWith('intent://')) {
      const parsed = parseIntentUrl(url);
      if (parsed) {
        Linking.openURL(parsed.launchUrl).catch(() => {
          if (parsed.packageName) {
            Linking.openURL(`market://details?id=${parsed.packageName}`).catch(() => {});
          }
        });
      }
      return false;
    }

    // 카드사 앱 스킴 처리 (iOS + Android)
    const scheme = url.split('://')[0];
    if (CARD_APP_SCHEMES.includes(scheme) || url.startsWith('market://') || url.startsWith('itms-apps://')) {
      Linking.openURL(url).catch(() => {});
      return false;
    }

    return true;
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: paymentUrl }}
        originWhitelist={['*']}
        onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
        javaScriptEnabled
        domStorageEnabled
        mixedContentMode="compatibility"
        sharedCookiesEnabled
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
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
  },
});
