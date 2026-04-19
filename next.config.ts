/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! 警告 !!
    // 允许生产环境编译即使有类型错误。
    ignoreBuildErrors: true,
  },
};

export default nextConfig;