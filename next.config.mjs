/** @type {import('next').NextConfig} */
const nextConfig = {
  // 이미지 최적화 도메인 설정
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // 환경변수 검증
  env: {
    CUSTOM_KEY: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
