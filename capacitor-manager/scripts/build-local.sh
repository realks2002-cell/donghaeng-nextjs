#!/bin/bash
set -e

PROJ_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
CAP_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "=== 매니저앱 로컬 빌드 시작 ==="

# 1. 백업
echo "[1/8] 원본 파일 백업..."
cp "$PROJ_ROOT/middleware.ts" "$PROJ_ROOT/middleware.ts.bak"
cp "$PROJ_ROOT/next.config.mjs" "$PROJ_ROOT/next.config.mjs.bak"

# 복원 함수 (에러 시에도 실행)
restore() {
  echo "[복원] 원본 파일 복원 중..."
  mv "$PROJ_ROOT/middleware.ts.bak" "$PROJ_ROOT/middleware.ts" 2>/dev/null || true
  mv "$PROJ_ROOT/next.config.mjs.bak" "$PROJ_ROOT/next.config.mjs" 2>/dev/null || true
  BACKUP_DIR="$CAP_DIR/.build-backup"
  if [ -d "$BACKUP_DIR" ]; then
    for dir in "$BACKUP_DIR"/*/; do
      dirname=$(basename "$dir")
      mv "$dir" "$PROJ_ROOT/app/$dirname" 2>/dev/null || true
    done
    rm -rf "$BACKUP_DIR"
  fi
}
trap restore EXIT

# 2. middleware 제거 (정적 export 호환)
echo "[2/8] middleware 임시 제거..."
rm "$PROJ_ROOT/middleware.ts"

# 3. 비매니저 페이지/API 임시 제거 (프로젝트 외부로 이동)
echo "[3/8] 비매니저 페이지/API 임시 제거..."
BACKUP_DIR="$CAP_DIR/.build-backup"
mkdir -p "$BACKUP_DIR"
for dir in requests admin bookings auth api payment; do
  if [ -d "$PROJ_ROOT/app/$dir" ]; then
    mv "$PROJ_ROOT/app/$dir" "$BACKUP_DIR/$dir"
  fi
done

# 4. export용 next.config 생성
echo "[4/8] export용 next.config 생성..."
cat > "$PROJ_ROOT/next.config.mjs" << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
}
export default nextConfig
EOF

# 5. 빌드
echo "[5/8] Next.js 정적 빌드 중..."
cd "$PROJ_ROOT"
NEXT_PUBLIC_API_BASE_URL=https://donghaeng77.co.kr npx next build

# 6. www/ 갱신
echo "[6/8] www/ 디렉토리 갱신..."
rm -rf "$CAP_DIR/www"
cp -r "$PROJ_ROOT/out" "$CAP_DIR/www"

# index.html을 로그인 페이지로 교체 (Capacitor는 확장자 없는 라우팅 미지원)
cp "$CAP_DIR/www/manager/login.html" "$CAP_DIR/www/index.html"

# 7. 원본 복원 (trap에서도 실행되지만 정상 흐름에서도 명시적 실행)
echo "[7/8] 원본 파일 복원..."
# trap restore EXIT 가 처리

# 8. Capacitor sync
echo "[8/8] Capacitor sync..."
cd "$CAP_DIR"
npx cap sync android

echo "=== 매니저앱 로컬 빌드 완료 ==="
echo "APK 빌드: cd $CAP_DIR && JAVA_HOME=\"/Applications/Android Studio.app/Contents/jbr/Contents/Home\" ./android/gradlew -p android assembleDebug"
