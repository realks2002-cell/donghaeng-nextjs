const { withAndroidManifest } = require("expo/config-plugins");

const PAYMENT_PACKAGES = [
  "viva.republica.toss",
  "com.kbcard.cxh.appcard",
  "kvp.jjy.MispAndroid320",
  "kr.co.samsungcard.mpocket",
  "com.shcard.smartpay",
  "com.hyundaicard.appcard",
  "com.lcacApp",
  "com.hanaskcard.paycla",
  "com.wooricard.wpay",
  "kr.co.citibank.citimobile",
  "nh.smart.nhallonepay",
  "com.kakaobank.channel",
  "com.samsung.android.spay",
  "com.nhn.android.search",
  "com.kakao.talk",
  "com.kftc.bankpay.android",
  "com.sktelecom.tauth",
  "com.lguplus.smartotp",
  "com.kt.ktauth",
];

function withAndroidQueries(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    if (!manifest.queries) {
      manifest.queries = [];
    }

    const packages = PAYMENT_PACKAGES.map((name) => ({
      $: { "android:name": name },
    }));

    manifest.queries.push({ package: packages });

    return config;
  });
}

module.exports = withAndroidQueries;
