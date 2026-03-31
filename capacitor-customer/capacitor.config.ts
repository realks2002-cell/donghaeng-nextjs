import type { CapacitorConfig } from '@capacitor/cli';

// 개발 모드: true → 로컬 개발 서버 사용, false → 프로덕션 URL 사용
const DEV_MODE = true;
const DEV_SERVER_IP = '172.30.1.66';

const config: CapacitorConfig = {
  appId: 'kr.co.donghaeng77.customer',
  appName: '행복안심동행',
  webDir: 'www',
  server: DEV_MODE
    ? {
        url: `http://${DEV_SERVER_IP}:3000`,
        cleartext: true,
      }
    : {
        url: 'https://donghaeng77.co.kr',
        androidScheme: 'https',
      },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#F97316',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#F97316',
      style: 'LIGHT',
    },
  },
  android: {
    allowMixedContent: DEV_MODE,
    backgroundColor: '#ffffff',
  },
};

export default config;
