import React from 'react';
import { StyleSheet, SafeAreaView, ActivityIndicator, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { Colors } from '../../constants/colors';

const HIDE_HEADER_FOOTER_JS = `
  (function() {
    var css = '#footer, #navbar { display: none !important; } .pt-44 { padding-top: 16px !important; } h1, h2, h3 { font-size: 80% !important; } p.text-lg, p.text-xl, .text-lg, .text-xl { font-size: 80% !important; }';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    // 동적 렌더링 대비: DOM 변경 감지 시 재적용
    new MutationObserver(function() {
      var f = document.getElementById('footer');
      var n = document.getElementById('navbar');
      if (f) f.style.display = 'none';
      if (n) n.style.display = 'none';
    }).observe(document.body, { childList: true, subtree: true });
  })();
  true;
`;

export function WebViewScreen() {
  const route = useRoute<{ key: string; name: string; params: { url: string; title: string } }>();
  const { url } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ uri: url }}
        style={styles.webview}
        injectedJavaScript={HIDE_HEADER_FOOTER_JS}
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
