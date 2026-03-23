/** @type {import('next').NextConfig} */
const nextConfig = {
  // web-push: 네이티브 Node.js 모듈을 사용하므로 번들링하지 않고 node_modules에서 직접 로드
  serverExternalPackages: ['web-push'],
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  // 환경변수 검증
  env: {
    CUSTOM_KEY: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
