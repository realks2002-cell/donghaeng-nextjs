/**
 * 하이브리드 라우팅 핸들러
 * 로컬 메인 페이지에서 외부 링크 클릭 시 서버 URL로 이동
 * Capacitor App 플러그인을 사용한 뒤로가기 핸들링
 */

const REMOTE_BASE = 'https://donghaeng77.co.kr';

document.addEventListener('DOMContentLoaded', function() {
  // 모든 외부 링크에 대해 Capacitor WebView 내에서 동작하도록 처리
  document.querySelectorAll('a[href^="https://donghaeng77.co.kr"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.location.href = this.href;
    });
  });
});

// Capacitor 뒤로가기 버튼 핸들링
document.addEventListener('deviceready', function() {
  if (window.Capacitor) {
    window.Capacitor.Plugins.App.addListener('backButton', function(data) {
      if (window.location.href.indexOf('file://') !== -1) {
        // 로컬 메인 페이지에서 뒤로가기 = 앱 종료
        window.Capacitor.Plugins.App.exitApp();
      } else {
        // 원격 페이지에서 뒤로가기 = 브라우저 뒤로 또는 로컬 메인으로
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = 'index.html';
        }
      }
    });
  }
});
