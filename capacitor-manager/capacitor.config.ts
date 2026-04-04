import type { CapacitorConfig } from '@capacitor/cli';

// 개발 모드: true → 로컬 개발 서버 사용, false → 로컬 번들 자산 사용
const DEV_MODE = false;
const DEV_SERVER_IP = '172.30.1.47';

const config: CapacitorConfig = {
  appId: 'kr.co.donghaeng77.manager',
  appName: '동행매니저',
  webDir: 'www',
  server: DEV_MODE
    ? {
        url: `http://${DEV_SERVER_IP}:3000/manager/login`,
        cleartext: true,
        errorPath: '/index.html',
      }
    : {
        androidScheme: 'https',
      },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#16a34a',
      showSpinner: false,
    },
    StatusBar: {
      backgroundColor: '#16a34a',
      style: 'LIGHT',
    },
  },
  android: {
    allowMixedContent: DEV_MODE,
    backgroundColor: '#ffffff',
  },
};

export default config;
