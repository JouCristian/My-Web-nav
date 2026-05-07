import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // !! 警告 !!
    // 允许生产环境编译即使有类型错误。
    ignoreBuildErrors: true,
  },
  
  // 图片优化配置
  images: {
    formats: ['image/avif', 'image/webp'], // 优先使用现代图片格式
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048], // 响应式断点
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // 图标尺寸
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // GitHub 头像
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com', // Vercel Blob
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Google 头像
      },
    ],
  },
  
  // 实验性优化
  experimental: {
    // 优化第三方包导入，减少 bundle 体积
    optimizePackageImports: [
      'framer-motion',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-slot',
    ],
  },
};

export default nextConfig;
